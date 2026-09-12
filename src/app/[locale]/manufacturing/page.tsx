import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import ManufacturingPage from '@/components/manufacturing/ManufacturingPage';
import { manufacturingPath } from '@/data/manufacturing';
import { isSeoLocale } from '@/i18n/config';
import { buildAlternatesFor, ogAlternateLocales, ogLocale } from '@/lib/seo';

import '@/styles/manufacturing.css';

interface PageProps {
  params: { locale: string };
}

/**
 * Manufacturer page (lead sprint §7): the two plants, which line is made
 * where, certifications. Localised external slug per locale via next-intl
 * pathnames (src/data/manufacturing.ts); this English slug is the internal
 * route. Static params come from the locale layout; the page exists in the
 * six SEO locales only — every other locale gets the localised 404, exactly
 * like the booth price guide. No catalogue data, so no ISR interval.
 */
export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  if (!isSeoLocale(locale)) return { robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: 'manufacturing' });
  const title = t('title');
  const description = t('description');

  return {
    // Title already ends in "| Re-Sound" — bypass the layout template.
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?page=manufacturing&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
    // Localised slugs: canonical + hreflang (six SEO locales + x-default) follow the per-locale path.
    alternates: buildAlternatesFor(locale, manufacturingPath),
  };
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  if (!isSeoLocale(locale)) notFound();
  return <ManufacturingPage locale={locale} />;
}
