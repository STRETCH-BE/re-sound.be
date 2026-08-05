// Prefab lighting elements — custom prefab page.
import type { Metadata } from 'next';
import { prefabMetadata, PrefabView } from '@/components/sections/PrefabRoute';

const SLUG = 'prefab-lighting-elements';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return prefabMetadata(SLUG, params.locale);
}

export default function Page({ params }: { params: { locale: string } }) {
  return <PrefabView slug={SLUG} locale={params.locale} />;
}
