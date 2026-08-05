// Prefab structures — custom prefab page (not the standard product template).
import type { Metadata } from 'next';
import { prefabMetadata, PrefabView } from '@/components/sections/PrefabRoute';

const SLUG = 'prefab-ceiling-unit';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return prefabMetadata(SLUG, params.locale);
}

export default function Page({ params }: { params: { locale: string } }) {
  return <PrefabView slug={SLUG} locale={params.locale} />;
}
