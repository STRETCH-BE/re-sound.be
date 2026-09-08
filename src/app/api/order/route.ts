import { NextRequest, NextResponse } from 'next/server';

import { loadConfigurator } from '@/components/order/loadConfigurator';
import { getCatalogue } from '@/lib/catalogue/load';
import { formatCents, lineLabel, priceSelection } from '@/lib/catalogue/pricing';
import { productById, validateSelection } from '@/lib/catalogue/select';
import type { CatalogueArticle, PricedLine, PricedSelection, Selection } from '@/lib/catalogue/types';
import {
  clientHash,
  idempotencyKey,
  markOrderMailed,
  placeOrder,
  toOrderLines,
  type OrderRecord,
  type PlaceOrderResult,
  type VatNumberStatus,
} from '@/lib/db/orders';
import { loadMessages, makeTranslator, type Translator } from '@/lib/order/messages';
import {
  findCountry,
  isEuCountry,
  isVatNumberFormatValid,
  normaliseVatNumber,
  resolveVat,
  splitVatNumber,
  vatNumberCountryDiffers,
  SHIP_FROM_COUNTRY,
  type VatMode,
} from '@/lib/order/vat';
import { checkVatNumber, type ViesResult } from '@/lib/order/vies';
import { defaultLocale, locales, localeFullCodes, type Locale } from '@/i18n/config';

/**
 * Order endpoint.
 *
 * The browser sends what the buyer selected and typed; this route decides
 * everything that matters: it loads the catalogue (database, else the
 * committed snapshot), checks the selection against it, prices every line
 * from the catalogue, resolves the VAT treatment (goods ship from
 * Częstochowa, so Polish VAT rules apply) and verifies the VAT number with
 * VIES. Then, in this order:
 *
 *   1. the order and its lines are stored through place_order(), which
 *      assigns the reference RS-<year>-<0001>;
 *   2. both e-mails are sent, listing every line with its article code;
 *   3. the order row records which e-mails went out.
 *
 * The buyer consents to the amount the dialog showed; the request carries it
 * as `expected`. The page is static for up to an hour while the route prices
 * from the live catalogue, so when the two nets differ the route answers
 * 409 price_changed with a fresh catalogue slice BEFORE anything is stored,
 * and the dialog asks the buyer to confirm the new amount. An article that
 * no longer exists answers 400 selection_outdated the same way.
 *
 * The order exists when it is in the database OR the internal e-mail was
 * delivered. When the database refused or did not answer, the e-mail carries
 * a fallback reference and says so in its first line — "not stored" when the
 * database said no, "not confirmed" when it did not answer (a late commit is
 * possible, so the internal copy names the idempotency key to check first);
 * only when both fail does the buyer get 502 not_delivered. There is no
 * payment step: Re-Sound confirms the order and adds transport, which is
 * never included in the prices.
 */

export const runtime = 'nodejs';
// VIES (6 s), place_order (4 s, once more on a transport failure), the two
// mail calls (8 s each, sent together) and mark_order_mailed (4 s) fit inside
// this; the platform default would cut the request off mid-send.
export const maxDuration = 30;

interface OrderRequest {
  locale?: string;
  selection?: unknown;
  customer?: {
    type?: string;
    companyName?: string;
    vatNumber?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    notes?: string;
  };
  consent?: boolean;
  /** The totals the dialog showed and the buyer consented to */
  expected?: unknown;
  /** Honeypot — the form never renders it */
  website?: string;
}

interface ExpectedTotals {
  netCents: number;
  grossCents: number;
}

const MAX_FIELD = 200;
const MAX_NOTES = 2000;
/** Article codes are short (RS-MX-AS2, WEB-MODULAR-XL-INST); anything longer is not one. */
const MAX_CODE = 64;
/** More article codes than any product has categories and options put together. */
const MAX_ARTICLES = 40;
/** Every control character (single-line fields). */
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
/** Control characters except newline and tab (the notes field keeps its shape). */
const CONTROL_KEEP_BREAKS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const esc = (s: string | undefined | null): string =>
  (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const clean = (value: unknown, max = MAX_FIELD): string =>
  typeof value === 'string' ? value.replace(CONTROL_CHARS, ' ').trim().slice(0, max) : '';

const cleanMultiline = (value: unknown, max = MAX_NOTES): string =>
  typeof value === 'string' ? value.replace(CONTROL_KEEP_BREAKS, ' ').trim().slice(0, max) : '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Shape check only: a product id, an integer quantity and a list of article
 * codes. Whether they exist, fit together and stay within the allowed
 * quantity is validateSelection()'s job, against the catalogue.
 */
function readSelection(input: unknown): Selection | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const productId = clean(raw.productId, MAX_CODE);
  if (!productId) return null;
  const quantity = raw.quantity;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) return null;
  if (!Array.isArray(raw.articles) || raw.articles.length > MAX_ARTICLES) return null;
  const articles = raw.articles.map((code) => clean(code, MAX_CODE));
  if (articles.some((code) => !code)) return null;
  return { productId, quantity, articles };
}

