/**
 * Storing an order: the two SECURITY DEFINER functions of
 * supabase/migrations/0001_catalogue_and_orders.sql, called with the server
 * client from ./supabase.ts.
 *
 * SERVER ONLY — the API route (src/app/api/order/route.ts) is the only caller.
 *
 * Behaviour:
 *  - placeOrder() never throws. It answers 'stored' with the row the database
 *    assigned, 'refused' when the database answered and said no (a PostgREST
 *    or Postgres error: the transaction was rolled back, the order is NOT in
 *    the table), or 'unknown' when there was no usable answer (environment
 *    not configured, host unreachable, FETCH_TIMEOUT_MS deadline, gateway
 *    5xx, malformed body). 'unknown' means exactly that: a late answer after
 *    the deadline still commits on the server, so the route must not claim
 *    the order is absent. The reason is logged once per distinct message,
 *    with e-mail addresses redacted; buyer data never reaches the log.
 *  - A transport failure is retried once with a fresh deadline before it is
 *    reported. The idempotency key makes the retry safe: place_order()
 *    returns the existing row when the first attempt did commit. The same
 *    retry covers the concurrent-duplicate race inside place_order()
 *    (select-then-insert without a lock → 23505 on the second insert; the
 *    second call then finds the first row).
 *  - Each attempt has one deadline (`abortSignal` on the query plus a race):
 *    without the shared signal a dead host could cost a multiple of
 *    FETCH_TIMEOUT_MS.
 *  - Only the columns of public.orders / public.order_lines are sent: the
 *    OrderRecord and OrderLineRecord shapes below are the whole payload. The
 *    raw request body never reaches the database.
 *  - The idempotency key makes a double click or a retry after a timeout one
 *    order; the same buyer placing the same order to another address, or an
 *    hour later, gets a new one.
 */
import 'server-only';

import { createHash } from 'node:crypto';

import type { CatalogueArticle, PricedSelection, Selection } from '@/lib/catalogue/types';
import { createServerClient, ENV_HINT, FETCH_TIMEOUT_MS } from '@/lib/db/supabase';
import type { VatMode } from '@/lib/order/vat';

/** orders.vat_number_status; '' = no number given (stored as null). */
export type VatNumberStatus = 'valid' | 'invalid' | 'unverified' | 'not_eligible' | '';

/** Where the prices of an order came from (Catalogue.source / loadedAt). */
export interface PricedFrom {
  source: 'database' | 'snapshot';
  loadedAt: string;
}

/** p_order — the columns of public.orders that place_order() reads. */
export interface OrderRecord {
  locale: string;
  product_id: string;
  website_slug: string | null;
  quantity: number;
  /**
   * The sanitised selection (product, quantity, article codes) — never the
   * raw body — plus which catalogue source priced it, so an order priced
   * from the snapshot while the database was unreachable says so.
   */
  config: Selection & { pricedFrom?: PricedFrom };
  customer_type: 'company' | 'private';
  company_name: string;
  vat_number: string;
  vat_number_status: VatNumberStatus;
  vat_registered_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  notes: string;
  vat_mode: VatMode;
  vat_rate: number;
  net_cents: number;
  vat_cents: number;
  gross_cents: number;
  has_on_request_items: boolean;
  price_list_id: string | null;
  idempotency_key: string;
  client_hash: string;
  user_agent: string;
}

/** p_lines[] — the columns of public.order_lines (line_no is assigned by the function). */
export interface OrderLineRecord {
  article_code: string;
  category_key: string;
  description: string;
  price_type: string;
  qty: number;
  unit_price_cents: number | null;
  line_total_cents: number | null;
  note: string | null;
}

export interface PlaceOrderInput {
  order: OrderRecord;
  lines: OrderLineRecord[];
}

export interface StoredOrder {
  /** orders.id */
  id: string;
  /** RS-2026-0001 */
  reference: string;
  /** ISO timestamp, as stored */
  createdAt: string;
  /**
   * True when place_order() returned a row created before this request
   * started: the idempotency key matched an earlier submission (a second tab,
   * a browser retry), so the e-mails now going out repeat an existing order.
   */
  replayed: boolean;
}

export type PlaceOrderResult =
  | { status: 'stored'; order: StoredOrder }
  /** The database answered and rejected the order: it is not in the table. */
  | { status: 'refused'; reason: string }
  /** No usable answer (timeout, network, gateway): the order may or may not be stored. */
  | { status: 'unknown'; reason: string };

// ---------------------------------------------------------------------------
// Keys
// ---------------------------------------------------------------------------

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex');

export interface IdempotencyInput {
  email: string;
  selection: Selection;
  grossCents: number;
  /**
   * The sanitised customer block (name, company, VAT number, address, notes
   * …): the same configuration for another address or with other notes is
   * another order, not a replay of the first.
   */
  customer: Record<string, string>;
  now: Date;
}

