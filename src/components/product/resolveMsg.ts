import { getProduct, type Product } from '@/data/products';
import type { Msg, ProductSlug, SpecField } from '@/data/specs/types';

/** next-intl `t` created with `getTranslations()` (no namespace). */
export type RootT = (key: string, values?: Record<string, string | number>) => string;

/**
 * Resolves one spec-table message. Returns null when a data-backed value is
 * missing (or a certification is not held), which makes ProductSpecs skip the
 * row. Server-only, edge-safe: plain imports of data modules, no Node APIs.
 */
export function resolveMsg(t: RootT, m: Msg): string | null {
  if (typeof m === 'string') return m;
  if ('spec' in m) {
    const value = resolveSpec(t, m.product, m.spec);
    if (value !== null) return value;
    return m.fallback === undefined ? null : t(m.fallback);
  }
  if ('cert' in m) {
    return getProduct(m.product).certifications.includes(m.cert) ? t(m.key) : null;
  }
  return t(m.key);
}

/** ISO 11654 weighted sound absorption class, message key per class. */
const ABSORPTION_CLASS_KEY: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
  A: 'productPage.acoustics.classA',
  B: 'productPage.specs.absorptionClassB',
  C: 'productPage.specs.absorptionClassC',
  D: 'productPage.specs.absorptionClassD',
  E: 'productPage.specs.absorptionClassE',
};

/**
 * ISO 11654 class from a weighted αw. Only a single plain number qualifies
 * ('0.90', '1.0', 0.85); ranges and "up to …" values yield no class because
 * the class of the product as sold would not follow from them.
 *   A ≥ 0.90 · B ≥ 0.80 · C ≥ 0.60 · D ≥ 0.30 · E ≥ 0.15
 */
export function isoAbsorptionClass(
  alphaW: string | number | null | undefined,
): 'A' | 'B' | 'C' | 'D' | 'E' | null {
  const n = typeof alphaW === 'number' ? alphaW : parseSingleNumber(alphaW);
  if (n === null) return null;
  if (n >= 0.9) return 'A';
  if (n >= 0.8) return 'B';
  if (n >= 0.6) return 'C';
  if (n >= 0.3) return 'D';
  if (n >= 0.15) return 'E';
  return null;
}

function parseSingleNumber(s: string | null | undefined): number | null {
  if (typeof s !== 'string') return null;
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*$/.exec(s);
  return m ? Number(m[1].replace(',', '.')) : null;
}

/**
 * Stored text or number → cell text; empty/null → null (row hidden). The
 * few English phrases the data strings carry ("up to 4 m³/min",
 * "0.35–0.85 (per pattern)", "… (base)") are rendered through message keys
 * so the spec tables stay translated; every other string is shown as stored.
 */
function asText(t: RootT, v: string | number | null | undefined, decimals?: number): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return decimals === undefined ? String(v) : v.toFixed(decimals);
  const s = v.trim();
  if (s === '') return null;
  const upTo = /^up to (.+)$/i.exec(s);
  if (upTo) return t('productPage.specs.upTo', { value: upTo[1] });
  const perPattern = /^(.+?) \(per pattern\)$/i.exec(s);
  if (perPattern) return `${perPattern[1]} (${t('productPage.specs.perPattern')})`;
  const base = /^(.+?) \(base\)$/i.exec(s);
  if (base) return `${base[1]} (${t('productPage.specs.baseUnit')})`;
  return s;
}

function resolveSpec(t: RootT, slug: ProductSlug, field: SpecField): string | null {
  const p: Product = getProduct(slug);
  switch (field) {
    case 'recycledContentPct':
      return p.recycledContentPct === null ? null : `${p.recycledContentPct} %`;
    case 'madeIn':
      return p.madeIn === null ? null : t(`manufacturer.plant.${p.madeIn}`);
    case 'certifications':
      return p.certifications.length === 0 ? null : p.certifications.join(', ');
    case 'absorptionClass': {
      const cls = p.specs.kind === 'panel' ? isoAbsorptionClass(p.specs.alphaW) : null;
      return cls === null ? null : t(ABSORPTION_CLASS_KEY[cls]);
    }
    case 'alphaW':
    case 'nrc':
      return p.specs.kind === 'panel' ? asText(t, p.specs[field], 2) : null;
    case 'fireClass':
    case 'thickness':
      return p.specs.kind === 'panel' ? asText(t, p.specs[field]) : null;
    case 'speechLevelReductionDbA':
      return p.specs.kind === 'booth' && p.specs.speechLevelReductionDbA !== null
        ? `${p.specs.speechLevelReductionDbA} dB(A)`
        : null;
    case 'ventilation':
    case 'power':
    case 'weight':
    case 'externalDimensions':
    case 'footprint':
      return p.specs.kind === 'booth' ? asText(t, p.specs[field]) : null;
  }
}
