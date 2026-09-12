// ============================================================================
// LEGACY REDIRECT MAP — re-sound.be on Wix → the Next.js site.
// Imported by next.config.mjs: `async redirects() { return legacyRedirects; }`
//
// ZERO-404 LAYERS (mirrors the stretchgroup.be project):
//   Layer 1  legacy/wix-urls.txt        — the URL inventory (launch-gate input)
//   Layer 2  EXPLICIT rules below       — every known legacy URL, mapped exactly
//   Layer 3  PREFIX catch-alls below    — ordered AFTER the explicit rules
//   Layer 4  src/middleware.ts          — any page-like path that is not one of
//            the site's routes 301s to the closest localised index or home;
//            Layer 4b: next.config `fallback` rewrite → /api/legacy-fallback
//            catches asset-like paths and unknown /api/* AFTER the filesystem
//   Layer 5  scripts/verify-redirects.mjs — proves it (npm run verify:redirects)
//
// Rules:
//   • Sources match with and without a trailing slash (Next normalises the
//     slash first) and ignore query strings (Next forwards them).
//   • Targets are locale-prefixed because the site uses localePrefix 'always'.
//     A legacy URL without a locale prefix goes to the language the old page
//     was written in: Wix served Dutch content under its default ("en")
//     locale, so unprefixed topic pages and blog posts go to /nl, product
//     pages to /en (the product pages exist in every locale).
//   • NO blanket "/:path*" rule here — next.config redirects run BEFORE the
//     filesystem, so a catch-all would hijack the site's own pages. The
//     middleware (Layer 4) is the only safe place for that.
//   • www → apex is a host rule so the canonical host holds even before the
//     Vercel domain-level redirect is configured.
// ============================================================================

const LOCALES = 'en|nl|fr|de|es|pt|da|sv|no|is';
/** Locale-preserving rule: `/:locale/<legacy>` → `/:locale/<live>` (308). */
const L = (legacy, live) => ({
  source: `/:locale(${LOCALES})${legacy}`,
  destination: live === '/' ? '/:locale' : `/:locale${live}`,
  permanent: true,
});
/** Unprefixed legacy path → one fixed locale (308). */
const U = (legacy, live) => ({ source: legacy, destination: live, permanent: true });

// ---------------------------------------------------------------------------
// HOST — www.re-sound.be → re-sound.be (the canonical tags use the apex).
// ---------------------------------------------------------------------------
const hostRules = [
  {
    source: '/:path*',
    has: [{ type: 'host', value: 'www.re-sound.be' }],
    destination: 'https://re-sound.be/:path*',
    permanent: true,
  },
];

// ---------------------------------------------------------------------------
// LAYER 2 — EXPLICIT MAP
// ---------------------------------------------------------------------------

/** Wix product-page slug → live product slug. */
const PRODUCT_SLUGS = {
  interior: 'interior',
  're-sound-interior': 'interior',
  solid: 'solid',
  're-sound-solid': 'solid',
  divide: 'divide',
  're-sound-divide': 'divide',
  'rwood-groove': 'rwood-groove',
  'rwood-micro': 'rwood-micro',
  'rwood-perf': 'rwood-perf',
  'rwood-veneer': 'rwood-veneer',
  'rwood-panel': 'rwood-veneer',
  'rpet-panel': 'rpet-panel',
  'rpet-groove': 'rpet-groove',
  'rpet-flex-groove': 'rpet-flex-groove',
  'rpet-flex': 'rpet-flex-groove',
  'solo-eco': 'solo-eco',
  'solo-flex': 'solo-flex',
  solo: 'solo-flex',
  duo: 'duo',
  'modular-xl': 'modular-xl',
  modular: 'modular-xl',
};

/**
 * Range hub slugs per locale (keep in step with src/data/hubs.ts — the
 * middleware cannot be imported here). A legacy hub URL goes straight to the
 * localised slug, so the chain ends without next-intl's extra 307 hop.
 */
