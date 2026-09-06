import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import DuoProductPage from '@/components/sections/DuoProductPage';
import { pickMessages } from '@/lib/i18n-messages';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqFor, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/duo';
import ProductSpecs from '@/components/product/ProductSpecs';
import { crumbsToSchema, productCrumbs } from '@/components/product/productCrumbs';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import Breadcrumbs from '@/components/product/Breadcrumbs';
import OtherModels from '@/components/product/OtherModels';
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

// Two configurations on a shared shell — Flex (meeting for 2) and Work (focus for 1).
const FAQ_KEYS = ["leadTime", "configChoice", "switchConfig", "noiseReduction", "warranty"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('duoTitle');
  const description = t('duoDescription');

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?product=duo&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/duo'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('duoTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('duoDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'duo', cleanName);

  const tFaq = await getTranslations({
    locale,
    namespace: 'duoPage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "duo", without duplicates
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
    faqFor(locale, 'duo').map((f) => ({ question: f.question, answer: f.answer }))
  );

  // Narrow the catalog to the namespaces the client tree actually uses:
  // duoPage (product copy), boothPage (shared booth template), leadModal.
  const messages = pickMessages(await getMessages(), [
    'duoPage',
    'boothPage',
    'leadModal',
    'manufacturer',
  ]);

  const tBooth = await getTranslations({ locale, namespace: 'duoPage' });
  const tShared = await getTranslations({ locale, namespace: 'boothPage' });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });

  return (
    <>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['duo'],
          locale,
          name: cleanName,
          description,
          category: tData('category.booth'),
        })}
      />
      <JsonLd
        data={breadcrumbSchema(crumbsToSchema(locale, crumbs))}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <DuoProductPage
          breadcrumbs={<Breadcrumbs items={crumbs} variant="overlay" />}
          specs={<ProductSpecs cards={specs} tag={tBooth('specs.tag')} title={tBooth('specs.title')} />}
          downloads={<ProductDownloads product={PRODUCTS['duo']} tag={tShared('downloads.tag')} title={tShared('downloads.title')} />}
          faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
          otherModels={<OtherModels slug="duo" locale={locale} />}
        />
      </NextIntlClientProvider>
    </>
  );
}
