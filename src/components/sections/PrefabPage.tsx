// Custom prefab page body (used by both prefab routes). Sections:
//   hero → (01) what we build → (02) materials → (NN) made in-house [optional:
//   production story + cutting/welding/powder-coating detail photos] →
//   (NN) drawing-vs-result showcase [optional] → shipped worldwide → CTA.
// Section numbers are computed from which optional sections are present.
// Driven by src/lib/prefab.ts. No datasheet / colour swatches / "where it's used".
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Globe } from 'lucide-react';
import Placeholder from '@/components/ui/Placeholder';
import { ModalButton } from '@/components/ui/ModalButton';
import Eyebrow from '@/components/ui/Eyebrow';
import type { PrefabPageData } from '@/lib/prefab';

// Hero title sizes per locale — the largest size at which that locale's longest
// word (measured in Archivo wdth 125, upper-case) still fits the hero column at
// every viewport, so no locale ever mid-word-breaks or bleeds behind the photo.
// (Done per locale in TS rather than :lang() CSS so it works regardless of the
// <html lang> value.) Keyed by app locale; anything missing gets the default.
const H1_SIZE: Record<string, string> = {
  be: 'clamp(27px, 3.4vw, 50px)', // "lichtelementen"
  nl: 'clamp(27px, 3.4vw, 50px)',
  fr: 'clamp(28px, 3.7vw, 54px)', // "préfabriquées"
  es: 'clamp(28px, 3.7vw, 54px)', // "prefabricadas"
  pt: 'clamp(27px, 3.6vw, 52px)', // "pré-fabricadas"
  de: 'clamp(26px, 3.4vw, 50px)', // "Lichtelemente"
  da: 'clamp(28px, 3.8vw, 55px)', // "lyselementer"
  no: 'clamp(28px, 3.8vw, 55px)',
  pl: 'clamp(26px, 3.2vw, 47px)', // "prefabrykowane"
  is: 'clamp(25px, 3.2vw, 46px)', // "lýsingareiningar"
  sv: 'clamp(23px, 2.9vw, 42px)', // "Prefabstrukturer"
};
const H1_SIZE_DEFAULT = 'clamp(32px, 4.6vw, 64px)';

function SectionHead({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 'clamp(24px,3vw,34px)' }}>
      <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>({n})</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{label}</span>
    </div>
  );
}

