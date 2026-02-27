import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import Hero from '@/components/sections/Hero';
import Ticker from '@/components/sections/Ticker';
import RWoodShowcase from '@/components/sections/RWoodShowcase';
import ProductsMosaic from '@/components/sections/ProductsMosaic';
import CircularLoop from '@/components/sections/CircularLoop';
import WhyCards from '@/components/sections/WhyCards';
import DualCTA from '@/components/sections/DualCTA';

interface HomePageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: 'Re—Sound | Recycled by Origin. Circular by Design.',
    description: t('homeDescription'),
    openGraph: {
      title: 'Re-Sound | Acoustic Panels Made Circular',
      description: t('homeDescription'),
      images: ['/images/og-home.jpg'],
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', nl: '/nl', fr: '/fr', de: '/de' },
    },
  };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  setRequestLocale(locale);

  return (
    <>
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
