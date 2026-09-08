/**
 * Site-locale helpers around the pure formatter in ./pricing.ts: pages know
 * the routing locale ('nl'), Intl wants a BCP 47 tag ('nl-BE').
 */
import { localeFullCodes, type Locale } from '@/i18n/config';

import { formatCents } from './pricing';

/** BCP 47 tag for a routing locale; unknown locales format as en-BE. */
export function localeTag(locale: string): string {
  return localeFullCodes[locale as Locale] ?? 'en-BE';
}

/** Integer cents → currency text for a routing locale ("€ 4.118,75" in nl). */
export function formatPrice(cents: number, locale: string): string {
  return formatCents(cents, localeTag(locale));
}
