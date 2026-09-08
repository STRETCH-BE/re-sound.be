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
 *    `source` and `loadedAt`.
 *
 * Only the four public tables are read, with explicit column lists.
 * supplier_articles is never queried by site code.
 */
import 'server-only';

import snapshotJson from '@/data/catalogue.snapshot.json';
import { createServerClient, ENV_HINT, FETCH_TIMEOUT_MS, isSupabaseConfigured } from '@/lib/db/supabase';

import type {
  ArticleSource,
  Catalogue,
  CatalogueArticle,
  CatalogueCategory,
  CatalogueProduct,
  PriceList,
  PriceType,
  ProductKind,
  ProductUnit,
  SelectMode,
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
interface ArticleRow {
  code: string; product_id: string; category_key: string; sheet_category: string | null; group: string | null;
  description: string; labels: unknown; price_cents: number | null; price_type: string; per_segment: boolean;
  segments: number | null; is_default: boolean; source: string; notes: string | null; sort: number; active: boolean;
}

const COLUMNS = {
  price_lists: 'id, name, currency, valid_from, price_basis, terms, packaging, contacts, notes, source_file, imported_at',
  products: 'id, price_list_id, model_code, name, description, kind, unit, website_slug, max_qty, ref_page, tech, sort, active',
  categories: 'key, name, labels, select_mode, required, sort',
  articles: 'code, product_id, category_key, sheet_category, "group", description, labels, price_cents, price_type, per_segment, segments, is_default, source, notes, sort, active',
} as const;

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

const mapPriceList = (r: PriceListRow): PriceList => ({
  id: r.id, name: r.name, currency: r.currency, validFrom: r.valid_from ?? null, priceBasis: r.price_basis ?? null,
  terms: asObject(r.terms), packaging: asArray(r.packaging), contacts: asArray(r.contacts),
  notes: asArray<string>(r.notes), sourceFile: r.source_file ?? null, importedAt: r.imported_at,
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
const mapArticle = (r: ArticleRow): CatalogueArticle => ({
  code: r.code, productId: r.product_id, categoryKey: r.category_key, sheetCategory: r.sheet_category ?? null,
  group: r.group ?? null, description: r.description, labels: asObject(r.labels), priceCents: r.price_cents ?? null,
  priceType: r.price_type as PriceType, perSegment: Boolean(r.per_segment), segments: r.segments ?? null,
  isDefault: Boolean(r.is_default), source: r.source as ArticleSource, notes: r.notes ?? null, sort: r.sort,
  active: Boolean(r.active),
});

// ---------------------------------------------------------------------------
// Sorting — identical for both sources
// ---------------------------------------------------------------------------
const byProduct = (a: CatalogueProduct, b: CatalogueProduct) => a.sort - b.sort || a.id.localeCompare(b.id);
const byCategory = (a: CatalogueCategory, b: CatalogueCategory) => a.sort - b.sort || a.key.localeCompare(b.key);
const byArticle = (a: CatalogueArticle, b: CatalogueArticle) => a.sort - b.sort || a.code.localeCompare(b.code);

function normalise(c: Catalogue): Catalogue {
  // The database queries fetch active rows only; the snapshot carries every
  // row (an inactive article stays in it so an old order still resolves), so
  // drop the inactive ones here and both sources serve the same catalogue.
  return {
    ...c,
    priceLists: c.priceLists.filter((l) => (l as PriceList & { active?: boolean }).active !== false),
    products: c.products.filter((p) => p.active).sort(byProduct),
    categories: [...c.categories].sort(byCategory),
    articles: c.articles.filter((a) => a.active).sort(byArticle),
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
        db.from('products').select(COLUMNS.products).eq('active', true).order('sort').order('id').abortSignal(deadline.signal),
        db.from('categories').select(COLUMNS.categories).order('sort').order('key').abortSignal(deadline.signal),
        db.from('articles').select(COLUMNS.articles).eq('active', true).order('sort').order('code').abortSignal(deadline.signal),
      ]),
      rejectAt,
    ]);
  } finally {
    clearTimeout(timer);
  }
  const [pl, pr, ca, ar] = results;
  const failed = ([['price_lists', pl], ['products', pr], ['categories', ca], ['articles', ar]] as const).find(([, r]) => r.error);
  if (failed) throw new Error(`${failed[0]}: ${failed[1].error?.message ?? 'query failed'}`);

  const catalogue: Catalogue = {
    priceLists: ((pl.data ?? []) as unknown as PriceListRow[]).map(mapPriceList),
    products: ((pr.data ?? []) as unknown as ProductRow[]).map(mapProduct),
    categories: ((ca.data ?? []) as unknown as CategoryRow[]).map(mapCategory),
    articles: ((ar.data ?? []) as unknown as ArticleRow[]).map(mapArticle),
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

/**
 * The whole catalogue: database if reachable, snapshot otherwise. Never
 * throws. Sorted products / categories / articles; inactive products and
 * articles are absent from both sources.
 */
export async function getCatalogue(): Promise<Catalogue> {
  if (memo && memo.until > Date.now()) return memo.catalogue;
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

/** Drops the memo — tests and scripts only. */
export function resetCatalogueCache(): void {
  memo = null;
  inflight = null;
}

// ---------------------------------------------------------------------------
// Views for pages
// ---------------------------------------------------------------------------

/**
 * Everything the configurator on one product page needs, as a plain object a
 * server page can hand to a client component: the models sold from that page,
 * every category, the articles of those models, and the price list they are
 * priced from.
 */
export interface ConfiguratorData {
  products: CatalogueProduct[];
  categories: CatalogueCategory[];
  articles: CatalogueArticle[];
  priceList: { id: string; validFrom: string | null } | null;
}

function productsForSlug(catalogue: Catalogue, websiteSlug: string): CatalogueProduct[] {
  return catalogue.products.filter((p) => p.active && p.websiteSlug === websiteSlug);
}

export async function getConfiguratorData(websiteSlug: string): Promise<ConfiguratorData> {
  const catalogue = await getCatalogue();
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
  };
}

/** Lowest 'base' article price among the models sold from a page, in cents. */
function fromPriceOf(catalogue: Catalogue, products: CatalogueProduct[]): number | null {
  const ids = new Set(products.map((p) => p.id));
  let min: number | null = null;
  for (const a of catalogue.articles) {
    if (!a.active || a.priceType !== 'base' || a.priceCents === null || !ids.has(a.productId)) continue;
    if (min === null || a.priceCents < min) min = a.priceCents;
  }
  return min;
}

/** "From" price of a product page in cents, or null when nothing is priced. */
export async function getFromPriceCents(websiteSlug: string): Promise<number | null> {
  const catalogue = await getCatalogue();
  return fromPriceOf(catalogue, productsForSlug(catalogue, websiteSlug));
}

/** "From" price per product page (websiteSlug → cents | null), for hub tables. */
export async function getProductPrices(): Promise<Map<string, number | null>> {
  const catalogue = await getCatalogue();
  const out = new Map<string, number | null>();
  for (const p of catalogue.products) {
    if (!p.active || !p.websiteSlug || out.has(p.websiteSlug)) continue;
    out.set(p.websiteSlug, fromPriceOf(catalogue, productsForSlug(catalogue, p.websiteSlug)));
  }
  return out;
}
