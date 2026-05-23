import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import RPETFlexGrooveProductPage from '@/components/sections/rpetflexgroovepage';
import JsonLd from '@/components/seo/JsonLd';
import { buildAlternates } from '@/lib/seo';
import { breadcrumbSchema, productSchema } from '@/lib/structured-data';

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

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly
  const t = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = t('rpetFlexGrooveTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = t('rpetFlexGrooveDescription');
  const tProducts = await getTranslations({ locale, namespace: 'products' });

  return (
    <>
      <JsonLd
        data={productSchema({
          slug: 'rpet-flex-groove',
          name: cleanName,
          description,
          image: '/images/products/rpet-flex-groove/rPET-Flex-hero.png',
          category: 'Acoustic recycled-PET panels', countryOfOrigin: 'BE',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Re-Sound', url: `/${locale}` },
          { name: tProducts('pageTitle'), url: `/${locale}/products` },
          { name: cleanName, url: `/${locale}/products/rpet-flex-groove` },
        ])}
      />
      <RPETFlexGrooveProductPage />
    </>
  );
}
