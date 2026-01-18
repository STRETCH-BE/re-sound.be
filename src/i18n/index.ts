// Re-export all i18n utilities for easy importing
// Usage: import { locales, Link, usePathname } from '@/i18n';

// Configuration
export {
  locales,
  defaultLocale,
  localeNames,
  localeFlags,
  localeFullCodes,
  rtlLocales,
  isValidLocale,
  getLocaleFromPath,
  removeLocaleFromPath,
  type Locale,
} from './config';

// Navigation utilities
export {
  Link,
  redirect,
  usePathname,
  useRouter,
  generateLocalizedPaths,
  getAlternateLinks,
  getCanonicalUrl,
  type LocaleParams,
} from './navigation';
