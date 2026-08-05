// Technical datasheets (/datasheets). A library of downloadable PDFs grouped by
// category; every download is gated behind the lead modal (name/email/phone via
// DatasheetDownloadButton → /api/lead). BreadcrumbList JSON-LD.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { FileText, ShieldCheck } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import { datasheetsByCategory } from '@/lib/datasheets';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import DatasheetDownloadButton from '@/components/ui/DatasheetDownloadButton';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/datasheets', titleKey: 'datasheetsTitle', descKey: 'datasheetsDescription' });
}

export default async function DatasheetsPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('datasheetsPage');
  const tp = await getTranslations('productPage');

  const groups = datasheetsByCategory();
  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: t('crumb'), url: `${localeBase(locale)}/datasheets` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(24px,3vw,40px)' }}>
        <Eyebrow num="01" label={t('eyebrow')} />
        <h1 className="h1" style={{ margin: '0 0 clamp(18px,2vw,26px)' }}>
          {t('titleA')} <span className="accent">{t('titleB')}.</span>
        </h1>
        <p className="lead" style={{ maxWidth: 580, margin: 0 }}>
          {t('lead')}
        </p>
      </section>

      {/* Datasheet groups */}
      <section className="container" style={{ paddingBottom: 'clamp(50px,6vw,90px)' }}>
        {groups.map((group) => (
          <div key={group.category} style={{ marginBottom: 'clamp(34px,4vw,54px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 20 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>
                {group.category}
              </span>
              <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ display: 'grid', gap: 14 }}>
              {group.items.map((sheet) => (
                <div key={sheet.slug} className="ds-row">
                  <div className="ds-ico" aria-hidden>
                    <FileText size={22} strokeWidth={1.8} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px,1.8vw,21px)', letterSpacing: '-.01em', margin: '0 0 6px' }}>
                      {sheet.title}
                    </h2>
                    <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0, maxWidth: 620 }}>
                      {sheet.description}
                    </p>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>
                      {sheet.format && <span>{sheet.format}</span>}
                      {sheet.sizeLabel && <span>{sheet.sizeLabel}</span>}
                      {sheet.updated && <span>{t('updated', { date: sheet.updated })}</span>}
                    </div>
                  </div>
                  <div className="ds-cta">
                    <DatasheetDownloadButton sheet={sheet} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Reassurance note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginTop: 8, padding: '16px 18px', background: 'var(--surface)', maxWidth: 620 }}>
          <ShieldCheck size={18} strokeWidth={1.9} style={{ color: 'var(--red)', flex: '0 0 auto', marginTop: 1 }} />
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>
            {t('privacyNote')}{' '}
            <a href={`/${locale}/privacy`} style={{ color: 'var(--red)', textDecoration: 'underline' }}>
              {t('privacyLink')}
            </a>
            .
          </p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .ds-row {
          display: flex;
          align-items: center;
          gap: 18px;
          border: 1px solid var(--border);
          background: #fff;
          padding: clamp(16px,2vw,22px) clamp(16px,2vw,24px);
        }
        .ds-ico {
          width: 46px;
          height: 46px;
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface);
          color: var(--black);
        }
        .ds-cta { flex: 0 0 auto; }
        @media (max-width: 640px) {
          .ds-row { flex-wrap: wrap; }
          .ds-ico { display: none; }
          .ds-cta { width: 100%; }
          .ds-cta :global(.btn) { width: 100%; justify-content: center; }
        }
      ` }} />
    </>
  );
}
