/**
 * Product data — the single source of truth for facts that are used by copy,
 * JSON-LD, the OG images, the hub comparison tables, the sitemap and the
 * downloads block.
 *
 * Rules:
 *   - Never invent a value. A `null` with a `TODO(needs-Michael)` comment is
 *     a placeholder; every consumer hides the fact while it is null.
 *   - Translatable strings do NOT live here: they live in messages/*.json
 *     under `productData.<slug>` (mounting, finishes, lead time …) and are
 *     resolved by the components. This file holds identifiers, numbers,
 *     units, ISO codes, file paths and certification flags only.
 */

import type { PlantCountry } from '@/config/site';

export type ProductFamily = 'textile' | 'rwood' | 'rpet' | 'booth';

export type Certification = 'FSC' | 'OEKO-TEX' | 'EPD';

export type DocumentId =
  | 'datasheet'
  | 'installation-guide'
  | 'installation-manual'
  | 'acoustic-test-report'
  | 'colour-finish-guide'
  | 'fire-certificate'
  | 'sustainability-declaration'
  | 'warranty'
  | 'cad-drawing';

export interface ProductDocument {
  id: DocumentId;
  /** Root-relative path under public/, always /documents/<slug>/<doc>.<ext> */
  file: string;
  /** Only BIM/DWG stays behind the lead-gen modal; PDFs are open links. */
  gated?: boolean;
}

/** UN/CEFACT unit codes used by schema.org UnitPriceSpecification. */
export type PriceUnit =
  | { unitCode: 'MTK'; unitText: 'per m²' }
  | { unitCode: 'C62'; unitText: 'per booth' }
  | { unitCode: 'SET'; unitText: 'per set' };

export interface PanelSpecs {
  kind: 'panel';
  /** e.g. '600 × 600 mm' — numbers/units only, no prose */
  format: string | null;
  thickness: string | null;
  /** Weighted sound absorption coefficient (ISO 11654), e.g. '0.85' */
  alphaW: string | null;
  /** Noise Reduction Coefficient (ASTM C423) */
  nrc: string | null;
  /** EN 13501-1 reaction-to-fire class, e.g. 'B-s1,d0' */
  fireClass: string | null;
  /** Number of standard finishes / colours */
  finishCount: number | null;
}

export interface BoothSpecs {
  kind: 'booth';
  /** Persons */
  capacity: string;
  /** e.g. '1 m²' */
  footprint: string;
  /** W × D × H in mm */
  externalDimensions: string;
  /** ISO 23351-1 speech level reduction in dB(A); null = not measured/known */
  speechLevelReductionDbA: number | null;
  ventilation: string;
  power: string;
  weight: string;
}

export interface Product {
  slug: string;
  family: ProductFamily;
  /** Brand name as written in copy, e.g. 'rWood Groove' */
  name: string;
  /** Country of manufacture (ISO 3166-1 alpha-2). null = placeholder. */
  madeIn: PlantCountry | null;
  /** Recycled content of the panel/core in %. null = placeholder. */
  recycledContentPct: number | null;
  /** What the recycled content is made of (for JSON-LD `material`) */
  material: string;
  certifications: Certification[];
  /** "From" price in EUR excl. VAT. null = placeholder (needs-Michael). */
  fromPrice: number | null;
  priceUnit: PriceUnit;
  heroImage: string;
  cardImage: string;
  documents: ProductDocument[];
  specs: PanelSpecs | BoothSpecs;
  /** Keys under `<namespace>.faq.questions` used for the FAQ + FAQPage schema */
  faqKeys: readonly string[];
  /** Message namespace of the product page copy */
  namespace: string;
  /** `meta.<key>Title` / `meta.<key>Description` */
  metaKey: string;
  /** Last content update (ISO date) — sitemap lastmod when git has nothing newer */
  updatedAt: string;
}

// Shared document sets ------------------------------------------------------

const panelDocs = (slug: string): ProductDocument[] => [
  { id: 'datasheet', file: `/documents/${slug}/datasheet.pdf` },
  { id: 'installation-guide', file: `/documents/${slug}/installation-guide.pdf` },
  { id: 'acoustic-test-report', file: `/documents/${slug}/acoustic-test-report.pdf` },
  { id: 'colour-finish-guide', file: `/documents/${slug}/colour-finish-guide.pdf` },
  { id: 'fire-certificate', file: `/documents/${slug}/fire-certificate.pdf` },
  { id: 'sustainability-declaration', file: `/documents/${slug}/sustainability-declaration.pdf` },
];

