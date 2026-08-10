import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import FAQContent from '@/components/sections/FAQContent';
import JsonLd from '@/components/seo/JsonLd';
import { pickMessages } from '@/lib/i18n-messages';
import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';

interface PageProps {
  params: { locale: string };
}

// FAQ question keys — must match the keys in messages/{locale}.json under faq.questions
const QUESTION_KEYS = [
  'absorptionVsInsulation',
  'whatIsReverberation',
  'whatInfluencesAcoustics',
  'whatIsAlphaW',
  'howManyPanels',
  'whereCanUse',
  'rwoodVsRpetVsTextile',
  'fireSafety',
  'samples',
  'whatIsCircular',
  'takeBack',
  'recycledContent',
  'leadTimes',
  'quoteProcess',
] as const;

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: { absolute: t('faqTitle') },
    description: t('faqDescription'),
    openGraph: {
      title: t('faqTitle'),
      description: t('faqDescription'),
      type: 'website',
      images: [
        {
          url: `/api/og?page=faq&locale=${locale}`,
          width: 1200,
          height: 630,
          alt: t('faqTitle'),
        },
      ],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('faqTitle'),
      description: t('faqDescription'),
    },
    alternates: buildAlternates(locale, '/faq'),
  };
}

export default async function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'faq' });

  // Build the FAQPage JSON-LD payload — improves SERP appearance (rich result
  // showing Q&A inline under the page title in Google).
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: QUESTION_KEYS.map((key) => ({
      '@type': 'Question',
      name: t(`questions.${key}.question`),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(`questions.${key}.answer`),
      },
    })),
  };

  // Hand the component the list of question keys — it pulls translations itself
  const messages = pickMessages(await getMessages(), ['faq']);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={faqJsonLd} />
      <FAQContent questionKeys={QUESTION_KEYS as unknown as string[]} />
    </NextIntlClientProvider>
  );
}
