import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import ModularXLProductPage from '@/components/sections/ModularXLProductPage';
import { pickMessages } from '@/lib/i18n-messages';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqFor, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/modular-xl';
import ProductSpecs from '@/components/product/ProductSpecs';
import { crumbsToSchema, productCrumbs } from '@/components/product/productCrumbs';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import Breadcrumbs from '@/components/product/Breadcrumbs';
import OtherModels from '@/components/product/OtherModels';
import { boothFromPrice } from '@/components/product/boothPrice';
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

const FAQ_KEYS = ["leadTime", "scaleUp", "ceilingHeight", "capacity", "warranty"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('modularXlTitle');
  const description = t('modularXlDescription');

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?product=modular-xl&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/modular-xl'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('modularXlTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('modularXlDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'modular-xl', cleanName);

  const tFaq = await getTranslations({
    locale,
    namespace: 'modularXlPage.faq',
  });
  // Product FAQ (messages) + the workbook rows tagged "modular-xl", without duplicates
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
    faqFor(locale, 'modular-xl').map((f) => ({ question: f.question, answer: f.answer }))
  );

  // Narrow the catalog to the namespaces the client tree actually uses:
  // modularXlPage (product copy), boothPage (shared booth template), leadModal.
  const messages = pickMessages(await getMessages(), [
    'modularXlPage',
    'boothPage',
    'leadModal',
    'manufacturer',
  ]);

  const tBooth = await getTranslations({ locale, namespace: 'modularXlPage' });
  const tShared = await getTranslations({ locale, namespace: 'boothPage' });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });
  const tHubs = await getTranslations({ locale, namespace: 'hubs.shared' });

  return (
    <>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['modular-xl'],
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
        <ModularXLProductPage
          fromPrice={boothFromPrice(locale, 'modular-xl', tHubs('col.fromPrice'))}
          breadcrumbs={<Breadcrumbs items={crumbs} />}
          specs={<ProductSpecs cards={specs} tag={tBooth('specs.tag')} title={tBooth('specs.title')} />}
          downloads={<ProductDownloads product={PRODUCTS['modular-xl']} tag={tShared('downloads.tag')} title={tShared('downloads.title')} />}
          faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
          otherModels={<OtherModels slug="modular-xl" locale={locale} />}
        />
      </NextIntlClientProvider>
    </>
  );
}
