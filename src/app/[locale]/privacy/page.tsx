// Privacy policy (/privacy). DRAFTED GDPR-oriented content — flagged in
// CHANGES.md for review by the client's legal advisor before launch.
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand, contact } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/privacy', titleKey: 'privacyTitle', descKey: 'privacyDescription' });
}

const UPDATED = 'January 2026';

export default function PrivacyPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: `${localeBase(locale)}` },
    { name: 'Privacy', url: `${localeBase(locale)}/privacy` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <section className="container section">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16 }}>Legal</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,4.6vw,58px)', lineHeight: 0.98, letterSpacing: '-.03em', textTransform: 'uppercase', margin: '0 0 14px' }}>Privacy policy</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-faint)', margin: '0 0 clamp(32px,4vw,48px)' }}>Last updated: {UPDATED}</p>

          <div className="prose">
            <p>
              This privacy policy explains how {brand.legalName} (&ldquo;{brand.name}&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects and uses personal data when you visit{' '}
              {brand.domain} or contact us. We are the data controller for that processing.
            </p>

            <h2>What we collect</h2>
            <p>
              We only collect what we need. When you submit a form on this site — a quote request,
              sample request, partner application, training booking, call-back request or the contact
              form — we collect the details you provide, which may include your name, company, email
              address, phone number, country and the contents of your message.
            </p>
            <p>
              When you browse the site we may also collect standard technical and usage data (such as
              device, browser and pages viewed) through cookies and similar technologies, but only to
              the extent you have consented. You can review and change your choices at any time via the
              &ldquo;Manage cookies&rdquo; link in the footer.
            </p>

            <h2>Why we use it</h2>
            <p>
              We use the details you submit to respond to your enquiry, prepare quotes, process partner
              and training requests, and provide the products and services you ask about. This
              processing is based on your request and our legitimate interest in responding to it, and —
              where applicable — on taking steps to enter into a contract with you.
            </p>
            <p>
              Where you have given consent, we use analytics and marketing technologies to understand
              how the site is used and to improve it. This processing is based on your consent, which
              you may withdraw at any time.
            </p>

            <h2>Cookies &amp; analytics</h2>
            <p>
              Non-essential cookies and analytics — including Google Analytics and Microsoft Clarity —
              are only loaded after you accept them. Until then, they remain disabled by default through
              consent mode. Essential cookies needed to operate the site and remember your cookie choice
              do not require consent.
            </p>

            <h2>Who we share it with</h2>
            <p>
              We do not sell your personal data. We share it only with service providers who help us
              operate the site and respond to you — for example our hosting provider, our email delivery
              provider and, where consented, our analytics providers — and only as needed to perform
              those services on our behalf. Some of these providers may process data outside the
              European Economic Area, in which case appropriate safeguards apply.
            </p>

            <h2>How long we keep it</h2>
            <p>
              We keep enquiry and lead data for as long as needed to handle your request and for our
              legitimate business and legal record-keeping purposes, after which it is deleted or
              anonymised.
            </p>

            <h2>Your rights</h2>
            <p>
              Subject to applicable law, you have the right to access, correct, delete or restrict the
              processing of your personal data, to object to processing, to data portability, and to
              withdraw consent at any time. You also have the right to lodge a complaint with your local
              data protection authority. In Belgium this is the Data Protection Authority
              (Gegevensbeschermingsautoriteit).
            </p>

            <h2>Contact</h2>
            <p>
              To exercise any of these rights or to ask a question about this policy, contact us at{' '}
              <a href={`mailto:${contact.email}`} className="lnk">{contact.email}</a> or by post at{' '}
              {brand.legalName}, {contact.address.street}, {contact.address.postalCode}{' '}
              {contact.address.city}, Belgium.
            </p>

            <p style={{ fontSize: 13.5, color: 'var(--text-faint)', borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 32 }}>
              This policy is provided as a starting point and should be reviewed by a qualified legal
              advisor before launch to ensure it reflects your actual data-processing practices.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
