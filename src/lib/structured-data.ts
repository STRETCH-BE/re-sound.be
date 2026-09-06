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
 *   - LocalBusiness     → the Beveren-Waas showroom (homepage, where-to-buy)
 *   - Product           → per product page, with one Offer built from
 *                         src/data/products.ts (price / unit / availability)
 *   - ItemList          → /products listing and the range hubs
 *   - CollectionPage    → range hubs (wraps the ItemList)
 *   - BreadcrumbList    → per product/hub page
 *   - FAQPage           → per product/hub page (only for visible FAQs)
 *   - BlogPosting       → per blog post
 *
 * Every fact comes from src/config/site.ts or src/data/products.ts — never
 * from a literal in a page file — so copy, meta and schema cannot disagree.
 * Each builder returns a plain JS object. Render it through <JsonLd>.
 */

import { locales, SEO_LOCALES, type Locale, defaultLocale } from '@/i18n/config';
import {
  BLOG_AUTHOR,
  FOUNDING_YEAR,
  LEGAL_NAME,
  PARENT_ORGANIZATION,
  SHOWROOM,
  SHOW_PLACEHOLDER_PRICES,
  SITE_URL,
  SOCIAL_LINKS_LIST,
} from '@/config/site';
import { isoSpeechClass, PRODUCTS, type Product } from '@/data/products';

const ORG_ID = `${SITE_URL}/#organization`;

/**
 * Placeholder "from" price used ONLY when NEXT_PUBLIC_SHOW_PRICES is set and
 * a product has no confirmed price yet. Deliberately impossible-looking so it
 * can never be mistaken for a real quote if it ever leaks.
 */
export const PLACEHOLDER_FROM_PRICE = 0;

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Re-Sound',
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/re-sound-logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'Belgian B2B manufacturer of circular acoustic panels and office phone booths made from recycled textiles, FSC-certified wood veneer, and recycled PET. Own plants in Beveren-Waas (BE) and Częstochowa (PL). Free take-back service.',
    // FOUNDING_YEAR is a placeholder (null) until confirmed — see config/site.ts.
    ...(FOUNDING_YEAR !== null ? { foundingDate: String(FOUNDING_YEAR) } : {}),
    parentOrganization: {
      '@type': 'Organization',
      name: PARENT_ORGANIZATION.name,
      url: PARENT_ORGANIZATION.url,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SHOWROOM.streetAddress,
      postalCode: SHOWROOM.postalCode,
      addressLocality: SHOWROOM.addressLocality,
      addressRegion: SHOWROOM.addressRegion,
      addressCountry: SHOWROOM.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: SHOWROOM.email,
      telephone: SHOWROOM.telephone,
      areaServed: ['BE', 'NL', 'FR', 'DE', 'LU', 'EU'],
      // Full 10-locale coverage matches what the site actually serves.
      availableLanguage: locales as unknown as string[],
    },
    // Same list the footer renders — one source of truth (config/site.ts).
    sameAs: SOCIAL_LINKS_LIST,
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
    inLanguage: SEO_LOCALES as unknown as string[],
    publisher: { '@id': ORG_ID },
    description:
      'Circular acoustic panels and office phone booths — wall, ceiling, and freestanding solutions from recycled textiles, FSC wood veneer, and recycled PET.',
  };
}

// ---------------------------------------------------------------------------
// LocalBusiness — the showroom in Beveren-Waas
// ---------------------------------------------------------------------------

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#showroom`,
    name: SHOWROOM.name,
    url: `${SITE_URL}/${defaultLocale}/where-to-buy`,
    image: `${SITE_URL}/images/re-sound-logo.png`,
    telephone: SHOWROOM.telephone,
    email: SHOWROOM.email,
    priceRange: SHOWROOM.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SHOWROOM.streetAddress,
      postalCode: SHOWROOM.postalCode,
      addressLocality: SHOWROOM.addressLocality,
      addressRegion: SHOWROOM.addressRegion,
      addressCountry: SHOWROOM.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SHOWROOM.latitude,
      longitude: SHOWROOM.longitude,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: SHOWROOM.openingDays,
        opens: SHOWROOM.opens,
        closes: SHOWROOM.closes,
      },
    ],
    parentOrganization: { '@id': ORG_ID },
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

/**
 * Legacy call shape (slug + hand-written specs) still used by a few route
 * pages while they are being migrated; resolved to the data-driven shape
 * inside productSchema(). Remove once every page passes `product`.
 */
export interface LegacyProductSchemaInput {
  slug: string;
  locale: Locale | string;
  name: string;
  description: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  category: string;
  countryOfOrigin?: string;
  material?: string;
  specs?: ProductSpec[];
  offer?: { lowPrice?: string; priceCurrency?: string; priceValidUntil?: string };
}