const boothDocs = (slug: string): ProductDocument[] => [
  { id: 'datasheet', file: `/documents/${slug}/datasheet.pdf` },
  { id: 'installation-manual', file: `/documents/${slug}/installation-manual.pdf` },
  { id: 'acoustic-test-report', file: `/documents/${slug}/acoustic-test-report.pdf` },
  { id: 'cad-drawing', file: `/documents/${slug}/cad-drawing.dwg`, gated: true },
  { id: 'warranty', file: `/documents/${slug}/warranty.pdf` },
  { id: 'sustainability-declaration', file: `/documents/${slug}/sustainability-declaration.pdf` },
];

const PER_M2: PriceUnit = { unitCode: 'MTK', unitText: 'per m²' };
const PER_BOOTH: PriceUnit = { unitCode: 'C62', unitText: 'per booth' };
const PER_SET: PriceUnit = { unitCode: 'SET', unitText: 'per set' };

const RWOOD_FAQ = ['fscSource', 'fireRating', 'leadTime', 'installMethod', 'substrateCleanup'] as const;
const RPET_FAQ = ['oekoTex', 'fireRating', 'processability', 'colorRange', 'leadTime'] as const;

// ---------------------------------------------------------------------------
// The 13 products
// ---------------------------------------------------------------------------

