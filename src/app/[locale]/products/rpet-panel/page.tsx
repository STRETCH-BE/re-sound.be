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
import RpetPanelProductPage from '@/components/sections/rpetpanelpage';
import { pickMessages } from '@/lib/i18n-messages';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqForResolved, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/rpet-panel';
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
// Q&A copy under `rpetPanelPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["oekoTex", "fireRating", "processability", "colorRange", "leadTime"] as const;

// EN 13501-1 class of every rPET model, read from product data: the shared
// "fireRating" answer names all three. null while any class is unknown, in
// which case that question is left out rather than shown with a blank.
function rpetFireClasses(): { panel: string; groove: string; flex: string } | null {
  const of = (slug: string) => {
    const s = PRODUCTS[slug].specs;
    return s.kind === 'panel' ? s.fireClass : null;
  };
  const panel = of('rpet-panel');
  const groove = of('rpet-groove');
  const flex = of('rpet-flex-groove');
  return panel && groove && flex ? { panel, groove, flex } : null;
}

// "Projects & Installations" gallery — same images, same order, as the
// former client-rendered gallery section (gallery-7 does not exist).
const GALLERY_IMAGES = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map(
  (i) => `/images/products/rpet-panel/gallery-${i}.webp`
);

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('rpetPanelTitle');
  const description = t('rpetPanelDescription');

  return {
    // Title already contains "| Re-Sound" — bypass the layout template
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic per-product OG so every locale's share preview matches
      // the page's language + branding.
      images: [`/api/og?product=rpet-panel&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/rpet-panel'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  // Strip the trailing " | Re-Sound" so the Product schema name reads cleanly.
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('rpetPanelTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('rpetPanelDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'rpet-panel', cleanName);

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
    namespace: 'rpetPanelPage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "rpet-panel", without duplicates
  const fireClasses = rpetFireClasses();
  const faqEntries: FaqEntry[] = mergeFaqEntries(
    FAQ_KEYS
    .map((key) => {
      if (key === 'fireRating' && !fireClasses) return null;
      try {
        return {
          question: tFaq(`questions.${key}.question`),
          answer: tFaq(`questions.${key}.answer`, key === 'fireRating' && fireClasses ? fireClasses : undefined),
        };
      } catch {
        return null;
      }
    })
    .filter((e): e is FaqEntry => e !== null),
    (await faqForResolved(locale, 'rpet-panel')).map((f) => ({ question: f.question, answer: f.answer }))
  );

  // Narrow the client-side message payload to just the namespaces this
  // page's client components use (see src/lib/i18n-messages.ts).
  const messages = pickMessages(await getMessages(), [
    'productPage',
    'rpetPanelPage',
    'manufacturer',
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['rpet-panel'],
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
      <RpetPanelProductPage
        breadcrumbs={<Breadcrumbs items={crumbs} />}
        specs={
          <ProductSpecs
            cards={specs}
            tag={t('rpetPanelPage.specs.tag')}
            title={t('rpetPanelPage.specs.title')}
          />
        }
        gallery={
          <ProductGallery
            images={galleryImages}
            tag={tPage('gallery.tag')}
            title={t('rpetPanelPage.gallery.title')}
          />
        }
        downloads={
          <ProductDownloads
            product={PRODUCTS['rpet-panel']}
            tag={tPage('downloads.tag')}
            title={tPage('downloads.title')}
          />
        }
        faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
        otherModels={<OtherModels slug="rpet-panel" locale={locale} />}
      />
    </NextIntlClientProvider>
  );
}
