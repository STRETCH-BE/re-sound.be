import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import OtherModels from '@/components/product/OtherModels';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecs from '@/components/product/ProductSpecs';
import RWoodVeneerProductPage from '@/components/sections/rwoodveneerpage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import specs from '@/data/specs/rwood-veneer';
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
// Q&A copy under `rwoodVeneerPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["fscSource", "fireRating", "leadTime", "installMethod", "substrateCleanup"] as const;

// "Projects & Interiors" gallery — same nine photos, in the same order,
// as the former client-rendered <section id="gallery">.
const GALLERY_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  (i) => `/images/products/rwood-veneer/gallery-${i}.webp`
);

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rwoodVeneerTitle');
  const description = t('rwoodVeneerDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=rwood-veneer&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rwood-veneer'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // The locale layout only provides nav/footer/cookies messages to client
  // components — narrow the catalog to what this page's client tree needs.
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'rwoodVeneerPage',
    'manufacturer',
  ]);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('rwoodVeneerTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('rwoodVeneerDescription');

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  // Root + productPage translators for the server-rendered sections.
  const t = await getTranslations({ locale });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  const galleryImages = GALLERY_IMAGES.map((src, i) => ({
    src,
    alt: `rWood Panel prefinished wood veneer panels — project installation ${i + 1}`,
  }));

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'rwoodVeneerPage.faq',
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
          slug: 'rwood-veneer',
          locale,
          name: cleanName,
          description,
          image: '/images/products/rwood-veneer/hero-rwood-veneer.webp',
          category: 'Acoustic wood panels',
          // ISO country from product data; omitted while the country is a placeholder
          countryOfOrigin: PRODUCTS['rwood-veneer'].madeIn ?? undefined,
          material: 'FSC-certified wood veneer',
          specs: [
            { name: 'Fire classification', value: 'B-s2,d0' },
            { name: 'Recycled content', value: '40', unitText: '%' },
            { name: 'Wood species', value: '10 curated' },
            { name: 'Construction', value: 'Furniture-grade' },
            { name: 'Certification', value: 'FSC + EPD' },
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
          { name: cleanName, url: `/${locale}/products/rwood-veneer` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <RWoodVeneerProductPage
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('rwoodVeneerPage.specs.tag')}
            title={t('rwoodVeneerPage.specs.title')}
          />
        }
        gallery={
          <ProductGallery
            images={galleryImages}
            tag={tPage('gallery.tag')}
            title={t('rwoodVeneerPage.gallery.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['rwood-veneer']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="rwood-veneer" />}
      />
    </NextIntlClientProvider>
  );
}
