/**
 * Which Re-Sound panels the calculator may recommend, and with what number.
 *
 * Only products.ts is consulted: a panel with a single numeric
 * `specs.alphaW` ('1.0', '0.90') gets a computed quantity (ΔA / αw); a panel
 * whose αw is null, a range or "up to …" is listed without a number and
 * points to its product page. Booths have no αw and are not panels, so they
 * never appear. The list is derived at call time — nothing is hard-coded.
 */
import { PRODUCTS, type ProductFamily } from '@/data/products';
import { parseAlphaW, productAreaNeeded } from '@/lib/acoustics/sabine';

export interface PanelRecommendation {
  slug: string;
  name: string;
  family: ProductFamily;
  /** The single weighted absorption coefficient, or null when none is published. */
  alphaW: number | null;
  /** The raw spec string as written in products.ts (for display when alphaW is null). */
  alphaWSpec: string | null;
  /** m² of this panel that supply the required ΔA; null when alphaW is null. */
  m2: number | null;
}

/** Every panel product in catalogue order, numeric-αw panels first. */
export function panelRecommendations(deltaA: number): PanelRecommendation[] {
  const rows: PanelRecommendation[] = [];
  for (const p of Object.values(PRODUCTS)) {
    if (p.specs.kind !== 'panel') continue;
    const alphaW = parseAlphaW(p.specs.alphaW);
    rows.push({
      slug: p.slug,
      name: p.name,
      family: p.family,
      alphaW,
      alphaWSpec: p.specs.alphaW,
      m2: alphaW === null ? null : productAreaNeeded(deltaA, alphaW),
    });
  }
  return [...rows.filter((r) => r.alphaW !== null), ...rows.filter((r) => r.alphaW === null)];
}

/** Comma-joined product families of the panels recommended by number, e.g. 'textile,rwood'. */
export function recommendedFamilies(rows: readonly PanelRecommendation[]): string {
  const seen: ProductFamily[] = [];
  for (const r of rows) {
    if (r.alphaW !== null && !seen.includes(r.family)) seen.push(r.family);
  }
  return seen.join(',');
}