/** The amounts the buyer agreed to; absent from a client that predates them. */
function readExpected(input: unknown): ExpectedTotals | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const netCents = raw.netCents;
  const grossCents = raw.grossCents;
  if (typeof netCents !== 'number' || !Number.isInteger(netCents)) return null;
  if (typeof grossCents !== 'number' || !Number.isInteger(grossCents)) return null;
  return { netCents, grossCents };
}

/**
 * Validation reasons that mean the page's catalogue slice is older than the
 * route's: an article or model went inactive since the page was rendered.
 * Anything else (tampering, a quantity outside the range) is a plain refusal.
 */
const OUTDATED_REASONS = /^(unknown_article:|product_inactive|product_not_for_sale|category_required:)/;

// ---------------------------------------------------------------------------
// Rate limiting (best effort: per warm instance)
// ---------------------------------------------------------------------------

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Client address for the rate limiter. `x-forwarded-for` is set by the
 * platform, but a client can prepend its own value, so the leftmost entry is
 * not trustworthy: prefer the platform's own fields and otherwise take the
 * last hop.
 */
function clientKey(request: NextRequest): string {
  const direct = (request as NextRequest & { ip?: string }).ip;
  if (direct) return direct;
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    Array.from(hits.keys()).forEach((key) => {
      const times = hits.get(key) ?? [];
      if (times.every((time: number) => now - time >= WINDOW_MS)) hits.delete(key);
    });
  }
  return recent.length > MAX_PER_WINDOW;
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Fallback reference, used only when the database did not store the order.
 * Its shape (RS-YYMMDD-XXXX) differs from the database's RS-YYYY-0001 on
 * purpose: one glance at the reference says which kind it is.
 */
function fallbackReference(now: Date): string {
  const stamp = now.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Array.from(
    { length: 4 },
    () => REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
  ).join('');
  return `RS-${stamp}-${random}`;
}

// ---------------------------------------------------------------------------
// Lines: article code, label in the reader's language, amounts
// ---------------------------------------------------------------------------

interface RenderedLine {
  code: string;
  label: string;
  qty: number;
  /** Unit price, "Included" or "On request" */
  unit: string;
  /** Line total; empty for included and on-request lines */
  total: string;
}

function renderLines(
  lines: PricedLine[],
  articles: Map<string, CatalogueArticle>,
  locale: string,
  localeTag: string,
  t: Translator
): RenderedLine[] {
  const included = t('order.summary.included');
  const onRequest = t('order.summary.onRequest');
  return lines.map((line) => {
    const article = articles.get(line.code);
    const label = article ? lineLabel(article, locale) : line.description;
    if (line.unitPriceCents === null || line.lineTotalCents === null) {
      return { code: line.code, label, qty: line.qty, unit: onRequest, total: '' };
    }
    if (line.priceType === 'included' || (line.unitPriceCents === 0 && line.priceType !== 'credit')) {
      return { code: line.code, label, qty: line.qty, unit: included, total: '' };
    }
    return {
      code: line.code,
      label,
      qty: line.qty,
      unit: formatCents(line.unitPriceCents, localeTag),
      total: formatCents(line.lineTotalCents, localeTag),
    };
  });
}

interface Customer {
  type: 'company' | 'private';
  companyName: string;
  vatNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  countryName: string;
  notes: string;
}

interface Totals {
  netCents: number;
  vatRate: number;
  vatMode: VatMode;
  vatCents: number;
  grossCents: number;
  hasOnRequestItems: boolean;
}

/** What the database did with the order, for the internal copy. */
interface StorageNote {
  /** 'stored' → nothing to say; the other two put a warning first */
  status: PlaceOrderResult['status'];
  reason: string;
  /** The key the row carries (or would carry), so a late commit can be found */
  idempotencyKey: string;
  /** The row existed before this request: a duplicate submission */
  replayed: boolean;
  /** Which catalogue source priced the order */
  pricedFrom: string;
}

