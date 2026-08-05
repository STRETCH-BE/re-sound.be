import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import Hero from '@/components/sections/Hero';
import Ticker from '@/components/sections/Ticker';
import RWoodShowcase from '@/components/sections/RWoodShowcase';
import ProductsMosaic from '@/components/sections/ProductsMosaic';
import CircularLoop from '@/components/sections/CircularLoop';
import WhyCards from '@/components/sections/WhyCards';
import DualCTA from '@/components/sections/DualCTA';

import JsonLd from '@/components/seo/JsonLd';
import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { organizationSchema, websiteSchema } from '@/lib/structured-data';

interface HomePageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('homeTitle');
  const description = t('homeDescription');

  return {
    // Title already includes "Re-Sound" — bypass template wrap
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      // Dynamic homepage OG image (brand-blue background, title, tagline).
      images: [`/api/og?locale=${locale}&page=home`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: buildAlternates(locale, '/'),
  };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);

  return (
    <>
      {/* Sitewide entity graph — Organization + WebSite together let Google
          merge facts under a single Knowledge-Graph node instead of treating
          the site as anonymous. WebSite is required for sitelinks. */}
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />

      {/* Dual-split fullscreen hero: rWood left / Circular right */}
      <Hero />

      {/* Scrolling blue ticker strip */}
      <Ticker />

      {/* rWood hero image + veneer strip + specs + swatches */}
      <RWoodShowcase />

      {/* 5-product mosaic grid + application context strip */}
      <ProductsMosaic />

      {/* Dark circular economy section with spinning ring */}
      <CircularLoop />

      {/* 4-card why section */}
      <WhyCards />

      {/* Split image CTA: samples left / quote right */}
      <DualCTA />
    </>
  );
}
