import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import RPETGrooveProductPage from '@/components/sections/rpetgroovepage';
import { buildAlternates } from '@/lib/seo';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rpetGrooveTitle');
  const description = t('rpetGrooveDescription');

  return {
    // Existing meta values already include "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: ['/images/products/rpet-groove/hero-rpet-groove.webp'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rpet-groove'),
  };
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  return <RPETGrooveProductPage />;
}
