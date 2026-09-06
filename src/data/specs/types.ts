/**
 * Declarative specification tables for the product pages.
 *
 * Each product page used to hard-code its "Specifications" section in a
 * 2,000-line client component. The tables are now plain data so the section
 * can be rendered on the server (src/components/product/ProductSpecs.tsx)
 * with native <details>/<summary> accordions — no JavaScript to hydrate.
 *
 * A `Msg` is either a literal string (numbers, units, standards that are the
 * same in every language) or `{ key }` — a fully-qualified message key such
 * as 'rwoodGroovePage.specs.dimPanelWidth' or 'productPage.specLabels.thickness'
 * that is resolved with next-intl on the server.
 */
export type Msg = string | { key: string };

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
