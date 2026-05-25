import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import RpetGrooveProductPage from '@/components/sections/rpetgroovepage';
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
// Q&A copy under `rpetGroovePage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["oekoTex", "fireRating", "processability", "colorRange", "leadTime"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rpetGrooveTitle');
  const description = t('rpetGrooveDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og/rpet-groove?locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
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

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('rpetGrooveTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('rpetGrooveDescription');

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'rpetGroovePage.faq',
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
          slug: 'rpet-groove',
          locale,
          name: cleanName,
          description,
          image: '/images/products/rpet-groove/hero-rPET-Groove.webp',
          category: 'Acoustic PET panels',
          countryOfOrigin: 'BE',
          material: '100% recycled PET',
          specs: [
            { name: 'Sound absorption (αw)', value: '0.85', unitText: 'ISO 11654' },
            { name: 'NRC', value: '0.85', unitText: 'ASTM C423' },
            { name: 'Fire classification', value: 'B-s1,d0' },
            { name: 'Recycled content', value: '100', unitText: '%' },
            { name: 'Available thicknesses', value: '12 / 24 / 36', unitText: 'mm' },
            { name: 'Color options', value: '12' },
            { name: 'Certification', value: 'OEKO-TEX®' },
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
          { name: cleanName, url: `/${locale}/products/rpet-groove` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <RpetGrooveProductPage />
    </>
  );
}
