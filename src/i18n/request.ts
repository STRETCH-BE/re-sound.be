import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

// Server-side configuration for next-intl.
// Loads translation messages based on the locale from the URL.
//
// Migrated to the next-intl 3.22+ API: instead of receiving `locale` as a
// parameter (deprecated), we read `await requestLocale` and validate it
// ourselves. The returned config object MUST include `locale` — this becomes
// required in next-intl 4.x.

export default getRequestConfig(async ({ requestLocale }) => {
  // Resolve the locale from the request, falling back to default if absent or invalid
  const requested = await requestLocale;
  const locale: Locale = locales.includes(requested as Locale)
    ? (requested as Locale)
    : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

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
