// ============================================================================
// SITE CONFIG — single source of truth for brand data.
// Pulled from the finalized brand brief + design mockups. Anything that varies
// by deploy (URLs, IDs) reads from env; everything brand-stable lives here.
// ============================================================================

// Primary origin — the default-locale (en / international) domain. Page URLs
// are always built per-locale via localeBase() in src/lib/seo.ts; siteUrl is
// only used for domain-stable identifiers (Organization @id, logo URL) so the
// brand keeps ONE schema.org entity across all 12 domains.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://stretchplafond.com'
).replace(/\/$/, '');

export const brand = {
  name: 'STRETCH',
  legalName: 'Stretch Productions BV',
  parentCompany: 'STRETCH Group',
  poweredBy: 'Powered by STRETCH Media',
  founded: 2018,
  tagline: 'A new ceiling in one day.',
  description:
    'STRETCH installs sleek, seamless stretch ceilings and walls in a single day — cold-mounted, with no dust and no painting — offering acoustic, lighting and printed-design options. Hand-made in Belgium for residential and commercial projects.',
  domain: 'stretchplafond.be',
  colors: {
    red: '#FF0000',
    black: '#0A0A0A',
    pureBlack: '#000000',
    white: '#FFFFFF',
    surface: '#F4F3F1',
    text: '#0A0A0A',
  },
} as const;

export const contact = {
  email: 'info@stretchgroup.be',
  leadDestination: process.env.LEAD_DESTINATION || 'leads@stretchgroup.be',
  phone: '+3232846818',
  phoneDisplay: '+32 3 284 68 18',
  phoneHref: 'tel:+3232846818',
  whatsapp: '+32474522090',
  whatsappHref: 'https://wa.me/32474522090',
  telegram: 'https://t.me/STRETCH_OFFICE',
  hours: 'Mo-Fr 08:30-17:00',
  hoursDisplay: 'Mon–Fri · 08:30–17:00',
  address: {
    street: 'Gentseweg 309 A3 (Beverpark)',
    city: 'Beveren-Waas',
    postalCode: '9120',
    region: 'Oost-Vlaanderen',
    country: 'BE',
  },
  geo: { lat: 51.1953188, lng: 4.2239015 },
} as const;

export type Office = {
  role: string;
  country: string;
  countryName: string;
  name: string;
  addressLines: string[];
  email?: string;
  geo?: { lat: number; lng: number };
};

export const offices: Office[] = [
  {
    role: 'Headquarters',
    country: 'BE',
    countryName: 'Belgium',
    name: 'STRETCH',
    addressLines: ['Gentseweg 309 A3', '9120 Beveren-Waas'],
    email: 'info@stretchgroup.be',
    geo: { lat: 51.1953188, lng: 4.2239015 },
  },
  {
    role: 'Sales',
    country: 'US',
    countryName: 'United States',
    name: 'STRETCH US',
    addressLines: ['New York', 'Sales — US'],
    email: 'us@stretchgroup.be',
  },
  {
    role: 'Branch',
    country: 'PL',
    countryName: 'Poland',
    name: 'Alto Design Sp. z o.o.',
    addressLines: ['Legionów 59', '42-202 Częstochowa'],
    email: 'info@stretch-sufit.pl',
    geo: { lat: 50.8074338, lng: 19.1585487 },
  },
  {
    role: 'Branch',
    country: 'AT',
    countryName: 'Austria',
    name: 'STRETCH Austria',
    addressLines: ['Gertrude-Fröhlich-Sandner-Straße 2', '1100 Vienna'],
    email: 'info@stretchdecken.at',
    geo: { lat: 48.1861668, lng: 16.3767073 },
  },
];

// Group reach (for copy + LocalBusiness areaServed). Sales territory at launch
// is Belgium; the group operates across these markets.
export const salesTerritory = [
  'BE',
  'NL',
  'FR',
  'DE',
  'AT',
  'PL',
  'UK',
  'US',
  'IS',
  'MT',
] as const;

// Social handles are [LATER] in the brief — only Telegram is public today.
// Render only entries with a real URL.
export const social: { label: string; short: string; url: string }[] = [
  { label: 'Telegram', short: 'tg', url: contact.telegram },
];

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export type NavLink = { key: string; href: string };

export const mainNav: NavLink[] = [
  { key: 'solutions', href: '/products' },
  { key: 'inspiration', href: '/inspiration' },
  { key: 'partners', href: '/partners' },
  { key: 'contact', href: '/contact' },
];

export const utilityNav: NavLink[] = [
  { key: 'reseller', href: '/partners' },
  { key: 'training', href: '/installer-training' },
];

export const footerNav = {
  solutions: [
    { key: 'polyester', href: '/products/polyester-stretch-ceiling' },
    { key: 'pvc', href: '/products/pvc-stretch-ceiling' },
    { key: 'acoustic', href: '/products/acoustic-stretch-system' },
    { key: 'light', href: '/products/light-print-stretch-ceiling' },
    { key: 'prefab', href: '/products/prefab-ceiling-unit' },
  ] as NavLink[],
  company: [
    { key: 'reseller', href: '/partners' },
    { key: 'training', href: '/installer-training' },
    { key: 'inspiration', href: '/inspiration' },
    { key: 'about', href: '/about' },
    { key: 'faq', href: '/faq' },
    // Client portal — private client area (login-gated, noindex).
    { key: 'clientPortal', href: '/portal' },
  ] as NavLink[],
  legal: [
    { key: 'privacy', href: '/privacy' },
    { key: 'terms', href: '/terms' },
  ] as NavLink[],
};

// Every internal route, for the sitemap. Product + blog detail routes are
// appended dynamically from the catalogs below in sitemap.ts.
export const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/products',
  '/partners',
  '/installer-training',
  '/inspiration',
  '/samples',
  '/datasheets',
  '/products/prefab-lighting-elements',
  '/faq',
  '/blog',
  '/privacy',
  '/terms',
] as const;
