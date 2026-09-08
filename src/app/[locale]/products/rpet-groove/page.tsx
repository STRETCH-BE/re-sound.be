import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import RpetGrooveProductPage from '@/components/sections/rpetgroovepage';
import ProductSpecs from '@/components/product/ProductSpecs';
import { crumbsToSchema, productCrumbs } from '@/components/product/productCrumbs';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductGallery from '@/components/product/ProductGallery';
import ProductFaq from '@/components/product/ProductFaq';
import Breadcrumbs from '@/components/product/Breadcrumbs';
import OtherModels from '@/components/product/OtherModels';
import { pickMessages } from '@/lib/i18n-messages';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqForResolved, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/rpet-groove';
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

// "Projects & Installations" gallery — same images (and order) the client
// component used to render itself.
const GALLERY_IMAGES = [1, 2, 3].map((i) => `/images/products/rpet-groove/gallery-${i}.jpg`);

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
      images: [`/api/og?product=rpet-groove&locale=${locale}`],
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

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'rpet-groove', cleanName);

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
    namespace: 'rpetGroovePage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "rpet-groove", without duplicates
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
    (await faqForResolved(locale, 'rpet-groove')).map((f) => ({ question: f.question, answer: f.answer }))
  );

  // Narrow the client-side message payload to just the namespaces this
  // page's client components use (see src/lib/i18n-messages.ts).
  // 'leadModal' stays: the gated CAD download (GatedDownloadButton inside
  // <ProductDownloads>) still mounts LeadGenModal, which reads that namespace.
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'rpetGroovePage',
    'manufacturer',
    'leadModal',
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['rpet-groove'],
          locale,
          name: cleanName,
          description,
          category: tData('category.rpet'),
        })}
      />
      <JsonLd
        data={breadcrumbSchema(crumbsToSchema(locale, crumbs))}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <RpetGrooveProductPage
        breadcrumbs={<Breadcrumbs items={crumbs} />}
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('rpetGroovePage.specs.tag')}
            title={t('rpetGroovePage.specs.title')}
          />
        }
        gallery={
          <ProductGallery
            images={galleryImages}
            tag={tPage('gallery.tag')}
            title={t('rpetGroovePage.gallery.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['rpet-groove']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="rpet-groove" locale={locale} />}
      />
    </NextIntlClientProvider>
  );
}
