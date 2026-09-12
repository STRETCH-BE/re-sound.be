import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';
import { FOUNDING_YEAR, PARTNERS, PLANTS } from '@/config/site';

import PageHero from '@/components/sections/PageHero';
import AboutStory from '@/components/sections/AboutStory';
import AboutValues from '@/components/sections/AboutValues';
import AboutPartners from '@/components/sections/AboutPartners';
import CTA from '@/components/sections/CTA';
import Icon from '@/components/ui/Icon';

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
      images: [`/api/og?locale=${locale}&page=about`],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/about'),
  };
}

export default async function AboutPage({ params: { locale } }: AboutPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const tm = await getTranslations('manufacturer');
  const messages = pickMessages(await getMessages(), ['about', 'cta']);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Our Story */}
      <AboutStory foundingYear={FOUNDING_YEAR} />

      {/* Our Values */}
      <AboutValues />

      {/* Own factories — the one manufacturer statement, reused sitewide */}
      <section className="belgian-section">
        <div className="belgian-inner">
          <div className="belgian-content">
            <span className="section-tag">{t('belgian.tag')}</span>
            <h2>{t('belgian.title')}</h2>
            <p>{tm('statement')}</p>
            <p>{t('belgian.description')}</p>

            <div className="belgian-features">
              <div className="belgian-feature">
                <span className="feature-icon"><Icon name="factory" /></span>
                <div>
                  <h4>{t('belgian.production.title')}</h4>
                  <p>{t('belgian.production.description')}</p>
                </div>
              </div>

              <div className="belgian-feature">
                <span className="feature-icon"><Icon name="handshake" /></span>
                <div>
                  <h4>{t('belgian.social.title')}</h4>
                  <p>{t('belgian.social.description')}</p>
                </div>
              </div>

              <div className="belgian-feature">
                <span className="feature-icon"><Icon name="flask" /></span>
                <div>
                  <h4>{t('belgian.rd.title')}</h4>
                  <p>{t('belgian.rd.description')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="belgian-visual">
            <ul className="plant-list">
              {PLANTS.map((plant) => (
                <li key={plant.city}>
                  <span className="plant-city">{plant.city}</span>
                  <span className="plant-country">{plant.country}</span>
                </li>
              ))}
            </ul>
            <p className="made-in">{t('belgian.madeIn')}</p>
          </div>
        </div>
      </section>

      {/* Partners — hidden until PARTNERS in src/config/site.ts has real entries */}
      <AboutPartners partners={PARTNERS} />

      {/* CTA */}
      <CTA />
    </NextIntlClientProvider>
  );
}
