/**
 * Loads the catalogue for server code: the database when it answers, the
 * committed snapshot (src/data/catalogue.snapshot.json) otherwise.
 *
 * SERVER ONLY — this module touches process.env through src/lib/db/supabase.ts
 * and pulls the 90 KB snapshot; `import 'server-only'` fails the build on a
 * client-component import. Client components receive plain data from a
 * server page (getConfiguratorData) and use the pure helpers in ./select.ts
 * and ./pricing.ts.
 *
 * Behaviour:
 *  - one read per process every 60 s (module-scope memo), shared between
 *    concurrent renders (single in-flight promise);
 *  - any failure — unconfigured environment, unreachable host, 4 s timeout,
 *    PostgREST error, empty result — falls back to the snapshot. The fallback
 *    is silent apart from one console.warn per process, and is memoised for
 *    the same 60 s so a dead host costs one timeout per minute, not one per
 *    request;
 *  - rows are mapped from snake_case to the camelCase types in ./types.ts and
 *    sorted, so the two sources are indistinguishable to callers except for
 *    `source` and `loadedAt`;
 *  - the memoised catalogue is the EUR view (every priceCents = prices.EUR).
 *    A page passes its routing locale: getCatalogue(locale) returns the view
 *    in that locale's currency (currencyForLocale — the active currency whose
 *    `locales` list it, else EUR), derived once per currency by
 *    catalogueInCurrency and cached against the memoised object.
 *
 * Only the five public tables are read, with explicit column lists.
 * supplier_articles is never queried by site code.
 */
import 'server-only';

import snapshotJson from '@/data/catalogue.snapshot.json';
import { createServerClient, ENV_HINT, FETCH_TIMEOUT_MS, isSupabaseConfigured } from '@/lib/db/supabase';

import {
  CURRENCY_CODES,
  MINOR_UNITS,
  type ArticleSource,
  type Catalogue,
  type CatalogueArticle,
  type CatalogueCategory,
  type CatalogueCurrency,
  type CatalogueProduct,
  type CurrencyCode,
  type PriceList,
  type PriceType,
  type ProductKind,
  type ProductUnit,
  type SelectMode,
} from './types';

/** How long one database read is reused. */
export const CATALOGUE_TTL_MS = 60_000;

// ---------------------------------------------------------------------------
// Row shapes as PostgREST returns them (snake_case, jsonb as unknown)
// ---------------------------------------------------------------------------
interface PriceListRow {
  id: string; name: string; currency: string; valid_from: string | null; price_basis: string | null;
  terms: unknown; packaging: unknown; contacts: unknown; notes: unknown; source_file: string | null; imported_at: string;
}
interface ProductRow {
  id: string; price_list_id: string | null; model_code: string | null; name: string; description: string | null;
  kind: string; unit: string; website_slug: string | null; max_qty: number; ref_page: number | null; tech: unknown;
  sort: number; active: boolean;
}
interface CategoryRow {
  key: string; name: string; labels: unknown; select_mode: string; required: boolean; sort: number;
}
interface CurrencyRow {
  code: string; name: string; minor_unit: number; symbol: string | null; locales: unknown; active: boolean; sort: number;
}
/**
 * price_* are numeric(12,2) / numeric(12,0) in decimal major units; PostgREST
 * hands a numeric over as a number or as a string. price_cents is the old
 * integer column, generated from price_eur since migration 0004 — still
 * selected, no longer read (prices.EUR replaces it).
 */
interface ArticleRow {
  code: string; product_id: string; category_key: string; sheet_category: string | null; group: string | null;
  description: string; labels: unknown; price_cents: number | null; price_eur: number | string | null;
  price_isk: number | string | null; price_pln: number | string | null; price_chf: number | string | null;
  price_usd: number | string | null; price_type: string; per_segment: boolean;
  per_extension: boolean; segments: number | null; is_default: boolean; source: string; notes: string | null;
  sort: number; active: boolean;
}

const COLUMNS = {
  price_lists: 'id, name, currency, valid_from, price_basis, terms, packaging, contacts, notes, source_file, imported_at',
  currencies: 'code, name, minor_unit, symbol, locales, active, sort',
  products: 'id, price_list_id, model_code, name, description, kind, unit, website_slug, max_qty, ref_page, tech, sort, active',
  categories: 'key, name, labels, select_mode, required, sort',
  articles: 'code, product_id, category_key, sheet_category, "group", description, labels, price_cents, price_eur, price_isk, price_pln, price_chf, price_usd, price_type, per_segment, per_extension, segments, is_default, source, notes, sort, active',
} as const;

