/**
 * The catalogue: what the site sells, at what price, and how a buyer
 * configures it. One shape, whether the rows come from Supabase or from the
 * committed snapshot (src/data/catalogue.snapshot.json).
 *
 * Source of truth: Supabase project toroqgofzsanxcisdbkn, tables price_lists,
 * products, categories, articles (supabase/migrations/0001_catalogue_and_orders.sql),
 * seeded from the 2026 booth price list by scripts/db/price-list-to-sql.mjs.
 *
 * Money is integer cents. `null` means "on request": the article can be
 * ordered but Re-Sound quotes it before the order is confirmed.
 */

export type ProductKind = 'booth' | 'panel';
export type ProductUnit = 'booth' | 'set' | 'piece' | 'm2';
/**
 * How a category's articles enter a selection: `single` (one choice),
 * `multi` (any number) or `auto` — never offered as a choice; the site adds
 * the line by rule (transport, installation of extra elements; rule 8).
 */
export type SelectMode = 'single' | 'multi' | 'auto';
export type PriceType = 'base' | 'included' | 'option' | 'credit';
export type ArticleSource = 'price-list' | 'website';

export interface PriceList {
  id: string;
  name: string;
  currency: string;
  /** ISO date the list applies from (2026-09-21 for the 2026 booth list) */
  validFrom: string | null;
  priceBasis: string | null;
  terms: Record<string, string>;
  packaging: Array<{ model: string; unit: string | null; pallet: string | null; grossKg: number | null }>;
  contacts: Array<{ territory: string; name: string | null; email: string | null; phone: string | null; base: string | null }>;
  notes: string[];
  sourceFile: string | null;
  importedAt: string;
}

export interface CatalogueProduct {
  /** 'solo-flex', 'duo-work', 'interior' … */
  id: string;
  priceListId: string | null;
  /** 'SF', 'DW' … — booth models only */
  modelCode: string | null;
  name: string;
  description: string | null;
  kind: ProductKind;
  unit: ProductUnit;
  /** Product page this model is sold from; several models may share one */
  websiteSlug: string | null;
  maxQty: number;
  refPage: number | null;
  /** "Technical & logistics data" rows, in sheet order */
  tech: Array<[string, string]>;
  sort: number;
  active: boolean;
}

export interface CatalogueCategory {
  /** 'construction', 'exterior_color', 'options' … */
  key: string;
  /** English name from the price list */
  name: string;
  /** Translations keyed by site locale ('nl', 'fr' …); English is `name` */
  labels: Record<string, string>;
  selectMode: SelectMode;
  /** single categories the buyer must pick from (construction, colours, socket …) */
  required: boolean;
  sort: number;
}

export interface CatalogueArticle {
  /** 'RS-SF-BF' — or 'WEB-…' for website-defined lines such as installation */
  code: string;
  productId: string;
  categoryKey: string;
  sheetCategory: string | null;
  group: string | null;
  /** English description from the price list */
  description: string;
  labels: Record<string, string>;
  /** Integer cents excl. VAT; negative for a credit; null = on request */
  priceCents: number | null;
  priceType: PriceType;
  /** Modular XL fire protection: charged once per 0.9 m segment of the booth */
  perSegment: boolean;
  /**
   * Installation of extra elements (Modular XL): charged once per extension
   * segment, i.e. per element chosen from `additional_segments` (rule 7)
   */
  perExtension: boolean;
  /** 0.9 m segments this article contributes (base module 2, +1 element 1 …) */
  segments: number | null;
  isDefault: boolean;
  source: ArticleSource;
  notes: string | null;
  sort: number;
  active: boolean;
}

export interface Catalogue {
  priceLists: PriceList[];
  products: CatalogueProduct[];
  categories: CatalogueCategory[];
  articles: CatalogueArticle[];
  /** When these rows were read */
  loadedAt: string;
  /** Where they came from: the database, or the committed snapshot */
  source: 'database' | 'snapshot';
}

/**
 * What the buyer configured for one product. `articles` holds article codes:
 * exactly one per required single-select category, at most one per optional
 * single-select category, any number from multi-select categories. Everything
 * is priced per unit and multiplied by `quantity`.
 */
export interface Selection {
  productId: string;
  quantity: number;
  articles: string[];
}

/**
 * Pricing rules, implemented identically by the dialog (preview) and the API
 * route (authoritative):
 *
 *  1. Every selected article is one line: unit price = article.priceCents.
 *  2. Line quantity = selection.quantity, except a perSegment article, whose
 *     line quantity = selection.quantity × (sum of `segments` over the
 *     selected articles). For Modular XL that is 2 for the base module plus
 *     1–3 for the chosen extension.
 *  3. A credit (negative priceCents) reduces the net like any other line.
 *  4. An article with priceCents null is "on request": its line carries no
 *     amount, and the order is flagged hasOnRequestItems.
 *  5. Net = sum of priced lines; VAT and gross follow src/lib/order/vat.ts.
 *  6. Included articles (priceCents 0) still appear as lines: the factory
 *     needs their article numbers (colour, door, socket) on the order.
 *  7. A perExtension article (installation of an extra element) has line
 *     quantity = selection.quantity × extension segments, where extension
 *     segments = the sum of `segments` over the selected additional_segments
 *     articles (Modular XL: AS1 = 1, AS2 = 2, AS3 = 3). When that sum is 0
 *     the line is omitted. PricedSelection.extensionSegments carries the sum.
 *  8. Articles of an `auto` category are never chosen by the buyer; the
 *     callers canonicalise the selection (canonicalSelection in ./select.ts)
 *     before pricing: every auto article is dropped and re-added by rule —
 *     the transport article for the delivery country (…-TRANSPORT-EU for
 *     mainland Europe, …-TRANSPORT-XX, on request, for the islands in
 *     NON_MAINLAND_EUROPE) when the product has transport articles, and the
 *     installation_extension articles when an installation article is
 *     selected and the extension segments are more than 0.
 */
export interface PricedLine {
  code: string;
  categoryKey: string;
  description: string;
  priceType: PriceType;
  qty: number;
  unitPriceCents: number | null;
  lineTotalCents: number | null;
}

export interface PricedSelection {
  product: CatalogueProduct;
  quantity: number;
  lines: PricedLine[];
  netCents: number;
  hasOnRequestItems: boolean;
  /** 0.9 m segments in the configured booth (Modular XL), else null */
  segments: number | null;
  /** Extension segments (sum over the selected additional_segments articles); 0 when none (rule 7) */
  extensionSegments: number;
}
