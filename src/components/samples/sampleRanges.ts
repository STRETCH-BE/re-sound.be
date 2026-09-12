import { FAMILY_PRODUCTS, PRODUCTS, type ProductFamily } from '@/data/products';

/**
 * The swatch ranges in the sample kit, in display order. Booths are not a
 * swatch product, so the booth family is left out. Plain data module (no
 * client directive) so both the server page and the form island can use it.
 */
export type SampleFamily = Extract<ProductFamily, 'textile' | 'rwood' | 'rpet'>;
export const SAMPLE_FAMILIES: readonly SampleFamily[] = ['textile', 'rwood', 'rpet'];

export interface SampleRange {
  /** Product slug — the id sent in extraFields.requestedSamples */
  id: string;
  /** Brand name from src/data/products.ts */
  name: string;
  family: SampleFamily;
}

/** The ranges of one family, names from src/data/products.ts. */
export function sampleRanges(family: SampleFamily): SampleRange[] {
  return FAMILY_PRODUCTS[family].map((slug) => ({ id: slug, name: PRODUCTS[slug].name, family }));
}

/**
 * GA4 `product_range` for a set of range ids: the families they belong to,
 * deduplicated, in display order — 'textile', 'rwood', 'textile,rpet' …
 * Falls back to 'general' when no id matches a range.
 */
export function productRangeFor(ids: readonly string[]): string {
  const picked = SAMPLE_FAMILIES.filter((family) => FAMILY_PRODUCTS[family].some((slug) => ids.includes(slug)));
  return picked.length > 0 ? picked.join(',') : 'general';
}
