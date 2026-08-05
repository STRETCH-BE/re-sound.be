// Product route — thin wrapper around the shared ProductRoute logic.
import type { Metadata } from 'next';
import { productMetadata, ProductView } from '@/components/sections/ProductRoute';

const SLUG = 'polyester-stretch-ceiling';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return productMetadata(SLUG, params.locale);
}

export default function Page({ params }: { params: { locale: string } }) {
  return <ProductView slug={SLUG} locale={params.locale} />;
}
