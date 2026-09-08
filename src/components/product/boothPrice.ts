import { guidePath, isGuideLocale } from '@/data/guides';
import { formatPrice } from '@/lib/catalogue/format';
import { getFromPriceCents } from '@/lib/catalogue/load';

/**
 * "From price" KPI for a booth hero: the lowest base price of the models sold
 * from the page, read from the catalogue (database, else snapshot), formatted
 * for the locale, linking to the price guide where the guide exists. Returns
 * undefined while the page has no priced model.
 *
 * Server only (reads the catalogue); the value is passed to the client hero
 * as a plain object.
 */
export async function boothFromPrice(locale: string, slug: string, label: string) {
  const cents = await getFromPriceCents(slug);
  if (cents === null) return undefined;
  return { value: formatPrice(cents, locale), label, href: isGuideLocale(locale) ? guidePath(locale) : undefined };
}

/** The same "from" amount as text only ("€ 387"), for the textile heroes. */
export async function fromPriceText(locale: string, slug: string): Promise<string | undefined> {
  const cents = await getFromPriceCents(slug);
  return cents === null ? undefined : formatPrice(cents, locale);
}
