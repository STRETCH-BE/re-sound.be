import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

import PageHero from '@/components/sections/PageHero';
import AboutStory from '@/components/sections/AboutStory';
import AboutValues from '@/components/sections/AboutValues';
import AboutPartners from '@/components/sections/AboutPartners';
import CTA from '@/components/sections/CTA';

interface AboutPageProps {
  params: { locale: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: AboutPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    openGraph: {
      title: `${t('aboutTitle')} | Re-Sound`,
      description: t('aboutDescription'),
      images: ['/images/og-about.jpg'],
    },
    alternates: {
      canonical: `/${locale}/about`,
      languages: {
        en: '/en/about',
        nl: '/nl/about',
        fr: '/fr/about',
        de: '/de/about',
      },
    },
  };
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('about');

  return (
    <>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Our Story */}
      <AboutStory />

      {/* Our Values */}
      <AboutValues />

      {/* Belgian Quality Section */}
      <section className="belgian-section">
        <div className="belgian-inner">
          <div className="belgian-content">
            <span className="section-tag">{t('belgian.tag')}</span>
            <h2>{t('belgian.title')}</h2>
            <p>{t('belgian.description')}</p>
            
            <div className="belgian-features">
              <div className="belgian-feature">
                <span className="feature-icon">🏭</span>
                <div>
                  <h4>{t('belgian.production.title')}</h4>
                  <p>{t('belgian.production.description')}</p>
                </div>
              </div>
              
              <div className="belgian-feature">
                <span className="feature-icon">🤝</span>
                <div>
                  <h4>{t('belgian.social.title')}</h4>
                  <p>{t('belgian.social.description')}</p>
                </div>
              </div>
              
              <div className="belgian-feature">
                <span className="feature-icon">🔬</span>
                <div>
                  <h4>{t('belgian.rd.title')}</h4>
                  <p>{t('belgian.rd.description')}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="belgian-visual">
            <div className="belgium-flag">
              <div className="flag-stripe black"></div>
              <div className="flag-stripe yellow"></div>
              <div className="flag-stripe red"></div>
            </div>
            <p className="made-in">{t('belgian.madeIn')}</p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <AboutPartners />

      {/* CTA */}
      <CTA />
    </>
  );
}
