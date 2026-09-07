import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import Breadcrumbs from '@/components/product/Breadcrumbs';
import OtherModels from '@/components/product/OtherModels';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecs from '@/components/product/ProductSpecs';
import { crumbsToSchema, productCrumbs } from '@/components/product/productCrumbs';
import DivideProductPage from '@/components/sections/DivideProductPage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqFor, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/divide';
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
// Q&A copy under `dividePage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["leadTime", "magneticConnection", "dualSidedAbsorption", "footStability", "sizeCustomization"] as const;

// Gallery ("In Action"). Dedicated project photos don't exist yet, so — as
// the old client section did — the grid showcases all six colourway heroes
// (only the selected one is visible in the hero).
const GALLERY_IMAGES = [
  { src: '/images/products/divide/hero-denim.webp', name: 'Denim' },
  { src: '/images/products/divide/hero-antracite.webp', name: 'Antracite' },
  { src: '/images/products/divide/hero-silver.webp', name: 'Silver' },
  { src: '/images/products/divide/hero-sky.webp', name: 'Sky' },
  { src: '/images/products/divide/hero-mint.webp', name: 'Mint' },
  { src: '/images/products/divide/hero-taupe.webp', name: 'Taupe' },
];

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('divideTitle');
  const description = t('divideDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=divide&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/divide'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // The locale layout only provides nav/footer/cookies messages to client
  // components — narrow the catalog to what this page's client tree needs.
  const messages = pickMessages(await getMessages(), [
    'dividePage',
    'productPage',
    'manufacturer',
  ]);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('divideTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('divideDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'divide', cleanName);

  // Root + productPage translators for the server-rendered sections.
  const t = await getTranslations({ locale });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'dividePage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "divide", without duplicates
  const faqEntries: FaqEntry[] = mergeFaqEntries(
    FAQ_KEYS
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
    .filter((e): e is FaqEntry => e !== null),
    faqFor(locale, 'divide').map((f) => ({ question: f.question, answer: f.answer }))
  );

  const galleryImages = GALLERY_IMAGES.map((img, i) => ({
    src: img.src,
    alt: t('dividePage.gallery.altPattern', { product: cleanName, colour: img.name, n: i + 1 }),
  }));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['divide'],
          locale,
          name: cleanName,
          description,
          category: tData('category.textile'),
        })}
      />
      <JsonLd
        data={breadcrumbSchema(crumbsToSchema(locale, crumbs))}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <DivideProductPage
        breadcrumbs={<Breadcrumbs items={crumbs} />}
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('dividePage.specs.tag')}
            title={t('dividePage.specs.title')}
          />
        }
        gallery={
          <ProductGallery
            images={galleryImages}
            tag={tPage('gallery.tag')}
            title={t('dividePage.gallery.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['divide']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="divide" locale={locale} />}
      />
    </NextIntlClientProvider>
  );
}
