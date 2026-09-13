import { formatCents } from './pricing';
import type { Catalogue, CatalogueArticle, CurrencyCode } from './types';

/**
 * Price tokens in prose.
 *
 * Copy that mentions a price (FAQ answers, blog posts, meta descriptions)
 * carries a token instead of a figure, and the figure is filled in from the
 * catalogue when the page renders — so a price edited in the database never
 * leaves a stale number in a sentence.
 *
 *   {{price:solo-flex}}            lowest base price of the models sold from
 *                                  the /products/solo-flex page
 *   {{price:product:duo-flex}}     lowest base price of one product id
 *   {{price:article:RS-MX-AS1}}    the price of one article
 *
 * Every token renders as a currency amount for the locale, in the currency
 * of the catalogue view it is resolved against (`catalogue.currency` — pass
 * the view for the page's locale, getCatalogue(locale)): "€4,118.75" in
 * English, "€ 4.118,75" in Dutch, "4 118,75 €" in French, "450.000 kr." in
 * Icelandic once ISK is active. Whole amounts drop the decimals. A token
 * that cannot be priced renders the `onRequest` text so the sentence still
 * reads, and is reported in `unresolved`.
 */

const TOKEN = /\{\{price:(?:(article|product):)?([A-Za-z0-9-]+)\}\}/g;

/** Currency for prose: two decimals unless the amount is whole (ISK: never any). */
export function formatMoney(cents: number, localeTag: string, currency: CurrencyCode = 'EUR'): string {
  return formatCents(cents, localeTag, currency);
}

function lowestBase(articles: CatalogueArticle[], productIds: Set<string>): number | null {
  let best: number | null = null;
  for (const a of articles) {
    if (!a.active || a.priceType !== 'base' || a.priceCents === null || !productIds.has(a.productId)) continue;
    if (best === null || a.priceCents < best) best = a.priceCents;
  }
  return best;
}

/** Cents for one token, or null when the catalogue cannot price it. */
export function priceTokenCents(catalogue: Catalogue, kind: 'article' | 'product' | undefined, key: string): number | null {
  if (kind === 'article') {
    const article = catalogue.articles.find((a) => a.code === key && a.active);
    return article?.priceCents ?? null;
  }
  if (kind === 'product') {
    return lowestBase(catalogue.articles, new Set([key]));
  }
  const ids = new Set(catalogue.products.filter((p) => p.active && p.websiteSlug === key).map((p) => p.id));
  if (ids.size === 0) return null;
  return lowestBase(catalogue.articles, ids);
}

export interface ResolvedText {
  text: string;
  /** Tokens that had no price and were replaced by `onRequest` */
  unresolved: string[];
}

/**
 * Replace every price token in `text`, formatting in `catalogue.currency`.
 * Text without tokens is returned as is.
 */
export function resolvePriceTokens(
  text: string,
  catalogue: Catalogue,
  localeTag: string,
  options: { onRequest: string }
): ResolvedText {
  const unresolved: string[] = [];
  if (!text.includes('{{price:')) return { text, unresolved };
  const out = text.replace(TOKEN, (token, kind: 'article' | 'product' | undefined, key: string) => {
    const cents = priceTokenCents(catalogue, kind, key);
    if (cents === null) {
      unresolved.push(token);
      return options.onRequest;
    }
    return formatMoney(cents, localeTag, catalogue.currency);
  });
  return { text: out, unresolved };
}

/** True when a string still carries a token — for checks before publishing. */
export function hasPriceTokens(text: string): boolean {
  return /\{\{price:/.test(text);
}
