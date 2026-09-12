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
export const ADDITIONAL_SEGMENTS_CATEGORY = 'additional_segments';
export const INSTALLATION_CATEGORY = 'installation';
export const INSTALLATION_EXTENSION_CATEGORY = 'installation_extension';
export const TRANSPORT_CATEGORY = 'transport';

/**
 * Delivery countries the flat mainland-Europe transport rate does not cover:
 * the islands the order form offers (src/lib/order/vat.ts). Michael to
 * confirm (docs/needs-michael.md). Every other country of the form — and an
 * unknown or empty one — is read as mainland Europe.
 */
export const NON_MAINLAND_EUROPE: ReadonlySet<string> = new Set(['GB', 'XI', 'IE', 'MT', 'CY', 'IS']);

/**
 * The country the transport rule assumes when defaultSelection() is given
 * none: the order form opens on Belgium, so the first price the buyer sees
 * is the one the form will show.
 */
export const DEFAULT_TRANSPORT_COUNTRY = 'BE';

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

// ---------------------------------------------------------------------------
// Transport — one flat rate within mainland Europe, on request elsewhere
// ---------------------------------------------------------------------------

/**
 * Whether a delivery country (ISO 3166-1 alpha-2, any case) gets the flat
 * mainland-Europe transport rate. Empty or unknown → true: the order form
 * opens on Belgium, and a country the form does not offer cannot be ordered.
 */
export function isMainlandEurope(country: string | null | undefined): boolean {
  const key = (country ?? '').trim().toUpperCase();
  return !NON_MAINLAND_EUROPE.has(key);
}

/** Transport article suffix: WEB-…-TRANSPORT-EU (flat rate) or -XX (on request). */
export type TransportSuffix = 'EU' | 'XX';

export function transportSuffixForCountry(country: string | null | undefined): TransportSuffix {
  return isMainlandEurope(country) ? 'EU' : 'XX';
}

/**
 * The product's transport article for a country, by the code suffix after
 * the last hyphen (WEB-SOLO-ECO-TRANSPORT-EU → 'EU'), like the socket
 * helper. Null when the product has no transport articles at all (panels,
 * models not sold online) — or none with the wanted suffix, so an island
 * delivery never silently gets the mainland rate.
 */
export function transportArticleForCountry(
  product: CatalogueProduct | string,
  slice: Pick<CatalogueSlice, 'articles'>,
  country: string | null | undefined,
): CatalogueArticle | null {
  const id = typeof product === 'string' ? product : product.id;
  const transports = articlesFor(id, slice).filter((a) => a.categoryKey === TRANSPORT_CATEGORY);
  if (transports.length === 0) return null;
  const wanted = transportSuffixForCountry(country);
  return transports.find((a) => articleSuffix(a.code) === wanted) ?? null;
}

// ---------------------------------------------------------------------------
// Extension segments and auto categories
// ---------------------------------------------------------------------------

/**
 * Extension segments of a selection: the sum of `segments` over the selected
 * additional_segments articles (Modular XL: RS-MX-AS1 = 1, AS2 = 2, AS3 = 3).
 * 0 when none is selected. Unknown codes are ignored.
 */
export function extensionSegments(articleCodes: string[], slice: Pick<CatalogueSlice, 'articles'>): number {
  const byCode = new Map(slice.articles.map((a) => [a.code, a]));
  let sum = 0;
  for (const code of articleCodes) {
    const a = byCode.get(code);
    if (a && a.categoryKey === ADDITIONAL_SEGMENTS_CATEGORY) sum += a.segments ?? 0;
  }
  return sum;
}

/** An `auto` category is never offered as a choice; its lines are added by rule (rule 8). */
export function isAutoCategory(category: CatalogueCategory): boolean {
  return category.selectMode === 'auto';
}

function autoCategoryKeys(slice: Pick<CatalogueSlice, 'categories'>): Set<string> {
  return new Set(slice.categories.filter(isAutoCategory).map((c) => c.key));
}

/** articlesFor() minus the articles of auto categories — what the configurator may show. */
export function chooseableArticles(
  product: CatalogueProduct | string,
  slice: Pick<CatalogueSlice, 'categories' | 'articles'>,
): CatalogueArticle[] {
  const id = typeof product === 'string' ? product : product.id;
  const auto = autoCategoryKeys(slice);
  return articlesFor(id, slice).filter((a) => !auto.has(a.categoryKey));
}

