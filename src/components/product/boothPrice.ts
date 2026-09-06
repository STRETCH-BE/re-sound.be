import { guidePath, isGuideLocale } from '@/data/guides';
import { PRODUCTS } from '@/data/products';
import { localeFullCodes, type Locale } from '@/i18n/config';

/**
 * "From price" KPI for a booth hero: the confirmed excl.-VAT price from
 * src/data/products.ts, formatted for the locale, linking to the price guide
 * where the guide exists. Returns undefined while a price is unconfirmed.
 */
export function boothFromPrice(locale: string, slug: string, label: string) {
  const product = PRODUCTS[slug];
  if (!product || product.fromPrice === null) return undefined;
  const value = new Intl.NumberFormat(localeFullCodes[locale as Locale] ?? 'en-BE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(product.fromPrice);
  return { value, label, href: isGuideLocale(locale) ? guidePath(locale) : undefined };
}
