import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Metadata } from 'next';

import { buildAlternates, ogLocale, ogAlternateLocales } from '@/lib/seo';
import { pickMessages } from '@/lib/i18n-messages';

import PageHero from '@/components/sections/PageHero';
import ContactForm from '@/components/sections/ContactForm';
import ContactInfo from '@/components/sections/ContactInfo';
import Newsletter from '@/components/sections/Newsletter';

interface ContactPageProps {
  params: { locale: string };
}

// Generate metadata for SEO
export async function generateMetadata({
  params: { locale },
}: ContactPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
    openGraph: {
      title: `${t('contactTitle')} | Re-Sound`,
      description: t('contactDescription'),
      images: [
        {
          url: `/api/og?page=contact&locale=${locale}`,
          width: 1200,
          height: 630,
          alt: `${t('contactTitle')} | Re-Sound`,
        },
      ],
      locale: ogLocale(locale),
      alternateLocale: ogAlternateLocales(locale),
    },
    alternates: buildAlternates(locale, '/contact'),
  };
}

export default async function ContactPage({ params: { locale } }: ContactPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('contact');
  const messages = pickMessages(await getMessages(), ['contact', 'newsletter']);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Page Hero */}
      <PageHero
        tag={t('tag')}
        title={t('title')}
        subtitle={t('subtitle')}
      />

      {/* Contact Section */}
      <section className="contact-content">
        <div className="contact-inner">
          {/* Contact Form */}
          <ContactForm />
          
          {/* Contact Info */}
          <ContactInfo />
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </NextIntlClientProvider>
  );
}
