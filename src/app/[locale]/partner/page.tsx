import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import PartnerPage from '@/components/sections/PartnerPage';

interface PartnerRouteProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PartnerRouteProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('partnerTitle'),
    description: t('partnerDescription'),
    openGraph: {
      title: `${t('partnerTitle')} | Re-Sound`,
      description: t('partnerDescription'),
      images: [`/api/og?locale=${locale}&page=partner`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/partner'),
  };
}

export default async function PartnerRoute({ params: { locale } }: PartnerRouteProps) {
  // Enable static rendering — must be called before any other next-intl functions
  setRequestLocale(locale);
  return <PartnerPage />;
}