/**
 * sha256 of e-mail + selection + gross + customer block + UTC hour. The
 * selection is canonicalised (article codes sorted) and the customer fields
 * are taken in key order, so neither click order nor field order matters;
 * the hour makes an identical order placed later a new order.
 */
export function idempotencyKey({ email, selection, grossCents, customer, now }: IdempotencyInput): string {
  const canonical = JSON.stringify({
    productId: selection.productId,
    quantity: selection.quantity,
    articles: [...selection.articles].sort(),
  });
  const who = JSON.stringify(
    Object.keys(customer)
      .sort()
      .map((k) => [k, customer[k].trim().toLowerCase()]),
  );
  const utcHour = now.toISOString().slice(0, 13); // 2026-09-08T18
  return sha256(`${email.trim().toLowerCase()}|${canonical}|${grossCents}|${who}|${utcHour}`);
}

/** sha256 of the client address; the raw address is never stored. */
export function clientHash(ip: string): string {
  return sha256(ip.trim());
}

/**
 * The priced lines (src/lib/catalogue/pricing.ts) → the rows place_order()
 * writes, auto lines (transport, installation of extra elements) included.
 * `articles` (by code) says which line is charged per extra element (rule 7),
 * so its note explains the quantity like the per-segment one.
 */
export function toOrderLines(
  priced: Pick<PricedSelection, 'lines' | 'segments' | 'extensionSegments' | 'quantity'>,
  articles: ReadonlyMap<string, Pick<CatalogueArticle, 'perExtension'>>,
): OrderLineRecord[] {
  const { lines, segments, extensionSegments, quantity } = priced;
  return lines.map((line) => ({
    article_code: line.code,
    category_key: line.categoryKey,
    description: line.description,
    price_type: line.priceType,
    qty: line.qty,
    unit_price_cents: line.unitPriceCents,
    line_total_cents: line.lineTotalCents,
    // A per-segment or per-extension line's qty is not the booth count; say why.
    note:
      line.qty === quantity
        ? null
        : articles.get(line.code)?.perExtension
          ? `${extensionSegments} extra elements x ${quantity}`
          : segments !== null
            ? `${segments} segments x ${quantity}`
            : null,
  }));
}

// ---------------------------------------------------------------------------
// Logging — one line per distinct reason, addresses redacted
// ---------------------------------------------------------------------------

const seenReasons = new Set<string>();

function redact(message: string): string {
  return message.replace(/[^\s@()<>"']+@[^\s@()<>"']+/g, '…@…').slice(0, 300);
}

function logOnce(scope: string, reason: string): void {
  const text = redact(reason);
  const key = `${scope}:${text}`;
  if (seenReasons.has(key)) return;
  seenReasons.add(key);
  console.warn(`[orders] ${scope} failed: ${text}`);
}

function describe(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object') {
    const e = err as { message?: unknown; code?: unknown };
    const parts = [typeof e.code === 'string' ? e.code : '', typeof e.message === 'string' ? e.message : ''].filter(Boolean);
    if (parts.length) return parts.join(' ');
  }
  return String(err);
}

// ---------------------------------------------------------------------------
// One call, one deadline
// ---------------------------------------------------------------------------

interface RpcResult<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
  /** HTTP status; 0 when the request never got an HTTP answer (postgrest-js) */
  status?: number;
}

/**
 * Runs one rpc under FETCH_TIMEOUT_MS. `run` receives the signal to attach
 * with .abortSignal(); the race stops postgrest-js's own retries as well.
 */
async function withDeadline<T>(run: (signal: AbortSignal) => PromiseLike<RpcResult<T>>): Promise<RpcResult<T>> {
  const deadline = new AbortController();
  const timer = setTimeout(
    () => deadline.abort(new Error(`no answer within ${FETCH_TIMEOUT_MS} ms`)),
    FETCH_TIMEOUT_MS,
  );
  const rejectAt = new Promise<never>((_, reject) =>
    deadline.signal.addEventListener('abort', () => reject(deadline.signal.reason ?? new Error('aborted')), { once: true }),
  );
  try {
    return await Promise.race([Promise.resolve(run(deadline.signal)), rejectAt]);
  } finally {
    clearTimeout(timer);
  }
}

interface PlaceOrderRow {
  order_id?: unknown;
  order_reference?: unknown;
  order_created_at?: unknown;
}

