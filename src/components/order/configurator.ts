/**
 * Pure helpers behind the order configurator. No React, no node APIs: the
 * dialog runs them in the browser on the ConfiguratorData a product page
 * handed down, and nothing here decides an amount the API route does not
 * recompute from the same catalogue helpers.
 */
import { formatCents, lineLabel, priceSelection } from '@/lib/catalogue/pricing';
import {
  articleSuffix,
  articlesFor,
  categoriesFor,
  defaultSelection,
  POWER_SOCKET_CATEGORY,
  socketArticleForCountry,
  validateSelection,
  type CatalogueSlice,
} from '@/lib/catalogue/select';
import type { CatalogueArticle, CatalogueCategory, CatalogueProduct, PricedSelection, Selection } from '@/lib/catalogue/types';
import { resolveVat, type VatInput, type VatMode } from '@/lib/order/vat';

/** A priced selection plus the VAT treatment of src/lib/order/vat.ts. */
export interface PricedOrder extends PricedSelection {
  vatRate: number;
  vatMode: VatMode;
  vatCents: number;
  grossCents: number;
}

/**
 * Net from the catalogue rules, VAT from vat.ts — the same arithmetic the
 * legacy dialog used (VAT rounded once, on the net). Null when the selection
 * does not validate against the slice, so a caller never hits the throw in
 * priceSelection.
 */
export function priceWithVat(selection: Selection, slice: CatalogueSlice, vat: VatInput): PricedOrder | null {
  if (!validateSelection(selection, slice).ok) return null;
  const priced = priceSelection(selection, slice);
  const { rate, mode } = resolveVat(vat);
  const vatCents = Math.round(priced.netCents * rate);
  return { ...priced, vatRate: rate, vatMode: mode, vatCents, grossCents: priced.netCents + vatCents };
}

/** One category of a product with its articles, in catalogue order. */
export interface CategoryGroup {
  category: CatalogueCategory;
  articles: CatalogueArticle[];
}

export function groupsFor(product: CatalogueProduct, slice: CatalogueSlice): CategoryGroup[] {
  const all = articlesFor(product.id, slice);
  return categoriesFor(product, slice).map((category) => ({
    category,
    articles: all.filter((a) => a.categoryKey === category.key),
  }));
}

/** Replace whatever was chosen in the group by `code` (null = nothing). */
export function chooseSingle(articles: string[], group: CategoryGroup, code: string | null): string[] {
  const inGroup = new Set(group.articles.map((a) => a.code));
  const rest = articles.filter((c) => !inGroup.has(c));
  return code ? [...rest, code] : rest;
}

export function toggleMulti(articles: string[], code: string, on: boolean): string[] {
  const rest = articles.filter((c) => c !== code);
  return on ? [...rest, code] : rest;
}

/** The selection with its socket article swapped for the country's one. */
export function withSocketFor(
  articles: string[],
  product: CatalogueProduct,
  slice: CatalogueSlice,
  country: string | null | undefined,
): string[] {
  const socket = socketArticleForCountry(product, slice, country);
  if (!socket) return articles;
  const sockets = new Set(
    articlesFor(product.id, slice)
      .filter((a) => a.categoryKey === POWER_SOCKET_CATEGORY)
      .map((a) => a.code),
  );
  return [...articles.filter((c) => !sockets.has(c)), socket.code];
}

/**
 * The articles for `to` that keep as much of `articles` as that model has:
 * an article is carried over by exact code, else by code suffix within the
 * same category (RS-DW-XA → RS-DF-XA, WEB-DUO-WORK-INST → WEB-DUO-FLEX-INST),
 * so switching Duo Work → Duo Flex keeps the anthracite exterior, the felt,
 * the socket and the Moving-Kit. Whatever the new model lacks falls back to
 * its default. Also used to repair a selection against a fresher catalogue
 * slice (an article deactivated since the page was rendered simply drops).
 */
export function carryOver(
  articles: string[],
  to: CatalogueProduct,
  slice: CatalogueSlice,
  country?: string | null,
): string[] {
  const target = articlesFor(to.id, slice);
  const byCode = new Map(target.map((a) => [a.code, a]));
  const bySuffix = new Map(target.map((a) => [articleSuffix(a.code), a]));
  const known = new Map(slice.articles.map((a) => [a.code, a]));
  const categories = categoriesFor(to, slice);
  let out = defaultSelection(to, slice, country).articles;
  for (const code of articles) {
    const previous = known.get(code);
    const match = byCode.get(code) ?? bySuffix.get(articleSuffix(code));
    if (!match) continue;
    if (previous && previous.categoryKey !== match.categoryKey) continue;
    const category = categories.find((c) => c.key === match.categoryKey);
    if (!category) continue;
    out =
      category.selectMode === 'single'
        ? chooseSingle(out, { category, articles: target.filter((a) => a.categoryKey === category.key) }, match.code)
        : toggleMulti(out, match.code, true);
  }
  return out;
}

/** Lowest base price of a model — what its picker card shows as "from". */
export function modelFromPrice(product: CatalogueProduct, slice: CatalogueSlice): number | null {
  let min: number | null = null;
  for (const a of articlesFor(product.id, slice)) {
    if (a.priceType !== 'base' || a.priceCents === null) continue;
    if (min === null || a.priceCents < min) min = a.priceCents;
  }
  return min;
}

/**
 * How an article changes the price, for the label next to its control.
 * `cents` is always a positive magnitude; the kind carries the sign.
 */
export type PriceEffect =
  | { kind: 'base'; cents: number }
  | { kind: 'included' }
  | { kind: 'option'; cents: number }
  | { kind: 'credit'; cents: number }
  | { kind: 'onRequest' };

export function priceEffect(article: Pick<CatalogueArticle, 'priceCents' | 'priceType'>): PriceEffect {
  if (article.priceCents === null) return { kind: 'onRequest' };
  if (article.priceType === 'base') return { kind: 'base', cents: article.priceCents };
  if (article.priceCents === 0) return { kind: 'included' };
  if (article.priceCents < 0) return { kind: 'credit', cents: -article.priceCents };
  return { kind: 'option', cents: article.priceCents };
}

/**
 * Short lists with short labels (colours, door side, felt) sit side by side
 * as chips; anything longer (sockets, segments, tables) stacks as rows so
 * the price effect stays on the same line as its label.
 */
export function layoutFor(articles: CatalogueArticle[], locale: string): 'chips' | 'rows' {
  const short = articles.every((a) => lineLabel(a, locale).length <= 24);
  return articles.length <= 4 && short ? 'chips' : 'rows';
}

/** Money for the dialog: catalogue formatter, two decimals unless whole euros. */
export const money = (cents: number, localeTag: string): string => formatCents(cents, localeTag);
