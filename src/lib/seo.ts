// ============================================================================
// SEO helpers — DOMAIN-AWARE canonical + hreflang alternates.
// Each locale lives on its own domain with unprefixed URLs, so:
//   canonical  → https://<locale-domain><route>
//   hreflang   → one entry per locale pointing at that locale's DOMAIN
//   x-default  → the default-locale (en) domain
// Derives entirely from i18n/config: adding/changing a locale or domain needs
// no change here.
// ============================================================================
import type { Metadata } from 'next';
import {
  locales,
  defaultLocale,
  localeFullCodes,
  originForLocale,
  type Locale,
} from '@/i18n/config';

/** Normalize a route to a clean, leading-slash path with no trailing slash. */
function normalizeRoute(route: string): string {
  if (!route || route === '/') return '';
  return ('/' + route.replace(/^\/+|\/+$/g, '')).replace(/\/+/g, '/');
}

/**
 * Absolute base URL of a locale's own domain (no trailing slash), e.g.
 * "https://stretchplafond.nl". Use `${localeBase(locale)}/products` wherever
 * `${siteUrl}/${locale}/products` was used before.
 */
export function localeBase(locale: Locale): string {
  return originForLocale(locale);
}

/** Absolute URL for a (locale, route) pair, e.g. https://stretchplafond.nl/products. */
export function buildCanonical(locale: Locale, route: string): string {
  // Home resolves to the bare origin; every other route is origin + path.
  return `${originForLocale(locale)}${normalizeRoute(route)}`;
}

/**
 * hreflang alternates for a route: one entry per locale (keyed by BCP 47 code,
 * pointing at that locale's domain) plus x-default pointing at the
 * default-locale domain.
 */
export function buildAlternates(locale: Locale, route: string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[localeFullCodes[l] ?? l] = buildCanonical(l, route);
  }
  languages['x-default'] = buildCanonical(defaultLocale, route);

  return {
    canonical: buildCanonical(locale, route),
    languages,
  };
}

/** OG locale + alternateLocale for a given active locale (nl_BE style). */
export function buildOgLocales(locale: Locale): { ogLocale: string; alternate: string[] } {
  const fmt = (code: string) => code.replace('-', '_');
  const ogLocale = fmt(localeFullCodes[locale] ?? 'en');
  const alternate = locales
    .filter((l) => l !== locale)
    .map((l) => fmt(localeFullCodes[l] ?? l));
  return { ogLocale, alternate };
}
