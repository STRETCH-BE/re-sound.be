// Installer training page (/installer-training). Hero + format band, the
// six-cell curriculum, upcoming-date cards, and the booking form (→ /api/lead).
// BreadcrumbList + a Course JSON-LD describing the programme.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, Check } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl, brand } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import { TRAINING_DATE_DETAIL } from '@/lib/forms-config';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { pageImages } from '@/lib/page-images';
import { ModalButton } from '@/components/ui/ModalButton';
import InlineLeadForm from '@/components/sections/InlineLeadForm';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/installer-training', titleKey: 'trainingTitle', descKey: 'trainingDescription' });
}

export default async function TrainingPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('trainingPage');
  const tm = await getTranslations('modals');
  const tp = await getTranslations('productPage');

  const format = t.raw('format') as { value: string; label: string }[];
  const curriculum = t.raw('curriculum.items') as { title: string; body: string }[];
  const included = t.raw('book.included') as string[];

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: t('crumb'), url: `${localeBase(locale)}/installer-training` },
  ]);
  const course = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: t('courseName'),
    description: t('courseDescription'),
    provider: { '@type': 'Organization', name: brand.name, sameAs: siteUrl },
    url: `${localeBase(locale)}/installer-training`,
  };

  return (
    <>
      <JsonLd data={crumbs} />
      <JsonLd data={course} />

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(40px,5vw,72px)' }}>
        <div className="tr-hero" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <Eyebrow num="01" label={t('hero.eyebrow')} />
            <h1 className="h1" style={{ margin: '0 0 24px' }}>
              {t('hero.titleA')}
              <br />
              {t('hero.titleB')} <span className="accent">{t('hero.titleC')}.</span>
            </h1>
            <p className="lead" style={{ maxWidth: 460, margin: '0 0 30px' }}>
              {t('hero.lead')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <ModalButton type="training" source="training_hero" className="btn btn--primary">
                {t('hero.ctaBook')} <ArrowRight size={16} />
              </ModalButton>
              <a href="#dates" className="btn btn--ghost">{t('hero.ctaDates')} <ArrowRight size={16} className="btn__arrow" /></a>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <Placeholder label={t('hero.imageLabel')} src={pageImages.training} sizes="(max-width: 860px) 100vw, 50vw" priority ratio="4/3.4" />
          </div>
        </div>

        {/* Format band */}
        <div className="tr-format" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', marginTop: 'clamp(28px,3vw,44px)' }}>
          {format.map((f) => (
            <div key={f.label} style={{ background: '#fff', padding: '26px 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(30px,3.4vw,46px)', lineHeight: 1, letterSpacing: '-.03em' }}>{f.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted-2)', marginTop: 10 }}>{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section className="section--dark">
        <div className="container section">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(40px,5vw,64px)' }}>
            <div>
              <Eyebrow num="02" label={t('curriculum.eyebrow')} tone="dark" />
              <h2 className="h2">{t('curriculum.title')}<span className="accent">.</span></h2>
            </div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-dark-muted-2)', maxWidth: 360, margin: 0 }}>
              {t('curriculum.lead')}
            </p>
          </div>
          <div className="tr-curric grid-lines grid-lines--dark" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            {curriculum.map((c, i) => (
              <div key={c.title} style={{ background: 'var(--black)', padding: 'clamp(26px,3vw,40px)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--red)', fontSize: 14, letterSpacing: '.05em' }}>{String(i + 1).padStart(2, '0')}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, letterSpacing: '-.01em', margin: '16px 0 11px' }}>{c.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-dark-muted)', margin: 0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dates */}
      <section id="dates" className="container section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 'clamp(32px,3vw,48px)' }}>
          <div>
            <Eyebrow num="03" label={t('dates.eyebrow')} />
            <h2 className="h2 h2--sm">{t('dates.title')}<span className="accent">.</span></h2>
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 320, margin: 0 }}>
            {t('dates.lead')}
          </p>
        </div>
        <div className="tr-dates" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {TRAINING_DATE_DETAIL.map((d, di) => ({
            date: (tm.raw('trainingDates') as string[])[di] ?? d.date,
            note: (tm.raw('trainingDateNotes') as string[])[di] ?? d.note,
          })).map((d) => (
            <div key={d.date} style={{ border: '1px solid var(--border)', background: '#fff', padding: 'clamp(22px,2.4vw,28px)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', marginBottom: 8 }}>{d.date}</div>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{d.note}</div>
            </div>
          ))}
          <div style={{ border: '1px dashed var(--border-input)', background: 'var(--surface)', padding: 'clamp(22px,2.4vw,28px)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', marginBottom: 8 }}>{t('dates.onRequestTitle')}</div>
            <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{t('dates.onRequestNote')}</div>
          </div>
        </div>
      </section>

      {/* Booking form */}
      <section id="book" className="section--red">
        <div className="container section">
          <div className="tr-book" style={{ display: 'grid', gridTemplateColumns: '.85fr 1.15fr', gap: 'clamp(32px,4vw,64px)', alignItems: 'start' }}>
            <div>
              <Eyebrow num="04" label={t('book.eyebrow')} tone="dark" />
              <h2 className="h2" style={{ color: '#fff', margin: '0 0 22px' }}>{t('book.titleA')}<br /><span style={{ color: 'var(--black)' }}>{t('book.titleB')}.</span></h2>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.8)', marginBottom: 14 }}>{t('book.includedLabel')}</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {included.map((p) => (
                  <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: '#fff', fontWeight: 500 }}>
                    <Check size={18} /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#fff', padding: 'clamp(26px,3vw,40px)', border: '1px solid var(--border)' }}>
              <InlineLeadForm type="training" source="training_book" />
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 860px) {
          .tr-hero { grid-template-columns: 1fr !important; }
          .tr-curric { grid-template-columns: 1fr 1fr !important; }
          .tr-dates { grid-template-columns: 1fr 1fr !important; }
          .tr-book { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .tr-format { grid-template-columns: 1fr !important; }
          .tr-curric { grid-template-columns: 1fr !important; }
          .tr-dates { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </>
  );
}
