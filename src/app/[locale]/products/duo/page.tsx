import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import DuoProductPage from '@/components/sections/DuoProductPage';
import { pickMessages } from '@/lib/i18n-messages';
import JsonLd from '@/components/seo/JsonLd';
import { PRODUCTS } from '@/data/products';
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

  const tProducts = await getTranslations({ locale, namespace: 'products' });

  const tFaq = await getTranslations({
    locale,
    namespace: 'duoPage.faq',
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

  // Narrow the catalog to the namespaces the client tree actually uses:
  // duoPage (product copy), boothPage (shared booth template), leadModal.
  const messages = pickMessages(await getMessages(), [
    'duoPage',
    'boothPage',
    'leadModal',
  ]);

  return (
    <>
      <JsonLd
        data={productSchema({
          slug: 'duo',
          locale,
          name: cleanName,
          description,
          image: '/images/products/duo/hero-flex.jpg',
          category: 'Acoustic meeting booths',
          // ISO country from product data; omitted while the country is a placeholder
          countryOfOrigin: PRODUCTS['duo'].madeIn ?? undefined,
          material: 'Steel frame, recycled-PET acoustic lining, tempered glass',
          specs: [
            { name: 'External dimensions', value: '1640 × 1200 × 2260', unitText: 'mm' },
            { name: 'Net weight', value: '420', unitText: 'kg' },
            { name: 'Ventilation rate', value: '9.2', unitText: 'm³/min' },
            { name: 'Capacity', value: '1–2 people' },
            { name: 'Configurations', value: 'Flex (meeting) · Work (focus)' },
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
          { name: cleanName, url: `/${locale}/products/duo` },
        ])}
      />
      {faqEntries.length > 0 && <JsonLd data={faqPageSchema(faqEntries)} />}
      <NextIntlClientProvider locale={locale} messages={messages}>
        <DuoProductPage />
      </NextIntlClientProvider>
    </>
  );
}
