import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';
import WhereToBuyPage from '@/components/sections/WhereToBuyPage';
import ProductionOffice from '@/components/where-to-buy/ProductionOffice';
import Testimonials from '@/components/testimonials/Testimonials';
import JsonLd from '@/components/seo/JsonLd';
import { localBusinessSchema } from '@/lib/structured-data';

interface WhereToBuyRouteProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: WhereToBuyRouteProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('whereToBuyTitle'),
    description: t('whereToBuyDescription'),
    openGraph: {
      title: `${t('whereToBuyTitle')} | Re-Sound`,
      description: t('whereToBuyDescription'),
      images: [`/api/og?locale=${locale}&page=where-to-buy`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/where-to-buy'),
  };
}

export default async function WhereToBuyRoute({ params: { locale } }: WhereToBuyRouteProps) {
  // Enable static rendering — must be called before any other next-intl functions
  setRequestLocale(locale);

  const messages = pickMessages(await getMessages(), ['whereToBuyPage']);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* The Beveren-Waas showroom is the physical place to see the range */}
      <JsonLd data={localBusinessSchema()} />
      <WhereToBuyPage />
      {/* Second location from the content workbook (Dealers_Showrooms) */}
      <ProductionOffice locale={locale} />
      <Testimonials locale={locale} />
    </NextIntlClientProvider>
  );
}
