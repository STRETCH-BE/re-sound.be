// Samples page (/samples). Standalone colour/RAL swatch request, using the
// shared inline lead form (samples config → /api/lead). BreadcrumbList JSON-LD.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Check } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import InlineLeadForm from '@/components/sections/InlineLeadForm';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/samples', titleKey: 'samplesTitle', descKey: 'samplesDescription' });
}

export default async function SamplesPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('samplesPage');
  const tp = await getTranslations('productPage');
  const points = t.raw('points') as string[];

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: t('crumb'), url: `${localeBase(locale)}/samples` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />
      <section className="container section">
        <div className="sm-grid" style={{ display: 'grid', gridTemplateColumns: '.85fr 1.15fr', gap: 'clamp(32px,4vw,64px)', alignItems: 'start' }}>
          <div>
            <Eyebrow num="01" label={t('eyebrow')} />
            <h1 className="h1" style={{ margin: '0 0 22px' }}>
              {t('titleA')}
              <br />
              <span className="accent">{t('titleB')}.</span>
            </h1>
            <p className="lead" style={{ maxWidth: 420, margin: '0 0 28px' }}>
              {t('lead')}
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {points.map((p) => (
                <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'var(--text-body)', fontWeight: 500 }}>
                  <span style={{ color: 'var(--red)', display: 'inline-flex' }}><Check size={18} /></span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: 'var(--surface)', padding: 'clamp(26px,3vw,40px)', border: '1px solid var(--border)' }}>
            <InlineLeadForm type="samples" source="samples_page" />
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 860px){ .sm-grid { grid-template-columns: 1fr !important; } }` }} />
    </>
  );
}