interface EmailContext {
  reference: string;
  /** false: the database did not confirm the order; the reference is a fallback */
  stored: boolean;
  storage: StorageNote;
  timestamp: string;
  priced: PricedSelection;
  totals: Totals;
  lines: RenderedLine[];
  customer: Customer;
  productName: string;
  /** Article code of the base (construction) line, for the Model row */
  baseCode: string;
  vatLabel: string;
  vies: ViesResult;
  vatFormatValid: boolean;
  locale: string;
  localeTag: string;
}

const shell = (title: string, heading: string, subtitle: string, inner: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f5f5f5;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#197FC7 0%,#1565a0 100%);padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.5px;">${esc(heading)}</h1>
<p style="margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${esc(subtitle)}</p>
</td></tr>
${inner}
<tr><td style="background-color:#f8f9fa;padding:20px 40px;border-top:1px solid #eee;color:#999;font-size:12px;">
Re-Sound &middot; Gentseweg 309 A3, 9120 Beveren-Waas (BE) &middot; info@re-sound.be &middot; re-sound.be
</td></tr>
</table></td></tr></table></body></html>`;

const CELL = 'padding:10px 0;border-bottom:1px solid #eee;font-size:14px;';

const lineRows = (lines: RenderedLine[]) =>
  lines
    .map(
      (l) => `<tr>
<td style="${CELL}color:#333;">${esc(l.label)}<br><span style="font-family:Menlo,Consolas,monospace;font-size:12px;color:#888;">${esc(l.code)}</span></td>
<td style="${CELL}color:#666;text-align:center;width:48px;white-space:nowrap;">${l.qty}&times;</td>
<td style="${CELL}color:#666;text-align:right;white-space:nowrap;">${esc(l.unit)}</td>
<td style="${CELL}color:#333;text-align:right;white-space:nowrap;width:100px;">${esc(l.total)}</td>
</tr>`
    )
    .join('');

function modelRows(ctx: EmailContext, t: Translator): string {
  const rows: Array<[string, string]> = [[t('order.email.model'), `${ctx.productName} (${ctx.baseCode})`]];
  if (ctx.priced.segments !== null) {
    rows.push([t('order.email.segments'), `${ctx.priced.segments} × 0.9 m`]);
  }
  return rows
    .map(
      ([label, value]) => `<tr>
<td colspan="3" style="padding:6px 0;color:#888;font-size:13px;">${esc(label)}</td>
<td style="padding:6px 0;color:#333;font-size:14px;text-align:right;white-space:nowrap;">${esc(value)}</td></tr>`
    )
    .join('');
}

function totalsRows(ctx: EmailContext, t: Translator): string {
  const { totals, localeTag } = ctx;
  return `<tr><td colspan="3" style="padding:12px 0 4px;color:#666;font-size:14px;">${esc(t('order.summary.net'))}</td>
<td style="padding:12px 0 4px;text-align:right;color:#333;font-size:14px;white-space:nowrap;">${esc(formatCents(totals.netCents, localeTag))}</td></tr>
<tr><td colspan="3" style="padding:4px 0;color:#666;font-size:14px;">${esc(ctx.vatLabel)}</td>
<td style="padding:4px 0;text-align:right;color:#333;font-size:14px;white-space:nowrap;">${esc(formatCents(totals.vatCents, localeTag))}</td></tr>
<tr><td colspan="3" style="padding:10px 0 0;color:#0d3a5c;font-size:16px;font-weight:700;">${esc(t('order.summary.total'))}</td>
<td style="padding:10px 0 0;text-align:right;color:#0d3a5c;font-size:16px;font-weight:700;white-space:nowrap;">${esc(formatCents(totals.grossCents, localeTag))}</td></tr>`;
}

function noticeBlock(text: string): string {
  return `<tr><td style="padding:16px 40px 0;">
<div style="background-color:#e8f4fc;border-left:3px solid #197FC7;padding:14px 18px;border-radius:4px;color:#0d3a5c;font-size:13px;line-height:1.6;">${esc(text)}</div>
</td></tr>`;
}

function warningBlock(text: string): string {
  return `<tr><td style="padding:24px 40px 0;">
<div style="background-color:#fdecea;border-left:3px solid #c62828;padding:14px 18px;border-radius:4px;color:#7f1d1d;font-size:14px;font-weight:600;line-height:1.6;">${esc(text)}</div>
</td></tr>`;
}

/** First line of the internal e-mail when the row is not confirmed. */
function storageWarning(note: StorageNote): string {
  if (note.status === 'refused') {
    return `NOT IN THE DATABASE: the database refused the order (${note.reason}). The reference below is a fallback; enter this order by hand. Idempotency key ${note.idempotencyKey}.`;
  }
  return `NOT CONFIRMED IN THE DATABASE: the database did not answer (${note.reason}), so the order may or may not have been stored. Before entering it by hand, look in the orders table for idempotency key ${note.idempotencyKey} (or this e-mail address in the last hour). The reference below is a fallback.`;
}

const REPLAYED =
  'DUPLICATE SUBMISSION: this order was already in the database when this request arrived (same buyer, configuration, address and hour). The reference above is the existing one; do not enter it twice.';

const textLine = (l: RenderedLine) =>
  `  ${l.code.padEnd(20)} ${l.qty}x ${l.label} - ${l.unit}${l.total ? ` = ${l.total}` : ''}`;

/** Copy for Re-Sound: everything needed to confirm and invoice the order. */
function internalEmail(ctx: EmailContext, t: Translator): { html: string; text: string } {
  const { customer, totals, reference, vies, vatFormatValid } = ctx;
  // A number only needs a manual check when verifying it would have changed
  // the rate: an EU delivery outside Poland, with a non-Polish EU number that
  // is well formed. Anywhere else the order is already correct without it, so
  // flagging it would send Michael chasing nothing.
  const numberCountry = splitVatNumber(customer.vatNumber)?.country ?? '';
  const verificationWouldMatter =
    vatFormatValid &&
    totals.vatMode === 'domestic' &&
    customer.country !== SHIP_FROM_COUNTRY &&
    isEuCountry(customer.country) &&
    numberCountry !== SHIP_FROM_COUNTRY &&
    isEuCountry(numberCountry);
  const vatStatus = !customer.vatNumber
    ? '-'
    : vies.checked
      ? vies.valid
        ? `VALID (VIES${vies.name ? `: ${vies.name}` : ''})`
        : 'INVALID per VIES - charged 23 % Polish VAT'
      : verificationWouldMatter
        ? 'NOT VERIFIED (VIES unreachable) - format valid, CHECK BY HAND: if the number is good, credit the 23 % VAT'
        : `NOT VERIFIED (VIES unreachable) - format ${vatFormatValid ? 'valid' : 'invalid'}, no effect on this order`;

  const rows: Array<[string, string]> = [
    ['Reference', ctx.stored ? reference : `${reference} (fallback - not confirmed in the database)`],
    ['Date', ctx.timestamp],
    ['Priced from', ctx.storage.pricedFrom],
    ['Language', ctx.locale],
    ['Model', `${ctx.productName} (${ctx.baseCode})`],
    ['Quantity', String(ctx.priced.quantity)],
    ...(ctx.priced.segments !== null ? ([['Segments', `${ctx.priced.segments} x 0.9 m`]] as Array<[string, string]>) : []),
    ['Customer type', customer.type === 'company' ? 'Business' : 'Private person'],
    ['Company', customer.companyName || '-'],
    ['VAT number', customer.vatNumber || '-'],
    ['VAT check', vatStatus],
    ['Contact', `${customer.firstName} ${customer.lastName}`],
    ['E-mail', customer.email],
    ['Phone', customer.phone || '-'],
    [
      'Delivery',
      `${customer.street}, ${customer.postalCode} ${customer.city}, ${customer.countryName} (${customer.country})`,
    ],
    ['VAT treatment', `${ctx.vatLabel} (${totals.vatMode})`],
  ];

  if (totals.vatMode === 'reverse-charge' && vatNumberCountryDiffers(customer.country, splitVatNumber(customer.vatNumber)?.country)) {
    rows.push([
      'CHECK',
      'VAT number issued by a country other than the delivery country - prepare the intra-Community paperwork accordingly',
    ]);
  }

  const inner = `
${ctx.stored ? '' : warningBlock(storageWarning(ctx.storage))}
${ctx.storage.replayed ? warningBlock(REPLAYED) : ''}
<tr><td style="padding:24px 40px 0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
${rows
  .map(
    ([label, value]) => `<tr>
<td width="140" style="padding:6px 0;color:#888;font-size:13px;vertical-align:top;">${esc(label)}</td>
<td style="padding:6px 0;color:#333;font-size:14px;">${esc(value)}</td></tr>`
  )
  .join('')}
</table></td></tr>
<tr><td style="padding:24px 40px 0;">
<h2 style="margin:0 0 12px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #197FC7;padding-bottom:8px;display:inline-block;">${esc(ctx.productName)}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${lineRows(ctx.lines)}${totalsRows(ctx, t)}</table>
</td></tr>
${noticeBlock(t('order.summary.transportNote'))}
${totals.hasOnRequestItems ? noticeBlock(t('order.summary.onRequestNote')) : ''}
${
  customer.notes
    ? `<tr><td style="padding:20px 40px 0;">
<h2 style="margin:0 0 10px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Notes</h2>
<div style="background-color:#fafafa;border-left:3px solid #197FC7;padding:14px 18px;border-radius:4px;color:#333;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(customer.notes)}</div></td></tr>`
    : ''
}
<tr><td style="padding:28px 40px;"><a href="mailto:${esc(customer.email)}?subject=${encodeURIComponent(`Re-Sound order ${reference}`)}"
style="display:inline-block;background:#197FC7;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">Reply to ${esc(customer.firstName)} &rarr;</a></td></tr>`;

  const text = [
    ctx.stored ? '' : storageWarning(ctx.storage),
    ctx.storage.replayed ? REPLAYED : '',
    `NEW ORDER - ${reference}`,
    '========================================',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    ctx.productName,
    ...ctx.lines.map(textLine),
    `  Net: ${formatCents(totals.netCents, ctx.localeTag)}`,
    `  ${ctx.vatLabel}: ${formatCents(totals.vatCents, ctx.localeTag)}`,
    `  Total: ${formatCents(totals.grossCents, ctx.localeTag)}`,
    '',
    t('order.summary.transportNote'),
    totals.hasOnRequestItems ? t('order.summary.onRequestNote') : '',
    customer.notes ? `\nNotes:\n${customer.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { html: shell(`Order ${reference}`, t('order.email.internalHeading'), reference, inner), text };
}

/** Copy for the buyer, in the language they ordered in. */
function customerEmail(ctx: EmailContext, t: Translator): { html: string; text: string } {
  const { customer, totals, reference } = ctx;
  const inner = `
<tr><td style="padding:28px 40px 0;">
<p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;">${esc(t('order.email.greeting', { name: customer.firstName }))}</p>
<p style="margin:0 0 8px;color:#333;font-size:15px;line-height:1.7;">${esc(t('order.email.intro'))}</p>
<p style="margin:0;color:#0d3a5c;font-size:15px;"><strong>${esc(t('order.email.referenceLabel'))}: ${esc(reference)}</strong></p>
</td></tr>
<tr><td style="padding:24px 40px 0;">
<h2 style="margin:0 0 12px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #197FC7;padding-bottom:8px;display:inline-block;">${esc(ctx.productName)}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${modelRows(ctx, t)}${lineRows(ctx.lines)}${totalsRows(ctx, t)}</table>
</td></tr>
${noticeBlock(t('order.summary.transportNote'))}
${totals.hasOnRequestItems ? noticeBlock(t('order.summary.onRequestNote')) : ''}
${totals.vatMode === 'reverse-charge' ? noticeBlock(t('order.vat.reverseChargeNote')) : ''}
${totals.vatMode === 'export' ? noticeBlock(t('order.vat.exportNote')) : ''}
<tr><td style="padding:20px 40px 0;">
<h2 style="margin:0 0 10px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${esc(t('order.email.deliveryHeading'))}</h2>
<p style="margin:0;color:#333;font-size:14px;line-height:1.6;">
${customer.companyName ? `${esc(customer.companyName)}<br>` : ''}${esc(`${customer.firstName} ${customer.lastName}`)}<br>
${esc(customer.street)}<br>${esc(`${customer.postalCode} ${customer.city}`)}<br>${esc(customer.countryName)}
</p></td></tr>
<tr><td style="padding:24px 40px 32px;">
<p style="margin:0;color:#666;font-size:14px;line-height:1.7;">${esc(t('order.email.nextSteps'))}</p>
</td></tr>`;

  const modelLines = [
    `${t('order.email.model')}: ${ctx.productName} (${ctx.baseCode})`,
    ctx.priced.segments !== null ? `${t('order.email.segments')}: ${ctx.priced.segments} × 0.9 m` : '',
  ];

  const text = [
    t('order.email.greeting', { name: customer.firstName }),
    '',
    t('order.email.intro'),
    `${t('order.email.referenceLabel')}: ${reference}`,
    '',
    ctx.productName,
    ...modelLines,
    ...ctx.lines.map(textLine),
    `  ${t('order.summary.net')}: ${formatCents(totals.netCents, ctx.localeTag)}`,
    `  ${ctx.vatLabel}: ${formatCents(totals.vatCents, ctx.localeTag)}`,
    `  ${t('order.summary.total')}: ${formatCents(totals.grossCents, ctx.localeTag)}`,
    '',
    totals.vatMode === 'reverse-charge' ? t('order.vat.reverseChargeNote') : '',
    totals.vatMode === 'export' ? t('order.vat.exportNote') : '',
    t('order.summary.transportNote'),
    totals.hasOnRequestItems ? t('order.summary.onRequestNote') : '',
    '',
    t('order.email.nextSteps'),
  ]
    .filter(Boolean)
    .join('\n');

  return {
    html: shell(t('order.email.customerSubject', { reference }), t('order.email.customerHeading'), reference, inner),
    text,
  };
}

const MAIL_TIMEOUT_MS = 8000;

async function sendMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[order] POWER_AUTOMATE_WEBHOOK_URL not configured - e-mail not sent to', to);
    return false;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAIL_TIMEOUT_MS);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body: html, text }),
      signal: controller.signal,
    });
    // Log the domain only: an order log is not the place for buyer addresses.
    const audience = to.includes('@') ? `…@${to.split('@')[1]}` : to;
    if (!response.ok) console.error('[order] webhook failed', response.status, 'for', audience);
    return response.ok;
  } catch (error) {
    console.error('[order] webhook error for', to.includes('@') ? `…@${to.split('@')[1]}` : to, error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    // Same-origin only: a binding order may not be placed by a third-party page
    // riding on a visitor's session.
    const origin = request.headers.get('origin');
    if (origin) {
      const host = request.headers.get('host');
      let originHost = '';
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = '';
      }
      if (!host || originHost !== host) {
        return NextResponse.json({ error: 'server_error' }, { status: 403 });
      }
    }

    // Honeypot: accept and drop.
    if (clean(body.website)) return NextResponse.json({ success: true, reference: null });

    const clientIp = clientKey(request);
    if (rateLimited(clientIp)) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    // The catalogue decides what can be ordered and at what price. The
    // loader falls back to the committed snapshot on its own; it never throws.
    const selection = readSelection(body.selection);
    if (!selection) return NextResponse.json({ error: 'invalid_product' }, { status: 400 });
    const catalogue = await getCatalogue();
    const expected = readExpected(body.expected);
    const valid = validateSelection(selection, catalogue);
    if (!valid.ok) {
      console.warn('[order] selection rejected:', valid.reason);
      // A dialog that sends `expected` is current code on a page whose slice
      // may be an hour old: when the reason is an article or model that is no
      // longer sold, hand it the fresh slice so it can repair the selection
      // instead of telling the buyer the product cannot be ordered.
      const page = productById(selection.productId, catalogue)?.websiteSlug ?? null;
      if (expected && page && OUTDATED_REASONS.test(valid.reason)) {
        return NextResponse.json(
          { error: 'selection_outdated', catalogue: await loadConfigurator(page) },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: 'invalid_product' }, { status: 400 });
    }

    const raw = body.customer ?? {};
    const type = raw.type === 'company' ? 'company' : 'private';
    const countryCode = clean(raw.country, 8).toUpperCase();
    const country = findCountry(countryCode);
    if (!country) return NextResponse.json({ error: 'invalid_country' }, { status: 400 });

    const email = clean(raw.email);
    const firstName = clean(raw.firstName);
    const lastName = clean(raw.lastName);
    const street = clean(raw.street);
    const postalCode = clean(raw.postalCode, 20);
    const city = clean(raw.city);
    const companyName = clean(raw.companyName);
    // Normalise before capping: the dialog strips spaces and dots before it
    // validates, so capping the raw string first made a spaced-out number such
    // as "BE 0123 456 789 " look different to the server than to the browser.
    const vatNumber = raw.vatNumber ? normaliseVatNumber(clean(raw.vatNumber, 64)).slice(0, 20) : '';

    if (!firstName || !lastName || !EMAIL_RE.test(email) || !street || !postalCode || !city) {
      return NextResponse.json({ error: 'invalid_details' }, { status: 400 });
    }
    if (type === 'company' && !companyName) {
      return NextResponse.json({ error: 'company_required' }, { status: 400 });
    }
    if (body.consent !== true) {
      return NextResponse.json({ error: 'consent_required' }, { status: 400 });
    }

    // VAT: format first, then VIES. An unreachable VIES falls back to the
    // format check and is flagged for a manual check in the internal e-mail.
    const vatFormatValid = vatNumber ? isVatNumberFormatValid(vatNumber) : false;
    let vies: ViesResult = { checked: false, valid: null };
    const viesAttempted = Boolean(vatNumber && vatFormatValid && type === 'company' && countryCode !== SHIP_FROM_COUNTRY);
    if (viesAttempted) {
      vies = await checkVatNumber(vatNumber);
    }
    // A number VIES could not answer for is NOT valid: zero-rating it would
    // leave Re-Sound owing the 23 % if the number turns out to be wrong. The
    // buyer is told the reverse charge is applied once the number is verified.
    const vatNumberValid = vatFormatValid && vies.checked && vies.valid === true;
    const vatNumberCountry = vatNumber ? splitVatNumber(vatNumber)?.country ?? null : null;
    const vatNumberStatus: VatNumberStatus = !vatNumber
      ? ''
      : !vatFormatValid
        ? 'invalid'
        : !viesAttempted
          ? 'not_eligible'
          : vies.checked
            ? vies.valid
              ? 'valid'
              : 'invalid'
            : 'unverified';

    // Pricing: the six rules of src/lib/catalogue/types.ts, then the VAT
    // treatment of src/lib/order/vat.ts on the net. Whole cents throughout.
    let priced: PricedSelection;
    try {
      priced = priceSelection(selection, catalogue);
    } catch (error) {
      console.error('[order] pricing failed:', error);
      return NextResponse.json({ error: 'pricing_failed' }, { status: 400 });
    }
    const { rate: vatRate, mode: vatMode } = resolveVat({
      customerType: type,
      deliveryCountry: countryCode,
      vatNumberValid,
      vatNumberCountry,
    });
    const vatCents = Math.round(priced.netCents * vatRate);
    const totals: Totals = {
      netCents: priced.netCents,
      vatRate,
      vatMode,
      vatCents,
      grossCents: priced.netCents + vatCents,
      hasOnRequestItems: priced.hasOnRequestItems,
    };

    // The buyer consented to the dialog's net. The VAT part may legitimately
    // differ (VIES answered differently at submit time); the net may not: a
    // different net means the catalogue changed under the page. Nothing is
    // stored or mailed until the buyer has seen and accepted the new amount.
    if (expected && expected.netCents !== totals.netCents && priced.product.websiteSlug) {
      console.warn('[order] price changed since the page was rendered:', expected.netCents, '->', totals.netCents);
      return NextResponse.json(
        {
          error: 'price_changed',
          totals: {
            netCents: totals.netCents,
            vatCents: totals.vatCents,
            grossCents: totals.grossCents,
            vatRate: totals.vatRate,
            vatMode: totals.vatMode,
            hasOnRequestItems: totals.hasOnRequestItems,
          },
          catalogue: await loadConfigurator(priced.product.websiteSlug),
        },
        { status: 409 }
      );
    }

    const submittedLocale = clean(body.locale, 8);
    const locale = (locales as readonly string[]).includes(submittedLocale) ? submittedLocale : defaultLocale;
    const localeTag = localeFullCodes[locale as Locale] ?? 'en-BE';
    const [localeMessages, englishMessages] = await Promise.all([loadMessages(locale), loadMessages('en')]);
    const t = makeTranslator(localeMessages, englishMessages);
    const tEn = makeTranslator(englishMessages, englishMessages);

    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Brussels',
    });

    // fallback: 'none' makes DisplayNames return undefined for a code ICU
    // does not know (XI), instead of echoing the code back as its own name.
    const countryName =
      new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' }).of(countryCode) ?? country.name;

    const customer: Customer = {
      type,
      companyName,
      vatNumber,
      firstName,
      lastName,
      email,
      phone: clean(raw.phone, 40),
      street,
      postalCode,
      city,
      country: countryCode,
      countryName,
      notes: cleanMultiline(raw.notes),
    };

    // 1. Database first. The row is the record; the e-mails are copies of it.
    //    Only the columns of public.orders / order_lines are sent.
    const customerBlock: Record<string, string> = {
      type,
      companyName,
      vatNumber,
      firstName,
      lastName,
      phone: customer.phone,
      street,
      postalCode,
      city,
      country: countryCode,
      notes: customer.notes,
    };
    const key = idempotencyKey({ email, selection, grossCents: totals.grossCents, customer: customerBlock, now });
    const record: OrderRecord = {
      locale,
      product_id: priced.product.id,
      website_slug: priced.product.websiteSlug,
      quantity: priced.quantity,
      config: { ...selection, pricedFrom: { source: catalogue.source, loadedAt: catalogue.loadedAt } },
      customer_type: type,
      company_name: companyName,
      vat_number: vatNumber,
      vat_number_status: vatNumberStatus,
      vat_registered_name: vies.name ?? '',
      first_name: firstName,
      last_name: lastName,
      email,
      phone: customer.phone,
      street,
      postal_code: postalCode,
      city,
      country: countryCode,
      notes: customer.notes,
      vat_mode: vatMode,
      vat_rate: vatRate,
      net_cents: totals.netCents,
      vat_cents: totals.vatCents,
      gross_cents: totals.grossCents,
      has_on_request_items: totals.hasOnRequestItems,
      price_list_id: priced.product.priceListId,
      idempotency_key: key,
      client_hash: clientHash(clientIp),
      user_agent: clean(request.headers.get('user-agent'), MAX_FIELD),
    };
    const placed = await placeOrder({
      order: record,
      lines: toOrderLines(priced.lines, priced.segments, priced.quantity),
    });
    const stored = placed.status === 'stored' ? placed.order : null;
    const reference = stored?.reference ?? fallbackReference(now);
    if (!stored) {
      console.warn(`[order] ${placed.status === 'refused' ? 'refused by' : 'not confirmed in'} the database - e-mail only, fallback reference`, reference);
    }
    const storage: StorageNote = {
      status: placed.status,
      reason: placed.status === 'stored' ? '' : placed.reason,
      idempotencyKey: key,
      replayed: stored?.replayed ?? false,
      pricedFrom: `${catalogue.source} (${catalogue.loadedAt})`,
    };

    // 2. E-mails, from the same numbers.
    const vatLabelIn = (tr: Translator) =>
      vatMode === 'reverse-charge'
        ? tr('order.vat.reverseCharge')
        : vatMode === 'export'
          ? tr('order.vat.export')
          : tr('order.vat.domestic', { rate: Math.round(vatRate * 100) });

    const articlesByCode = new Map(catalogue.articles.map((a) => [a.code, a]));
    const productName = priced.product.name;
    const baseCode = priced.lines.find((l) => l.priceType === 'base')?.code ?? priced.lines[0]?.code ?? '-';
    const ctx: EmailContext = {
      reference,
      stored: stored !== null,
      storage,
      timestamp,
      priced,
      totals,
      lines: renderLines(priced.lines, articlesByCode, locale, localeTag, t),
      customer,
      productName,
      baseCode,
      vatLabel: vatLabelIn(t),
      vies,
      vatFormatValid,
      locale,
      localeTag,
    };
    const internalCtx: EmailContext = {
      ...ctx,
      lines: renderLines(priced.lines, articlesByCode, 'en', 'en-BE', tEn),
      localeTag: 'en-BE',
      vatLabel: vatLabelIn(tEn),
    };

    const recipient = process.env.ORDER_EMAIL || 'info@re-sound.be';
    const internal = internalEmail(internalCtx, tEn);
    const confirmation = customerEmail(ctx, t);

    // Both messages go out together: the buyer's copy must not be hostage to
    // the internal one, and neither may stall the request.
    const [notifiedResult, confirmedResult] = await Promise.allSettled([
      sendMail(
        recipient,
        `New order ${reference} - ${productName} x${priced.quantity} - ${customer.companyName || `${firstName} ${lastName}`}${
          stored ? (stored.replayed ? ' - DUPLICATE SUBMISSION' : '') : placed.status === 'refused' ? ' - NOT IN DATABASE' : ' - DATABASE NOT CONFIRMED'
        }`,
        internal.html,
        internal.text
      ),
      sendMail(email, t('order.email.customerSubject', { reference }), confirmation.html, confirmation.text),
    ]);
    const notified = notifiedResult.status === 'fulfilled' && notifiedResult.value;
    const confirmed = confirmedResult.status === 'fulfilled' && confirmedResult.value;

    // 3. The row says which e-mails went out, so an order with
    //    internal_email_sent false can be spotted in the table.
    if (stored) await markOrderMailed(stored.id, notified, confirmed);

    console.log(
      '=== NEW ORDER ===',
      reference,
      priced.product.id,
      `x${priced.quantity}`,
      customer.country,
      vatMode,
      'stored:',
      placed.status,
      stored?.replayed ? '(replayed)' : '',
      'notified:',
      notified,
      'confirmed:',
      confirmed,
      'catalogue:',
      catalogue.source
    );

    // The order exists when it is in the database or the internal e-mail
    // went out. If neither happened, say so instead of handing the buyer a
    // reference for an order nobody received.
    if (!stored && !notified) {
      return NextResponse.json({ error: 'not_delivered', reference }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      reference,
      stored: stored !== null,
      replayed: stored?.replayed ?? false,
      emailSent: notified,
      confirmationSent: confirmed,
      totals: {
        netCents: totals.netCents,
        vatCents: totals.vatCents,
        grossCents: totals.grossCents,
        vatRate: totals.vatRate,
        vatMode: totals.vatMode,
        hasOnRequestItems: totals.hasOnRequestItems,
      },
    });
  } catch (error) {
    console.error('[order] failed:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
