// ============================================================================
// i18n — SINGLE SOURCE OF TRUTH
//
// MULTI-DOMAIN SETUP: each locale is served from its own domain (one locale
// per domain), with clean, UNPREFIXED urls in production:
//
//   stretchplafond.be/products   → locale "be" (Dutch, Belgium)
//   stretchplafond.nl/products   → locale "nl" (Dutch, Netherlands)
//   stretchplafond.com/products  → locale "en" (English / international,
//                                   also the hreflang x-default)
//
// On hosts that are NOT in the domain map (localhost, *.vercel.app previews)
// every locale stays reachable via a path prefix: /be, /fr, /pl, ... and the
// default locale (en) is unprefixed. This keeps dev & preview fully working.
//
// NOTE ON "be": it is used here as a MARKET code (Belgium — Dutch content),
// not an ISO 639-1 language code (which would be Belarusian). The correct
// BCP-47 code nl-BE is mapped below and is what ends up in <html lang>,
// hreflang and og:locale — so search engines always see valid codes.
//
// Everything else — middleware, navigation, sitemap hreflang, <html lang>,
// canonical URLs, OG alternateLocale, robots.txt — derives from this file.
// To change a domain, edit `localeDomains` below. Nothing else.
// ============================================================================
import { defineRouting } from 'next-intl/routing';

export const locales = [
  'en', // English — international / x-default
  'be', // Dutch — Belgium
  'nl', // Dutch — Netherlands
  'fr', // French — France
  'pl', // Polish — Poland
  'de', // German — Germany
  'es', // Spanish — Spain
  'pt', // Portuguese — Portugal
  'da', // Danish — Denmark
  'sv', // Swedish — Sweden
  'no', // Norwegian (Bokmål) — Norway
  'is', // Icelandic — Iceland
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// ---------------------------------------------------------------------------
// DOMAIN MAP — the only place production domains are defined.
// Override any entry per-deploy with NEXT_PUBLIC_DOMAIN_<LOCALE> if needed.
// ---------------------------------------------------------------------------
export const localeDomains: Record<Locale, string> = {
  en: process.env.NEXT_PUBLIC_DOMAIN_EN || 'stretchplafond.com',
  be: process.env.NEXT_PUBLIC_DOMAIN_BE || 'stretchplafond.be',
  nl: process.env.NEXT_PUBLIC_DOMAIN_NL || 'stretchplafond.nl',
  fr: process.env.NEXT_PUBLIC_DOMAIN_FR || 'stretchplafond.fr',
  pl: process.env.NEXT_PUBLIC_DOMAIN_PL || 'stretchplafond.pl',
  de: process.env.NEXT_PUBLIC_DOMAIN_DE || 'stretchplafond.de',
  es: process.env.NEXT_PUBLIC_DOMAIN_ES || 'stretchplafond.es',
  pt: process.env.NEXT_PUBLIC_DOMAIN_PT || 'stretchplafond.pt',
  da: process.env.NEXT_PUBLIC_DOMAIN_DA || 'stretchplafond.dk',
  sv: process.env.NEXT_PUBLIC_DOMAIN_SV || 'stretchplafond.se',
  no: process.env.NEXT_PUBLIC_DOMAIN_NO || 'stretchplafond.no',
  is: process.env.NEXT_PUBLIC_DOMAIN_IS || 'stretchplafond.is',
};

/** Absolute https origin for a locale, e.g. "https://stretchplafond.nl". */
export function originForLocale(locale: Locale): string {
  return `https://${localeDomains[locale]}`;
}

/** Locale served by a given host (case-insensitive, ignores port & www.). */
export function localeForHost(host: string | null | undefined): Locale | null {
  if (!host) return null;
  const h = host.toLowerCase().split(':')[0].replace(/^www\./, '');
  const hit = (Object.entries(localeDomains) as [Locale, string][]).find(
    ([, d]) => d.toLowerCase() === h,
  );
  return hit ? hit[0] : null;
}

// next-intl routing definition (consumed by middleware + navigation helpers).
// One locale per domain → production URLs carry no locale prefix at all;
// unknown hosts (dev/preview) fall back to prefixed routing ("as-needed").
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  domains: locales.map((locale) => ({
    domain: localeDomains[locale],
    defaultLocale: locale,
    locales: [locale],
  })),
});

// Native-language display names (shown in the language switcher).
export const localeNames: Record<Locale, string> = {
  en: 'English',
  be: 'Nederlands (België)',
  nl: 'Nederlands',
  fr: 'Français',
  pl: 'Polski',
  de: 'Deutsch',
  es: 'Español',
  pt: 'Português',
  da: 'Dansk',
  sv: 'Svenska',
  no: 'Norsk',
  is: 'Íslenska',
};

// Emoji flags for the switcher.
export const localeFlags: Record<Locale, string> = {
  en: '🌐',
  be: '🇧🇪',
  nl: '🇳🇱',
  fr: '🇫🇷',
  pl: '🇵🇱',
  de: '🇩🇪',
  es: '🇪🇸',
  pt: '🇵🇹',
  da: '🇩🇰',
  sv: '🇸🇪',
  no: '🇳🇴',
  is: '🇮🇸',
};

// BCP 47 codes — used for <html lang>, OG locale, hreflang, formatting.
// These are the ONLY codes exposed to browsers/search engines.
export const localeFullCodes: Record<Locale, string> = {
  en: 'en',      // international English (x-default lives on this domain)
  be: 'nl-BE',
  nl: 'nl-NL',
  fr: 'fr-FR',
  pl: 'pl-PL',
  de: 'de-DE',
  es: 'es-ES',
  pt: 'pt-PT',
  da: 'da-DK',
  sv: 'sv-SE',
  no: 'nb-NO',
  is: 'is-IS',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Pull the leading locale segment from a pathname, or the default locale. */
export function getLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg && isValidLocale(seg) ? seg : defaultLocale;
}

/** Strip the leading locale segment, returning the remaining path (always starts with "/"). */
export function removeLocaleFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] && isValidLocale(parts[0])) parts.shift();
  return '/' + parts.join('/');
}
