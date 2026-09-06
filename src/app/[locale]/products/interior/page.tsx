import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import OtherModels from '@/components/product/OtherModels';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import ProductGallery from '@/components/product/ProductGallery';
import ProductSpecs from '@/components/product/ProductSpecs';
import InteriorProductPage from '@/components/sections/InteriorProductPage';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
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
const GALLERY_IMAGES = [1, 2, 3, 4, 5, 6].map((i) => ({
  src: `/images/products/interior/gallery-${i}.jpg`,
  alt: `Interior acoustic textile wall panels — project installation ${i}`,
}));

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

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  // Root + productPage translators for the server-rendered section slots.
  const t = await getTranslations({ locale });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  // FAQ entries — fall back gracefully if a question key isn't translated
  // (string returns the key, which we then filter out).
  const tFaq = await getTranslations({
    locale,
    namespace: 'interiorPage.faq',
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
          slug: 'interior',
          locale,
          name: cleanName,
          description,
          image: '/images/products/interior/hero-antracite.webp',
          category: 'Acoustic textile wall panels',
          // ISO country from product data; omitted while the country is a placeholder
          countryOfOrigin: PRODUCTS['interior'].madeIn ?? undefined,
          material: 'Recycled textile fibres',
          specs: [
            { name: 'Sound absorption (αw)', value: '1.0', unitText: 'ISO 11654' },
            { name: 'NRC', value: '0.95', unitText: 'ASTM C423' },
            { name: 'Fire classification', value: 'B-s2,d0' },
            { name: 'Recycled content', value: '80', unitText: '%' },
            { name: 'Panel thickness', value: '25', unitText: 'mm' },
          ],
          offer: {
            lowPrice: '387', priceCurrency: 'EUR',
          },
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Re-Sound', url: `/${locale}` },
          { name: tProducts('pageTitle'), url: `/${locale}/products` },
          { name: cleanName, url: `/${locale}/products/interior` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <InteriorProductPage
          specs={
            <ProductSpecs
              cards={specs}
              tag={t('interiorPage.specs.tag')}
              title={t('interiorPage.specs.title')}
            />
          }
          gallery={
            <ProductGallery
              images={GALLERY_IMAGES}
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
          otherModels={<OtherModels slug="interior" />}
        />
      </NextIntlClientProvider>
    </>
  );
}
