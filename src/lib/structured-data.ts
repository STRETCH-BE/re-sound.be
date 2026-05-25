/**
 * Schema.org JSON-LD builders.
 *
 * Goal: feed Google, Bing, and AI crawlers a machine-readable description of
 * the Re-Sound entity and its products so they render richer results and have
 * a stable source of truth for entity disambiguation (Knowledge Graph,
 * shopping cards, AI assistants).
 *
 * Types produced:
 *   - Organization      → sitewide entity; emitted once on the homepage
 *   - WebSite           → sitewide entity; emitted once on the homepage
 *   - Product           → per product page (with offers / specs / return policy)
 *   - BreadcrumbList    → per product page; helps Google show breadcrumbs in SERP
 *   - FAQPage           → per product page (when an FAQ block is present)
 *
 * Each builder returns a plain JS object. Render it through <JsonLd> which
 * serialises to a single `<script type="application/ld+json">` tag.
 */

import { locales, type Locale, defaultLocale } from '@/i18n/config';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://re-sound.be'
).replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Re-Sound',
    legalName: 'STRETCH-BE BV',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/re-sound-logo.svg`,
    },
    description:
      'Belgian B2B manufacturer of circular acoustic panels made from recycled textiles, FSC-certified wood veneer, and recycled PET. Free take-back service.',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Gentseweg 309 A3',
      postalCode: '9120',
      addressLocality: 'Beveren-Waas',
      addressCountry: 'BE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'info@re-sound.be',
      telephone: '+32-3-284-68-18',
      areaServed: ['BE', 'NL', 'FR', 'DE', 'LU', 'EU'],
      // Full 10-locale coverage matches what the site actually serves.
      availableLanguage: locales as unknown as string[],
    },
    sameAs: [
      'https://www.instagram.com/resoundbe',
      'https://www.linkedin.com/company/re-sound-be',
    ],
  };
}

// ---------------------------------------------------------------------------
// WebSite
// ---------------------------------------------------------------------------

/**
 * Sitewide WebSite entity. Emitted alongside Organization on the homepage.
 *
 * No `potentialAction` SearchAction block: re-sound.be has no site search,
 * and Google requires the search endpoint to actually work — claiming a
 * feature that doesn't exist would trigger validation warnings.
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Re-Sound',
    url: SITE_URL,
    inLanguage: locales as unknown as string[],
    publisher: { '@id': `${SITE_URL}/#organization` },
    description:
      'Circular acoustic panels — wall, ceiling, and freestanding solutions from recycled textiles, FSC wood veneer, and recycled PET.',
  };
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductSpec {
  /** Human-readable name, e.g. 'Sound absorption (αw)' */
  name: string;
  /** Value as string — keeps decimals / units consistent across products */
  value: string;
  /** Optional unit or standard reference, e.g. 'ISO 11654', '%', 'mm' */
  unitText?: string;
}

export interface ProductOffer {
  /** Lower bound of the price range as a stringified number, e.g. '387'.
   *  Omit when no public price is published — Google accepts AggregateOffer
   *  without a lowPrice provided availability + priceCurrency are present. */
  lowPrice?: string;
  /** Defaults to 'EUR' */
  priceCurrency?: string;
  /** ISO-8601 date; Google requires this whenever lowPrice is set. */
  priceValidUntil?: string;
}

export interface ProductSchemaInput {
  /** kebab-case slug, e.g. 'rwood-groove' */
  slug: string;
  /** Routing locale of the current page (e.g. 'en', 'nl'). Required —
   *  previously hardcoded to 'en', which made every locale page declare
   *  the EN URL as its canonical inside JSON-LD. */
  locale: Locale | string;
  /** Localised product name without trailing " | Re-Sound" */
  name: string;
  /** Localised product description */
  description: string;
  /** Path to a primary product image, relative to site root */
  image: string;
  /** Optional image dimensions; defaults to 1920×1080 (site convention) */
  imageWidth?: number;
  imageHeight?: number;
  /** Category in human language, e.g. 'Acoustic wood panels' */
  category: string;
  /** Optional ISO country code where this product is manufactured */
  countryOfOrigin?: string;
  /** Optional material(s) for AI search matching */
  material?: string;
  /** Optional structured specs (αw, NRC, fire class, thickness, %) */
  specs?: ProductSpec[];
  /** Optional offer data (price + currency + validity) */
  offer?: ProductOffer;
}

/**
 * Build a Product JSON-LD payload.
 *
 * Includes:
 *   - ImageObject (not bare URL) so Google can pick the right rich-card crop
 *   - AggregateOffer with availability + seller (and lowPrice when known)
 *   - additionalProperty PropertyValue entries for acoustic / technical specs
 *   - hasMerchantReturnPolicy reflecting the free take-back program
 *   - material string for AI search ("acoustic panel made from recycled PET")
 */
export function productSchema(input: ProductSchemaInput) {
  const url = `${SITE_URL}/${input.locale}/products/${input.slug}`;
  const imgWidth = input.imageWidth ?? 1920;
  const imgHeight = input.imageHeight ?? 1080;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: input.name,
    description: input.description,
    url,
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${input.image}`,
      width: imgWidth,
      height: imgHeight,
      caption: input.name,
    },
    category: input.category,
    brand: { '@type': 'Brand', name: 'Re-Sound' },
    manufacturer: { '@id': `${SITE_URL}/#organization` },
  };

  if (input.countryOfOrigin) {
    node.countryOfOrigin = {
      '@type': 'Country',
      name: input.countryOfOrigin,
    };
  }

  if (input.material) {
    node.material = input.material;
  }

  if (input.specs && input.specs.length > 0) {
    node.additionalProperty = input.specs.map((s) => ({
      '@type': 'PropertyValue',
      name: s.name,
      value: s.value,
      ...(s.unitText ? { unitText: s.unitText } : {}),
    }));
  }

  // Offers — always emit at least the availability + seller block. Google
  // requires priceCurrency whenever lowPrice is set, plus priceValidUntil.
  const offer = input.offer ?? {};
  const offerNode: Record<string, unknown> = {
    '@type': 'AggregateOffer',
    priceCurrency: offer.priceCurrency ?? 'EUR',
    availability: 'https://schema.org/InStock',
    seller: { '@id': `${SITE_URL}/#organization` },
    eligibleRegion: ['BE', 'NL', 'FR', 'DE', 'LU'],
  };
  if (offer.lowPrice) {
    offerNode.lowPrice = offer.lowPrice;
    offerNode.priceValidUntil = offer.priceValidUntil ?? '2026-12-31';
  }
  node.offers = offerNode;

  // Free take-back program → MerchantReturnPolicy. The take-back is
  // effectively lifetime, but schema.org expects either a finite-window
  // category + days, or the Unlimited Window category. We use Unlimited
  // Window here, since "panels last decades" doesn't fit a day count.
  node.hasMerchantReturnPolicy = {
    '@type': 'MerchantReturnPolicy',
    returnPolicyCategory:
      'https://schema.org/MerchantReturnUnlimitedWindow',
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    applicableCountry: ['BE', 'NL', 'FR', 'DE', 'LU'],
  };

  return node;
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  /** Absolute or root-relative URL */
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQPage (per product, or generic)
// ---------------------------------------------------------------------------

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqPageSchema(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.answer,
      },
    })),
  };
}

// Used by callers that need to construct an absolute URL outside this module.
export { SITE_URL };
// Re-export defaultLocale so consumers don't need to know about i18n/config.
export { defaultLocale };
