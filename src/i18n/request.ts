import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from './config';

// This is the server-side configuration for next-intl
// It loads the appropriate translation messages based on the locale

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming locale is valid
  const validLocale = locales.includes(locale as Locale) ? locale : defaultLocale;

  // Load messages for the requested locale
  // Messages are stored in /messages/{locale}.json
  const messages = await import(`../../messages/${validLocale}.json`).then(
    (module) => module.default
  );

  return {
    messages,
    // Optionally configure time zone for date formatting
    timeZone: 'Europe/Brussels',
    // Configure how dates, numbers, etc. are formatted
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          weekday: 'long',
        },
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'EUR',
        },
        percent: {
          style: 'percent',
          minimumFractionDigits: 0,
        },
      },
    },
    // Default translation values (can be overridden per message)
    defaultTranslationValues: {
      // Add common values that appear in many translations
      brandName: 'Re-Sound',
      year: new Date().getFullYear().toString(),
    },
    // Handling of missing translations
    onError: (error) => {
      // In development, log missing translations
      if (process.env.NODE_ENV === 'development') {
        console.warn('Translation error:', error.message);
      }
    },
    // Fallback for missing messages
    getMessageFallback: ({ namespace, key }) => {
      // Return the key itself as fallback (useful for debugging)
      return `${namespace}.${key}`;
    },
  };
});