/** The column each currency's price lives in (public.articles). */
const PRICE_COLUMN: Record<CurrencyCode, 'price_eur' | 'price_isk' | 'price_pln' | 'price_chf' | 'price_usd'> = {
  EUR: 'price_eur', ISK: 'price_isk', PLN: 'price_pln', CHF: 'price_chf', USD: 'price_usd',
};

/**
 * The EUR row the catalogue always carries: what a snapshot written before
 * public.currencies existed is read with, and the guard against a currencies
 * table without EUR.
 */
const EUR_ROW: CatalogueCurrency = { code: 'EUR', name: 'Euro', minorUnit: 2, symbol: '€', locales: [], active: true, sort: 1 };

const isCurrencyCode = (v: unknown): v is CurrencyCode => typeof v === 'string' && (CURRENCY_CODES as readonly string[]).includes(v);

const asRecord = (v: unknown): Record<string, string> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) if (typeof val === 'string') out[k] = val;
  return out;
};
const asObject = (v: unknown): Record<string, string> => asRecord(v);
const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
/** tech is jsonb: the seed writes [[label, value], …]; an empty row may hold {}. */
const asTech = (v: unknown): Array<[string, string]> => {
  if (Array.isArray(v)) {
    return v
      .filter((r): r is [unknown, unknown] => Array.isArray(r) && r.length === 2)
      .map(([a, b]) => [String(a), String(b)]);
  }
  return Object.entries(asRecord(v)).map(([a, b]) => [a, b]);
};

/**
 * A numeric column → integer minor units: 4118.75 EUR → 411875, 450000 ISK →
 * 450000. Null, an empty string or anything that is not a number → null (no
 * price in that currency).
 */
const toMinorUnits = (value: unknown, currency: CurrencyCode): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 10 ** MINOR_UNITS[currency]) : null;
};
const pricesFromRow = (r: ArticleRow): Record<CurrencyCode, number | null> => {
  const prices = {} as Record<CurrencyCode, number | null>;
  for (const code of CURRENCY_CODES) prices[code] = toMinorUnits(r[PRICE_COLUMN[code]], code);
  return prices;
};

const mapPriceList = (r: PriceListRow): PriceList => ({
  id: r.id, name: r.name, currency: r.currency, validFrom: r.valid_from ?? null, priceBasis: r.price_basis ?? null,
  terms: asObject(r.terms), packaging: asArray(r.packaging), contacts: asArray(r.contacts),
  notes: asArray<string>(r.notes), sourceFile: r.source_file ?? null, importedAt: r.imported_at,
});
const mapCurrency = (r: CurrencyRow): CatalogueCurrency => ({
  code: r.code as CurrencyCode, name: r.name, minorUnit: Number(r.minor_unit) === 0 ? 0 : 2, symbol: r.symbol ?? null,
  locales: asArray<unknown>(r.locales).filter((l): l is string => typeof l === 'string'), active: Boolean(r.active), sort: r.sort,
});
const mapProduct = (r: ProductRow): CatalogueProduct => ({
  id: r.id, priceListId: r.price_list_id ?? null, modelCode: r.model_code ?? null, name: r.name,
  description: r.description ?? null, kind: r.kind as ProductKind, unit: r.unit as ProductUnit,
  websiteSlug: r.website_slug ?? null, maxQty: r.max_qty, refPage: r.ref_page ?? null, tech: asTech(r.tech),
  sort: r.sort, active: Boolean(r.active),
});
const mapCategory = (r: CategoryRow): CatalogueCategory => ({
  key: r.key, name: r.name, labels: asObject(r.labels), selectMode: r.select_mode as SelectMode,
  required: Boolean(r.required), sort: r.sort,
});
const mapArticle = (r: ArticleRow): CatalogueArticle => {
  const prices = pricesFromRow(r);
  return {
    code: r.code, productId: r.product_id, categoryKey: r.category_key, sheetCategory: r.sheet_category ?? null,
    group: r.group ?? null, description: r.description, labels: asObject(r.labels), priceCents: prices.EUR, prices,
    priceType: r.price_type as PriceType, perSegment: Boolean(r.per_segment), perExtension: Boolean(r.per_extension), segments: r.segments ?? null,
    isDefault: Boolean(r.is_default), source: r.source as ArticleSource, notes: r.notes ?? null, sort: r.sort,
    active: Boolean(r.active),
  };
};

