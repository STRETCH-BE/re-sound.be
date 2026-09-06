import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import RangeHubPage from '@/components/hub/RangeHubPage';
import { hubMetadata } from '@/components/hub/hubMetadata';

interface PageProps {
  params: { locale: string };
}

// Range hub: "rpet". The external URL is localised per locale via
// next-intl pathnames (see src/data/hubs.ts); this English slug is the
// internal route.
export function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return hubMetadata('rpet', locale);
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  return <RangeHubPage hubId="rpet" locale={locale} />;
}
