// Terms of use (/terms). DRAFTED content — flagged in CHANGES.md for review by
// the client's legal advisor before launch.
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand, contact } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/terms', titleKey: 'termsTitle', descKey: 'termsDescription' });
}

const UPDATED = 'January 2026';

export default function TermsPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;

  const crumbs = breadcrumbSchema([
    { name: 'Home', url: `${localeBase(locale)}` },
    { name: 'Terms', url: `${localeBase(locale)}/terms` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <section className="container section">
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16 }}>Legal</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px,4.6vw,58px)', lineHeight: 0.98, letterSpacing: '-.03em', textTransform: 'uppercase', margin: '0 0 14px' }}>Terms of use</h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-faint)', margin: '0 0 clamp(32px,4vw,48px)' }}>Last updated: {UPDATED}</p>

          <div className="prose">
            <p>
              These terms govern your use of {brand.domain} (the &ldquo;site&rdquo;), operated by{' '}
              {brand.legalName} (&ldquo;{brand.name}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using
              the site you agree to these terms. If you do not agree, please do not use the site.
            </p>

            <h2>Use of the site</h2>
            <p>
              You may use this site for lawful purposes only — to learn about our products and services
              and to contact us. You agree not to misuse the site, interfere with its operation, attempt
              to gain unauthorised access, or use it in any way that breaches applicable law.
            </p>

            <h2>Information on the site</h2>
            <p>
              We aim to keep information on this site accurate and up to date, but it is provided for
              general information only. Product specifications, technical values, dimensions, finishes
              and availability may change and are indicative. Nothing on this site constitutes a binding
              offer; quotations and order confirmations are provided separately and prevail over any
              information here.
            </p>

            <h2>Forms and enquiries</h2>
            <p>
              When you submit a form, you confirm that the information you provide is accurate and that
              you are entitled to share it. Submitting an enquiry does not create a contract; any supply
              of products or services is subject to a separate agreement and our applicable sales
              conditions.
            </p>

            <h2>Intellectual property</h2>
            <p>
              All content on this site — including text, graphics, logos, imagery and the
              &ldquo;{brand.name}&rdquo; name and marks — is owned by or licensed to us and is protected
              by intellectual-property laws. You may not copy, reproduce or reuse it without our prior
              written permission, except as permitted by law.
            </p>

            <h2>Third-party links</h2>
            <p>
              The site may link to third-party websites or services that we do not control. We are not
              responsible for their content, availability or practices, and a link does not imply
              endorsement.
            </p>

            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, we are not liable for any indirect or
              consequential loss arising from your use of, or inability to use, the site, or from
              reliance on its content. Nothing in these terms excludes liability that cannot be excluded
              under applicable law.
            </p>

            <h2>Changes</h2>
            <p>
              We may update these terms from time to time. The version published on this page applies to
              your use of the site. Please check back periodically.
            </p>

            <h2>Governing law &amp; contact</h2>
            <p>
              These terms are governed by Belgian law, and the courts competent for the seat of{' '}
              {brand.legalName} have jurisdiction, to the extent permitted by law. Questions about these
              terms can be sent to{' '}
              <a href={`mailto:${contact.email}`} className="lnk">{contact.email}</a>.
            </p>

            <p style={{ fontSize: 13.5, color: 'var(--text-faint)', borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 32 }}>
              These terms are provided as a starting point and should be reviewed by a qualified legal
              advisor before launch.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
