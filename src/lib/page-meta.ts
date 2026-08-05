// Builds <head> metadata for the static routes from the `meta` translation
// namespace + hreflang alternates. Titles in messages already include the
// "| STRETCH" suffix, so they are applied as absolute (bypassing the template).
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates, buildOgLocales } from '@/lib/seo';

export async function pageMetadata(opts: {
  locale: string;
  route: string;
  titleKey: string;
  descKey: string;
  ogPath?: string;
  index?: boolean;
}): Promise<Metadata> {
  if (!isValidLocale(opts.locale)) return {};
  const locale = opts.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const { ogLocale, alternate } = buildOgLocales(locale);
  const title = t(opts.titleKey);
  const description = t(opts.descKey);
  const ogImg = `${localeBase(locale)}${opts.ogPath ?? '/api/og'}`;
  const url = `${localeBase(locale)}${opts.route === '/' ? '' : opts.route}`;

  return {
    title: { absolute: title },
    description,
    robots: opts.index === false ? { index: false, follow: true } : { index: true, follow: true },
    alternates: buildAlternates(locale, opts.route),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title,
      description,
      url,
      locale: ogLocale,
      alternateLocale: alternate,
      images: [{ url: ogImg, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImg] },
  };
}
