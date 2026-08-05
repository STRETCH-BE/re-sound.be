// Partners page (/partners). Explains the two ways to work with STRETCH —
// Reseller (you sell, we install via the dealer network) and Dealer (you sell
// and install yourself, after training) — with a comparison, shared benefits,
// per-path how-it-works, and a tagged application form. BreadcrumbList JSON-LD.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight, TrendingUp, Users, Package, MapPin, GraduationCap, Megaphone, Store, Wrench, Check } from 'lucide-react';
import { isValidLocale, type Locale } from '@/i18n/config';
import { Link } from '@/i18n/navigation';
import { siteUrl } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { pageImages } from '@/lib/page-images';
import { ModalButton } from '@/components/ui/ModalButton';
import InlineLeadForm from '@/components/sections/InlineLeadForm';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/partners', titleKey: 'partnersTitle', descKey: 'partnersDescription' });
}

const WHY_ICONS = [TrendingUp, Users, Package, MapPin, GraduationCap, Megaphone];

export default async function PartnersPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('partnersPage');
  const tp = await getTranslations('productPage');

  const resellerPoints = t.raw('models.reseller.points') as string[];
  const dealerPoints = t.raw('models.dealer.points') as string[];
  const compareRows = t.raw('compare.rows') as { label: string; reseller: string; dealer: string }[];
  const whyCards = t.raw('why.cards') as { title: string; body: string }[];
  const resellerSteps = t.raw('how.resellerSteps') as { title: string; body: string }[];
  const dealerSteps = t.raw('how.dealerSteps') as { title: string; body: string }[];
  const applyPoints = t.raw('apply.points') as string[];

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: t('crumb'), url: `${localeBase(locale)}/partners` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(40px,5vw,72px)' }}>
        <div className="pt-hero" style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <Eyebrow num="01" label={t('hero.eyebrow')} />
            <h1 className="h1" style={{ margin: '0 0 24px' }}>
              {t('hero.title')}
              <br />
              <span className="accent">STRETCH.</span>
            </h1>
            <p className="lead" style={{ maxWidth: 480, margin: '0 0 30px' }}>
              {t('hero.lead')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <ModalButton type="partner" source="partners_hero" className="btn btn--primary">
                {t('hero.ctaApply')} <ArrowRight size={16} />
              </ModalButton>
              <ModalButton type="call" source="partners_hero" className="btn btn--ghost">
                {t('hero.ctaCall')} <ArrowRight size={16} className="btn__arrow" />
              </ModalButton>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <Placeholder
            label="Installer / team photo"
            src={pageImages.partners}
            alt={t('hero.imageAlt')}
            sizes="(max-width: 860px) 100vw, 45vw"
            ratio="4/3.4"
          />
            <div style={{ position: 'absolute', right: -1, bottom: -1, background: 'var(--red)', color: '#fff', padding: '16px 22px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 30, lineHeight: 1 }}>50m²</div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', marginTop: 5 }}>{t('hero.statLabel')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Two ways to partner */}
      <section className="section--surface">
        <div className="container section">
          <Eyebrow num="02" label={t('models.eyebrow')} />
          <h2 className="h2 h2--sm" style={{ margin: '0 0 14px', maxWidth: '22ch' }}>
            {t('models.title')}
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 620, margin: '0 0 clamp(32px,4vw,48px)' }}>
            {t('models.lead')}
          </p>

          <div className="pt-paths" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {/* Reseller */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: 'clamp(26px,3vw,40px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ color: 'var(--red)', display: 'inline-flex' }}><Store size={26} /></span>
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('models.reseller.kicker')}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.4vw,28px)', letterSpacing: '-.02em', margin: '0 0 12px' }}>{t('models.reseller.title')}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                {t('models.reseller.body')}
              </p>
              <ul style={{ listStyle: 'none', margin: '0 0 22px', padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {resellerPoints.map((p) => (
                  <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.45 }}>
                    <Check size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />{p}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 13, color: 'var(--text-faint-2)', margin: '0 0 22px' }}><strong style={{ color: 'var(--text)' }}>{t('models.bestForLabel')}</strong> {t('models.reseller.bestFor')}</p>
              <div style={{ marginTop: 'auto' }}>
                <ModalButton type="partner" source="partners_reseller" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {t('models.reseller.cta')} <ArrowRight size={15} />
                </ModalButton>
              </div>
            </div>

            {/* Dealer */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', padding: 'clamp(26px,3vw,40px)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ color: 'var(--red)', display: 'inline-flex' }}><Wrench size={26} /></span>
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('models.dealer.kicker')}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid var(--red)', padding: '4px 9px', borderRadius: 999 }}>{t('models.dealer.badge')}</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.4vw,28px)', letterSpacing: '-.02em', margin: '0 0 12px' }}>{t('models.dealer.title')}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-muted)', margin: '0 0 20px' }}>
                {t('models.dealer.body')}
              </p>
              <ul style={{ listStyle: 'none', margin: '0 0 22px', padding: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {dealerPoints.map((p) => (
                  <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, lineHeight: 1.45 }}>
                    <Check size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />{p}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 13, color: 'var(--text-faint-2)', margin: '0 0 22px' }}><strong style={{ color: 'var(--text)' }}>{t('models.bestForLabel')}</strong> {t('models.dealer.bestFor')}</p>
              <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <ModalButton type="partner" source="partners_dealer" className="btn btn--primary" style={{ flex: '1 1 auto', justifyContent: 'center' }}>
                  {t('models.dealer.cta')} <ArrowRight size={15} />
                </ModalButton>
                <Link href="/installer-training" className="btn btn--ghost btn--sm" style={{ flex: '0 0 auto' }}>
                  {t('models.dealer.trainingLink')} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="pt-compare" style={{ marginTop: 'clamp(24px,3vw,36px)', border: '1px solid var(--border)', background: '#fff', overflowX: 'auto' }}>
            <div className="pt-compare-row pt-compare-head" style={{ fontWeight: 700 }}>
              <div />
              <div style={{ color: 'var(--text)' }}>{t('compare.resellerHead')}</div>
              <div style={{ color: 'var(--text)' }}>{t('compare.dealerHead')}</div>
            </div>
            {compareRows.map((r) => (
              <div key={r.label} className="pt-compare-row">
                <div style={{ fontWeight: 600, color: 'var(--text-faint-2)' }}>{r.label}</div>
                <div>{r.reseller}</div>
                <div>{r.dealer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="section--dark">
        <div className="container section">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(40px,5vw,64px)' }}>
            <div>
              <Eyebrow num="03" label={t('why.eyebrow')} tone="dark" />
              <h2 className="h2">{t('why.titleA')}<br /><span className="accent">{t('why.titleB')}.</span></h2>
            </div>
            <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--on-dark-muted-2)', maxWidth: 360, margin: 0 }}>
              {t('why.lead')}
            </p>
          </div>
          <div className="pt-why grid-lines grid-lines--dark" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            {whyCards.map((c, i) => {
              const Icon = WHY_ICONS[i];
              return (
                <div key={c.title} style={{ background: 'var(--black)', padding: 'clamp(26px,3vw,40px)' }}>
                  <span style={{ color: 'var(--red)', display: 'inline-flex', marginBottom: 18 }}><Icon size={26} /></span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, letterSpacing: '-.01em', margin: '0 0 11px' }}>{c.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--on-dark-muted)', margin: 0 }}>{c.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works — per path */}
      <section className="container section">
        <Eyebrow num="04" label={t('how.eyebrow')} />
        <h2 className="h2 h2--sm" style={{ margin: '0 0 clamp(36px,4vw,52px)', maxWidth: '24ch' }}>
          {t('how.title')}
        </h2>
        <div className="pt-flows" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(28px,4vw,48px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ color: 'var(--red)', display: 'inline-flex' }}><Store size={20} /></span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '.02em', textTransform: 'uppercase', margin: 0 }}>{t('how.resellerPath')}</h3>
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {resellerSteps.map((s, i) => (
                <li key={s.title} style={{ borderLeft: '2px solid var(--border)', paddingLeft: 18 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--red)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, margin: '8px 0 5px' }}>{s.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <span style={{ color: 'var(--red)', display: 'inline-flex' }}><Wrench size={20} /></span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '.02em', textTransform: 'uppercase', margin: 0 }}>{t('how.dealerPath')}</h3>
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {dealerSteps.map((s, i) => (
                <li key={s.title} style={{ borderLeft: '2px solid var(--border)', paddingLeft: 18 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22, color: 'var(--red)', lineHeight: 1 }}>{String(i + 1).padStart(2, '0')}</div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, margin: '8px 0 5px' }}>{s.title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" className="section--red">
        <div className="container section">
          <div className="pt-apply" style={{ display: 'grid', gridTemplateColumns: '.85fr 1.15fr', gap: 'clamp(32px,4vw,64px)', alignItems: 'start' }}>
            <div>
              <Eyebrow num="05" label={t('apply.eyebrow')} tone="dark" />
              <h2 className="h2" style={{ color: '#fff', margin: '0 0 18px' }}>{t('apply.titleA')}<br /><span style={{ color: 'var(--black)' }}>{t('apply.titleB')}.</span></h2>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: '#fff', margin: '0 0 22px', maxWidth: 360 }}>
                {t('apply.lead')}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {applyPoints.map((p) => (
                  <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: '#fff', fontWeight: 500 }}>
                    <span style={{ width: 8, height: 8, background: '#fff', flexShrink: 0 }} />{p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#fff', padding: 'clamp(26px,3vw,40px)', border: '1px solid var(--border)' }}>
              <InlineLeadForm type="partner" source="partners_apply" />
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .pt-compare-row { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 16px; padding: 14px clamp(16px,2vw,24px); border-bottom: 1px solid var(--border); font-size: 14px; min-width: 520px; }
        .pt-compare-row:last-child { border-bottom: 0; }
        .pt-compare-head { background: var(--surface); font-size: 12px; letter-spacing: .06em; text-transform: uppercase; }
        @media (max-width: 860px) {
          .pt-hero { grid-template-columns: 1fr !important; }
          .pt-paths { grid-template-columns: 1fr !important; }
          .pt-why { grid-template-columns: 1fr 1fr !important; }
          .pt-flows { grid-template-columns: 1fr !important; }
          .pt-apply { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .pt-why { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </>
  );
}
