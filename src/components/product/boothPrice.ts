import { guidePath, isGuideLocale } from '@/data/guides';
import { formatPrice } from '@/lib/catalogue/format';
import { getCatalogue, getFromPriceCents } from '@/lib/catalogue/load';
import type { CurrencyCode } from '@/lib/catalogue/types';

/**
 * The page's "from" price in the locale's currency — the catalogue view for
 * the locale (src/lib/catalogue/load.ts: euros, or the locale's own currency
 * once it is active) — with the currency it is expressed in. `cents` is null
 * while the page has no priced model.
 */
async function fromPriceIn(locale: string, slug: string): Promise<{ cents: number | null; currency: CurrencyCode }> {
  const [cents, catalogue] = await Promise.all([getFromPriceCents(slug, locale), getCatalogue(locale)]);
  return { cents, currency: catalogue.currency };
}

/**
 * "From price" KPI for a booth hero: the lowest base price of the models sold
 * from the page, read from the catalogue (database, else snapshot) in the
 * locale's currency, formatted for the locale, linking to the price guide
 * where the guide exists. Returns undefined while the page has no priced
 * model.
 *
 * Server only (reads the catalogue); the value is passed to the client hero
 * as a plain object.
 */
export async function boothFromPrice(locale: string, slug: string, label: string) {
  const { cents, currency } = await fromPriceIn(locale, slug);
  if (cents === null) return undefined;
  return { value: formatPrice(cents, locale, currency), label, href: isGuideLocale(locale) ? guidePath(locale) : undefined };
}

/** The same "from" amount as text only ("€ 387"), for the textile heroes. */
export async function fromPriceText(locale: string, slug: string): Promise<string | undefined> {
  const { cents, currency } = await fromPriceIn(locale, slug);
  return cents === null ? undefined : formatPrice(cents, locale, currency);
}
