import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import OtherModels from '@/components/product/OtherModels';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import ProductSpecs from '@/components/product/ProductSpecs';
import RpetFlexGrooveProductPage from '@/components/sections/rpetflexgroovepage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import specs from '@/data/specs/rpet-flex-groove';
import { pickMessages } from '@/lib/i18n-messages';
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
// Q&A copy under `rpetFlexGroovePage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["oekoTex", "fireRating", "processability", "colorRange", "leadTime"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rpetFlexGrooveTitle');
  const description = t('rpetFlexGrooveDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=rpet-flex-groove&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
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

  // The locale layout only provides nav/footer/cookies messages to client
  // components — narrow the catalog to what this page's client tree needs.
  // (No gated documents on this product, so the lead modal — and its
  // `leadModal` namespace — is no longer in the client tree.)
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'rpetFlexGroovePage',
    'manufacturer',
  ]);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('rpetFlexGrooveTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('rpetFlexGrooveDescription');

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  // Root + productPage translators for the server-rendered sections.
  const t = await getTranslations({ locale });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'rpetFlexGroovePage.faq',
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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd
        data={productSchema({
          slug: 'rpet-flex-groove',
          locale,
          name: cleanName,
          description,
          image: '/images/products/rpet-flex-groove/rPET-Flex.jpg',
          category: 'Acoustic PET panels',
          // ISO country from product data; omitted while the country is a placeholder
          countryOfOrigin: PRODUCTS['rpet-flex-groove'].madeIn ?? undefined,
          material: '100% recycled PET',
          specs: [
            { name: 'Sound absorption (αw)', value: '0.80', unitText: 'ISO 11654' },
            { name: 'NRC', value: '0.80', unitText: 'ASTM C423' },
            { name: 'Fire classification', value: 'B-s1,d0' },
            { name: 'Recycled content', value: '100', unitText: '%' },
            { name: 'Bendable', value: 'Yes' },
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
          { name: cleanName, url: `/${locale}/products/rpet-flex-groove` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <RpetFlexGrooveProductPage
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('rpetFlexGroovePage.specs.tag')}
            title={t('rpetFlexGroovePage.specs.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['rpet-flex-groove']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="rpet-flex-groove" />}
      />
    </NextIntlClientProvider>
  );
}