const HUB_SLUGS = {
  '/products/pet-acoustic-panels': { en: 'pet-acoustic-panels', nl: 'pet-akoestische-panelen', fr: 'panneaux-acoustiques-pet', de: 'pet-akustikpaneele' },
  '/products/wood-acoustic-panels': { en: 'wood-acoustic-panels', nl: 'houten-akoestische-panelen', fr: 'panneaux-acoustiques-bois', de: 'holz-akustikpaneele' },
  '/products/acoustic-phone-booths': { en: 'acoustic-phone-booths', nl: 'akoestische-belcabines', fr: 'cabines-acoustiques', de: 'telefonboxen' },
};
const ALL_LOCALES = LOCALES.split('|');
/** Live path for one locale: hubs get their localised slug, everything else is shared. */
const liveFor = (live, locale) => {
  const hub = HUB_SLUGS[live];
  return hub ? `/products/${hub[locale] ?? hub.en}` : live;
};

/**
 * Wix topic pages (Dutch and English slugs) → live page (internal path; hubs
 * are localised per locale through liveFor()).
 */
const TOPIC_PAGES = {
  // Dutch
  'akoestische-scheidingspanelen': '/products/divide', // confirmed backlinked URL
  'akoestische-wandpanelen': '/products/interior',
  'akoestische-panelen': '/products',
  'houten-akoestische-panelen': '/products/wood-acoustic-panels',
  'pet-akoestische-panelen': '/products/pet-acoustic-panels',
  'akoestische-belcabines': '/products/acoustic-phone-booths',
  belcabines: '/products/acoustic-phone-booths',
  telefooncellen: '/products/acoustic-phone-booths',
  vergaderpods: '/products/acoustic-phone-booths',
  'over-ons': '/about',
  duurzaamheid: '/sustainability',
  circulair: '/sustainability',
  producten: '/products',
  downloads: '/products',
  projecten: '/products',
  realisaties: '/products',
  verkooppunten: '/where-to-buy',
  dealers: '/where-to-buy',
  showroom: '/where-to-buy',
  'veelgestelde-vragen': '/faq',
  nieuws: '/blog',
  // English
  'acoustic-panels': '/products',
  'acoustic-dividers': '/products/divide',
  'room-dividers': '/products/divide',
  'acoustic-wall-panels': '/products/interior',
  'phone-booths': '/products/acoustic-phone-booths',
  'office-pods': '/products/acoustic-phone-booths',
  'about-us': '/about',
  'about-1': '/about', // Wix duplicate-page suffix
  'contact-1': '/contact',
  shop: '/products',
  news: '/blog',
  'blog-1': '/blog',
};

const explicitRules = [];
for (const [wix, live] of Object.entries(PRODUCT_SLUGS)) {
  explicitRules.push(L(`/product-page/${wix}`, `/products/${live}`));
  explicitRules.push(L(`/product-page/copy-of-${wix}`, `/products/${live}`));
  explicitRules.push(U(`/product-page/${wix}`, `/en/products/${live}`));
  explicitRules.push(U(`/product-page/copy-of-${wix}`, `/en/products/${live}`));
}
for (const [wix, live] of Object.entries(TOPIC_PAGES)) {
  if (HUB_SLUGS[live]) {
    // one rule per locale so the destination is the localised hub slug
    for (const locale of ALL_LOCALES) explicitRules.push(U(`/${locale}/${wix}`, `/${locale}${liveFor(live, locale)}`));
  } else {
    explicitRules.push(L(`/${wix}`, live));
  }
  explicitRules.push(U(`/${wix}`, `/nl${liveFor(live, 'nl')}`));
  explicitRules.push(U(`/copy-of-${wix}`, `/nl${liveFor(live, 'nl')}`));
}

// ---------------------------------------------------------------------------
// LAYER 3 — PREFIX CATCH-ALLS (after the explicit rules; first match wins)
// ---------------------------------------------------------------------------
const prefixRules = [
  L('/product-page/:path*', '/products'),
  U('/product-page/:path*', '/en/products'),
  L('/post/:path*', '/blog'),
  U('/post/:path*', '/nl/blog'),
  L('/blog-1/:path*', '/blog'),
  U('/blog-1/:path*', '/nl/blog'),
  L('/copy-of-:path*', '/'),
  U('/copy-of-:path*', '/nl'),
  L('/shop/:path*', '/products'),
  U('/shop/:path*', '/en/products'),
];

export const legacyRedirects = [...hostRules, ...explicitRules, ...prefixRules];
