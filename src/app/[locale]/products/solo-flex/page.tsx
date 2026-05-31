import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import SoloFlexProductPage from '@/components/sections/SoloFlexProductPage';
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

// Localised FAQ keys for this product. The keys are stable across locales;
// each translation file under `messages/{locale}.json` provides the actual
// Q&A copy under `soloFlexPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["leadTime", "noiseReduction", "installation", "ventilation", "warranty"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('soloFlexTitle');
  const description = t('soloFlexDescription');

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?product=solo-flex&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/solo-flex'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('soloFlexTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*STRETCH\s*$/, '');
  const description = tMeta('soloFlexDescription');

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  const tFaq = await getTranslations({
    locale,
    namespace: 'soloFlexPage.faq',
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
          slug: 'solo-flex',
          locale,
          name: cleanName,
          description,
          image: '/images/products/solo-flex/hero.jpg',
          category: 'Acoustic phone booths',
          countryOfOrigin: 'EU',
          material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
          specs: [
            { name: 'External dimensions', value: '1020 × 1020 × 2260', unitText: 'mm' },
            { name: 'Net weight', value: '280', unitText: 'kg' },
            { name: 'Ventilation rate', value: '4.6', unitText: 'm³/min' },
            { name: 'Capacity', value: '1 person' },
            { name: 'Warranty (structural)', value: '5', unitText: 'years' },
          ],
          offer: {
            priceCurrency: 'EUR',
          },
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'STRETCH', url: `/${locale}` },
          { name: tProducts('pageTitle'), url: `/${locale}/products` },
          { name: cleanName, url: `/${locale}/products/solo-flex` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <SoloFlexProductPage />
    </>
  );
}
