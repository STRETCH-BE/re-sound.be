/**
 * SERVER ONLY — imported by the product pages, never by a client component.
 *
 * The configurator receives the catalogue slice of one product page as plain
 * props. Before it crosses to the browser the fields the dialog never shows
 * are blanked: `notes` holds internal remarks from the price-list import,
 * `tech` the technical sheet rows, `sheetCategory`/`group` the workbook's own
 * grouping. Dropping them keeps them out of every product page's HTML and
 * trims the payload by roughly half.
 */
import 'server-only';

import { getConfiguratorData, type ConfiguratorData } from '@/lib/catalogue/load';

export type { ConfiguratorData };

export async function loadConfigurator(websiteSlug: string): Promise<ConfiguratorData> {
  const data = await getConfiguratorData(websiteSlug);
  return {
    priceList: data.priceList,
    categories: data.categories,
    products: data.products.map((p) => ({ ...p, tech: [] })),
    articles: data.articles.map((a) => ({ ...a, notes: null, sheetCategory: null, group: null })),
  };
}
