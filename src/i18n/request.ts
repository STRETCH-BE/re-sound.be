import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

// Server-side configuration for next-intl.
// Loads translation messages based on the locale from the URL.
//
// Migrated to the next-intl 3.22+ API: instead of receiving `locale` as a
// parameter (deprecated), we read `await requestLocale` and validate it
// ourselves. The returned config object MUST include `locale` — this becomes
// required in next-intl 4.x.
//
// EN-fallback merge: a deep merge of the requested locale on top of EN so
// that any namespace or key missing in a non-EN locale falls back to the EN
// string instead of rendering a literal namespace.key on the page. This is
// a defensive default for newly-added namespaces (e.g. when a product is
// added to messages/en.json before being translated into the other 9
// locales). For NL/FR/DE the existing translations remain authoritative
// because they take priority in the merge.

// Deep-merge `override` on top of `base`. Plain objects are merged
// recursively; arrays and primitives in `override` replace the base.
function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(override)) {
    if (
      v !== null &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      typeof out[k] === 'object' &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
      out[k] = deepMerge(out[k] as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Resolve the locale from the request, falling back to default if absent or invalid
  const requested = await requestLocale;
  const locale: Locale = locales.includes(requested as Locale)
    ? (requested as Locale)
    : defaultLocale;

  // Always load EN as the fallback base. For EN itself, this is a no-op merge.
  const baseMessages = (await import('../../messages/en.json')).default;
  const localeMessages = locale === 'en'
    ? baseMessages
    : (await import(`../../messages/${locale}.json`)).default;
  const messages = deepMerge(baseMessages, localeMessages);

  return {
    locale,
    messages,
    timeZone: 'Europe/Brussels',
    formats: {
      dateTime: {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long',
        },
      },
      number: {
        currency: { style: 'currency', currency: 'EUR' },
        percent: { style: 'percent', minimumFractionDigits: 0 },
      },
    },
    onError: (error) => {
      // In development, log missing translations
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation error:', error.message);
      }
    },
    getMessageFallback: ({ namespace, key }) => {
      // Return the key itself as fallback (useful for debugging missing strings)
      return `${namespace}.${key}`;
    },
  };
});
