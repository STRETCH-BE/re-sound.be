// Shared logic for the prefab routes: page metadata + render PrefabPage with
// BreadcrumbList JSON-LD. notFound() for unknown slugs.
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import { prefabPages } from '@/lib/prefab';
import { localizePrefab } from '@/lib/localize-content';
import PrefabPage from '@/components/sections/PrefabPage';

export async function prefabMetadata(slug: string, locale: string): Promise<Metadata> {
  if (!isValidLocale(locale)) return {};
  const base = prefabPages[slug];
  if (!base) return {};
  const tpr = await getTranslations({ locale, namespace: 'prefab' });
  const data = localizePrefab(base, tpr.raw(slug));
  const title = `${data.name} | ${brand.name}`;
  const url = `${localeBase(locale)}/products/${slug}`;
  const ogImg = `${localeBase(locale as Locale)}/api/og`;
  return {
    title: { absolute: title },
    description: data.metaDescription,
    alternates: buildAlternates(locale as Locale, `/products/${slug}`),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title,
      description: data.metaDescription,
      url,
      images: [{ url: ogImg, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: { card: 'summary_large_image', title, description: data.metaDescription, images: [ogImg] },
  };
}

export function PrefabView({ slug, locale }: { slug: string; locale: string }) {
  if (isValidLocale(locale)) setRequestLocale(locale as Locale);
  const loc = (isValidLocale(locale) ? locale : 'en') as Locale;
  if (!prefabPages[slug]) notFound();
  return <PrefabBody slug={slug} locale={loc} />;
}

// Split so useTranslations runs after setRequestLocale (next-intl RSC pattern).
function PrefabBody({ slug, locale }: { slug: string; locale: Locale }) {
  const tpr = useTranslations('prefab');
  const tp = useTranslations('productPage');
  const data = localizePrefab(prefabPages[slug], tpr.raw(slug));

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: tp('solutions'), url: `${localeBase(locale)}/products` },
    { name: data.name, url: `${localeBase(locale)}/products/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <PrefabPage data={data} />
    </>
  );
}
