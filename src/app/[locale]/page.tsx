import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

// Import all homepage sections
import Hero from '@/components/sections/Hero';
import StatsBar from '@/components/sections/StatsBar';
import Materials from '@/components/sections/Materials';
import ProductsSection from '@/components/sections/ProductsSection';
import WhySection from '@/components/sections/WhySection';
import CircularSection from '@/components/sections/CircularSection';
import CTA from '@/components/sections/CTA';

interface HomePageProps {
  params: { locale: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: HomePageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: 'Acoustics Made Circular',
    description: t('homeDescription'),
    openGraph: {
      title: 'Re-Sound | Acoustics Made Circular',
      description: t('homeDescription'),
      images: ['/images/og-home.jpg'],
      locale: locale,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        nl: '/nl',
        fr: '/fr',
        de: '/de',
      },
    },
  };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  // Enable static rendering
  setRequestLocale(locale);
  
  return (
    <>
      {/* Hero Section - Main landing area */}
      <Hero />

      {/* Stats Bar - 100%, 50+, 0, 🇧🇪 */}
      <StatsBar />

      {/* Materials Section - Recycled materials showcase */}
      <Materials />

      {/* Products Section - Interior, Solid, Divide */}
      <ProductsSection />

      {/* Why Section - Why choose circular acoustic panels */}
      <WhySection />

      {/* Circular Section - Close the loop process */}
      <CircularSection />

      {/* CTA Section - Ready to transform your space */}
      <CTA />
    </>
  );
}
