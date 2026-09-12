import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';
import { faqPageSchema } from '@/lib/structured-data';
import CalculatorPage from '@/components/calculator/CalculatorPage';
import { CALCULATOR_FAQ_KEYS } from '@/components/calculator/faqKeys';
import PageHero from '@/components/sections/PageHero';
import JsonLd from '@/components/seo/JsonLd';

interface CalculatorRouteProps {
  params: { locale: string };
}

/**
 * Reverberation-time (RT60) calculator: Sabine's formula with the finish and
 * room-type tables imported from the STRETCH Group portal
 * (src/data/acoustic-materials.ts) and Re-Sound's own panels from
 * src/data/products.ts. Copy lives under `calculator.*` in messages; locales
 * without a translation fall back to English (src/i18n/request.ts).
 */
export async function generateMetadata({ params: { locale } }: CalculatorRouteProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'calculator' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: `${t('meta.title')} | Re-Sound`,
      description: t('meta.description'),
      images: [`/api/og?locale=${locale}&page=acoustic-calculator`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/acoustic-calculator'),
  };
}

export default async function CalculatorRoute({ params: { locale } }: CalculatorRouteProps) {
  // Enable static rendering — must be called before any other next-intl functions
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'calculator' });
  const messages = pickMessages(await getMessages(), ['calculator']);
  // Same three questions as the visible FAQ (CalculatorPage), so the
  // structured data matches what is on the page.
  const faq = CALCULATOR_FAQ_KEYS.map((key) => ({ question: t(`faq.${key}.question`), answer: t(`faq.${key}.answer`) }));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <JsonLd data={faqPageSchema(faq)} />
      <PageHero tag={t('hero.tag')} title={t('hero.title')} subtitle={t('hero.subtitle')} />
      <CalculatorPage />
    </NextIntlClientProvider>
  );
}
