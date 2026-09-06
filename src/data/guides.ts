import { locales, type Locale } from '@/i18n/config';

/**
 * Booth price guide ("Office phone booth: prices & ISO classes 2026",
 * workbook Content_Calendar CC-008 / Booth_Guide). Localised slugs like the
 * range hubs; the page exists in GUIDE_LOCALES only — other locales fall
 * back to the English slug in the routing table but the page returns 404.
 */
export const GUIDE_LOCALES = ['en', 'nl', 'fr', 'de'] as const;
export type GuideLocale = (typeof GUIDE_LOCALES)[number];

export const BOOTH_GUIDE = {
  id: 'booths',
  internalPath: '/guides/phone-booth-prices',
  slugs: { en: 'phone-booth-prices', nl: 'prijzen-belcabines', fr: 'prix-cabines-acoustiques', de: 'telefonbox-preise' } as Record<GuideLocale, string>,
  updatedAt: '2026-09-06',
} as const;

export function isGuideLocale(locale: string): locale is GuideLocale {
  return (GUIDE_LOCALES as readonly string[]).includes(locale);
}

export function guidePath(locale: string): string {
  const slug = isGuideLocale(locale) ? BOOTH_GUIDE.slugs[locale] : BOOTH_GUIDE.slugs.en;
  return `/guides/${slug}`;
}

export function guidePathnames(): Record<string, Record<Locale, string>> {
  return { [BOOTH_GUIDE.internalPath]: Object.fromEntries(locales.map((loc) => [loc, guidePath(loc)])) as Record<Locale, string> };
}
