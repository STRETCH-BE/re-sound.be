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
import InteriorProductPage from '@/components/sections/InteriorProductPage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqFor, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/interior';
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
// Q&A copy under `interiorPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["leadTime", "washableCover", "absorptionRating", "breeamLeed", "installMethod"] as const;

// "Projects & Installations" grid — same six images the client component
// used to render inline, now a static server-rendered <ProductGallery>.
const GALLERY_IMAGES = [1, 2, 3, 4, 5, 6].map((i) => `/images/products/interior/gallery-${i}.jpg`);

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('interiorTitle');
  const description = t('interiorDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=interior&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/interior'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('interiorTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('interiorDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'interior', cleanName);

  // Root + productPage translators for the server-rendered section slots.
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
    namespace: 'interiorPage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "interior", without duplicates
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
    faqFor(locale, 'interior').map((f) => ({ question: f.question, answer: f.answer }))
  );

  // Only the namespaces the client components in this tree actually use —
  // serializing the full catalog would bloat every page's HTML.
  const messages = pickMessages(await getMessages(), [
    'interiorPage',
    'productPage',
    'manufacturer',
  ]);

  return (
    <>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['interior'],
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
      <NextIntlClientProvider locale={locale} messages={messages}>
        <InteriorProductPage
          breadcrumbs={<Breadcrumbs items={crumbs} variant="overlay" />}
          specs={
            <ProductSpecs
              cards={specs}
              tag={t('interiorPage.specs.tag')}
              title={t('interiorPage.specs.title')}
            />
          }
          gallery={
            <ProductGallery
              images={galleryImages}
              tag={tPage('gallery.tag')}
              title={t('interiorPage.gallery.title')}
            />
          }
          downloads={
            <ProductDownloads
              product={PRODUCTS['interior']}
              tag={tPage('downloads.tag')}
              title={tPage('downloads.title')}
            />
          }
          faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
          otherModels={<OtherModels slug="interior" locale={locale} />}
        />
      </NextIntlClientProvider>
    </>
  );
}
