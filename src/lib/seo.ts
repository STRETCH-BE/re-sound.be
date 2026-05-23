/**
 * Shared SEO helpers.
 *
 * Use these so every page derives its hreflang / canonical URLs from the
 * single source of truth (`src/i18n/config.ts`). Adding a new locale to
 * `locales` will automatically extend hreflang coverage everywhere.
 */
import { locales, type Locale } from '@/i18n/config';

/**
 * Build the `languages` map for `Metadata.alternates`.
 * Returns one entry per configured locale, pointing at the same route
 * under each locale prefix.
 *
 *   buildLanguageAlternates('/about')
 *   →  { en: '/en/about', nl: '/nl/about', fr: '/fr/about', ... }
 */
export function buildLanguageAlternates(
  route: string
): Record<string, string> {
  // Normalise route: ensure leading slash, no trailing slash (except for "/")
  const cleanRoute =
    route === '' || route === '/' ? '' : route.startsWith('/') ? route : `/${route}`;

  return Object.fromEntries(
    locales.map((loc) => [loc, `/${loc}${cleanRoute}`])
  );
}

/**
 * Build the full `alternates` object (canonical + languages) for a page.
 *
 *   buildAlternates('en', '/products/rwood-groove')
 */
export function buildAlternates(locale: Locale | string, route: string) {
  const cleanRoute =
    route === '' || route === '/' ? '' : route.startsWith('/') ? route : `/${route}`;
  return {
    canonical: `/${locale}${cleanRoute}`,
    languages: buildLanguageAlternates(cleanRoute),
  };
}
