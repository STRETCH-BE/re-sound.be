import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import PageHero from '@/components/sections/PageHero';
import CircularProcess from '@/components/sections/CircularProcess';
import Materials from '@/components/sections/Materials';
import ImpactStats from '@/components/sections/ImpactStats';
import CTA from '@/components/sections/CTA';

interface SustainabilityPageProps {
  params: { locale: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: SustainabilityPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('sustainabilityTitle'),
    description: t('sustainabilityDescription'),
    openGraph: {
      title: `${t('sustainabilityTitle')} | Re-Sound`,
      description: t('sustainabilityDescription'),
      images: ['/images/og-sustainability.jpg'],
    },
    alternates: {
      canonical: `/${locale}/sustainability`,
      languages: {
        en: '/en/sustainability',
        nl: '/nl/sustainability',
        fr: '/fr/sustainability',
        de: '/de/sustainability',
      },
    },
  };
}

export default async function SustainabilityPage({ params: { locale } }: SustainabilityPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('sustainability');

  return (
    <>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('title')}
        subtitle={t('subtitle')}
        dark
      />

      {/* Circular Economy Intro */}
      <section className="circular-intro">
        <div className="circular-intro-inner">
          <div className="intro-content">
            <h2>{t('intro.title')}</h2>
            <p>{t('intro.description')}</p>
          </div>
          
          <div className="intro-visual">
            <div className="loop-animation">
              <div className="loop-circle">
                <div className="loop-arrow"></div>
              </div>
              <div className="loop-center">
                <span>♻️</span>
                <p>{t('intro.endless')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Circular Process */}
      <CircularProcess />

      {/* Materials We Use */}
      <section className="materials-section">
        <div className="materials-inner">
          <span className="section-tag">{t('materials.tag')}</span>
          <h2>{t('materials.title')}</h2>
          <p className="materials-subtitle">{t('materials.subtitle')}</p>
          
          <Materials extended />
        </div>
      </section>

      {/* Impact Statistics */}
      <ImpactStats />

      {/* Return Program */}
      <section className="return-section">
        <div className="return-inner">
          <div className="return-content">
            <span className="section-tag">{t('return.tag')}</span>
            <h2>{t('return.title')}</h2>
            <p>{t('return.description')}</p>
            
            <ul className="return-benefits">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t('return.benefit1')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t('return.benefit2')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {t('return.benefit3')}
              </li>
            </ul>
          </div>
          
          <div className="return-visual">
            <div className="return-box">
              <span>📦</span>
              <p>{t('return.boxText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTA variant="green" />
    </>
  );
}
