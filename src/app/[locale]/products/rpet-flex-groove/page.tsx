import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import RPETFlexGrooveProductPage from '@/components/sections/rpetflexgroovepage';
import { buildAlternates } from '@/lib/seo';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rpetFlexGrooveTitle');
  const description = t('rpetFlexGrooveDescription');

  return {
    // Existing meta values already include "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: ['/images/products/rpet-flex-groove/rPET-Flex-hero.png'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rpet-flex-groove'),
  };
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  return <RPETFlexGrooveProductPage />;
}
