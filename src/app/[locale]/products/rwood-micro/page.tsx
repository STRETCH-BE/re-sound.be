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
import RWoodMicroProductPage from '@/components/sections/rwoodmicropage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import specs from '@/data/specs/rwood-micro';
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
// Q&A copy under `rwoodMicroPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["fscSource", "fireRating", "leadTime", "installMethod", "substrateCleanup"] as const;

// "Projects & Installations" gallery — same five photos, in the same order,
// as the former client-rendered <section id="gallery">.
const GALLERY_IMAGES = [1, 2, 3, 4, 5].map(
  (i) => `/images/products/rwood-micro/gallery-${i}.webp`
);

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rwoodMicroTitle');
  const description = t('rwoodMicroDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=rwood-micro&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
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

  // The locale layout only provides nav/footer/cookies messages to client
  // components — narrow the catalog to what this page's client tree needs.
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'rwoodMicroPage',
    'manufacturer',
  ]);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('rwoodMicroTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('rwoodMicroDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'rwood-micro', cleanName);

  // Root + productPage translators for the server-rendered sections.
  const t = await getTranslations({ locale });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  const galleryImages = GALLERY_IMAGES.map((src, i) => ({
    src,
    alt: tPage('gallery.altPattern', { product: cleanName, n: i + 1 }),
  }));

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'rwoodMicroPage.faq',
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
          product: PRODUCTS['rwood-micro'],
          locale,
          name: cleanName,
          description,
          category: tData('category.rwood'),
        })}
      />
      <JsonLd
        data={breadcrumbSchema(crumbsToSchema(locale, crumbs))}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <RWoodMicroProductPage
        breadcrumbs={<Breadcrumbs items={crumbs} variant="overlay" />}
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('rwoodMicroPage.specs.tag')}
            title={t('rwoodMicroPage.specs.title')}
          />
        }
        gallery={
          <ProductGallery
            images={galleryImages}
            tag={t('rwoodMicroPage.gallery.tag')}
            title={t('rwoodMicroPage.gallery.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['rwood-micro']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="rwood-micro" locale={locale} />}
      />
    </NextIntlClientProvider>
  );
}
