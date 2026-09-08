/**
 * Pure, isomorphic helpers for building and checking a Selection against a
 * catalogue slice. No database, no node APIs: the order dialog (browser) and
 * the API route (server) run exactly this code.
 *
 * A "slice" is whatever part of the catalogue the caller holds — the
 * ConfiguratorData a page passes to the dialog, or the whole Catalogue.
 */
import type { CatalogueArticle, CatalogueCategory, CatalogueProduct, Selection } from './types';

export interface CatalogueSlice {
  products: CatalogueProduct[];
  categories: CatalogueCategory[];
  articles: CatalogueArticle[];
}

export const POWER_SOCKET_CATEGORY = 'power_socket';

export type SocketSuffix = 'PE' | 'PF' | 'PG' | 'PJ' | 'PK';

/**
 * Socket article per delivery country, by the code suffix after the last
 * hyphen (RS-SF-PE → 'PE'), for every country the order form offers
 * (src/lib/order/vat.ts):
 *   type E (PE): BE FR PL CZ SK · type J (PJ): CH LI · type K (PK): DK ·
 *   type G (PG): GB XI IE MT CY ·
 *   type F / Schuko (PF): DE AT NL LU ES PT FI SE NO IS GR HU RO BG HR SI
 *                         EE LV LT RS UA
 * Italy (type L) is deliberately absent: it gets the type F article as a
 * default, not as a match, and socketMatchForCountry() tells the two apart
 * so the review step can say so.
 */
const SOCKET_BY_COUNTRY: Record<string, SocketSuffix> = {
  BE: 'PE', FR: 'PE', PL: 'PE', CZ: 'PE', SK: 'PE',
  CH: 'PJ', LI: 'PJ',
  DK: 'PK',
  GB: 'PG', XI: 'PG', IE: 'PG', MT: 'PG', CY: 'PG',
  DE: 'PF', AT: 'PF', NL: 'PF', LU: 'PF', ES: 'PF', PT: 'PF', FI: 'PF', SE: 'PF', NO: 'PF', IS: 'PF',
  GR: 'PF', HU: 'PF', RO: 'PF', BG: 'PF', HR: 'PF', SI: 'PF', EE: 'PF', LV: 'PF', LT: 'PF', RS: 'PF', UA: 'PF',
};
const SOCKET_DEFAULT: SocketSuffix = 'PF';

export type ValidationResult = { ok: true } | { ok: false; reason: string };

const byArticle = (a: CatalogueArticle, b: CatalogueArticle) => a.sort - b.sort || a.code.localeCompare(b.code);
const byCategory = (a: CatalogueCategory, b: CatalogueCategory) => a.sort - b.sort || a.key.localeCompare(b.key);

/** The part of an article code after the last hyphen: RS-MX-AS2 → 'AS2'. */
export function articleSuffix(code: string): string {
  const i = code.lastIndexOf('-');
  return i >= 0 ? code.slice(i + 1) : code;
}

export function productById(productId: string, slice: Pick<CatalogueSlice, 'products'>): CatalogueProduct | null {
  return slice.products.find((p) => p.id === productId) ?? null;
}

/** Active articles of one product, in catalogue order. */
export function articlesFor(productId: string, slice: Pick<CatalogueSlice, 'articles'>): CatalogueArticle[] {
  return slice.articles.filter((a) => a.active && a.productId === productId).sort(byArticle);
}

/** Categories that have at least one active article for the product, in sort order. */
export function categoriesFor(
  product: CatalogueProduct | string,
  slice: Pick<CatalogueSlice, 'categories' | 'articles'>,
): CatalogueCategory[] {
  const id = typeof product === 'string' ? product : product.id;
  const used = new Set(articlesFor(id, slice).map((a) => a.categoryKey));
  return slice.categories.filter((c) => used.has(c.key)).sort(byCategory);
}

/**
 * The socket suffix listed for a delivery country (ISO 3166-1 alpha-2, any
 * case), or null when the country is not in the map and only the type F
 * default applies.
 */
export function socketMatchForCountry(country: string | null | undefined): SocketSuffix | null {
  const key = (country ?? '').trim().toUpperCase();
  return SOCKET_BY_COUNTRY[key] ?? null;
}

