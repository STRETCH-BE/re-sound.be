import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import RWoodMicroProductPage from '@/components/sections/rwoodmicropage';
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

  const title = t('rwoodMicroTitle');
  const description = t('rwoodMicroDescription');

  return {
    // Existing meta values already include "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: ['/images/products/rwood-micro/hero-rwood-micro.webp'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rwood-micro'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly
  const t = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = t('rwoodMicroTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = t('rwoodMicroDescription');
  const tProducts = await getTranslations({ locale, namespace: 'products' });

  return (
    <>
      <JsonLd
        data={productSchema({
          slug: 'rwood-micro',
          name: cleanName,
          description,
          image: '/images/products/rwood-micro/hero-rwood-micro.webp',
          category: 'Acoustic wood panels',
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Re-Sound', url: `/${locale}` },
          { name: tProducts('pageTitle'), url: `/${locale}/products` },
          { name: cleanName, url: `/${locale}/products/rwood-micro` },
        ])}
      />
      <RWoodMicroProductPage />
    </>
  );
}
