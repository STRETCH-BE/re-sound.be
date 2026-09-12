import type { Locale } from '@/i18n/config';

/**
 * The manufacturing page (/[locale]/manufacturing): localised slugs, like the
 * range hubs. Locales without a localised slug use the English one.
 */
export const MANUFACTURING_SLUGS: Partial<Record<Locale, string>> & { en: string } = {
  en: 'manufacturing',
  nl: 'productie',
  fr: 'fabrication',
  de: 'fertigung',
  es: 'fabricacion',
  pt: 'fabrico',
};

export const MANUFACTURING_INTERNAL_PATH = '/manufacturing';

/** The locales in which the page exists (the others get the localised 404). */
export const MANUFACTURING_LOCALES = ['en', 'nl', 'fr', 'de', 'es', 'pt'] as const;
export type ManufacturingLocale = (typeof MANUFACTURING_LOCALES)[number];

export function isManufacturingLocale(locale: string): locale is ManufacturingLocale {
  return (MANUFACTURING_LOCALES as readonly string[]).includes(locale);
}

/** External path for a locale, e.g. '/productie' for nl. */
export function manufacturingPath(locale: string): string {
  return `/${MANUFACTURING_SLUGS[locale as Locale] ?? MANUFACTURING_SLUGS.en}`;
}

/** next-intl `pathnames` entry: internal path → external slug per locale. */
export function manufacturingPathnames(): Record<string, Record<Locale, string>> {
  const locales: Locale[] = ['en', 'nl', 'fr', 'de', 'es', 'pt', 'da', 'sv', 'no', 'is'];
  const out = {} as Record<Locale, string>;
  for (const l of locales) out[l] = manufacturingPath(l);
  return { [MANUFACTURING_INTERNAL_PATH]: out };
}
