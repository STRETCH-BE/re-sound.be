// Technical hub page — pvc / specification. Explicit route; shared logic in TechnicalRoute.
import type { Metadata } from 'next';
import { technicalMetadata, TechnicalView } from '@/components/sections/TechnicalRoute';

const MEMBRANE = 'pvc';
const TOPIC = 'specification';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return technicalMetadata(MEMBRANE, TOPIC, params.locale);
}

export default function Page({ params }: { params: { locale: string } }) {
  return <TechnicalView membrane={MEMBRANE} topic={TOPIC} locale={params.locale} />;
}
