import type { Catalogue, CatalogueArticle } from './types';

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
 * Every token renders as a currency amount for the locale: "€4,118.75" in
 * English, "€ 4.118,75" in Dutch, "4 118,75 €" in French. Whole euros drop
 * the decimals. A token that cannot be priced renders the `onRequest` text so
 * the sentence still reads, and is reported in `unresolved`.
 */

const TOKEN = /\{\{price:(?:(article|product):)?([A-Za-z0-9-]+)\}\}/g;

/** Currency for prose: two decimals unless the amount is whole euros. */
export function formatEuroCents(cents: number, localeTag: string): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
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

/** Replace every price token in `text`. Text without tokens is returned as is. */
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
    return formatEuroCents(cents, localeTag);
  });
  return { text: out, unresolved };
}

/** True when a string still carries a token — for checks before publishing. */
export function hasPriceTokens(text: string): boolean {
  return /\{\{price:/.test(text);
}
