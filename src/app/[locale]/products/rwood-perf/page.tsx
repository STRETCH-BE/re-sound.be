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
import RWoodPerfProductPage from '@/components/sections/rwoodperfpage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqForResolved, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/rwood-perf';
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
// Q&A copy under `rwoodPerfPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["fscSource", "fireRating", "leadTime", "installMethod", "substrateCleanup"] as const;

// "Projects & Installations" gallery — same seven photos, in the same order,
// as the former client-rendered <section id="gallery">.
const GALLERY_IMAGES = [1, 2, 3, 4, 5, 6, 7].map(
  (i) => `/images/products/rwood-perf/gallery-${i}.webp`
);

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rwoodPerfTitle');
  const description = t('rwoodPerfDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=rwood-perf&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rwood-perf'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // The locale layout only provides nav/footer/cookies messages to client
  // components — narrow the catalog to what this page's client tree needs.
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'rwoodPerfPage',
    'manufacturer',
  ]);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('rwoodPerfTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('rwoodPerfDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'rwood-perf', cleanName);

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
    namespace: 'rwoodPerfPage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "rwood-perf", without duplicates
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
    (await faqForResolved(locale, 'rwood-perf')).map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['rwood-perf'],
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
      <RWoodPerfProductPage
        breadcrumbs={<Breadcrumbs items={crumbs} />}
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('rwoodPerfPage.specs.tag')}
            title={t('rwoodPerfPage.specs.title')}
          />
        }
        gallery={
          <ProductGallery
            images={galleryImages}
            tag={tPage('gallery.tag')}
            title={t('rwoodPerfPage.gallery.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['rwood-perf']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="rwood-perf" locale={locale} />}
      />
    </NextIntlClientProvider>
  );
}
