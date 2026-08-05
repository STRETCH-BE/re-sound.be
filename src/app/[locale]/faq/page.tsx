// FAQ page (/faq). Full-width hero, then the global FAQ as an accessible native
// <details> accordion beside a sticky help card. Emits FAQPage + BreadcrumbList
// JSON-LD. Content is drafted and flagged in CHANGES.md.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Phone } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, contact } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema, faqPageSchema } from '@/lib/structured-data';
import type { Faq } from '@/lib/content';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import { ModalButton } from '@/components/ui/ModalButton';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/faq', titleKey: 'faqTitle', descKey: 'faqDescription' });
}

export default async function FaqPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('faqPage');
  const tp = await getTranslations('productPage');
  const faqs = t.raw('items') as Faq[];

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: t('eyebrow'), url: `${localeBase(locale)}/faq` },
  ]);

  return (
    <>
      <JsonLd data={faqPageSchema(faqs)} />
      <JsonLd data={crumbs} />

      {/* Hero (full width so the display heading has room) */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(28px,3vw,44px)' }}>
        <Eyebrow num="01" label={t('eyebrow')} />
        <h1 className="h1" style={{ margin: '0 0 18px' }}>
          {t('titleA')} <span className="accent">{t('titleB')}.</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(16px,1.3vw,18px)', lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
          {t('lead')}
        </p>
      </section>

      {/* Accordion + sticky help card */}
      <section className="container" style={{ paddingBottom: 'clamp(56px,7vw,110px)' }}>
        <div className="faq-grid">
          <div className="faq-list">
            {faqs.map((f, i) => (
              <details key={f.q} className="faq-item" {...(i === 0 ? { open: true } : {})}>
                <summary className="faq-q">
                  <span>{f.q}</span>
                  <span className="faq-ic" aria-hidden />
                </summary>
                <p className="faq-a">{f.a}</p>
              </details>
            ))}
          </div>

          <aside className="faq-aside">
            <div className="faq-card">
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 14 }}>
                {t('asideKicker')}
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2vw,26px)', letterSpacing: '-.01em', lineHeight: 1.05, color: '#fff', margin: '0 0 14px' }}>
                {t('asideTitle')}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-dark-muted)', margin: '0 0 22px' }}>
                {t('asideBody')}
              </p>
              <ModalButton type="quote" source="faq_aside" trackQuote className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
                {t('asideCta')} <ArrowRight size={15} />
              </ModalButton>
              <a href={contact.phoneHref} className="faq-call">
                <Phone size={15} /> {contact.phoneDisplay}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .faq-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: clamp(28px, 4vw, 64px);
          align-items: start;
        }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-item:first-child { border-top: 1px solid var(--border); }
        .faq-q {
          list-style: none; cursor: pointer; display: flex; align-items: center;
          justify-content: space-between; gap: 24px; padding: 24px 4px;
          font-family: var(--font-display); font-weight: 700; font-size: clamp(17px,1.5vw,20px);
          letter-spacing: -.01em; color: var(--black);
        }
        .faq-q::-webkit-details-marker { display: none; }
        .faq-q:hover { color: var(--red); }
        .faq-ic { position: relative; width: 16px; height: 16px; flex-shrink: 0; }
        .faq-ic::before, .faq-ic::after {
          content: ''; position: absolute; background: var(--red); transition: transform .2s ease;
        }
        .faq-ic::before { left: 0; top: 7px; width: 16px; height: 2px; }
        .faq-ic::after { left: 7px; top: 0; width: 2px; height: 16px; }
        .faq-item[open] .faq-ic::after { transform: scaleY(0); }
        .faq-a {
          margin: 0; padding: 0 48px 26px 4px; font-size: 15.5px; line-height: 1.7;
          color: var(--text-muted); max-width: 68ch;
        }
        .faq-aside { position: sticky; top: calc(var(--header-h) + 60px); }
        .faq-card { background: var(--black); padding: clamp(26px,2.6vw,34px); }
        .faq-call {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          margin-top: 14px; padding-top: 18px; border-top: 1px solid var(--line-dark);
          color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;
        }
        .faq-call:hover { color: var(--red); }
        @media (max-width: 860px) {
          .faq-grid { grid-template-columns: 1fr; }
          .faq-aside { position: static; }
        }
      ` }} />
    </>
  );
}
