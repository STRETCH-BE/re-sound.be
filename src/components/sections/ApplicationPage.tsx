// Shared application ("room type") landing page: hero → benefits → recommended
// solutions → selected projects → CTA. Driven by src/lib/applications.ts.
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Placeholder from '@/components/ui/Placeholder';
import { ModalButton } from '@/components/ui/ModalButton';
import Eyebrow from '@/components/ui/Eyebrow';
import { getProduct } from '@/lib/products';
import { localizeProduct, type CatalogEntry } from '@/lib/localize-product';
import { productImage, pimg } from '@/lib/product-images';
import { projects } from '@/lib/content';
import type { Application } from '@/lib/applications';

export default function ApplicationPage({ app }: { app: Application }) {
  const locale = useLocale();
  const t = useTranslations('appPage');
  const tp = useTranslations('productPage');
  const tc = useTranslations('catalog');
  const tpc = useTranslations('projectCards');
  const solutions = (app.solutionSlugs.map(getProduct).filter(Boolean) as NonNullable<
    ReturnType<typeof getProduct>
  >[]).map((p) => localizeProduct(p, tc.raw(p.key) as CatalogEntry));
  const work = projects.filter((p) => app.projectKeys.includes(p.key)).slice(0, 6);
  const cat = (c: string) => (tpc.has(`cats.${c}`) ? tpc(`cats.${c}`) : c);
  const meta = (slug: string, m: string) => (tpc.has(`metas.${slug}`) ? tpc(`metas.${slug}`) : m);
  // German (noun) keeps its capitalization inside the CTA sentence.
  const ctaName = locale === 'de' ? app.shortName : app.shortName.toLowerCase();

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container" style={{ paddingTop: 'clamp(20px,3vw,30px)' }}>
        <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, fontSize: 12.5, color: 'var(--text-faint-2)' }}>
          <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{tp('home')}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/inspiration" style={{ color: 'inherit', textDecoration: 'none' }}>{t('crumbApplications')}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" style={{ color: 'var(--text-muted)' }}>{app.shortName}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(24px,3vw,40px) 0 clamp(40px,5vw,72px)' }}>
        <div className="ap-hero">
          <div style={{ minWidth: 0 }}>
            <Eyebrow num="01" label={app.eyebrow} />
            <h1 className="h1" style={{ margin: '0 0 clamp(16px,2vw,24px)' }}>{app.name}</h1>
            <p className="lead" style={{ maxWidth: 480, margin: '0 0 28px' }}>{app.intro}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <ModalButton type="quote" source={`application_${app.slug}`} trackQuote className="btn btn--primary">
                {t('quoteCta')} <ArrowRight size={16} />
              </ModalButton>
              <Link href="/inspiration" className="btn btn--ghost">{t('seeProjects')}</Link>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <Placeholder
              label={`${app.shortName} ceiling`}
              src={app.hero}
              alt={`STRETCH ceiling — ${app.shortName}`}
              priority
              sizes="(max-width: 860px) 100vw, 50vw"
              ratio="4/3.2"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
        <div className="ap-benefits">
          {app.benefits.map((b, i) => (
            <div key={b.title} className="ap-benefit">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--red)' }}>0{i + 1}</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px,1.9vw,22px)', letterSpacing: '-.01em', margin: '12px 0 9px' }}>{b.title}</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended solutions */}
      <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 24 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('recommended')}</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div className="ap-sol-grid">
          {solutions.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="ap-sol zoom-wrap">
              <div style={{ overflow: 'hidden' }}>
                <Placeholder
                  label={p.short}
                  src={pimg(productImage(p.slug).hero, '16/10').src}
                  alt={p.name}
                  sizes="(max-width: 860px) 100vw, 33vw"
                  light
                  ratio="16/10"
                  className="zoom-img"
                  decorative
                />
              </div>
              <div style={{ padding: 22 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-.01em', margin: '0 0 7px' }}>{p.short}</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)', margin: '0 0 12px' }}>{p.summary}</p>
                <span className="lnk" style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: '.04em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {t('explore')} <span style={{ color: 'var(--red)' }}>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Selected projects */}
      {work.length > 0 && (
        <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 24 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('selectedWork')}</span>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div className="ap-work-grid">
            {work.map((p) => (
              <figure key={p.title} className="zoom-wrap" style={{ margin: 0, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ overflow: 'hidden', position: 'relative' }}>
                  <Placeholder label={`${p.title} — ${p.cat}`} src={p.image} alt={`${p.title} — ${p.cat}`} sizes="(max-width: 860px) 50vw, 25vw" light ratio="4/3" className="zoom-img" />
                </div>
                <figcaption style={{ padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 8 }}>{cat(p.cat)}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-.01em', margin: '0 0 5px' }}>{p.title}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-faint)', margin: 0 }}>{meta(p.slug, p.meta)}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="container" style={{ paddingBottom: 'clamp(50px,6vw,90px)' }}>
        <div style={{ background: 'var(--black)', padding: 'clamp(30px,4vw,52px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 22 }}>
          <div>
            <h2 className="h2 h2--sm" style={{ color: '#fff', fontSize: 'clamp(24px,3vw,34px)', margin: '0 0 8px' }}>{t('ctaTitle', { name: ctaName })}</h2>
            <p style={{ color: 'var(--on-dark-muted)', fontSize: 14.5, lineHeight: 1.55, margin: 0, maxWidth: 460 }}>{t('ctaBody')}</p>
          </div>
          <ModalButton type="quote" source={`application_${app.slug}_cta`} trackQuote className="btn btn--primary">
            {t('quoteCta')} <ArrowRight size={16} />
          </ModalButton>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .ap-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(28px,4vw,60px); align-items: center; }
        .ap-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ap-benefit { border: 1px solid var(--border); background: #fff; padding: clamp(20px,2.4vw,28px); }
        .ap-sol-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .ap-sol { border: 1px solid var(--border); background: #fff; text-decoration: none; display: block; }
        .ap-work-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        @media (max-width: 900px) {
          .ap-hero { grid-template-columns: 1fr; }
          .ap-benefits, .ap-sol-grid { grid-template-columns: 1fr; }
          .ap-work-grid { grid-template-columns: 1fr 1fr; }
        }
      ` }} />
    </>
  );
}