function parseStored(data: unknown, startedAt: number): StoredOrder | null {
  const row = (Array.isArray(data) ? data[0] : data) as PlaceOrderRow | null | undefined;
  if (!row || typeof row !== 'object') return null;
  const { order_id: id, order_reference: reference, order_created_at: createdAt } = row;
  if (typeof id !== 'string' || typeof reference !== 'string' || !id || !reference) return null;
  const created = typeof createdAt === 'string' ? createdAt : new Date().toISOString();
  // A row older than this request (with a second of slack for clock skew
  // between the two machines) was written by an earlier submission.
  const createdMs = Date.parse(created);
  const replayed = Number.isFinite(createdMs) && createdMs < startedAt - 1_000;
  return { id, reference, createdAt: created, replayed };
}

/** Postgres unique violation — here only the idempotency key can raise it. */
const UNIQUE_VIOLATION = '23505';

/**
 * Whether a failed attempt may be tried again. The database has spoken only
 * when the error carries a code (a SQLSTATE such as 22P02, or PGRSTnnn):
 * that is PostgREST or the function refusing, the transaction rolled back,
 * and a retry would get the same answer. Everything else — our deadline, a
 * network error, a proxy or gateway page (postgrest-js maps a non-JSON body
 * to an error without a code) — is a transport failure, tried once more. So
 * is the duplicate-key race inside place_order(): the second call finds the
 * first row.
 */
function retryable(outcome: Outcome): boolean {
  if (outcome.kind === 'thrown') return true;
  if (outcome.kind === 'error') return !outcome.error.code || outcome.error.code === UNIQUE_VIOLATION;
  return false;
}

type Outcome =
  | { kind: 'stored'; order: StoredOrder }
  | { kind: 'error'; error: { message: string; code?: string }; status?: number }
  | { kind: 'malformed' }
  | { kind: 'thrown'; err: unknown };

async function attemptPlaceOrder(db: NonNullable<ReturnType<typeof createServerClient>>, input: PlaceOrderInput): Promise<Outcome> {
  const startedAt = Date.now();
  try {
    const { data, error, status } = await withDeadline<unknown>((signal) =>
      db.rpc('place_order', { p_order: input.order, p_lines: input.lines }).abortSignal(signal),
    );
    if (error) return { kind: 'error', error, status };
    const order = parseStored(data, startedAt);
    return order ? { kind: 'stored', order } : { kind: 'malformed' };
  } catch (err) {
    return { kind: 'thrown', err };
  }
}

function describeOutcome(outcome: Outcome): string {
  switch (outcome.kind) {
    case 'error': {
      // A gateway answer has no PostgREST body: name the status instead.
      const text = describe(outcome.error);
      return text === '[object Object]' || !text ? `HTTP ${outcome.status ?? 0}` : text;
    }
    case 'thrown':
      return describe(outcome.err);
    case 'malformed':
      return 'unexpected answer shape';
    case 'stored':
      return 'stored';
  }
}

/**
 * Stores the order and its lines through place_order(). 'stored' carries the
 * id, reference and timestamp the database assigned; 'refused' means the
 * database rejected the order (not in the table); 'unknown' means no usable
 * answer came back — the order may be there, and the internal e-mail has to
 * say so instead of asking for it to be entered by hand. Never throws.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const db = createServerClient();
  if (!db) {
    logOnce('place_order', ENV_HINT);
    return { status: 'unknown', reason: ENV_HINT };
  }
  let outcome = await attemptPlaceOrder(db, input);
  if (outcome.kind !== 'stored' && retryable(outcome)) {
    // Safe because of the idempotency key: if the first attempt committed
    // after our deadline, this returns that row instead of inserting again.
    logOnce('place_order (retrying once)', describeOutcome(outcome));
    outcome = await attemptPlaceOrder(db, input);
  }
  if (outcome.kind === 'stored') return { status: 'stored', order: outcome.order };
  const reason = describeOutcome(outcome);
  logOnce('place_order', reason);
  // A refusal is an answer from the database (an error with a code): the
  // transaction rolled back. Everything else (deadline, network, gateway,
  // malformed body) leaves the question open — a late commit is possible.
  const refused = outcome.kind === 'error' && !retryable(outcome);
  return { status: refused ? 'refused' : 'unknown', reason };
}

/**
 * Records which of the two e-mails went out (mark_order_mailed()). Returns
 * false when the update could not be made; the order itself is unaffected.
 * Never throws.
 */
export async function markOrderMailed(id: string, internal: boolean, customer: boolean): Promise<boolean> {
  const db = createServerClient();
  if (!db) return false;
  try {
    const { error } = await withDeadline<unknown>((signal) =>
      db.rpc('mark_order_mailed', { p_id: id, p_internal: internal, p_customer: customer }).abortSignal(signal),
    );
    if (error) {
      logOnce('mark_order_mailed', describe(error));
      return false;
    }
    return true;
  } catch (err) {
    logOnce('mark_order_mailed', describe(err));
    return false;
  }
}
