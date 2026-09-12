import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import SoloEcoProductPage from '@/components/sections/SoloEcoProductPage';
import { pickMessages } from '@/lib/i18n-messages';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
import { faqForResolved, mergeFaqEntries } from '@/lib/content/faq';
import specs from '@/data/specs/solo-eco';
import ProductSpecs from '@/components/product/ProductSpecs';
import { crumbsToSchema, productCrumbs } from '@/components/product/productCrumbs';
import ProductDownloads from '@/components/product/ProductDownloads';
import ProductFaq from '@/components/product/ProductFaq';
import Breadcrumbs from '@/components/product/Breadcrumbs';
import OtherModels from '@/components/product/OtherModels';
import { boothFromPrice } from '@/components/product/boothPrice';
import { boothServicePrices } from '@/components/product/boothServices';
import { getFromPriceCents } from '@/lib/catalogue/load';
import { loadConfigurator } from '@/components/order/loadConfigurator';
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
 * ISR: prices come from the catalogue (database), so a change reaches this
 * page within the hour without a redeploy.
 */
export const revalidate = 3600;

// Localised FAQ keys for this product. The keys are stable across locales;
// each translation file under `messages/{locale}.json` provides the actual
// Q&A copy under `soloEcoPage.faq.questions.<key>.question/.answer`.
const FAQ_KEYS = ["leadTime", "difference", "backWall", "power", "ventilation", "warranty"] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('soloEcoTitle');
  const description = t('soloEcoDescription');

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: [`/api/og?product=solo-eco&locale=${locale}`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/products/solo-eco'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);

  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  const fullTitle = tMeta('soloEcoTitle');
  const cleanName = fullTitle.replace(/\s*\|\s*Re-Sound\s*$/, '');
  const description = tMeta('soloEcoDescription');

  const tData = await getTranslations({ locale, namespace: 'productData' });
  const crumbs = await productCrumbs(locale, 'solo-eco', cleanName);

  // Narrow the catalog to the namespaces the client tree actually uses:
  // soloEcoPage (product copy), boothPage (shared booth template), leadModal.
  const messages = pickMessages(await getMessages(), [
    'soloEcoPage',
    'boothPage',
    'leadModal',
    'manufacturer',
    'order',
    'footer',
  ]);

  const tBooth = await getTranslations({ locale, namespace: 'soloEcoPage' });
  const tShared = await getTranslations({ locale, namespace: 'boothPage' });
  const tPage = await getTranslations({ locale, namespace: 'productPage' });
  const tHubs = await getTranslations({ locale, namespace: 'hubs.shared' });
  // "From" price from the catalogue (database, else snapshot): hero KPI + JSON-LD offer.
  const priceCents = await getFromPriceCents('solo-eco');
  // Models, categories and articles for the order dialog (same catalogue read).
  const configurator = await loadConfigurator('solo-eco');
  const fromPrice = await boothFromPrice(locale, 'solo-eco', tHubs('col.fromPrice'));
  // Transport (mainland Europe) and installation figures for the CTA note, from the same slice.
  const services = boothServicePrices(locale, configurator);

  const tFaq = await getTranslations({
    locale,
    namespace: 'soloEcoPage.faq',
  });
  // Catalogue figures the FAQ copy interpolates: leadTime names the mainland-Europe transport figure ({transport}); on request when the catalogue has none.
  const faqValues = { transport: services.transport ?? tShared('cta.onRequest') };
  // Product FAQ (messages) + the workbook rows tagged "solo-eco", without duplicates
  const faqEntries: FaqEntry[] = mergeFaqEntries(
    FAQ_KEYS
    .map((key) => {
      try {
        return {
          question: tFaq(`questions.${key}.question`),
          answer: tFaq(`questions.${key}.answer`, faqValues),
        };
      } catch {
        return null;
      }
    })
    .filter((e): e is FaqEntry => e !== null),
    (await faqForResolved(locale, 'solo-eco')).map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <>
      <JsonLd
        data={productSchema({
          product: PRODUCTS['solo-eco'],
          locale,
          name: cleanName,
          description,
          category: tData('category.booth'),
          priceCents,
        })}
      />
      <JsonLd
        data={breadcrumbSchema(crumbsToSchema(locale, crumbs))}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SoloEcoProductPage
          fromPrice={fromPrice}
          configurator={configurator}
          services={services}
          breadcrumbs={<Breadcrumbs items={crumbs} />}
          specs={<ProductSpecs cards={specs} tag={tBooth('specs.tag')} title={tBooth('specs.title')} />}
          downloads={<ProductDownloads product={PRODUCTS['solo-eco']} tag={tShared('downloads.tag')} title={tShared('downloads.title')} />}
          faq={<ProductFaq entries={faqEntries} tag={tPage('faq.tag')} title={tPage('faq.title')} />}
          otherModels={<OtherModels slug="solo-eco" locale={locale} />}
        />
      </NextIntlClientProvider>
    </>
  );
}
