/**
 * Edge-safe route knowledge for the middleware's zero-404 layer.
 *
 * Imports only plain data modules (no Node APIs): which locale-stripped paths
 * are pages of this site. Anything else that reaches the middleware is a
 * legacy or mistyped URL and is redirected to the closest live index instead
 * of rendering a 404 (see src/middleware.ts).
 *
 * Keep STATIC_ROUTES in step with src/app/[locale]/<route>/page.tsx.
 */
import { BOOTH_GUIDE } from '@/data/guides';
import { HUBS } from '@/data/hubs';
import { MANUFACTURING_SLUGS } from '@/data/manufacturing';
import { PRODUCT_SLUGS } from '@/data/products';

/** Locale-stripped paths that are pages in every locale. */
const STATIC_ROUTES = new Set<string>([
  '/',
  '/about',
  '/blog',
  '/contact',
  '/faq',
  '/partner',
  '/privacy',
  '/products',
  '/samples',
  '/acoustic-calculator',
  '/sustainability',
  '/terms',
  '/where-to-buy',
]);

/** /products/<slug>: product pages plus every hub slug in every locale. */
const PRODUCT_PATHS = new Set<string>([
  ...PRODUCT_SLUGS.map((s) => `/products/${s}`),
  ...Object.values(HUBS).flatMap((hub) => [hub.internalPath, ...Object.values(hub.slugs).map((s) => `/products/${s}`)]),
]);

/** /guides/<slug> in any locale's spelling. */
const GUIDE_PATHS = new Set<string>(Object.values(BOOTH_GUIDE.slugs).map((s) => `/guides/${s}`));

/** /manufacturing and its localised spellings. */
const MANUFACTURING_PATHS = new Set<string>(Object.values(MANUFACTURING_SLUGS).map((s) => `/${s}`));

/** Normalise a locale-stripped pathname: no trailing slash, no doubled slashes. */
export function normalizePath(pathname: string): string {
  const cleaned = ('/' + pathname).replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

/**
 * True when the locale-stripped path is one of the site's own routes. Blog
 * posts are accepted by prefix (their slugs live in content/blog and in
 * messages, which the edge cannot read); an unknown blog slug renders the
 * blog's own not-found state.
 */
export function isKnownRoute(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (STATIC_ROUTES.has(path)) return true;
  if (PRODUCT_PATHS.has(path)) return true;
  if (GUIDE_PATHS.has(path)) return true;
  if (MANUFACTURING_PATHS.has(path)) return true;
  if (path.startsWith('/blog/')) return true;
  return false;
}

/**
 * Where an unknown path should land: the closest live index for the section
 * it pretends to be in, else the locale home. Locale-stripped in, locale-
 * stripped out.
 */
export function closestRoute(pathname: string): string {
  const path = normalizePath(pathname);
  if (path.startsWith('/products/') || path.startsWith('/product-page')) return '/products';
  if (path.startsWith('/guides/')) return '/guides/phone-booth-prices';
  if (path.startsWith('/blog') || path.startsWith('/post/')) return '/blog';
  return '/';
}

/**
 * Top-level paths that exist as files or generated routes under public/ or
 * src/app (favicon, robots, sitemap, the images/documents/videos folders).
 * An unprefixed asset-like request outside these prefixes cannot be a real
 * file, so the middleware sends it to the home page instead of letting a
 * bogus first segment reach the [locale] tree. Keep in step with public/.
 */
const PUBLIC_ASSET_PREFIXES = [
  '/images/',
  '/documents/',
  '/videos/',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/robots.txt',
  '/llms.txt',
  '/sitemap.xml',
  '/sitemap',
  '/opengraph-image',
  '/README.md',
];

/** True when an asset-like path could be served from public/ or a generated route. */
export function isPublicAssetPath(pathname: string): boolean {
  return PUBLIC_ASSET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}
