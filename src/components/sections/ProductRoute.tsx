// Shared logic for the five product routes. Each product folder is its own
// route (one-folder-per-product), so this keeps those page files to three lines
// and centralises metadata + JSON-LD (Product, BreadcrumbList, FAQPage).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates, buildOgLocales } from '@/lib/seo';
import { getProduct } from '@/lib/products';
import { localizeProduct, type CatalogEntry } from '@/lib/localize-product';
import { productSchema, breadcrumbSchema, faqPageSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import SolutionPage from '@/components/sections/SolutionPage';
// Prefab slugs render a bespoke page, not the standard product template. We
// delegate here so the per-slug route file works regardless of which view it
// imports — keeps prefab-ceiling-unit on the custom PrefabPage.
import { prefabPages } from '@/lib/prefab';
import { prefabMetadata, PrefabView } from '@/components/sections/PrefabRoute';

export async function productMetadata(slug: string, localeParam: string): Promise<Metadata> {
  if (prefabPages[slug]) return prefabMetadata(slug, localeParam);
  if (!isValidLocale(localeParam)) return {};
  const locale = localeParam as Locale;
  const base = getProduct(slug);
  if (!base) return {};
  const tc = await getTranslations({ locale, namespace: 'catalog' });
  const product = localizeProduct(base, tc.raw(base.key) as CatalogEntry);

  const route = `/products/${slug}`;
  const { ogLocale, alternate } = buildOgLocales(locale);
  const ogImg = `${localeBase(locale)}/api/og/${slug}`;

  return {
    title: product.name,
    description: product.summary,
    alternates: buildAlternates(locale, route),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title: `${product.name} | ${brand.name}`,
      description: product.summary,
      url: `${localeBase(locale)}${route}`,
      locale: ogLocale,
      alternateLocale: alternate,
      images: [{ url: ogImg, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${brand.name}`,
      description: product.summary,
      images: [ogImg],
    },
  };
}

export function ProductView({ slug, locale: localeParam }: { slug: string; locale: string }) {
  if (prefabPages[slug]) return <PrefabView slug={slug} locale={localeParam} />;
  const base = getProduct(slug);
  if (!base) notFound();
  if (isValidLocale(localeParam)) setRequestLocale(localeParam as Locale);
  const locale = (isValidLocale(localeParam) ? localeParam : 'en') as Locale;

  return <ProductBody slug={slug} locale={locale} />;
}

// Split so useTranslations runs after setRequestLocale (next-intl RSC pattern).
function ProductBody({ slug, locale }: { slug: string; locale: Locale }) {
  const tc = useTranslations('catalog');
  const tp = useTranslations('productPage');
  const tf = useTranslations('catalogFaqs');
  const base = getProduct(slug)!;
  const product = localizeProduct(base, tc.raw(base.key) as CatalogEntry);
  const faqs = (tf.raw(base.key) as typeof base.faqs | undefined) ?? base.faqs;

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: tp('solutions'), url: `${localeBase(locale)}/products` },
    { name: product.short, url: `${localeBase(locale)}/products/${slug}` },
  ]);

  return (
    <>
      <JsonLd data={productSchema(product, locale)} />
      <JsonLd data={crumbs} />
      <JsonLd data={faqPageSchema(faqs)} />
      <SolutionPage product={base} />
    </>
  );
}
