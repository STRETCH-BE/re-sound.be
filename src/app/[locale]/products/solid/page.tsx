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
import SolidProductPage from '@/components/sections/SolidProductPage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqForResolved, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/solid';
import { pickMessages } from '@/lib/i18n-messages';
import { fromPriceText } from '@/components/product/boothPrice';
import { getFromPriceCents } from '@/lib/catalogue/load';
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

/**
 * ISR: the "from" price comes from the catalogue (database), so a change
 * reaches this page within the hour without a redeploy. Solid has no
 * catalogue product yet, so the hero shows no price until one exists.
 */
export const revalidate = 3600;

// Localised FAQ keys for this product. The keys are stable across locales;
// each translation file under `messages/{locale}.json` provides the actual
// Q&A copy under `solidPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["leadTime", "hookInstall", "sizeCustomization", "weightPerPanel", "absorptionRating"] as const;

// "Projects & Installations" gallery. gallery-6.jpg does not exist on disk;
// the old client section padded the grid by repeating gallery-1.jpg, which
// would now collide on the image key, so the grid shows the five real photos.
const GALLERY_IMAGES = [
  '/images/products/solid/gallery-1.jpg',
  '/images/products/solid/gallery-2.jpg',
  '/images/products/solid/gallery-3.jpg',
  '/images/products/solid/gallery-4.jpg',
  '/images/products/solid/gallery-5.jpg',
];

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('solidTitle');
  const description = t('solidDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=solid&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/solid'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('solidTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('solidDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'solid', cleanName);
  // "From" price from the catalogue (database, else snapshot): hero + JSON-LD
  // offer. Undefined/null while no catalogue product carries websiteSlug 'solid'.
  const priceFrom = await fromPriceText(locale, 'solid');
  const priceCents = await getFromPriceCents('solid');

  // Root + productPage translators for the server-rendered sections.
  const t = await getTranslations({ locale });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'solidPage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "solid", without duplicates
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
    (await faqForResolved(locale, 'solid')).map((f) => ({ question: f.question, answer: f.answer }))
  );

  // Only the namespaces the client components in this tree actually use —
  // serializing the full catalog would bloat every page's HTML.
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'solidPage',
    'manufacturer',
  ]);

  const galleryImages = GALLERY_IMAGES.map((src, i) => ({
    src,
    alt: tPage('gallery.altPattern', { product: cleanName, n: i + 1 }),
  }));

  return (
    <>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['solid'],
          locale,
          name: cleanName,
          description,
          category: tData('category.textile'),
          priceCents,
        })}
      />
      <JsonLd
        data={breadcrumbSchema(crumbsToSchema(locale, crumbs))}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SolidProductPage
          priceFrom={priceFrom}
          breadcrumbs={<Breadcrumbs items={crumbs} />}
          specs={
            <ProductSpecs
              cards={specs}
              tag={t('solidPage.specs.tag')}
              title={t('solidPage.specs.title')}
            />
          }
          gallery={
            <ProductGallery
              images={galleryImages}
              tag={tPage('gallery.tag')}
              title={t('solidPage.gallery.title')}
            />
          }
          downloads={
            <ProductDownloads
              product={PRODUCTS['solid']}
              tag={tPage('downloads.tag')}
              title={tPage('downloads.title')}
            />
          }
          faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
          otherModels={<OtherModels slug="solid" locale={locale} />}
        />
      </NextIntlClientProvider>
    </>
  );
}
