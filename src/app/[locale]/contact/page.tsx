import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from 'next';

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
    },
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        en: '/en/contact',
        nl: '/nl/contact',
        fr: '/fr/contact',
        de: '/de/contact',
      },
    },
  };
}

export default async function ContactPage({ params: { locale } }: ContactPageProps) {
  // Enable static rendering - must be called before any other next-intl functions
  setRequestLocale(locale);
  
  const t = await getTranslations('contact');

  return (
    <>
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
    </>
  );
}
