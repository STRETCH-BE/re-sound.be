// Merges the translated `catalog` message entry over a base Product from
// lib/products.ts. Structural fields (slug, key, colours, colourChart, related,
// images, faqs) stay on the base object; only display text is replaced, so the
// English catalogue remains the single source of truth for data and routing.
//
// `colours` / `colourChart[].name` are deliberately NOT translated here — they
// double as lookup keys (swatch backgrounds). Translate them at render time
// with the `colourNames` namespace instead.
import type { Product } from '@/lib/products';

export type CatalogEntry = Pick<
  Product,
  | 'name'
  | 'short'
  | 'category'
  | 'mount'
  | 'intro'
  | 'summary'
  | 'chips'
  | 'highlights'
  | 'features'
  | 'specs'
  | 'applications'
> & { colourChartNote?: string };

export function localizeProduct(product: Product, entry: CatalogEntry | undefined): Product {
  if (!entry) return product;
  return {
    ...product,
    ...entry,
    colourChartNote: entry.colourChartNote ?? product.colourChartNote,
  };
}
