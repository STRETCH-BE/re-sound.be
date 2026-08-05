// Inspiration page (/inspiration). Hero, two featured projects, browse-by-
// solution tiles, the filterable portfolio grid, and a closing CTA.
import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { isValidLocale, type Locale } from '@/i18n/config';
import { siteUrl } from '@/lib/site-config';
import { pageMetadata } from '@/lib/page-meta';
import { breadcrumbSchema } from '@/lib/structured-data';
import { projects, browseSolutions } from '@/lib/content';
import JsonLd from '@/components/seo/JsonLd';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import PortfolioGrid from '@/components/sections/PortfolioGrid';
import { ModalButton } from '@/components/ui/ModalButton';
import { localeBase } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  return pageMetadata({ locale: params.locale, route: '/inspiration', titleKey: 'inspirationTitle', descKey: 'inspirationDescription' });
}

const FEATURED = projects.filter((p) => p.featured).slice(0, 2);

export default async function InspirationPage({ params }: { params: { locale: string } }) {
  if (isValidLocale(params.locale)) setRequestLocale(params.locale as Locale);
  const locale = (isValidLocale(params.locale) ? params.locale : 'en') as Locale;
  const t = await getTranslations('inspirationPage');
  const tp = await getTranslations('productPage');
  const tpc = await getTranslations('projectCards');
  const tpr = await getTranslations('projects');
  const cat = (c: string) => (tpc.has(`cats.${c}`) ? tpc(`cats.${c}`) : c);
  const meta = (slug: string, m: string) => (tpc.has(`metas.${slug}`) ? tpc(`metas.${slug}`) : m);
  const title = (slug: string, fallback: string) =>
    (tpr.raw(slug) as { title?: string } | undefined)?.title ?? fallback;

  const crumbs = breadcrumbSchema([
    { name: tp('home'), url: `${localeBase(locale)}` },
    { name: t('eyebrow'), url: `${localeBase(locale)}/inspiration` },
  ]);

  return (
    <>
      <JsonLd data={crumbs} />

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(36px,5vw,72px) 0 clamp(32px,4vw,52px)' }}>
        <Eyebrow num="01" label={t('eyebrow')} />
        <h1 className="h1" style={{ margin: 0 }}>
          {t('title1')}
          <br />
          {t('title2a')} <span className="accent">{t('title2b')}.</span>
        </h1>
      </section>

      {/* Featured */}
      <section className="container" style={{ paddingBottom: 'clamp(40px,5vw,72px)' }}>
        <div className="ins-feat" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {FEATURED.map((p) => (
            <Link key={p.slug} href={`/inspiration/${p.slug}`} className="zoom-wrap" style={{ display: 'block', margin: 0, position: 'relative', overflow: 'hidden', border: '1px solid var(--border)', textDecoration: 'none' }}>
              <Placeholder
                label={`Featured — ${title(p.slug, p.title)}`}
                src={p.image}
                alt={`${title(p.slug, p.title)} — ${cat(p.cat)}`}
                sizes="(max-width: 860px) 100vw, 50vw"
                ratio="16/10"
                className="zoom-img"
              />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 'clamp(22px,2.6vw,34px)', background: 'linear-gradient(to top, rgba(10,10,10,.85) 0%, rgba(10,10,10,.1) 60%, rgba(10,10,10,0) 100%)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#fff', background: 'var(--red)', alignSelf: 'flex-start', padding: '5px 10px', marginBottom: 12 }}>{cat(p.cat)}</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px,2.6vw,32px)', letterSpacing: '-.02em', textTransform: 'uppercase', color: '#fff', margin: '0 0 6px' }}>{title(p.slug, p.title)}</h2>
                <span style={{ fontSize: 13.5, color: 'var(--on-dark-soft)' }}>{meta(p.slug, p.meta)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse by solution */}
      <section className="section--surface">
        <div className="container section--sm">
          <Eyebrow num="02" label={t('browseEyebrow')} />
          <div className="ins-browse" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {browseSolutions.map((b, bi) => (
              <Link key={b.key} href="/products" className="ins-browse-card" style={{ border: '1px solid var(--border)', background: '#fff', padding: 'clamp(22px,2.4vw,30px)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, letterSpacing: '-.01em', marginBottom: 5 }}>{t(`browse.${bi}.label`)}</span>
                  <span style={{ display: 'block', fontSize: 13, color: 'var(--text-faint)' }}>{t(`browse.${bi}.desc`)}</span>
                </span>
                <span style={{ color: 'var(--red)', flexShrink: 0 }}><ArrowRight size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="container section">
        <div style={{ marginBottom: 'clamp(28px,3vw,40px)' }}>
          <Eyebrow num="03" label={t('allEyebrow')} />
          <h2 className="h2 h2--sm" style={{ margin: 0 }}>{t('portfolioTitle')}<span className="accent">.</span></h2>
        </div>
        <PortfolioGrid />
      </section>

      {/* CTA */}
      <section className="section--dark">
        <div className="container section" style={{ textAlign: 'center' }}>
          <h2 className="h2" style={{ color: '#fff', margin: '0 auto 28px', maxWidth: '16ch' }}>
            {t('ctaTitle')}<span className="accent">.</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            <ModalButton type="quote" source="inspiration_cta" trackQuote className="btn btn--primary">
              {t('quoteCta')} <ArrowRight size={16} />
            </ModalButton>
            <Link href="/products" className="btn btn--ghost-light">{t('exploreCta')}</Link>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 760px) {
          .ins-feat { grid-template-columns: 1fr !important; }
          .ins-browse { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 980px) and (min-width: 761px) {
          .ins-browse { grid-template-columns: 1fr 1fr !important; }
        }
      ` }} />
    </>
  );
}