// ---------------------------------------------------------------------------
// Sorting — identical for both sources
// ---------------------------------------------------------------------------
const byProduct = (a: CatalogueProduct, b: CatalogueProduct) => a.sort - b.sort || a.id.localeCompare(b.id);
const byCategory = (a: CatalogueCategory, b: CatalogueCategory) => a.sort - b.sort || a.key.localeCompare(b.key);
const byArticle = (a: CatalogueArticle, b: CatalogueArticle) => a.sort - b.sort || a.code.localeCompare(b.code);
const byCurrency = (a: CatalogueCurrency, b: CatalogueCurrency) => a.sort - b.sort || a.code.localeCompare(b.code);

/**
 * An article's five-key price map. A snapshot written before `prices`
 * existed carries only priceCents (EUR cents): read it as the EUR price.
 */
const pricesOf = (a: Partial<CatalogueArticle>): Record<CurrencyCode, number | null> => {
  const given = a.prices;
  const prices = {} as Record<CurrencyCode, number | null>;
  for (const code of CURRENCY_CODES) {
    const v = given?.[code];
    prices[code] = typeof v === 'number' && Number.isFinite(v) ? v : null;
  }
  if (!given) prices.EUR = typeof a.priceCents === 'number' ? a.priceCents : null;
  return prices;
};

