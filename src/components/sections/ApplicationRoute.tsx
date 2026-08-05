// Shared logic for the application routes: builds page metadata and renders the
// ApplicationPage with BreadcrumbList JSON-LD. notFound() for unknown slugs.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import { getApplication } from '@/lib/applications';
import { localizeApplication, type ApplicationMessages } from '@/lib/localize-content';
import ApplicationPage from '@/components/sections/ApplicationPage';

export async function applicationMetadata(slug: string, locale: string): Promise<Metadata> {
  if (!isValidLocale(locale)) return {};
  const base = getApplication(slug);
  if (!base) return {};
  const ta = await getTranslations({ locale, namespace: 'applications' });
  const app = localizeApplication(base, ta.raw(slug) as ApplicationMessages);
  const title = `${app.name} | ${brand.name}`;
  const url = `${localeBase(locale)}/applications/${slug}`;
  const ogImg = `${localeBase(locale as Locale)}/api/og`;
  return {
    title: { absolute: title },
    description: app.metaDescription,
    alternates: buildAlternates(locale as Locale, `/applications/${slug}`),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title,
      description: app.metaDescription,
      url,
      images: [{ url: ogImg, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: { card: 'summary_large_image', title, description: app.metaDescription, images: [ogImg] },
  };
}

export function ApplicationView({ slug, locale }: { slug: string; locale: string }) {
  if (isValidLocale(locale)) setRequestLocale(locale as Locale);
  const loc = (isValidLocale(locale) ? locale : 'en') as Locale;
  if (!getApplication(slug)) notFound();
  return <ApplicationBody slug={slug} locale={loc} />;
}

// Split so useTranslations runs after setRequestLocale (next-intl RSC pattern).
function ApplicationBody({ slug, locale }: { slug: string; locale: Locale }) {
  const ta = useTranslations('applications');
  const tp = useTranslations('productPage');
  const tap = useTranslations('appPage');
  const app = localizeApplication(getApplication(slug)!, ta.raw(slug) as ApplicationMessages);

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: tap('crumbApplications'), url: `${localeBase(locale)}/inspiration` },
    { name: app.shortName, url: `${localeBase(locale)}/applications/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <ApplicationPage app={app} />
    </>
  );
}
