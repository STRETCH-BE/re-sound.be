/**
 * Pure pricing of a Selection — rules 1–7 in ./types.ts, nothing else.
 * Runs unchanged in the browser (running total in the dialog) and on the
 * server (authoritative amounts in the API route). VAT is not applied here:
 * src/lib/order/vat.ts takes the net.
 *
 * Call validateSelection() first: an unknown product or article throws.
 * Rule 8 (the auto lines — transport, installation of extra elements) is
 * canonicalSelection() in ./select.ts; the callers apply it before pricing,
 * this function prices whatever codes it is given.
 */
import { extensionSegments as extensionSegmentsOf, type CatalogueSlice } from './select';
import type { CatalogueArticle, CatalogueCategory, PricedLine, PricedSelection, Selection } from './types';

export function priceSelection(selection: Selection, slice: CatalogueSlice): PricedSelection {
  const product = slice.products.find((p) => p.id === selection.productId);
  if (!product) throw new Error(`priceSelection: unknown product ${selection.productId}`);

  const byCode = new Map(slice.articles.map((a) => [a.code, a]));
  const chosen = selection.articles.map((code) => {
    const article = byCode.get(code);
    if (!article || article.productId !== product.id) throw new Error(`priceSelection: unknown article ${code}`);
    return article;
  });

  // Lines in catalogue order (category, then article), whatever order the
  // buyer clicked in: the factory reads the order top to bottom.
  const categorySort = new Map(slice.categories.map((c) => [c.key, c.sort]));
  chosen.sort(
    (a, b) =>
      (categorySort.get(a.categoryKey) ?? 0) - (categorySort.get(b.categoryKey) ?? 0) ||
      a.sort - b.sort ||
      a.code.localeCompare(b.code),
  );

  // Rule 2: segments = sum over the selected articles; null when none carries any.
  const withSegments = chosen.filter((a) => a.segments !== null);
  const segments = withSegments.length > 0 ? withSegments.reduce((sum, a) => sum + (a.segments ?? 0), 0) : null;
  // Rule 7: extension segments = sum over the selected additional_segments articles.
  const extensionSegments = extensionSegmentsOf(selection.articles, slice);

  const quantity = selection.quantity;
  let netCents = 0;
  let hasOnRequestItems = false;
  const lines: PricedLine[] = [];
  for (const a of chosen) {
    if (a.perExtension && extensionSegments === 0) continue;                  // rule 7: no extension, no line
    const qty = a.perSegment ? quantity * (segments ?? 0)                      // rule 2
      : a.perExtension ? quantity * extensionSegments                          // rule 7
      : quantity;
    const unitPriceCents = a.priceCents;                                       // rules 1, 3, 6
    const lineTotalCents = unitPriceCents === null ? null : unitPriceCents * qty; // rule 4
    if (lineTotalCents === null) hasOnRequestItems = true;
    else netCents += lineTotalCents;                                           // rule 5
    lines.push({
      code: a.code,
      categoryKey: a.categoryKey,
      description: a.description,
      priceType: a.priceType,
      qty,
      unitPriceCents,
      lineTotalCents,
    });
  }

  return { product, quantity, lines, netCents, hasOnRequestItems, segments, extensionSegments };
}

// ---------------------------------------------------------------------------
// Labels and formatting
// ---------------------------------------------------------------------------

function labelFor(labels: Record<string, string> | undefined, locale: string, fallback: string): string {
  const l = labels?.[locale]?.trim();
  return l ? l : fallback;
}

/** Article text for a locale: the translated label, else the English description. */
export function lineLabel(article: Pick<CatalogueArticle, 'labels' | 'description'>, locale: string): string {
  return labelFor(article.labels, locale, article.description);
}

/** Category text for a locale: the translated label, else the English name. */
export function categoryLabel(category: Pick<CatalogueCategory, 'labels' | 'name'>, locale: string): string {
  return labelFor(category.labels, locale, category.name);
}

/**
 * Integer cents → "€ 4.118,75" / "€ 2.740" for a BCP 47 tag (see
 * localeFullCodes in src/i18n/config.ts). Two decimals unless the amount is a
 * whole number of euros; never rounded.
 */
export function formatCents(cents: number, localeTag: string, currency = 'EUR'): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

/** Integer cents → "4118.75" / "2740" — the plain decimal form for JSON-LD and APIs. */
export function centsToDecimal(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const rest = abs % 100;
  return rest === 0 ? `${sign}${euros}` : `${sign}${euros}.${String(rest).padStart(2, '0')}`;
}
