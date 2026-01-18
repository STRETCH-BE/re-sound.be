// Supported locales for Re-Sound website
export const locales = ['en', 'nl', 'fr', 'de'] as const;

// Default locale (English)
export const defaultLocale = 'en' as const;

// Type for locale
export type Locale = (typeof locales)[number];

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
};

// Locale flags for UI
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  nl: '🇳🇱',
  fr: '🇫🇷',
  de: '🇩🇪',
};

// Full locale codes (for HTML lang attribute and SEO)
export const localeFullCodes: Record<Locale, string> = {
  en: 'en-BE',
  nl: 'nl-BE',
  fr: 'fr-BE',
  de: 'de-DE',
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
