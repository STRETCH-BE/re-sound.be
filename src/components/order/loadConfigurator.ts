/**
 * SERVER ONLY — imported by the product pages, never by a client component.
 *
 * The configurator receives the catalogue slice of one product page as plain
 * props. Before it crosses to the browser the fields the dialog never shows
 * are blanked: `notes` holds internal remarks from the price-list import,
 * `tech` the technical sheet rows, `sheetCategory`/`group` the workbook's own
 * grouping. Dropping them keeps them out of every product page's HTML and
 * trims the payload by roughly half.
 *
 * `locale` selects the currency view (src/lib/catalogue/load.ts): every
 * priceCents in the slice is in the locale's currency and `currency` names
 * it, so the dialog formats — and the buyer consents to — amounts in that
 * currency. Without a locale the slice is the euro view.
 */
import 'server-only';

import { getConfiguratorData, type ConfiguratorData } from '@/lib/catalogue/load';

export type { ConfiguratorData };

export async function loadConfigurator(websiteSlug: string, locale?: string): Promise<ConfiguratorData> {
  const data = await getConfiguratorData(websiteSlug, locale);
  return {
    priceList: data.priceList,
    currency: data.currency,
    categories: data.categories,
    products: data.products.map((p) => ({ ...p, tech: [] })),
    articles: data.articles.map((a) => ({ ...a, notes: null, sheetCategory: null, group: null })),
  };
}
