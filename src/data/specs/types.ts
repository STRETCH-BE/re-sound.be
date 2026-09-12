/**
 * Declarative specification tables for the product pages.
 *
 * Each product page used to hard-code its "Specifications" section in a
 * 2,000-line client component. The tables are now plain data so the section
 * can be rendered on the server (src/components/product/ProductSpecs.tsx)
 * with native <details>/<summary> accordions — no JavaScript to hydrate.
 *
 * A `Msg` is one of:
 *   - a literal string — numbers, units, standards that are the same in every
 *     language and are NOT governed facts (panel sizes, densities, hole sizes);
 *   - `{ key }` — a fully-qualified message key such as
 *     'rwoodGroovePage.specs.dimPanelWidth', resolved with next-intl;
 *   - `{ product, spec }` — a governed fact (αw, NRC, fire class, thickness,
 *     recycled content, plant, certifications, booth figures) read from
 *     src/data/products.ts by the resolver. A null value hides the whole row,
 *     unless a `fallback` message key is given for that case;
 *   - `{ product, cert, key }` — a message shown only while `cert` is listed in
 *     PRODUCTS[product].certifications; otherwise the row is hidden.
 *
 * Governed figures must never be typed into a spec file: one source per value.
 */
import type { Certification } from '@/data/products';

export type ProductSlug =
  | 'interior'
  | 'solid'
  | 'divide'
  | 'rwood-groove'
  | 'rwood-micro'
  | 'rwood-perf'
  | 'rwood-veneer'
  | 'rpet-panel'
  | 'rpet-groove'
  | 'rpet-flex-groove'
  | 'solo-eco'
  | 'solo-flex'
  | 'duo'
  | 'modular-xl';

/**
 * Fields of PRODUCTS[slug] a spec row may show. `absorptionClass` is derived
 * from `specs.alphaW` (ISO 11654) by the resolver; everything else maps 1:1.
 */
export type SpecField =
  // Product
  | 'recycledContentPct'
  | 'madeIn'
  | 'certifications'
  // PanelSpecs
  | 'alphaW'
  | 'absorptionClass'
  | 'nrc'
  | 'fireClass'
  | 'thickness'
  // BoothSpecs
  | 'speechLevelReductionDbA'
  | 'ventilation'
  | 'power'
  | 'weight'
  | 'externalDimensions'
  | 'footprint';

export interface SpecMsg {
  product: ProductSlug;
  spec: SpecField;
  /** Message key shown instead of hiding the row while the data value is null */
  fallback?: string;
}

export interface CertMsg {
  product: ProductSlug;
  cert: Certification;
  /** Message key rendered when the certification is present in the data */
  key: string;
}

export type Msg = string | { key: string } | SpecMsg | CertMsg;

export interface SpecRowDef {
  label: Msg;
  value: Msg;
}

export interface SpecCardDef {
  title: Msg;
  rows: SpecRowDef[];
}

export type SpecTableDef = SpecCardDef[];

export const key = (k: string): Msg => ({ key: k });

export const spec = (product: ProductSlug, field: SpecField, fallback?: string): Msg =>
  fallback === undefined ? { product, spec: field } : { product, spec: field, fallback };

export const cert = (product: ProductSlug, id: Certification, k: string): Msg => ({
  product,
  cert: id,
  key: k,
});
