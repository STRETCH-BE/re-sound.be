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
  | { unitCode: 'SET'; unitText: 'per set' }
  | { unitCode: 'C62'; unitText: 'per piece' };

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
  /**
   * Always null: prices live in the catalogue (Supabase, else
   * src/data/catalogue.snapshot.json) and are read through
   * src/lib/catalogue/load.ts — getFromPriceCents(slug) for a page's "from"
   * price, getProductPrices() for the hub tables. The field stays so the
   * Product type does not change; nothing may read a price from here.
   */
  fromPrice: null;
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
/** Textile panels are priced per piece (workbook: "per stuk"); same UN/CEFACT code C62 as the booths. */
const PER_PIECE: PriceUnit = { unitCode: 'C62', unitText: 'per piece' };
void PER_SET;

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
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_SET, // Michael, 6 Sep 2026: €387 is the price per set
    heroImage: '/images/products/interior/hero.webp',
    cardImage: '/images/products/interior/interior_card.webp',
    documents: panelDocs('interior'),
    // Page values (spec table). The old JSON-LD said B-s2,d0 — flagged in the report.
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
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_PIECE, // workbook: per stuk
    heroImage: '/images/products/solid/hero-denim.webp',
    cardImage: '/images/products/solid/solid_card.webp',
    documents: panelDocs('solid'),
    // TODO(needs-Michael): page table says 50 mm, messages say 45 mm; JSON-LD said B-s2,d0.
    specs: { kind: 'panel', format: '1200 × 600 mm', thickness: '50 mm', alphaW: '1.0', nrc: '0.90', fireClass: 'B-s1,d0', finishCount: 5 }, // αw 1.0 / class A per Products_Data
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
    recycledContentPct: 80, // page spec table "≥80%"; the old meta said "100% recycled" — flagged
    material: 'Recycled textile fibres, recycled steel frame',
    certifications: [],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_PIECE, // workbook: per stuk
    heroImage: '/images/products/divide/hero-denim.webp',
    cardImage: '/images/products/divide/divide_card.webp',
    documents: panelDocs('divide'),
    // αw 0.85 is per side (dual-sided screen). Old JSON-LD said αw 0.90 / B-s2,d0 — flagged.
    specs: { kind: 'panel', format: '800 × 1600 mm', thickness: '45 mm', alphaW: '1.0', nrc: null, fireClass: 'B-s1,d0', finishCount: 6 }, // αw 1.0 / class A per Products_Data (page said 0.85 per side)
    faqKeys: ['leadTime', 'magneticConnection', 'dualSidedAbsorption', 'footStability', 'sizeCustomization'],
    namespace: 'dividePage',
    metaKey: 'divide',
    updatedAt: '2026-09-06',
  },

  // ───────────── rWood (made in Częstochowa — confirmed by Michael, 6 Sep 2026) ─────────────
  'rwood-groove': {
    slug: 'rwood-groove',
    family: 'rwood',
    name: 'rWood Groove',
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: 60, // Products_Data (status Backlog) — TODO(needs-Michael): confirm
    material: 'FSC-certified wood veneer on recycled-felt core',
    certifications: ['FSC'],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-groove/hero-rWood-Groove.webp',
    cardImage: '/images/products/rwood-groove/hero-rWood-Groove.webp',
    documents: panelDocs('rwood-groove'),
    // Page: αw 0.90 (old JSON-LD 0.85); fire class depends on the core: standard MDF
    // D-s2,d2, fire-retardant MDF B-s1,d0 (FAQ said B-s2,d0) — all flagged.
    specs: { kind: 'panel', format: '300 × 2400 / 2780 mm', thickness: '19 mm', alphaW: '0.90', nrc: null, fireClass: 'B-s1,d0', finishCount: 5 }, // fire class confirmed by Michael, 6 Sep 2026
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodGroovePage',
    metaKey: 'rwoodGroove',
    updatedAt: '2026-09-06',
  },
  'rwood-micro': {
    slug: 'rwood-micro',
    family: 'rwood',
    name: 'rWood Micro',
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: null, // TODO(needs-Michael)
    material: 'FSC-certified wood veneer on recycled-felt core',
    certifications: ['FSC'],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-micro/hero-rwood-micro.webp',
    cardImage: '/images/products/rwood-micro/hero-rwood-micro.webp',
    documents: panelDocs('rwood-micro'),
    // αw 0.90 (up to 1.00 with 50 mm mineral wool). Old JSON-LD claimed NRC 0.85 / 60 % recycled — unsupported, dropped.
    specs: { kind: 'panel', format: '100–3050 × 100–1220 mm (custom)', thickness: '8–19 mm', alphaW: '0.90', nrc: null, fireClass: 'B-s1,d0', finishCount: 8 },
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodMicroPage',
    metaKey: 'rwoodMicro',
    updatedAt: '2026-09-06',
  },
  'rwood-perf': {
    slug: 'rwood-perf',
    family: 'rwood',
    name: 'rWood Perf',
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: 17, // page badge "17% Recycled Content" (old JSON-LD said 60 %) — TODO(needs-Michael) confirm
    material: 'FSC-certified wood veneer on recycled-felt core',
    certifications: ['FSC'],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-perf/hero-rwood-perf.webp',
    cardImage: '/images/products/rwood-perf/hero-rwood-perf.webp',
    documents: panelDocs('rwood-perf'),
    // αw depends on the perforation pattern (PD8 0.85 … PH5 0.35). Page says B-s1,d0
    // (one message key mistypes it as "B2-s1, d0"); old JSON-LD said B-s2,d0.
    specs: { kind: 'panel', format: '100–3050 × 100–1220 mm (custom)', thickness: '8–19 mm', alphaW: '0.35–0.85 (per pattern)', nrc: null, fireClass: 'B-s1,d0', finishCount: 8 },
    faqKeys: RWOOD_FAQ,
    namespace: 'rwoodPerfPage',
    metaKey: 'rwoodPerf',
    updatedAt: '2026-09-06',
  },
  'rwood-veneer': {
    slug: 'rwood-veneer',
    family: 'rwood',
    name: 'rWood Panel',
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: null, // TODO(needs-Michael)
    material: 'FSC-certified wood veneer',
    certifications: ['FSC', 'EPD'],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rwood-veneer/hero-rwood-veneer.webp',
    cardImage: '/images/products/rwood-veneer/hero-rwood-veneer.webp',
    documents: panelDocs('rwood-veneer'),
    // No αw/NRC anywhere on the page (the blurb's "Class A" is unsupported — flagged).
    // TODO(needs-Michael): title says 10 wood species, the veneer collection lists 8.
    specs: { kind: 'panel', format: '1220 × 2800 / 3050 mm', thickness: '12 / 19 mm', alphaW: null, nrc: null, fireClass: 'B-s1,d0 (FR MDF) / D-s2,d0', finishCount: 8 },
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
    recycledContentPct: 100, // Products_Data (old page copy said "up to 50%" — see docs/needs-michael.md)
    material: 'Recycled PET felt',
    certifications: ['OEKO-TEX'],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rpet-panel/hero-rPET-Flat.webp',
    cardImage: '/images/products/rpet-panel/rPET - Panel - 2.png',
    documents: panelDocs('rpet-panel'),
    // Page: "up to αw 1.00" (0.95 in the tested 24 mm-on-frame set-up); fire class B-s2,d0 in the
    // spec table but B-s1,d0 in the FAQ/old JSON-LD — TODO(needs-Michael). Colour count follows the
    // agreed title (16); the page itself lists 5 standard colours + RAL/NCS — TODO(needs-Michael).
    specs: { kind: 'panel', format: '1200 × 2750 mm', thickness: '12 / 18 / 24 mm', alphaW: 'up to 1.00', nrc: null, fireClass: 'B-s2,d0', finishCount: 16 },
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
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rpet-groove/hero-rpet-groove.webp',
    cardImage: '/images/products/rpet-groove/gallery-1.jpg',
    documents: panelDocs('rpet-groove'),
    // NRC by thickness (12/24/36 mm). Old JSON-LD claimed αw 0.85 — unsupported, dropped.
    specs: { kind: 'panel', format: '600 / 1200 mm wide', thickness: '12 / 24 / 36 mm', alphaW: null, nrc: '0.55 / 0.75 / 0.90', fireClass: 'B-s1,d0', finishCount: 12 },
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
    recycledContentPct: 100, // Products_Data
    material: 'Recycled PET felt',
    certifications: ['OEKO-TEX'],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_M2,
    heroImage: '/images/products/rpet-flex-groove/rPET-Flex.jpg',
    cardImage: '/images/products/rpet-flex-groove/rPET-Flex.jpg',
    documents: panelDocs('rpet-flex-groove'),
    // Old JSON-LD claimed αw/NRC 0.80 — unsupported by the page, dropped.
    specs: { kind: 'panel', format: '1130 × 2880 mm', thickness: '9 mm', alphaW: null, nrc: null, fireClass: 'B-s1,d0', finishCount: 12 },
    faqKeys: RPET_FAQ,
    namespace: 'rpetFlexGroovePage',
    metaKey: 'rpetFlexGroove',
    updatedAt: '2026-09-06',
  },

  // ───────────── Booths ─────────────
  'solo-eco': {
    slug: 'solo-eco',
    family: 'booth',
    name: 'Solo ECO',
    madeIn: 'PL', // Products_Data / order VAT rules: booths ship from Częstochowa (the price list itself names no plant)
    recycledContentPct: null,
    material: 'Acoustic felt lining, 8 mm enamelled acoustic glass', // price list 2026 tech sheet
    certifications: [],
    fromPrice: null, // prices live in the catalogue
    priceUnit: PER_BOOTH,
    // Placeholders: the Solo Flex photos until Re-Sound supplies ECO photography (docs/needs-michael.md)
    heroImage: '/images/products/solo-eco/hero-solo-eco.webp',
    cardImage: '/images/products/solo-eco/solo-eco_card.webp',
    documents: boothDocs('solo-eco'),
    // Price list 2026 tech sheet. No ISO 23351-1 figure is published for this model — TODO(needs-Michael)
    specs: { kind: 'booth', capacity: '1', footprint: '1.1 m²', externalDimensions: '1050 × 1080 × 2080 mm', speechLevelReductionDbA: null, ventilation: 'up to 4 m³/min', power: '1 × 230 V (type by country), USB-A + USB-C except DK', weight: '280 kg' },
    faqKeys: ['leadTime', 'difference', 'backWall', 'power', 'ventilation', 'warranty'],
    namespace: 'soloEcoPage',
    metaKey: 'soloEco',
    updatedAt: '2026-09-08',
  },
  'solo-flex': {
    slug: 'solo-flex',
    family: 'booth',
    name: 'Solo Flex',
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: null,
    material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
    certifications: [],
    fromPrice: null, // prices live in the catalogue
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
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: null,
    material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
    certifications: [],
    fromPrice: null, // prices live in the catalogue
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
    madeIn: 'PL', // Products_Data: made in Częstochowa
    recycledContentPct: null,
    material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
    certifications: [],
    fromPrice: null, // prices live in the catalogue
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
  booth: ['solo-eco', 'solo-flex', 'duo', 'modular-xl'],
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
