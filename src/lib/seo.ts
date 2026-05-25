/**
 * Shared SEO helpers.
 *
 * Use these so every page derives its hreflang / canonical URLs from the
 * single source of truth (`src/i18n/config.ts`). Adding a new locale to
 * `locales` will automatically extend hreflang coverage everywhere.
 */
import { locales, localeFullCodes, defaultLocale, type Locale } from '@/i18n/config';

/**
 * Build the `languages` map for `Metadata.alternates`.
 *
 * Returns one entry per configured locale, pointing at the same route
 * under each locale prefix, plus an `x-default` entry pointing at the
 * English version. Google requires `x-default` when there's no clear
 * default locale for international users — without it, GSC's
 * International Targeting report flags every page as ambiguous.
 *
 *   buildLanguageAlternates('/about')
 *   →  { en: '/en/about', nl: '/nl/about', ..., 'x-default': '/en/about' }
 */
export function buildLanguageAlternates(
  route: string
): Record<string, string> {
  // Normalise route: ensure leading slash, no trailing slash (except for "/")
  const cleanRoute =
    route === '' || route === '/' ? '' : route.startsWith('/') ? route : `/${route}`;

  return {
    ...Object.fromEntries(
      locales.map((loc) => [loc, `/${loc}${cleanRoute}`])
    ),
    // EN is the default for unspecified locales (matches `defaultLocale`).
    'x-default': `/${defaultLocale}${cleanRoute}`,
  };
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

/**
 * Map a routing-locale (e.g. 'en') to the OpenGraph `locale` value
 * (e.g. 'en_BE'). OpenGraph spec uses language_TERRITORY with an
 * underscore separator; our `localeFullCodes` use hyphens (BCP 47).
 */
export function ogLocale(locale: Locale | string): string {
  const code = (localeFullCodes as Record<string, string>)[locale];
  return code ? code.replace('-', '_') : 'en_BE';
}

/**
 * Build the `alternateLocale` array for OpenGraph — every locale except
 * the current one, in the same underscored language_TERRITORY format.
 */
export function ogAlternateLocales(locale: Locale | string): string[] {
  return locales
    .filter((l) => l !== locale)
    .map((l) => localeFullCodes[l].replace('-', '_'));
}