export default function PrefabPage({ data }: { data: PrefabPageData }) {
  const t = useTranslations('prefabPage');
  const tp = useTranslations('productPage');
  const locale = useLocale();
  const h1Size = H1_SIZE[locale] ?? H1_SIZE_DEFAULT;
  // Dynamic section numbering — make + materials always present.
  const order: string[] = ['make', 'materials'];
  if (data.production) order.push('production');
  if (data.showcase) order.push('showcase');
  const num = (key: string) => String(order.indexOf(key) + 1).padStart(2, '0');

  return (
    <>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="container" style={{ paddingTop: 'clamp(20px,3vw,30px)' }}>
        <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, fontSize: 12.5, color: 'var(--text-faint-2)' }}>
          <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{tp('home')}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>{tp('solutions')}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" style={{ color: 'var(--text-muted)' }}>{data.name}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="container" style={{ padding: 'clamp(24px,3vw,40px) 0 clamp(40px,5vw,72px)' }}>
        <div className="pf-hero">
          <div style={{ minWidth: 0 }}>
            <Eyebrow num="01" label={data.eyebrow} />
            <h1 className="h1" style={{ fontSize: h1Size, margin: '0 0 clamp(16px,2vw,24px)' }}>{data.name}</h1>
            <p className="lead" style={{ maxWidth: 500, margin: '0 0 28px' }}>{data.intro}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <ModalButton type="quote" source={`prefab_${data.slug}`} trackQuote className="btn btn--primary">
                {t('discussCta')} <ArrowRight size={16} />
              </ModalButton>
              <Link href="/partners" className="btn btn--ghost">{t('becomeDealer')}</Link>
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <Placeholder label={`${data.name} photo`} src={data.hero} alt={data.name} priority sizes="(max-width: 860px) 100vw, 50vw" ratio="4/3.2" />
          </div>
        </div>
      </section>

      {/* (01) What we build */}
      <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
        <SectionHead n={num('make')} label={data.makeHeading} />
        <div className="pf-grid">
          {data.make.map((m) => (
            <div key={m.title} className="pf-card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(19px,2vw,23px)', letterSpacing: '-.01em', margin: '0 0 10px' }}>{m.title}</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* (02) Materials */}
      <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
        <SectionHead n={num('materials')} label={data.materialsHeading} />
        <div className="pf-grid">
          {data.materials.map((m) => (
            <div key={m.title} className="pf-mat">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-.01em', margin: '0 0 9px' }}>{m.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)', margin: 0 }}>{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* (NN) Made in-house — production story + craftsmanship detail photos */}
      {data.production && (
        <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
          <SectionHead n={num('production')} label={data.production.heading} />
          <p style={{ fontSize: 'clamp(15px,1.5vw,17px)', lineHeight: 1.65, color: 'var(--text-muted)', margin: '0 0 clamp(28px,3.4vw,44px)', maxWidth: 720 }}>
            {data.production.body}
          </p>
          <div className="pf-detail-grid">
            {data.production.details.map((d, i) => (
              <figure key={d.title} className="pf-detail">
                <Placeholder label={`${d.title} — detail`} src={d.image} alt={`${d.title} — high-end detail`} sizes="(max-width: 860px) 100vw, 33vw" light ratio="4/3" />
                <figcaption style={{ marginTop: 14 }}>
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 7 }}>
                    <span style={{ color: 'var(--red)', marginRight: 7 }}>0{i + 1}</span>{d.title}
                  </span>
                  <span style={{ display: 'block', fontSize: 14, lineHeight: 1.55, color: 'var(--text-muted)' }}>{d.body}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* (NN) From drawing to finished structure — 2-up drawing | result */}
      {data.showcase && (
        <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
          <SectionHead n={num('showcase')} label={data.showcase.heading} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(34px,4vw,56px)' }}>
            {data.showcase.items.map((s) => (
              <div key={s.title} className="pf-show">
                <div className="pf-show-head">
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px,2.2vw,26px)', letterSpacing: '-.01em', margin: 0 }}>{s.title}</h3>
                  {s.meta && <span className="pf-show-meta">{s.meta}</span>}
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: '10px 0 0', maxWidth: 640 }}>{s.summary}</p>
                </div>
                <div className={`pf-show-imgs${s.result2 ? ' pf-show-imgs--3' : ''}`}>
                  <figure style={{ margin: 0 }}>
                    <Placeholder label={`${s.title} — technical drawing`} src={s.drawing} alt={`${s.title} — technical drawing`} sizes={s.result2 ? '(max-width: 860px) 100vw, 33vw' : '(max-width: 860px) 100vw, 50vw'} light ratio="4/3" />
                    <figcaption style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginTop: 10 }}>
                      <span style={{ color: 'var(--red)', marginRight: 7 }}>01</span>{t('technicalDrawing')}
                    </figcaption>
                  </figure>
                  <figure style={{ margin: 0 }}>
                    <Placeholder label={`${s.title} — installed & finished`} src={s.result} alt={`${s.title} — installed and finished`} sizes={s.result2 ? '(max-width: 860px) 100vw, 33vw' : '(max-width: 860px) 100vw, 50vw'} ratio="4/3" />
                    <figcaption style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginTop: 10 }}>
                      <span style={{ color: 'var(--red)', marginRight: 7 }}>02</span>{t('installedFinished')}
                    </figcaption>
                  </figure>
                  {s.result2 && (
                    <figure style={{ margin: 0 }}>
                      <Placeholder label={`${s.title} — the finished space`} src={s.result2} alt={`${s.title} — the finished space`} sizes="(max-width: 860px) 100vw, 33vw" ratio="4/3" />
                      <figcaption style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginTop: 10 }}>
                        <span style={{ color: 'var(--red)', marginRight: 7 }}>03</span>{t('finishedSpace')}
                      </figcaption>
                    </figure>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shipped worldwide */}
      <section className="container" style={{ paddingBottom: 'clamp(44px,5vw,76px)' }}>
        <div className="pf-world">
          <Globe size={30} strokeWidth={1.7} style={{ color: 'var(--red)', flex: '0 0 auto' }} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(20px,2.4vw,28px)', letterSpacing: '-.01em', textTransform: 'uppercase', margin: '0 0 8px' }}>{t('shippedWorldwide')}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0, maxWidth: 620 }}>{data.worldwide}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ paddingBottom: 'clamp(50px,6vw,90px)' }}>
        <div style={{ background: 'var(--black)', padding: 'clamp(30px,4vw,52px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 22 }}>
          <div>
            <h2 className="h2 h2--sm" style={{ color: '#fff', fontSize: 'clamp(24px,3vw,34px)', margin: '0 0 8px' }}>{t('ctaTitle')}</h2>
            <p style={{ color: 'var(--on-dark-muted)', fontSize: 14.5, lineHeight: 1.55, margin: 0, maxWidth: 470 }}>{t('ctaBody')}</p>
          </div>
          <ModalButton type="quote" source={`prefab_${data.slug}_cta`} trackQuote className="btn btn--primary">
            {t('discussCta')} <ArrowRight size={16} />
          </ModalButton>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .pf-hero { display: grid; grid-template-columns: 1.05fr 1fr; gap: clamp(28px,4vw,60px); align-items: center; }
        /* Long page names ("Prefab Structures", "Konstrukcje prefabrykowane", …) in a
           half-width column: size down from the full-page .h1 so the title never
           runs behind the hero photo, and let extreme words hyphenate/wrap. */
        .pf-hero .h1 { line-height: 0.94; letter-spacing: -.02em; text-wrap: balance; hyphens: auto; overflow-wrap: anywhere; }
        .pf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .pf-card { border: 1px solid var(--border); background: #fff; padding: clamp(22px,2.6vw,30px); }
        .pf-mat { border-left: 2px solid var(--red); background: var(--surface); padding: clamp(18px,2.2vw,26px); }
        .pf-detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(18px,2.4vw,28px); }
        .pf-detail { margin: 0; }
        .pf-show { border: 1px solid var(--border); background: #fff; padding: clamp(20px,2.6vw,32px); }
        .pf-show-head { margin-bottom: clamp(18px,2.2vw,26px); }
        .pf-show-meta { display: inline-block; margin-top: 8px; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--red); }
        .pf-show-imgs { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(16px,2vw,24px); }
        .pf-show-imgs--3 { grid-template-columns: 1fr 1fr 1fr; }
        .pf-world { display: flex; gap: 18px; align-items: flex-start; border: 1px solid var(--border); background: var(--surface); padding: clamp(22px,3vw,34px); }
        @media (max-width: 900px) {
          .pf-hero { grid-template-columns: 1fr; }
          .pf-grid { grid-template-columns: 1fr; }
          .pf-detail-grid { grid-template-columns: 1fr; }
          .pf-show-imgs, .pf-show-imgs--3 { grid-template-columns: 1fr; }
        }
      ` }} />
    </>
  );
}