/** Which socket suffix a delivery country gets: its match, else type F. */
export function socketSuffixForCountry(country: string | null | undefined): SocketSuffix {
  return socketMatchForCountry(country) ?? SOCKET_DEFAULT;
}

/**
 * The product's socket article for a country: the one whose code suffix
 * matches the country's socket type, else the type F one, else null when the
 * product has no socket articles at all (textile products).
 */
export function socketArticleForCountry(
  product: CatalogueProduct | string,
  slice: Pick<CatalogueSlice, 'articles'>,
  country: string | null | undefined,
): CatalogueArticle | null {
  const id = typeof product === 'string' ? product : product.id;
  const sockets = articlesFor(id, slice).filter((a) => a.categoryKey === POWER_SOCKET_CATEGORY);
  if (sockets.length === 0) return null;
  const wanted = socketSuffixForCountry(country);
  return (
    sockets.find((a) => articleSuffix(a.code) === wanted) ??
    sockets.find((a) => articleSuffix(a.code) === SOCKET_DEFAULT) ??
    null
  );
}

/**
 * The selection a product page opens with: quantity 1, the is_default article
 * of every single-select category (the first article when a required category
 * has no default), the socket for the country when one is known, and any
 * multi-select article flagged as default (none today).
 */
export function defaultSelection(
  product: CatalogueProduct,
  slice: Pick<CatalogueSlice, 'categories' | 'articles'>,
  country?: string | null,
): Selection {
  const articles = articlesFor(product.id, slice);
  const codes: string[] = [];
  for (const category of categoriesFor(product, slice)) {
    const inCategory = articles.filter((a) => a.categoryKey === category.key);
    if (category.selectMode === 'single') {
      let pick: CatalogueArticle | undefined;
      if (category.key === POWER_SOCKET_CATEGORY && country) pick = socketArticleForCountry(product, slice, country) ?? undefined;
      pick ??= inCategory.find((a) => a.isDefault);
      if (!pick && category.required) pick = inCategory[0];
      if (pick) codes.push(pick.code);
    } else {
      for (const a of inCategory) if (a.isDefault) codes.push(a.code);
    }
  }
  return { productId: product.id, quantity: 1, articles: codes };
}

/**
 * Checks a selection against the slice. Reasons are stable machine-readable
 * strings, optionally followed by ':' and the offending key or code:
 *   unknown_product · product_inactive · product_not_for_sale ·
 *   quantity_invalid · articles_invalid · unknown_article:<code> ·
 *   duplicate_article:<code> · category_required:<key> · category_single:<key>
 */
export function validateSelection(selection: Selection, slice: CatalogueSlice): ValidationResult {
  const fail = (reason: string): ValidationResult => ({ ok: false, reason });

  if (!selection || typeof selection !== 'object') return fail('unknown_product');
  const product = typeof selection.productId === 'string' ? productById(selection.productId, slice) : null;
  if (!product) return fail('unknown_product');
  if (!product.active) return fail('product_inactive');
  if (!product.websiteSlug) return fail('product_not_for_sale');

  const q = selection.quantity;
  if (typeof q !== 'number' || !Number.isInteger(q) || q < 1 || q > product.maxQty) return fail('quantity_invalid');

  if (!Array.isArray(selection.articles) || selection.articles.some((c) => typeof c !== 'string')) return fail('articles_invalid');

  const byCode = new Map(articlesFor(product.id, slice).map((a) => [a.code, a]));
  const seen = new Set<string>();
  const perCategory = new Map<string, number>();
  for (const code of selection.articles) {
    const article = byCode.get(code);
    if (!article) return fail(`unknown_article:${code}`);
    if (seen.has(code)) return fail(`duplicate_article:${code}`);
    seen.add(code);
    perCategory.set(article.categoryKey, (perCategory.get(article.categoryKey) ?? 0) + 1);
  }

  for (const category of categoriesFor(product, slice)) {
    const n = perCategory.get(category.key) ?? 0;
    if (category.selectMode !== 'single') continue;
    if (category.required && n !== 1) return fail(`category_required:${category.key}`);
    if (!category.required && n > 1) return fail(`category_single:${category.key}`);
  }
  return { ok: true };
}
