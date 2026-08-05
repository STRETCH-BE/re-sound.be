// Project detail route — one dynamic route renders every project page
// (e.g. /inspiration/van-der-valk-beveren). Params + content come from
// content.ts `projects` via ProjectRoute. dynamicParams=false → unknown
// slugs 404.
import type { Metadata } from 'next';
import { projectMetadata, ProjectView, projectParams } from '@/components/sections/ProjectRoute';

export const dynamicParams = false;

export function generateStaticParams() {
  return projectParams();
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  return projectMetadata(params.slug, params.locale);
}

export default function Page({ params }: { params: { locale: string; slug: string } }) {
  return <ProjectView slug={params.slug} locale={params.locale} />;
}
