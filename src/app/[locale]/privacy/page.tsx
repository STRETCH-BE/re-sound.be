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
    title: t('privacy.title'),
    description: t('privacy.subtitle'),
    alternates: buildAlternates(locale, '/privacy'),
    robots: {
      // Mark as draft — let search engines index the URL (so the cookie banner
      // link is valid) but signal it's not finalised by not indexing for now.
      index: false,
      follow: true,
    },
  };
}

export default async function PrivacyPage({ params: { locale } }: PageProps) {
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
          <h1>{t('privacy.title')}</h1>
          <p className="legal-subtitle">{t('privacy.subtitle')}</p>
          <p className="legal-meta">
            {t('lastUpdated')}: {lastUpdatedDate}
          </p>
        </header>

        <article className="legal-body">
          <section>
            <h2>1. Who we are</h2>
            <p>
              Re-Sound is a brand of <strong>STRETCH-BE BV</strong> ("Re-Sound", "we",
              "us"), registered in Belgium and operating the website{' '}
              <a href="https://re-sound.be">re-sound.be</a>.
            </p>
            <p>
              <strong>Data controller:</strong>
              <br />
              STRETCH-BE BV
              <br />
              Gentseweg 309 A3
              <br />
              9120 Beveren-Waas, Belgium
              <br />
              Email:{' '}
              <a href="mailto:info@re-sound.be">info@re-sound.be</a>
            </p>
            <p>
              If you have any question about how your personal data is handled,
              you can contact us at the address above.
            </p>
          </section>

          <section>
            <h2>2. What data we collect</h2>
            <h3>Information you give us directly</h3>
            <ul>
              <li>
                <strong>Contact form</strong> — name, email address, phone number
                (optional), company name (optional), subject, and the content of
                your message.
              </li>
              <li>
                <strong>Lead capture forms</strong> (PDF downloads, sample
                requests) — company name, first and last name, business email,
                phone number, role/position, company type, and the document or
                resource you requested.
              </li>
            </ul>

            <h3>Information collected automatically</h3>
            <ul>
              <li>
                <strong>Technical data</strong> — IP address (truncated for
                analytics), browser type and version, device type, operating
                system, referring URL, pages visited, and approximate location
                derived from the IP address.
              </li>
              <li>
                <strong>Cookies and similar technologies</strong> — see Section 6
                below.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Why we use your data (and our legal basis)</h2>
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Legal basis (GDPR Art. 6)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Responding to inquiries submitted via the contact form
                  </td>
                  <td>
                    Performance of pre-contractual steps and our legitimate
                    interest in customer communication (Art. 6(1)(b) and (f))
                  </td>
                </tr>
                <tr>
                  <td>
                    Delivering requested documents (product PDFs, brochures)
                  </td>
                  <td>
                    Performance of pre-contractual steps at your request
                    (Art. 6(1)(b))
                  </td>
                </tr>
                <tr>
                  <td>
                    Following up on a lead with relevant product information
                  </td>
                  <td>
                    Our legitimate interest in commercial outreach
                    (Art. 6(1)(f)), balanced against your right to object
                  </td>
                </tr>
                <tr>
                  <td>Website analytics (anonymous)</td>
                  <td>Your consent (Art. 6(1)(a))</td>
                </tr>
                <tr>
                  <td>Marketing and advertising measurement</td>
                  <td>Your consent (Art. 6(1)(a))</td>
                </tr>
                <tr>
                  <td>Compliance with legal and accounting obligations</td>
                  <td>Legal obligation (Art. 6(1)(c))</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>4. How long we keep your data</h2>
            <p>
              We only keep your personal data for as long as needed for the
              purposes set out above:
            </p>
            <ul>
              <li>
                <strong>Contact form messages</strong> — kept for [TO BE
                DETERMINED, suggested: 24 months] after the last interaction,
                unless a commercial relationship develops.
              </li>
              <li>
                <strong>Lead data</strong> — kept for [TO BE DETERMINED,
                suggested: 36 months] from collection, or longer if a commercial
                relationship is active.
              </li>
              <li>
                <strong>Customer and accounting records</strong> — kept for the
                statutory retention period required under Belgian law
                (typically 7–10 years).
              </li>
              <li>
                <strong>Analytics data</strong> — Google Analytics retention is
                set to [TO BE DETERMINED, suggested: 14 months]. Aggregate,
                non-identifying data may be retained longer.
              </li>
            </ul>
            <p className="legal-todo">
              [Action item: confirm retention periods with legal counsel before
              publishing.]
            </p>
          </section>

          <section>
            <h2>5. Who we share your data with</h2>
            <p>
              We do not sell your personal data. We share it only with the
              processors and partners we need to operate the website and
              respond to you:
            </p>
            <ul>
              <li>
                <strong>Microsoft Corporation</strong> (Power Automate, Office
                365 / Outlook) — for processing contact and lead submissions
                and delivering them as email to the Re-Sound team.
              </li>
              <li>
                <strong>Google LLC / Google Ireland</strong> — Google Analytics
                4, Google Consent Mode (analytics consent only).
              </li>
              <li>
                <strong>Microsoft Clarity</strong> — usability analysis with
                PII masking (analytics consent only).
              </li>
              <li>
                <strong>Meta Platforms Ireland Ltd.</strong> — Meta (Facebook)
                Pixel (marketing consent only).
              </li>
              <li>
                <strong>Microsoft Bing / Microsoft Advertising</strong> —
                Bing UET (marketing consent only).
              </li>
              <li>
                <strong>Vercel Inc.</strong> — website hosting infrastructure.
              </li>
            </ul>
            <p>
              Some of these recipients are based outside the EU/EEA. We rely on
              Standard Contractual Clauses approved by the European Commission
              and, where available, adequacy decisions, to ensure your data
              remains protected.
            </p>
          </section>

          <section>
            <h2>6. Cookies and similar technologies</h2>
            <p>
              We use cookies and similar technologies for three purposes:
            </p>
            <ul>
              <li>
                <strong>Necessary</strong> (always active) — these are required
                for the website to function. They store technical settings such
                as your selected language and your consent preferences. No
                personal data is shared with third parties for these.
              </li>
              <li>
                <strong>Analytics</strong> (with your consent) — Google
                Analytics 4 and Microsoft Clarity, used to understand how
                visitors interact with the site so we can improve it.
              </li>
              <li>
                <strong>Marketing</strong> (with your consent) — Meta Pixel and
                Bing UET, used to measure the effectiveness of advertising and
                show you more relevant content on other platforms.
              </li>
            </ul>
            <p>
              You can change your cookie preferences at any time using the
              "Manage cookies" link at the bottom of every page, or by clearing
              your browser's local storage for this site.
            </p>
          </section>

          <section>
            <h2>7. Your rights</h2>
            <p>Under the GDPR, you have the right to:</p>
            <ul>
              <li>
                <strong>Access</strong> — obtain confirmation of whether we
                process your personal data, and a copy of that data.
              </li>
              <li>
                <strong>Rectification</strong> — have inaccurate or incomplete
                data corrected.
              </li>
              <li>
                <strong>Erasure ("right to be forgotten")</strong> — request
                deletion of your personal data when there is no longer a valid
                reason for us to keep it.
              </li>
              <li>
                <strong>Restriction</strong> — ask us to pause processing while
                a question is resolved.
              </li>
              <li>
                <strong>Portability</strong> — receive the data you provided in
                a structured, machine-readable format.
              </li>
              <li>
                <strong>Objection</strong> — object to processing based on our
                legitimate interest (including direct marketing).
              </li>
              <li>
                <strong>Withdraw consent</strong> — withdraw consent for
                analytics or marketing at any time, with no effect on
                processing done before withdrawal.
              </li>
              <li>
                <strong>Complaint</strong> — lodge a complaint with the Belgian
                Data Protection Authority (Gegevensbeschermingsautoriteit /
                Autorité de protection des données), Drukpersstraat 35, 1000
                Brussels —{' '}
                <a
                  href="https://www.gegevensbeschermingsautoriteit.be/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.gegevensbeschermingsautoriteit.be
                </a>
                .
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:info@re-sound.be">info@re-sound.be</a>. We will
              respond within one month.
            </p>
          </section>

          <section>
            <h2>8. Security</h2>
            <p>
              We apply appropriate technical and organisational measures to
              protect personal data against loss, misuse, or unauthorised access.
              All data is transmitted over encrypted HTTPS connections. Lead
              and contact submissions are routed through Microsoft Power
              Automate over an authenticated webhook.
            </p>
          </section>

          <section>
            <h2>9. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The "Last updated"
              date at the top reflects the most recent revision. Material
              changes will be communicated on the site.
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
        .legal-body h3 {
          font-size: 1.05rem;
          color: var(--deep-blue, #0b2940);
          margin: 1.5rem 0 0.5rem;
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
        .legal-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.92rem;
        }
        .legal-table th,
        .legal-table td {
          padding: 0.65rem 0.85rem;
          text-align: left;
          border-bottom: 1px solid #e3e8ec;
          vertical-align: top;
        }
        .legal-table th {
          background: #f0f4f7;
          font-weight: 600;
          color: var(--deep-blue, #0b2940);
        }
        .legal-todo {
          background: #fff8e1;
          border-left: 3px solid #f0c419;
          padding: 0.5rem 0.85rem;
          font-size: 0.85rem;
          color: #6a4a00;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
