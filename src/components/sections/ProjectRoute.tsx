// Shared logic for /inspiration/[slug] project detail pages.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates } from '@/lib/seo';
import { breadcrumbSchema, faqPageSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import { getProjectBySlug, projectSlugs } from '@/lib/content';
import { localizeProject, type ProjectMessages } from '@/lib/localize-content';
import ProjectPage from '@/components/sections/ProjectPage';

export function projectParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function projectMetadata(slug: string, locale: string): Promise<Metadata> {
  if (!isValidLocale(locale)) return {};
  const base = getProjectBySlug(slug);
  if (!base) return {};
  const tpr = await getTranslations({ locale, namespace: 'projects' });
  const tpc = await getTranslations({ locale, namespace: 'projectCards' });
  const project = localizeProject(base, tpr.raw(slug) as ProjectMessages);
  const meta = tpc.has(`metas.${slug}`) ? tpc(`metas.${slug}`) : project.meta;
  const title = `${project.title} — ${meta} | ${brand.name}`;
  const description = project.summary ?? `${project.title} — a STRETCH ceiling project. ${meta}.`;
  const route = `/inspiration/${slug}`;
  const ogImg = `${localeBase(locale as Locale)}/api/og`;
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale as Locale, route),
    openGraph: {
      type: 'article',
      siteName: brand.name,
      title,
      description,
      url: `${localeBase(locale)}${route}`,
      images: [{ url: ogImg, width: 1200, height: 630, alt: project.title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImg] },
  };
}

export function ProjectView({ slug, locale }: { slug: string; locale: string }) {
  if (!getProjectBySlug(slug)) notFound();
  if (isValidLocale(locale)) setRequestLocale(locale as Locale);
  const loc = (isValidLocale(locale) ? locale : 'en') as Locale;
  return <ProjectBody slug={slug} locale={loc} />;
}

// Split so useTranslations runs after setRequestLocale (next-intl RSC pattern).
function ProjectBody({ slug, locale }: { slug: string; locale: Locale }) {
  const tpr = useTranslations('projects');
  const tp = useTranslations('productPage');
  const tpp = useTranslations('projectPage');
  const project = localizeProject(getProjectBySlug(slug)!, tpr.raw(slug) as ProjectMessages);

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: tpp('crumbInspiration'), url: `${localeBase(locale)}/inspiration` },
    { name: project.title, url: `${localeBase(locale)}/inspiration/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      {project.faqs && project.faqs.length > 0 && <JsonLd data={faqPageSchema(project.faqs)} />}
      <ProjectPage project={project} />
    </>
  );
}
