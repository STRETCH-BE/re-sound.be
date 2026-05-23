import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import RWoodGrooveProductPage from '@/components/sections/rwoodgroovepage';
import { buildAlternates } from '@/lib/seo';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rwoodGrooveTitle');
  const description = t('rwoodGrooveDescription');

  return {
    // Existing meta values already include "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: ['/images/products/rwood-groove/hero-rWood-Groove.webp'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rwood-groove'),
  };
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  return <RWoodGrooveProductPage />;
}
