import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

import RangeHubPage from '@/components/hub/RangeHubPage';
import { hubMetadata } from '@/components/hub/hubMetadata';

interface PageProps {
  params: { locale: string };
}

/**
 * ISR: prices come from the catalogue (database), so a change reaches this
 * page within the hour without a redeploy.
 */
export const revalidate = 3600;

// Range hub: "booths". The external URL is localised per locale via
// next-intl pathnames (see src/data/hubs.ts); this English slug is the
// internal route.
export function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  return hubMetadata('booths', locale);
}

export default function Page({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  return <RangeHubPage hubId="booths" locale={locale} />;
}
