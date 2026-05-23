/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { buildAlternates } from '@/lib/seo';

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal' });

  return {
    title: t('terms.title'),
    description: t('terms.subtitle'),
    alternates: buildAlternates(locale, '/terms'),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function TermsPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal' });

  const lastUpdatedDate = '2026-05-23';

  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-draft-banner" role="note">
          ⚠️ {t('draftBanner')}
        </div>

        <header className="legal-header">
          <h1>{t('terms.title')}</h1>
          <p className="legal-subtitle">{t('terms.subtitle')}</p>
          <p className="legal-meta">
            {t('lastUpdated')}: {lastUpdatedDate}
          </p>
        </header>

        <article className="legal-body">
          <section>
            <h2>1. Scope</h2>
            <p>
              These terms govern your use of the website{' '}
              <a href="https://re-sound.be">re-sound.be</a> (the "Site"),
              operated by STRETCH-BE BV, Gentseweg 309 A3, 9120 Beveren-Waas,
              Belgium ("Re-Sound", "we", "us"). By accessing or using the Site,
              you agree to these terms.
            </p>
            <p>
              These terms cover the informational use of the Site only.
              Separate commercial terms apply to any purchase, quote, or
              contract for Re-Sound products, and will be communicated
              separately for each transaction.
            </p>
          </section>

          <section>
            <h2>2. Intellectual property</h2>
            <p>
              All content on the Site — including text, graphics, photography,
              product designs, illustrations, logos, and code — is the property
              of Re-Sound or its licensors and is protected by Belgian and
              international intellectual property laws. "Re-Sound", "rWood",
              "rPET", and related product names are trademarks of STRETCH-BE BV.
            </p>
            <p>
              You may view and download content for personal, non-commercial
              reference. Any other use — including reproduction, distribution,
              modification, or use in derivative works — requires our prior
              written consent.
            </p>
          </section>

          <section>
            <h2>3. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>
                Use the Site for any unlawful purpose or in violation of
                applicable Belgian or EU law.
              </li>
              <li>
                Attempt to gain unauthorised access to the Site, its servers,
                or related systems.
              </li>
              <li>
                Interfere with the Site's normal operation, including by
                introducing malware, automated scraping at scale, or actions
                that impose unreasonable load on our infrastructure.
              </li>
              <li>
                Submit false, misleading, or fraudulent information through any
                form on the Site.
              </li>
            </ul>
          </section>

          <section>
            <h2>4. Product information</h2>
            <p>
              We make reasonable efforts to keep product information,
              specifications, photographs, and prices accurate, but content on
              the Site is provided for general information only. Specifications
              and availability may change without notice; binding commercial
              terms are confirmed at the time of order or quotation.
            </p>
            <p>
              Acoustic performance figures, fire ratings, and material
              composition data reflect the best information available at
              publication; refer to current product datasheets and test reports
              for the values applicable to your specific configuration.
            </p>
          </section>

          <section>
            <h2>5. Third-party links</h2>
            <p>
              The Site may contain links to third-party websites. We provide
              these links for convenience and do not endorse, control, or take
              responsibility for the content, accuracy, or practices of those
              sites.
            </p>
          </section>

          <section>
            <h2>6. Disclaimer of warranties</h2>
            <p>
              The Site is provided "as is" and "as available". To the maximum
              extent permitted by Belgian law, we make no warranties of any
              kind regarding the Site's availability, accuracy, or fitness for
              a particular purpose.
            </p>
          </section>

          <section>
            <h2>7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Re-Sound is
              not liable for any indirect, incidental, consequential, or
              punitive damages arising from your use of, or inability to use,
              the Site — including any reliance on information published on
              it. Nothing in these terms limits our liability for damages that
              cannot be limited or excluded under Belgian law (such as
              liability for intent or gross negligence).
            </p>
          </section>

          <section>
            <h2>8. Privacy</h2>
            <p>
              Personal data submitted via the Site is handled in accordance
              with our{' '}
              <a href={`/${locale}/privacy`}>Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2>9. Governing law and jurisdiction</h2>
            <p>
              These terms are governed by Belgian law. Any dispute arising from
              or in connection with these terms or your use of the Site is
              subject to the exclusive jurisdiction of the competent courts of
              the judicial district of Dendermonde, Belgium, without prejudice
              to mandatory consumer-protection rules.
            </p>
          </section>

          <section>
            <h2>10. Changes</h2>
            <p>
              We may update these terms from time to time. The "Last updated"
              date at the top reflects the most recent revision. Continued use
              of the Site after a change indicates acceptance of the updated
              terms.
            </p>
          </section>

          <section>
            <h2>11. Contact</h2>
            <p>
              For questions about these terms, contact{' '}
              <a href="mailto:info@re-sound.be">info@re-sound.be</a>.
            </p>
          </section>
        </article>
      </div>

      <style>{`
        .legal-page {
          padding: 4rem 0 6rem;
          background: #fafbfc;
          min-height: 70vh;
        }
        .legal-page .container {
          max-width: 820px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .legal-draft-banner {
          background: #fff8e1;
          border: 1px solid #f0c419;
          color: #6a4a00;
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 2.5rem;
          font-size: 0.95rem;
          font-weight: 500;
        }
        .legal-header {
          margin-bottom: 3rem;
          border-bottom: 1px solid #e3e8ec;
          padding-bottom: 2rem;
        }
        .legal-header h1 {
          font-size: 2.5rem;
          color: var(--deep-blue, #0b2940);
          margin: 0 0 0.5rem;
        }
        .legal-subtitle {
          font-size: 1.1rem;
          color: #4a5a68;
          margin: 0 0 1rem;
        }
        .legal-meta {
          font-size: 0.85rem;
          color: #8090a0;
          margin: 0;
        }
        .legal-body section { margin-bottom: 2.5rem; }
        .legal-body h2 {
          font-size: 1.4rem;
          color: var(--deep-blue, #0b2940);
          margin: 0 0 1rem;
        }
        .legal-body p, .legal-body li {
          color: #3a4a58;
          line-height: 1.7;
        }
        .legal-body ul {
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }
        .legal-body li { margin-bottom: 0.5rem; }
        .legal-body a {
          color: var(--brand-blue, #197FC7);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
