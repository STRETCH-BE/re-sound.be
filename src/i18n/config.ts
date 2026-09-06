// Supported locales for Re-Sound website
export const locales = ['en', 'nl', 'fr', 'de', 'es', 'pt', 'da', 'sv', 'no', 'is'] as const;

// Default locale (English)
export const defaultLocale = 'en' as const;

// Type for locale
export type Locale = (typeof locales)[number];

/**
 * Locales that are complete enough to be indexed.
 *
 * Only these go into the sitemap and the hreflang sets; the others
 * (da, sv, no, is) stay reachable but carry `robots: noindex, follow`
 * because large parts of their copy still fall back to English.
 *
 * To re-enable a locale: finish its translation (run
 * `node scripts/seo-check.mjs` — the "(b) English text segments" section
 * must show < 3 % for every page of that locale), then add it here. The
 * sitemap, hreflang alternates and robots meta all read this list.
 */
export const SEO_LOCALES = ['en', 'nl', 'fr', 'de', 'es', 'pt'] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];

export function isSeoLocale(locale: string): locale is SeoLocale {
  return (SEO_LOCALES as readonly string[]).includes(locale);
}

// Routing configuration for next-intl middleware
export const routing = {
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: 'always' as const,
};

// Locale display names (in their native language)
export const localeNames: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  da: 'Dansk',
  sv: 'Svenska',
  no: 'Norsk',
  is: 'Íslenska',
};

// Locale flags for UI
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  nl: '🇳🇱',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
  pt: '🇵🇹',
  da: '🇩🇰',
  sv: '🇸🇪',
  no: '🇳🇴',
  is: '🇮🇸',
};

// Full locale codes (for HTML lang attribute and SEO)
export const localeFullCodes: Record<Locale, string> = {
  en: 'en-BE',
  nl: 'nl-BE',
  fr: 'fr-BE',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  da: 'da-DK',
  sv: 'sv-SE',
  // Bokmål — 'no' is a macrolanguage; 'nb-NO' is the code Facebook/OG and
  // hreflang validators actually recognise.
  no: 'nb-NO',
  is: 'is-IS',
};

// RTL languages (none for Re-Sound, but included for reference)
export const rtlLocales: Locale[] = [];

// Check if a locale is valid
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale from path
export function getLocaleFromPath(path: string): Locale | null {
  const segments = path.split('/').filter(Boolean);
  const potentialLocale = segments[0];

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  return null;
}

// Remove locale from path
export function removeLocaleFromPath(path: string): string {
  const locale = getLocaleFromPath(path);

  if (locale) {
    return path.replace(`/${locale}`, '') || '/';
  }

  return path;
}