export interface ProductSchemaInput {
  /** Product record from src/data/products.ts — drives offer, origin, material, specs */
  product: Product;
  /** Routing locale of the current page (e.g. 'en', 'nl') */
  locale: Locale | string;
  /** Localised product name without trailing " | Re-Sound" */
  name: string;
  /** Localised product description */
  description: string;
  /** Localised category, e.g. 'Acoustic wood panels' / 'Houten akoestische panelen' */
  category: string;
  /** Optional override of the primary image (defaults to product.heroImage) */
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  /** Extra localised specs to append to the ones derived from product data */
  extraSpecs?: ProductSpec[];
}

/** The free take-back programme, expressed as a MerchantReturnPolicy. */
function returnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    returnPolicyCategory: 'https://schema.org/MerchantReturnUnlimitedWindow',
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    applicableCountry: ['BE', 'NL', 'FR', 'DE', 'LU'],
  };
}

/**
 * One Offer per product.
 *
 * Confirmed prices (product.fromPrice) always ship. Products whose price is
 * still a placeholder get an Offer without a price unless
 * NEXT_PUBLIC_SHOW_PRICES is set, in which case PLACEHOLDER_FROM_PRICE is
 * emitted — so nothing false ships to production by accident.
 */
export function productOffer(product: Product, url: string) {
  const price =
    product.fromPrice !== null
      ? product.fromPrice
      : SHOW_PLACEHOLDER_PRICES
        ? PLACEHOLDER_FROM_PRICE
        : null;

  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url,
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORG_ID },
    eligibleRegion: ['BE', 'NL', 'FR', 'DE', 'LU'],
    hasMerchantReturnPolicy: returnPolicy(),
  };

  if (price !== null) {
    offer.price = String(price);
    offer.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      price: String(price),
      priceCurrency: 'EUR',
      unitCode: product.priceUnit.unitCode,
      unitText: product.priceUnit.unitText,
      valueAddedTaxIncluded: false,
    };
    // End of next calendar year, so the date never silently expires.
    offer.priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
  }

  return offer;
}

/** Specs derived from the normalised fields in product data. */
function dataSpecs(product: Product): ProductSpec[] {
  const out: ProductSpec[] = [];
  const s = product.specs;
  if (s.kind === 'panel') {
    if (s.alphaW) out.push({ name: 'Sound absorption (αw)', value: s.alphaW, unitText: 'ISO 11654' });
    if (s.nrc) out.push({ name: 'NRC', value: s.nrc, unitText: 'ASTM C423' });
    if (s.fireClass) out.push({ name: 'Fire classification', value: s.fireClass, unitText: 'EN 13501-1' });
    if (s.thickness) out.push({ name: 'Thickness', value: s.thickness });
    if (s.format) out.push({ name: 'Panel format', value: s.format });
  } else {
    out.push({ name: 'Capacity', value: `${s.capacity} ${s.capacity === '1' ? 'person' : 'persons'}` });
    out.push({ name: 'Footprint', value: s.footprint });
    out.push({ name: 'External dimensions', value: s.externalDimensions });
    if (s.speechLevelReductionDbA !== null) {
      out.push({ name: 'Speech level reduction (ISO 23351-1)', value: String(s.speechLevelReductionDbA), unitText: 'dB(A)' });
      const cls = isoSpeechClass(s.speechLevelReductionDbA);
      if (cls) out.push({ name: 'ISO 23351-1 class', value: cls });
    }
    out.push({ name: 'Ventilation', value: s.ventilation });
    out.push({ name: 'Net weight', value: s.weight });
  }
  if (product.recycledContentPct !== null) {
    out.push({ name: 'Recycled content', value: String(product.recycledContentPct), unitText: '%' });
  }
  for (const c of product.certifications) out.push({ name: 'Certification', value: c });
  return out;
}

/**
 * Build a Product JSON-LD payload from product data.
 *
 * Includes:
 *   - ImageObject (not bare URL) so Google can pick the right rich-card crop
 *   - one Offer with UnitPriceSpecification (see productOffer)
 *   - countryOfOrigin as a real ISO country, only when confirmed
 *   - additionalProperty PropertyValue entries for acoustic / technical specs
 *   - material string for AI search ("acoustic panel made from recycled PET")
 */
