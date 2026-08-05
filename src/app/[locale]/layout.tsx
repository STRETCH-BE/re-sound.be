// ROOT + locale layout (multi-domain i18n: all routes live under [locale], so
// this is the app's root layout — it owns <html lang> per locale, fonts and
// global styles). Validates the locale, provides messages to client components,
// sets default metadata (title template, OG/robots defaults, metadataBase,
// home alternates), and mounts the shared chrome: consent-mode defaults,
// analytics, scroll tracking, header, footer, cookie banner, and the lead-modal
// provider that powers every CTA.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { archivo } from '../fonts';
import '../globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { locales, isValidLocale, localeFullCodes, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { localeBase, buildAlternates, buildOgLocales } from '@/lib/seo';
import { ConsentModeDefaults, ScrollTracker, AnalyticsScripts } from '@/components/analytics';
import { LeadModalProvider } from '@/components/LeadGenModal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/layout/CookieConsent';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const { ogLocale, alternate } = buildOgLocales(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('homeTitle'),
      template: `%s | ${brand.name}`,
    },
    description: t('homeDescription'),
    applicationName: brand.name,
    robots: { index: true, follow: true },
    alternates: buildAlternates(locale, '/'),
    openGraph: {
      type: 'website',
      siteName: brand.name,
      title: t('homeTitle'),
      description: t('homeDescription'),
      url: `${localeBase(locale)}`,
      locale: ogLocale,
      alternateLocale: alternate,
      images: [{ url: `${localeBase(locale)}/api/og`, width: 1200, height: 630, alt: brand.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('homeTitle'),
      description: t('homeDescription'),
      images: [`${localeBase(locale)}/api/og`],
    },
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
      apple: '/apple-touch-icon.png',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={localeFullCodes[locale] ?? locale}
      className={`${archivo.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Consent Mode v2 defaults — must run before analytics. */}
      <ConsentModeDefaults />
      <AnalyticsScripts />

      <LeadModalProvider>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieConsent />
        <ScrollTracker />
      </LeadModalProvider>

          {/* Document language for assistive tech / hreflang consistency. */}
          <span data-locale={localeFullCodes[locale]} hidden />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
