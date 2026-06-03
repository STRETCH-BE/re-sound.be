import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import WhereToBuyPage from '@/components/sections/WhereToBuyPage';

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
  return <WhereToBuyPage />;
}
