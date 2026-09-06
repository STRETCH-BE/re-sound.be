import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import BoothPriceGuide from '@/components/guides/BoothPriceGuide';
import { GUIDE_LOCALES, guidePath, isGuideLocale } from '@/data/guides';
import { ogAlternateLocales, ogLocale } from '@/lib/seo';

interface PageProps {
  params: { locale: string };
}

/**
 * Booth price guide (workbook Booth_Guide / Content_Calendar CC-008).
 * Localised external slug per locale via next-intl pathnames
 * (src/data/guides.ts); this English slug is the internal route. The page
 * exists in GUIDE_LOCALES only — every other locale gets the localised 404.
 */
export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  if (!isGuideLocale(locale)) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: 'boothGuide' });
  const title = t('title');
  const description = t('description');

  return {
    // Title already ends in "| Re-Sound" — bypass the layout template.
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?page=booth-guide&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    // hreflang only for the locales in which the guide exists.
    alternates: {
      canonical: `/${locale}${guidePath(locale)}`,
      languages: {
        ...Object.fromEntries(GUIDE_LOCALES.map((loc) => [loc, `/${loc}${guidePath(loc)}`])),
        'x-default': `/en${guidePath('en')}`,
      },
    },
  };
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  if (!isGuideLocale(locale)) notFound();
  return <BoothPriceGuide locale={locale} />;
}
