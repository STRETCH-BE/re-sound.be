/**
 * Schema.org JSON-LD builders.
 *
 * Goal: feed Google, Bing, and AI crawlers a machine-readable description of
 * the Re-Sound entity and its products so they render richer results and have
 * a stable source of truth for entity disambiguation (Knowledge Graph,
 * shopping cards, AI assistants).
 *
 * Three types are produced:
 *   - Organization      → sitewide entity; emitted once on the homepage
 *   - Product           → per product page
 *   - BreadcrumbList    → per product page; helps Google show breadcrumbs in SERP
 *
 * Each builder returns a plain JS object. Render it through <JsonLd> which
 * serialises to a single `<script type="application/ld+json">` tag.
 */

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
      areaServed: ['BE', 'NL', 'FR', 'DE', 'LU', 'EU'],
      availableLanguage: ['en', 'nl', 'fr', 'de'],
    },
    sameAs: [
      'https://www.instagram.com/resoundbe',
      'https://www.linkedin.com/company/re-sound-be',
    ],
  };
}

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductSchemaInput {
  /** kebab-case slug, e.g. 'rwood-groove' */
  slug: string;
  /** Localised product name without trailing " | Re-Sound" */
  name: string;
  /** Localised product description */
  description: string;
  /** Path to a primary product image, relative to site root (e.g. /images/products/.../hero.webp) */
  image: string;
  /** Category in human language, e.g. 'Acoustic wood panels' */
  category: string;
  /** Optional ISO country code where this product is manufactured */
  countryOfOrigin?: string;
}

export function productSchema(input: ProductSchemaInput) {
  const url = `${SITE_URL}/en/products/${input.slug}`;

  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: input.name,
    description: input.description,
    url,
    image: `${SITE_URL}${input.image}`,
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
