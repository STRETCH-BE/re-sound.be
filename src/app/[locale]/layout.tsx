import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/layout/CookieConsent';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import MetaPixel from '@/components/analytics/MetaPixel';

import '@/app/globals.css';

// Supported locales
const locales = ['en', 'nl', 'fr', 'de'] as const;
type Locale = (typeof locales)[number];

// Generate static params for all locales (for static export)
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Default metadata (can be overridden per page)
export const metadata: Metadata = {
  title: {
    template: '%s | Re-Sound',
    default: 'Re-Sound | Acoustics Made Circular',
  },
  description: 'High-performance acoustic solutions crafted from recycled materials. We transform waste into silence—designed for the planet, made in Belgium.',
  keywords: ['acoustic panels', 'circular economy', 'recycled materials', 'sound absorption', 'Belgium', 'sustainable'],
  authors: [{ name: 'Re-Sound' }],
  creator: 'Re-Sound',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://resound.be'),
  openGraph: {
    type: 'website',
    locale: 'en_BE',
    siteName: 'Re-Sound',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Re-Sound - Acoustics Made Circular',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Enable static rendering
  setRequestLocale(locale);
  
  // Validate that the incoming locale is valid
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Load translations for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {/* Preconnect to font servers for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Alternate language links for SEO */}
        {locales.map((loc) => (
          <link
            key={loc}
            rel="alternate"
            hrefLang={loc}
            href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/${loc}`}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/en`}
        />
      </head>
      
      <body className="font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* Analytics - only loads after cookie consent */}
          <GoogleAnalytics />
          <MetaPixel />
          
          {/* Header - consistent across all pages */}
          <Header />
          
          {/* Main content area */}
          <main>
            {children}
          </main>
          
          {/* Footer - consistent across all pages */}
          <Footer />
          
          {/* GDPR Cookie Consent Banner */}
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