function normalise(c: Catalogue): Catalogue {
  // The database queries fetch active rows only; the snapshot carries every
  // row (an inactive article stays in it so an old order still resolves), so
  // drop the inactive ones here and both sources serve the same catalogue.
  // A snapshot written before `per_extension` existed has no perExtension
  // field: read it as false so the old file still loads. Likewise a snapshot
  // written before public.currencies existed has no `currencies` (it is EUR
  // only) and no `currency`; the EUR row is always present, in first place
  // once sorted, and a row with a code the site does not know is dropped.
  const partial = c as Partial<Catalogue>;
  const currency: CurrencyCode = isCurrencyCode(partial.currency) ? partial.currency : 'EUR';
  const known = (partial.currencies ?? []).filter((r) => isCurrencyCode(r.code));
  const currencies = (known.some((r) => r.code === 'EUR') ? known : [EUR_ROW, ...known]).sort(byCurrency);
  return {
    ...c,
    currency,
    currencies,
    priceLists: c.priceLists.filter((l) => (l as PriceList & { active?: boolean }).active !== false),
    products: c.products.filter((p) => p.active).sort(byProduct),
    categories: [...c.categories].sort(byCategory),
    articles: c.articles
      .filter((a) => a.active)
      .map((a) => {
        const prices = pricesOf(a);
        return { ...a, prices, priceCents: prices[currency], perExtension: Boolean((a as Partial<CatalogueArticle>).perExtension) };
      })
      .sort(byArticle),
  };
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------
let snapshotCache: Catalogue | null = null;
function snapshot(): Catalogue {
  snapshotCache ??= normalise(snapshotJson as unknown as Catalogue);
  return snapshotCache;
}

async function readDatabase(): Promise<Catalogue> {
  const db = createServerClient();
  if (!db) throw new Error(ENV_HINT);
  // One deadline for the whole read. Each fetch is already capped at
  // FETCH_TIMEOUT_MS by the client, but postgrest-js retries network errors
  // with a back-off; the shared signal stops the retries as well, so a dead
  // host costs one FETCH_TIMEOUT_MS, never a multiple of it.
  const deadline = new AbortController();
  const timer = setTimeout(() => deadline.abort(new Error(`no answer within ${FETCH_TIMEOUT_MS} ms`)), FETCH_TIMEOUT_MS);
  const rejectAt = new Promise<never>((_, reject) =>
    deadline.signal.addEventListener('abort', () => reject(deadline.signal.reason ?? new Error('aborted')), { once: true }),
  );
  let results;
  try {
    // The catalogue is small (a few hundred rows), well under PostgREST's
    // default 1000-row page; no pagination needed.
    results = await Promise.race([
      Promise.all([
        db.from('price_lists').select(COLUMNS.price_lists).eq('active', true).order('id').abortSignal(deadline.signal),
        // Every currency row, inactive ones included: the dashboard sets
        // `active` when a currency's prices are complete, and the site only
        // serves it to a locale from then on (currencyForLocale).
        db.from('currencies').select(COLUMNS.currencies).order('sort').order('code').abortSignal(deadline.signal),
        db.from('products').select(COLUMNS.products).eq('active', true).order('sort').order('id').abortSignal(deadline.signal),
        db.from('categories').select(COLUMNS.categories).order('sort').order('key').abortSignal(deadline.signal),
        db.from('articles').select(COLUMNS.articles).eq('active', true).order('sort').order('code').abortSignal(deadline.signal),
      ]),
      rejectAt,
    ]);
  } finally {
    clearTimeout(timer);
  }
  const [pl, cu, pr, ca, ar] = results;
  const failed = ([['price_lists', pl], ['currencies', cu], ['products', pr], ['categories', ca], ['articles', ar]] as const).find(([, r]) => r.error);
  if (failed) throw new Error(`${failed[0]}: ${failed[1].error?.message ?? 'query failed'}`);

  const catalogue: Catalogue = {
    priceLists: ((pl.data ?? []) as unknown as PriceListRow[]).map(mapPriceList),
    currencies: ((cu.data ?? []) as unknown as CurrencyRow[]).map(mapCurrency),
    products: ((pr.data ?? []) as unknown as ProductRow[]).map(mapProduct),
    categories: ((ca.data ?? []) as unknown as CategoryRow[]).map(mapCategory),
    articles: ((ar.data ?? []) as unknown as ArticleRow[]).map(mapArticle),
    currency: 'EUR',
    loadedAt: new Date().toISOString(),
    source: 'database',
  };
  if (catalogue.products.length === 0 || catalogue.categories.length === 0 || catalogue.articles.length === 0) {
    throw new Error(`empty catalogue (${catalogue.products.length} products, ${catalogue.articles.length} articles)`);
  }
  return normalise(catalogue);
}

// ---------------------------------------------------------------------------
// Memo
// ---------------------------------------------------------------------------
let memo: { until: number; catalogue: Catalogue } | null = null;
let inflight: Promise<Catalogue> | null = null;
let warned = false;

function warnOnce(reason: string) {
  if (warned) return;
  warned = true;
  console.warn(`[catalogue] using the committed snapshot: ${reason}`);
}

/** The memoised EUR catalogue: database if reachable, snapshot otherwise. */
function loadCatalogue(): Promise<Catalogue> {
  if (memo && memo.until > Date.now()) return Promise.resolve(memo.catalogue);
  if (inflight) return inflight;
  inflight = (async () => {
    let catalogue: Catalogue;
    try {
      if (!isSupabaseConfigured()) throw new Error(ENV_HINT);
      catalogue = await readDatabase();
    } catch (err) {
      warnOnce(err instanceof Error ? err.message : String(err));
      catalogue = snapshot();
    }
    memo = { until: Date.now() + CATALOGUE_TTL_MS, catalogue };
    return catalogue;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

/**
 * The whole catalogue: database if reachable, snapshot otherwise. Never
 * throws. Sorted products / categories / articles; inactive products and
 * articles are absent from both sources.
 *
 * Without a locale the EUR view (the memoised object itself). With a routing
 * locale ('is', 'nl' …) the view in that locale's currency: the same rows
 * with every priceCents = prices[currency] — one object per currency for the
 * life of the memo, so a page and the API route pricing the same order get
 * the same amounts.
 */
export async function getCatalogue(locale?: string): Promise<Catalogue> {
  const catalogue = await loadCatalogue();
  return locale === undefined ? catalogue : catalogueInCurrency(catalogue, currencyForLocale(catalogue, locale));
}

/** Drops the memo — tests and scripts only. */
export function resetCatalogueCache(): void {
  memo = null;
  inflight = null;
}

// ---------------------------------------------------------------------------
// Currency views
// ---------------------------------------------------------------------------

/**
 * The currency a locale is served in: the ACTIVE currency whose `locales`
 * list it, else EUR. Only EUR is active until Michael fills in and activates
 * another currency, so every locale — 'is' included — is EUR until then.
 */
export function currencyForLocale(catalogue: Pick<Catalogue, 'currencies'>, locale: string | null | undefined): CurrencyCode {
  const key = locale?.trim().toLowerCase();
  if (!key) return 'EUR';
  const match = (catalogue.currencies ?? []).find((c) => c.active && c.locales.some((l) => l.trim().toLowerCase() === key));
  return match?.code ?? 'EUR';
}

/**
 * One view per (catalogue object, currency): the WeakMap follows the 60 s
 * memo — a new database read is a new object with its own views — and the
 * views of a dropped catalogue go with it.
 */
const views = new WeakMap<Catalogue, Map<CurrencyCode, Catalogue>>();

/**
 * The catalogue with every priceCents in `currency` (prices[currency], null
 * where that currency has no price = on request) and `currency` set. Pure:
 * the rows are copied, never mutated; the same (catalogue, currency) pair
 * yields the same object. A catalogue already in that currency is returned
 * as is.
 */
export function catalogueInCurrency(catalogue: Catalogue, currency: CurrencyCode): Catalogue {
  if (catalogue.currency === currency) return catalogue;
  let perCurrency = views.get(catalogue);
  if (!perCurrency) {
    perCurrency = new Map();
    views.set(catalogue, perCurrency);
  }
  const cached = perCurrency.get(currency);
  if (cached) return cached;
  const view: Catalogue = {
    ...catalogue,
    currency,
    articles: catalogue.articles.map((a) => ({ ...a, priceCents: a.prices[currency] ?? null })),
  };
  perCurrency.set(currency, view);
  return view;
}

// ---------------------------------------------------------------------------
// Views for pages
// ---------------------------------------------------------------------------

/**
 * Everything the configurator on one product page needs, as a plain object a
 * server page can hand to a client component: the models sold from that page,
 * every category, the articles of those models, the price list they are
 * priced from, and the currency every priceCents is in (the page's locale's
 * currency — the dialog formats with it, and the API route prices the order
 * in the same view).
 */
export interface ConfiguratorData {
  products: CatalogueProduct[];
  categories: CatalogueCategory[];
  articles: CatalogueArticle[];
  priceList: { id: string; validFrom: string | null } | null;
  currency: CurrencyCode;
}

function productsForSlug(catalogue: Catalogue, websiteSlug: string): CatalogueProduct[] {
  return catalogue.products.filter((p) => p.active && p.websiteSlug === websiteSlug);
}

/** Configurator data in the locale's currency; EUR without a locale. */
export async function getConfiguratorData(websiteSlug: string, locale?: string): Promise<ConfiguratorData> {
  const catalogue = await getCatalogue(locale);
  const products = productsForSlug(catalogue, websiteSlug);
  const ids = new Set(products.map((p) => p.id));
  const articles = catalogue.articles.filter((a) => a.active && ids.has(a.productId));
  const listId = products.find((p) => p.priceListId)?.priceListId ?? null;
  const list = listId ? catalogue.priceLists.find((l) => l.id === listId) : undefined;
  return {
    products,
    categories: [...catalogue.categories],
    articles,
    priceList: list ? { id: list.id, validFrom: list.validFrom } : null,
    currency: catalogue.currency,
  };
}

/** Lowest 'base' article price among the models sold from a page, in minor units of the view's currency. */
function fromPriceOf(catalogue: Catalogue, products: CatalogueProduct[]): number | null {
  const ids = new Set(products.map((p) => p.id));
  let min: number | null = null;
  for (const a of catalogue.articles) {
    if (!a.active || a.priceType !== 'base' || a.priceCents === null || !ids.has(a.productId)) continue;
    if (min === null || a.priceCents < min) min = a.priceCents;
  }
  return min;
}

/**
 * "From" price of a product page in minor units of the locale's currency
 * (EUR without a locale), or null when nothing is priced in it.
 */
export async function getFromPriceCents(websiteSlug: string, locale?: string): Promise<number | null> {
  const catalogue = await getCatalogue(locale);
  return fromPriceOf(catalogue, productsForSlug(catalogue, websiteSlug));
}

/** "From" price per product page (websiteSlug → minor units | null) in the locale's currency, for hub tables. */
export async function getProductPrices(locale?: string): Promise<Map<string, number | null>> {
  const catalogue = await getCatalogue(locale);
  const out = new Map<string, number | null>();
  for (const p of catalogue.products) {
    if (!p.active || !p.websiteSlug || out.has(p.websiteSlug)) continue;
    out.set(p.websiteSlug, fromPriceOf(catalogue, productsForSlug(catalogue, p.websiteSlug)));
  }
  return out;
}
