import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import PageHero from '@/components/sections/PageHero';
import ProductsGrid from '@/components/sections/ProductsGrid';
import CTA from '@/components/sections/CTA';

interface ProductsPageProps {
  params: { locale: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: ProductsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('productsTitle'),
    description: t('productsDescription'),
    openGraph: {
      title: `${t('productsTitle')} | Re-Sound`,
      description: t('productsDescription'),
      images: ['/images/og-products.jpg'],
    },
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        en: '/en/products',
        nl: '/nl/products',
        fr: '/fr/products',
        de: '/de/products',
      },
    },
  };
}

export default async function ProductsPage({ params: { locale } }: ProductsPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('products');

  return (
    <>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
      />

      {/* All Products Grid */}
      <section className="products-page">
        <div className="products-page-inner">
          <ProductsGrid showAll />
        </div>
      </section>

      {/* Features/Benefits */}
      <section className="products-features">
        <div className="features-inner">
          <div className="feature-block">
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3>{t('features.performance.title')}</h3>
            <p>{t('features.performance.description')}</p>
          </div>

          <div className="feature-block">
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9m-9 9a9 9 0 0 1 9-9" />
              </svg>
            </div>
            <h3>{t('features.circular.title')}</h3>
            <p>{t('features.circular.description')}</p>
          </div>

          <div className="feature-block">
            <div className="feature-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 3v18" />
              </svg>
            </div>
            <h3>{t('features.customization.title')}</h3>
            <p>{t('features.customization.description')}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTA />
    </>
  );
}
