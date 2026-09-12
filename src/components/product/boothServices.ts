import { formatPrice } from '@/lib/catalogue/format';
import type { ConfiguratorData } from '@/lib/catalogue/load';
import {
  INSTALLATION_CATEGORY,
  INSTALLATION_EXTENSION_CATEGORY,
  TRANSPORT_CATEGORY,
  transportArticleForCountry,
} from '@/lib/catalogue/select';
import type { CatalogueArticle } from '@/lib/catalogue/types';

/**
 * Transport and installation figures a booth page prints in its CTA note,
 * read from the catalogue slice the page already loads for the order dialog
 * (loadConfigurator) and formatted for the locale on the server, like the
 * from-price KPI (./boothPrice.ts).
 *
 * A page can sell several catalogue models (Duo: duo-work and duo-flex); each
 * figure is the lowest one among them, the same "from" reading as the KPI.
 * `null` in a formatted field means the article exists but carries no price
 * (on request); `hasTransport` false means no model of the page has a
 * transport article at all (the note then omits transport).
 */
export interface BoothServicePrices {
  /** Any model of the page has a transport article (WEB-…-TRANSPORT-EU/-XX). */
  hasTransport: boolean;
  /** Transport within mainland Europe (…-TRANSPORT-EU), formatted; null = on request. */
  transport: string | null;
  /** Installation by Re-Sound (category installation), formatted; null = on request. */
  installation: string | null;
  /** Installation of an extra element (category installation_extension, per_extension); null when the page has none. */
  perExtraElement: string | null;
}

const lowest = (articles: CatalogueArticle[]): number | null =>
  articles.reduce<number | null>(
    (min, a) => (a.priceCents !== null && (min === null || a.priceCents < min) ? a.priceCents : min),
    null,
  );

export function boothServicePrices(locale: string, slice: Pick<ConfiguratorData, 'products' | 'articles'>): BoothServicePrices {
  const fmt = (cents: number | null) => (cents === null ? null : formatPrice(cents, locale));
  const products = slice.products.filter((p) => p.active);
  const ids = new Set(products.map((p) => p.id));
  const own = slice.articles.filter((a) => a.active && ids.has(a.productId));

  // Mainland rate: the transport article for "no country" is the -EU one (the order form opens on Belgium).
  const transports = products
    .map((p) => transportArticleForCountry(p, slice, null))
    .filter((a): a is CatalogueArticle => a !== null);
  const hasTransport = own.some((a) => a.categoryKey === TRANSPORT_CATEGORY);
  const installations = own.filter((a) => a.categoryKey === INSTALLATION_CATEGORY);
  const extensions = own.filter((a) => a.categoryKey === INSTALLATION_EXTENSION_CATEGORY && a.perExtension);

  return {
    hasTransport,
    transport: fmt(lowest(transports)),
    installation: fmt(lowest(installations)),
    perExtraElement: extensions.length > 0 ? fmt(lowest(extensions)) : null,
  };
}
