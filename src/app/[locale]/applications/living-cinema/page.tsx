// Application route — thin wrapper around the shared ApplicationRoute logic.
import type { Metadata } from 'next';
import { applicationMetadata, ApplicationView } from '@/components/sections/ApplicationRoute';

const SLUG = 'living-cinema';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return applicationMetadata(SLUG, params.locale);
}

export default function Page({ params }: { params: { locale: string } }) {
  return <ApplicationView slug={SLUG} locale={params.locale} />;
}