/** categoriesFor() minus the auto categories — the sections the configurator shows. */
export function chooseableCategories(
  product: CatalogueProduct | string,
  slice: Pick<CatalogueSlice, 'categories' | 'articles'>,
): CatalogueCategory[] {
  return categoriesFor(product, slice).filter((c) => !isAutoCategory(c));
}

/**
 * The canonical form of a selection (rule 8 in ./types.ts): every article of
 * an auto category is dropped from `articles`, then the auto lines are
 * appended by rule —
 *   - the product's transport article for the delivery country, when the
 *     product has any (transportArticleForCountry);
 *   - every installation_extension article of the product, when an
 *     installation article of the product is selected AND
 *     extensionSegments(...) > 0.
 * The non-auto codes keep their order; the auto codes follow. Codes the
 * product does not know are kept as they are, so validateSelection() still
 * reports them. The callers canonicalise after every change and before
 * pricing; `country` empty or unknown counts as mainland Europe.
 */
export function canonicalSelection(
  selection: Selection,
  slice: Pick<CatalogueSlice, 'categories' | 'articles'>,
  country?: string | null,
): Selection {
  const auto = autoCategoryKeys(slice);
  const own = articlesFor(selection.productId, slice);
  const byCode = new Map(own.map((a) => [a.code, a]));
  const kept = selection.articles.filter((code) => {
    const a = byCode.get(code);
    return !a || !auto.has(a.categoryKey);
  });

  const added: string[] = [];
  const transport = transportArticleForCountry(selection.productId, slice, country);
  if (transport) added.push(transport.code);

  const hasInstallation = kept.some((code) => byCode.get(code)?.categoryKey === INSTALLATION_CATEGORY);
  if (hasInstallation && extensionSegments(kept, slice) > 0) {
    for (const a of own) if (a.categoryKey === INSTALLATION_EXTENSION_CATEGORY) added.push(a.code);
  }

  const seen = new Set(kept);
  const articles = [...kept];
  for (const code of added) {
    if (seen.has(code)) continue;
    seen.add(code);
    articles.push(code);
  }
  return { ...selection, articles };
}

/**
 * The selection a product page opens with: quantity 1, the is_default article
 * of every single-select category (the first article when a required category
 * has no default), the socket for the country when one is known, any
 * multi-select article flagged as default (none today) — in canonical form,
 * so the transport line for the country is on it. Only inside that transport
 * rule does a missing `country` default to Belgium (DEFAULT_TRANSPORT_COUNTRY):
 * the socket keeps the catalogue default when no country is given.
 */
export function defaultSelection(
  product: CatalogueProduct,
  slice: Pick<CatalogueSlice, 'categories' | 'articles'>,
  country?: string | null,
): Selection {
  const articles = articlesFor(product.id, slice);
  const codes: string[] = [];
  for (const category of categoriesFor(product, slice)) {
    if (isAutoCategory(category)) continue; // added by canonicalSelection()
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
  return canonicalSelection({ productId: product.id, quantity: 1, articles: codes }, slice, country || DEFAULT_TRANSPORT_COUNTRY);
}

/**
 * Checks a selection against the slice. Reasons are stable machine-readable
 * strings, optionally followed by ':' and the offending key or code:
 *   unknown_product · product_inactive · product_not_for_sale ·
 *   quantity_invalid · articles_invalid · unknown_article:<code> ·
 *   duplicate_article:<code> · category_required:<key> · category_single:<key>
 * An auto category counts as an optional single one (at most one article);
 * whether the right auto article is on the selection is not checked here —
 * the callers canonicalise before pricing (canonicalSelection).
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
    if (category.selectMode === 'auto') {
      if (n > 1) return fail(`category_single:${category.key}`);
      continue;
    }
    if (category.selectMode !== 'single') continue;
    if (category.required && n !== 1) return fail(`category_required:${category.key}`);
    if (!category.required && n > 1) return fail(`category_single:${category.key}`);
  }
  return { ok: true };
}