export const PRODUCTS: Record<string, Product> = {
  // ───────────── Textile (made in Beveren-Waas, BE) ─────────────
  interior: {
    slug: 'interior',
    family: 'textile',
    name: 'Interior',
    madeIn: 'BE',
    recycledContentPct: 80, // specs copy: "≥80%"
    material: 'Recycled textile fibres',
    certifications: [],
    // The page states "Starting from €387 per set" — the only confirmed price.
    fromPrice: 387,
    priceUnit: PER_SET,
    heroImage: '/images/products/interior/hero.webp',
    cardImage: '/images/products/interior/interior_card.webp',
    documents: panelDocs('interior'),
    specs: { kind: 'panel', format: '900 × 600 mm', thickness: '45 mm', alphaW: '1.0', nrc: '0.95', fireClass: 'B-s1,d0', finishCount: 6 },
    faqKeys: ['leadTime', 'washableCover', 'absorptionRating', 'breeamLeed', 'installMethod'],
    namespace: 'interiorPage',
    metaKey: 'interior',
    updatedAt: '2026-09-06',
  },
  solid: {
    slug: 'solid',
    family: 'textile',
    name: 'Solid',
    madeIn: 'BE',
    recycledContentPct: 80,
    material: 'Recycled textile fibres',
    certifications: [],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/solid/hero-denim.webp',
    cardImage: '/images/products/solid/solid_card.webp',
    documents: panelDocs('solid'),
    specs: { kind: 'panel', format: '1200 × 600 mm', thickness: '45 mm', alphaW: '0.95', nrc: '0.90', fireClass: 'B-s1,d0', finishCount: 5 },
    faqKeys: ['leadTime', 'hookInstall', 'sizeCustomization', 'weightPerPanel', 'absorptionRating'],
    namespace: 'solidPage',
    metaKey: 'solid',
    updatedAt: '2026-09-06',
  },
  divide: {
    slug: 'divide',
    family: 'textile',
    name: 'Divide',
    madeIn: 'BE',
    recycledContentPct: null, // TODO(needs-Michael): copy says "100% recycled" (textile + steel frame) — confirm %
    material: 'Recycled textile fibres, recycled steel frame',
    certifications: [],
    // The page states "Starting from €1,238 excl. VAT" per screen.
    fromPrice: 1238,
    priceUnit: PER_SET,
    heroImage: '/images/products/divide/hero-denim.webp',
    cardImage: '/images/products/divide/divide_card.webp',
    documents: panelDocs('divide'),
    specs: { kind: 'panel', format: null, thickness: null, alphaW: null, nrc: null, fireClass: null, finishCount: 6 },
    faqKeys: ['leadTime', 'magneticConnection', 'dualSidedAbsorption', 'footStability', 'sizeCustomization'],
    namespace: 'dividePage',
    metaKey: 'divide',
    updatedAt: '2026-09-06',
  },

  // ───────────── rWood (country of manufacture: TODO(needs-Michael)) ─────────────
  'rwood-groove': {
    slug: 'rwood-groove',
    family: 'rwood',
    name: 'rWood Groove',
    madeIn: null, // TODO(needs-Michael): site only said "Made in Europe"
    recycledContentPct: 60, // JSON-LD spec: "Recycled content 60 %"
    material: 'FSC-certified wood veneer on recycled-felt core',
    certifications: ['FSC'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-groove/hero-rWood-Groove.webp',
    cardImage: '/images/products/rwood-groove/hero-rWood-Groove.webp',
    documents: panelDocs('rwood-groove'),
    specs: { kind: 'panel', format: null, thickness: null, alphaW: '0.85', nrc: '0.80', fireClass: 'B-s2,d0', finishCount: 5 },
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodGroovePage',
    metaKey: 'rwoodGroove',
    updatedAt: '2026-09-06',
  },
  'rwood-micro': {
    slug: 'rwood-micro',
    family: 'rwood',
    name: 'rWood Micro',
    madeIn: null, // TODO(needs-Michael)
    recycledContentPct: null, // TODO(needs-Michael)
    material: 'FSC-certified wood veneer on recycled-felt core',
    certifications: ['FSC'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-micro/hero-rwood-micro.webp',
    cardImage: '/images/products/rwood-micro/hero-rwood-micro.webp',
    documents: panelDocs('rwood-micro'),
    specs: { kind: 'panel', format: null, thickness: null, alphaW: null, nrc: null, fireClass: 'B-s1,d0', finishCount: 8 },
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodMicroPage',
    metaKey: 'rwoodMicro',
    updatedAt: '2026-09-06',
  },
  'rwood-perf': {
    slug: 'rwood-perf',
    family: 'rwood',
    name: 'rWood Perf',
    madeIn: null, // TODO(needs-Michael)
    recycledContentPct: null, // TODO(needs-Michael)
    material: 'FSC-certified wood veneer on recycled-felt core',
    certifications: ['FSC'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-perf/hero-rwood-perf.webp',
    cardImage: '/images/products/rwood-perf/hero-rwood-perf.webp',
    documents: panelDocs('rwood-perf'),
    specs: { kind: 'panel', format: null, thickness: null, alphaW: '0.85', nrc: null, fireClass: null, finishCount: 8 },
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodPerfPage',
    metaKey: 'rwoodPerf',
    updatedAt: '2026-09-06',
  },
  'rwood-veneer': {
    slug: 'rwood-veneer',
    family: 'rwood',
    name: 'rWood Panel',
    madeIn: null, // TODO(needs-Michael)
    recycledContentPct: null, // TODO(needs-Michael)
    material: 'FSC-certified wood veneer',
    certifications: ['FSC', 'EPD'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-veneer/hero-rwood-veneer.webp',
    cardImage: '/images/products/rwood-veneer/hero-rwood-veneer.webp',
    documents: panelDocs('rwood-veneer'),
    specs: { kind: 'panel', format: '1220 × 2800 mm', thickness: '12 / 19 mm', alphaW: null, nrc: null, fireClass: null, finishCount: 8 },
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodVeneerPage',
    metaKey: 'rwoodVeneer',
    updatedAt: '2026-09-06',
  },

  // ───────────── rPET (made in Częstochowa, PL) ─────────────
  'rpet-panel': {
    slug: 'rpet-panel',
    family: 'rpet',
    name: 'rPET Panel',
    madeIn: 'PL',
    // TODO(needs-Michael): copy said "up to 50%", title/meta/schema said "100%".
    recycledContentPct: null,
    material: 'Recycled PET felt',
    certifications: ['OEKO-TEX'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rpet-panel/hero-rPET-Flat.webp',
    cardImage: '/images/products/rpet-panel/rPET - Panel - 2.png',
    documents: panelDocs('rpet-panel'),
    specs: { kind: 'panel', format: null, thickness: '12 / 18 / 24 mm', alphaW: '1.00', nrc: null, fireClass: null, finishCount: 16 },
    faqKeys: RPET_FAQ,
    namespace: 'rpetPanelPage',
    metaKey: 'rpetPanel',
    updatedAt: '2026-09-06',
  },
  'rpet-groove': {
    slug: 'rpet-groove',
    family: 'rpet',
    name: 'rPET Groove',
    madeIn: 'PL',
    recycledContentPct: 100, // TODO(needs-Michael): confirm — every page says "100% recycled PET bottles"
    material: 'Recycled PET felt',
    certifications: ['OEKO-TEX'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rpet-groove/hero-rpet-groove.webp',
    cardImage: '/images/products/rpet-groove/gallery-1.jpg',
    documents: panelDocs('rpet-groove'),
    specs: { kind: 'panel', format: null, thickness: '12 / 24 / 36 mm', alphaW: null, nrc: '0.90', fireClass: 'B-s1,d0', finishCount: 12 },
    faqKeys: RPET_FAQ,
    namespace: 'rpetGroovePage',
    metaKey: 'rpetGroove',
    updatedAt: '2026-09-06',
  },
  'rpet-flex-groove': {
    slug: 'rpet-flex-groove',
    family: 'rpet',
    name: 'rPET Flex Groove',
    madeIn: 'PL',
    recycledContentPct: 100, // TODO(needs-Michael): confirm
    material: 'Recycled PET felt',
    certifications: ['OEKO-TEX'],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_M2,
    heroImage: '/images/products/rpet-flex-groove/rPET-Flex.jpg',
    cardImage: '/images/products/rpet-flex-groove/rPET-Flex.jpg',
    documents: panelDocs('rpet-flex-groove'),
    specs: { kind: 'panel', format: null, thickness: null, alphaW: null, nrc: null, fireClass: null, finishCount: 12 },
    faqKeys: RPET_FAQ,
    namespace: 'rpetFlexGroovePage',
    metaKey: 'rpetFlexGroove',
    updatedAt: '2026-09-06',
  },

  // ───────────── Booths ─────────────
  'solo-flex': {
    slug: 'solo-flex',
    family: 'booth',
    name: 'Solo Flex',
    madeIn: null, // TODO(needs-Michael): component comment calls it a white-label supplier product
    recycledContentPct: null,
    material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
    certifications: [],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_BOOTH,
    heroImage: '/images/products/solo-flex/hero-solo-flex.webp',
    cardImage: '/images/products/solo-flex/solo-flex_card.webp',
    documents: boothDocs('solo-flex'),
    specs: { kind: 'booth', capacity: '1', footprint: '1 m²', externalDimensions: '1020 × 1020 × 2260 mm', speechLevelReductionDbA: 24, ventilation: '4.6 m³/min', power: '1 × 230 V, USB-C PD 60 W, USB-A', weight: '280 kg' },
    faqKeys: ['leadTime', 'noiseReduction', 'installation', 'ventilation', 'warranty'],
    namespace: 'soloFlexPage',
    metaKey: 'soloFlex',
    updatedAt: '2026-09-06',
  },
  duo: {
    slug: 'duo',
    family: 'booth',
    name: 'Duo',
    madeIn: null, // TODO(needs-Michael)
    recycledContentPct: null,
    material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
    certifications: [],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_BOOTH,
    heroImage: '/images/products/duo/hero-duo.webp',
    cardImage: '/images/products/duo/duo_card.webp',
    documents: boothDocs('duo'),
    // TODO(needs-Michael): the page quotes "26 dB(A)" but no ISO 23351-1 test value
    // is on file — treated as a placeholder until the report is confirmed.
    specs: { kind: 'booth', capacity: '2', footprint: '2 m²', externalDimensions: '1640 × 1200 × 2260 mm', speechLevelReductionDbA: null, ventilation: '9.2 m³/min', power: '2 × 230 V, 2 × USB-C PD 60 W, 2 × USB-A', weight: '420 kg' },
    faqKeys: ['leadTime', 'configChoice', 'switchConfig', 'noiseReduction', 'warranty'],
    namespace: 'duoPage',
    metaKey: 'duo',
    updatedAt: '2026-09-06',
  },
  'modular-xl': {
    slug: 'modular-xl',
    family: 'booth',
    name: 'Modular XL',
    madeIn: null, // TODO(needs-Michael)
    recycledContentPct: null,
    material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
    certifications: [],
    fromPrice: null, // TODO(needs-Michael)
    priceUnit: PER_BOOTH,
    heroImage: '/images/products/modular-xl/hero-modular-xl.webp',
    cardImage: '/images/products/modular-xl/modular-xl_card.webp',
    documents: boothDocs('modular-xl'),
    specs: { kind: 'booth', capacity: '6–10', footprint: '4.3 m²', externalDimensions: '2400 × 1800 × 2260 mm (base)', speechLevelReductionDbA: 25.9, ventilation: '18.4 m³/min', power: '230 V, A/V provisions', weight: '790 kg' },
    faqKeys: ['leadTime', 'scaleUp', 'ceilingHeight', 'capacity', 'warranty'],
    namespace: 'modularXlPage',
    metaKey: 'modularXl',
    updatedAt: '2026-09-06',
  },
};

export const PRODUCT_SLUGS = Object.keys(PRODUCTS);

export const FAMILY_PRODUCTS: Record<ProductFamily, string[]> = {
  textile: ['interior', 'solid', 'divide'],
  rwood: ['rwood-groove', 'rwood-micro', 'rwood-perf', 'rwood-veneer'],
  rpet: ['rpet-panel', 'rpet-groove', 'rpet-flex-groove'],
  booth: ['solo-flex', 'duo', 'modular-xl'],
};

export function getProduct(slug: string): Product {
  const p = PRODUCTS[slug];
  if (!p) throw new Error(`Unknown product slug: ${slug}`);
  return p;
}

/**
 * ISO 23351-1 speech level reduction class.
 *   A+ ≥ 33 · A ≥ 30 · B ≥ 27 · C ≥ 24 · D ≥ 21 dB(A)
 */
export function isoSpeechClass(dbA: number | null): string | null {
  if (dbA === null) return null;
  if (dbA >= 33) return 'A+';
  if (dbA >= 30) return 'A';
  if (dbA >= 27) return 'B';
  if (dbA >= 24) return 'C';
  if (dbA >= 21) return 'D';
  return null;
}
