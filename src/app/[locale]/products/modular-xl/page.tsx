import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import ModularXLProductPage from '@/components/sections/ModularXLProductPage';
import JsonLd from '@/components/seo/JsonLd';
import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import {
  breadcrumbSchema,
  productSchema,
  faqPageSchema,
  type FaqEntry,
} from '@/lib/structured-data';

interface PageProps {
  params: { locale: string };
}

const FAQ_KEYS = ["leadTime", "scaleUp", "ceilingHeight", "capacity", "warranty"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('modularXlTitle');
  const description = t('modularXlDescription');

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?product=modular-xl&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/modular-xl'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('modularXlTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('modularXlDescription');

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  const tFaq = await getTranslations({
    locale,
    namespace: 'modularXlPage.faq',
  });
  const faqEntries: FaqEntry[] = FAQ_KEYS
    .map((key) => {
      try {
        return {
          question: tFaq(`questions.${key}.question`),
          answer: tFaq(`questions.${key}.answer`),
        };
      } catch {
        return null;
      }
    })
    .filter((e): e is FaqEntry => e !== null);

  return (
    <>
      <JsonLd
        data={productSchema({
          slug: 'modular-xl',
          locale,
          name: cleanName,
          description,
          image: '/images/products/modular-xl/hero.jpg',
          category: 'Acoustic meeting pods',
          countryOfOrigin: 'EU',
          material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
          specs: [
            { name: 'Base external dimensions', value: '2400 × 1800 × 2260', unitText: 'mm' },
            { name: 'Base net weight', value: '790', unitText: 'kg' },
            { name: 'Speech reduction', value: '25.9', unitText: 'dB(A)' },
            { name: 'Capacity', value: 'Up to 10 people' },
            { name: 'Modular extension', value: '+900 mm per segment' },
          ],
          offer: {
            priceCurrency: 'EUR',
          },
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Re-Sound', url: `/${locale}` },
          { name: tProducts('pageTitle'), url: `/${locale}/products` },
          { name: cleanName, url: `/${locale}/products/modular-xl` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <ModularXLProductPage />
    </>
  );
}