export function productSchema(raw: ProductSchemaInput | LegacyProductSchemaInput) {
  // Legacy adapter: look the product up by slug and drop the hand-written
  // origin/offer/specs (they were the source of the copy-vs-schema
  // contradictions the audit found); data-driven values take over.
  const input: ProductSchemaInput =
    'product' in raw
      ? raw
      : {
          product: PRODUCTS[raw.slug],
          locale: raw.locale,
          name: raw.name,
          description: raw.description,
          category: raw.category,
          image: raw.image,
          imageWidth: raw.imageWidth,
          imageHeight: raw.imageHeight,
        };
  const { product } = input;
  const url = `${SITE_URL}/${input.locale}/products/${product.slug}`;
  const image = input.image ?? product.heroImage;
  const imgWidth = input.imageWidth ?? 1920;
  const imgHeight = input.imageHeight ?? 1080;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: input.name,
    description: input.description,
    url,
    sku: product.slug,
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${encodeURI(image)}`,
      width: imgWidth,
      height: imgHeight,
      caption: input.name,
    },
    category: input.category,
    brand: { '@type': 'Brand', name: 'Re-Sound' },
    // Self-describing reference: the full Organization node only exists on
    // the homepage, so include name/url inline to avoid a dangling @id.
    manufacturer: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Re-Sound',
      url: SITE_URL,
    },
    material: product.material,
    offers: productOffer(product, url),
  };

  // Never "EU": either a confirmed ISO country from product data or nothing.
  if (product.madeIn) {
    node.countryOfOrigin = { '@type': 'Country', name: product.madeIn };
  }

  const specs = [...dataSpecs(product), ...(input.extraSpecs ?? [])];
  if (specs.length > 0) {
    node.additionalProperty = specs.map((s) => ({
      '@type': 'PropertyValue',
      name: s.name,
      value: s.value,
      ...(s.unitText ? { unitText: s.unitText } : {}),
    }));
  }

  return node;
}

// ---------------------------------------------------------------------------
// ItemList / CollectionPage
// ---------------------------------------------------------------------------

export interface ListItemInput {
  name: string;
  /** Absolute or root-relative URL */
  url: string;
  image?: string;
  description?: string;
}

const abs = (u: string) => (u.startsWith('http') ? u : `${SITE_URL}${u}`);

export function itemListSchema(items: ListItemInput[], name?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(name ? { name } : {}),
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: abs(item.url),
      ...(item.image ? { image: abs(item.image) } : {}),
    })),
  };
}

export interface CollectionPageInput {
  name: string;
  description: string;
  /** Root-relative page URL */
  url: string;
  locale: string;
  items: ListItemInput[];
}

export function collectionPageSchema(input: CollectionPageInput) {
  const { '@context': _ctx, ...list } = itemListSchema(input.items, input.name);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${abs(input.url)}#collection`,
    name: input.name,
    description: input.description,
    url: abs(input.url),
    inLanguage: input.locale,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': ORG_ID },
    mainEntity: list,
  };
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
      item: abs(item.url),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQPage (per product, hub or generic)
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

// ---------------------------------------------------------------------------
// BlogPosting
// ---------------------------------------------------------------------------

export interface BlogPostingInput {
  locale: string;
  slug: string;
  headline: string;
  description: string;
  /** ISO date, e.g. '2024-01-15' */
  datePublished: string;
  /** ISO date; defaults to datePublished */
  dateModified?: string;
  /** Root-relative or absolute image URL */
  image: string;
  /** Named author (editorial posts from the content workbook); falls back to BLOG_AUTHOR / the organisation */
  author?: { name: string; jobTitle?: string; url?: string };
  /** Word count of the article body, when known */
  wordCount?: number;
}

export function blogPostingSchema(input: BlogPostingInput) {
  const url = `${SITE_URL}/${input.locale}/blog/${input.slug}`;
  // A named author comes from the post itself (workbook: "Author (named
  // person)"). BLOG_AUTHOR is a placeholder (null) until a real default
  // author is confirmed; the organisation is then credited instead of an
  // invented person.
  const person = input.author ?? BLOG_AUTHOR;
  const author = person
    ? {
        '@type': 'Person',
        name: person.name,
        ...('jobTitle' in person && person.jobTitle ? { jobTitle: person.jobTitle, worksFor: { '@id': ORG_ID } } : {}),
        ...(person.url ? { url: person.url } : {}),
      }
    : { '@type': 'Organization', '@id': ORG_ID, name: 'Re-Sound', url: SITE_URL };

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: input.headline,
    description: input.description,
    inLanguage: input.locale,
    url,
    mainEntityOfPage: url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: abs(input.image),
    ...(input.wordCount ? { wordCount: input.wordCount } : {}),
    author,
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Re-Sound',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/re-sound-logo.png`,
      },
    },
  };
}

// Used by callers that need to construct an absolute URL outside this module.
export { SITE_URL };
// Re-export defaultLocale so consumers don't need to know about i18n/config.
export { defaultLocale };
