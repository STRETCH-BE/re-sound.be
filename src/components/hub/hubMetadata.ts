import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { HUBS, hubPath, type HubId } from '@/data/hubs';
import { buildAlternatesFor, ogAlternateLocales, ogLocale } from '@/lib/seo';

/** generateMetadata() body shared by the three hub routes. */
export async function hubMetadata(hubId: HubId, locale: string): Promise<Metadata> {
  const hub = HUBS[hubId];
  const t = await getTranslations({ locale, namespace: hub.namespace });
  const title = t('title');
  const description = t('description');

  return {
    // Title already ends in "| Re-Sound" — bypass the layout template.
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?page=hub-${hubId}&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    // Localised slugs: canonical + hreflang follow the per-locale path.
    alternates: buildAlternatesFor(locale, (loc) => hubPath(hub, loc)),
  };
}
