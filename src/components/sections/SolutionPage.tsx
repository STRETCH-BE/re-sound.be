// Shared product ("solution") page body. Mirrors the Solution Page mockup:
// breadcrumb → hero (chips + dual CTA) → highlights → alternating feature rows
// → dark datasheet → colour swatches → applications → related → red CTA.
// Server component; the quote/samples CTAs are the client ModalButton/-TextLink.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowDown } from 'lucide-react';
import Placeholder from '@/components/ui/Placeholder';
import { ModalButton, ModalTextLink } from '@/components/ui/ModalButton';
import { getProduct, type Product } from '@/lib/products';
import { localizeProduct, type CatalogEntry } from '@/lib/localize-product';
import { productImage, pimg } from '@/lib/product-images';
import ColourChart from '@/components/sections/ColourChart';

// Renders a colour name as a real swatch background (solid colour or a gradient
// for translucent/RGB/print/custom finishes). Light tones get a hairline border
// so they're visible on white.
function swatch(name: string): { background: string; border: string } {
  const map: Record<string, string> = {
    white: '#ffffff',
    'off-white': '#f3efe6',
    'satin white': '#efece5',
    'warm white': '#f7efdc',
    'light grey': '#d2d3d1',
    grey: '#9c9d9a',
    anthracite: '#36383a',
    sand: '#d9c4a0',
    'black gloss': '#0b0b0b',
    translucent: 'linear-gradient(135deg,#ffffff,#e6eef3)',
    'translucent white': 'linear-gradient(135deg,#ffffff,#e7eff4)',
    rgb: 'linear-gradient(135deg,#ff0040,#ffd400 35%,#00d4ff 70%,#b000ff)',
    'starry sky': 'radial-gradient(circle at 32% 30%,#1b2a4a,#0a1326)',
    'custom print': 'linear-gradient(135deg,#ff5a5f,#ffb400 40%,#3ad29f 75%,#3a7bd5)',
    custom: 'linear-gradient(135deg,#c9c5be,#7d7a74)',
    'custom ral': 'conic-gradient(from 0deg,#ff0000,#ffb400,#3ad29f,#3a7bd5,#b000ff,#ff0000)',
  };
  const bg = map[name.toLowerCase()] ?? '#e2ded7';
  const lightTones = ['#ffffff', '#f3efe6', '#efece5', '#f7efdc', '#d2d3d1'];
  return { background: bg, border: lightTones.includes(bg) ? '1px solid var(--border-input)' : '1px solid rgba(0,0,0,.06)' };
}

export default function SolutionPage({ product: baseProduct }: { product: Product }) {
  const t = useTranslations('productPage');
  const tc = useTranslations('catalog');
  const tCol = useTranslations('colourNames');
  const product = localizeProduct(baseProduct, tc.raw(baseProduct.key) as CatalogEntry);
  const imgs = productImage(product.slug);
  const related = product.related
    .map((slug) => getProduct(slug))
    .filter((p): p is Product => Boolean(p))
    .map((p) => localizeProduct(p, tc.raw(p.key) as CatalogEntry));
  // Colour names double as swatch-lookup keys, so translate only at render time.
  const colourLabel = (name: string) => (tCol.has(name) ? tCol(name) : name);

  return (
    <article>
      {/* ---------- Hero ---------- */}
      <section className="container" style={{ padding: 'clamp(24px,3vw,36px) 0 clamp(40px,5vw,72px)' }}>
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 'clamp(26px,3vw,40px)' }}>
          <Link href="/" className="lnk" style={{ textDecoration: 'none' }}>{t('home')}</Link>
          <span>/</span>
          <Link href="/products" className="lnk" style={{ textDecoration: 'none' }}>{t('solutions')}</Link>
          <span>/</span>
          <span style={{ color: 'var(--red)' }}>{product.short}</span>
        </nav>

        <div className="sp-hero" style={{ display: 'grid', gridTemplateColumns: '1.02fr 1.18fr', gap: 'clamp(28px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#fff', background: 'var(--red)', padding: '7px 13px' }}>{product.mount}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--black)', border: '1.5px solid var(--border-input)', padding: '7px 13px' }}>{product.category}</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(40px,5.6vw,82px)', lineHeight: 0.9, letterSpacing: '-.03em', textTransform: 'uppercase', margin: '0 0 24px', color: 'var(--black)' }}>
              {product.name}
            </h1>
            <p style={{ fontSize: 'clamp(16px,1.3vw,19px)', lineHeight: 1.55, color: 'var(--text-body)', maxWidth: 480, margin: '0 0 28px' }}>
              {product.intro}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 30 }}>
              {product.chips.map((chip) => (
                <span key={chip} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600, border: '1px solid var(--border)', padding: '9px 14px' }}>
                  <span style={{ width: 7, height: 7, background: 'var(--red)' }} />
                  {chip}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <ModalButton type="quote" source={`product_${product.key}`} product={product.name} trackQuote className="btn btn--primary">
                {t('quote')} <ArrowRight size={16} />
              </ModalButton>
              <a href="#specs" className="btn btn--ghost">
                {t('viewSpecs')} <ArrowRight size={16} className="btn__arrow" />
              </a>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <Placeholder
              label={`${product.name} hero photo`}
              src={pimg(imgs.hero, '4/3.2').src}
              alt={`${product.name} — STRETCH`}
              priority
              sizes="(max-width: 860px) 100vw, 55vw"
              ratio={pimg(imgs.hero, '4/3.2').ratio}
              fit={pimg(imgs.hero, '4/3.2').fit}
              bg={pimg(imgs.hero, '4/3.2').bg}
            />
            <div style={{ position: 'absolute', left: -1, bottom: -1, background: 'var(--black)', color: '#fff', padding: '13px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase' }}>
              {t('systemTag', { name: product.short })}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Highlights ---------- */}
      <section className="container" style={{ padding: '0 0 clamp(50px,6vw,90px)' }}>
        <div className="sp-highlights" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)' }}>
          {product.highlights.map((h) => (
            <div key={h.label} style={{ background: '#fff', padding: '28px 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(30px,3.4vw,46px)', lineHeight: 1, letterSpacing: '-.03em' }}>{h.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted-2)', marginTop: 10 }}>{h.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="container" style={{ padding: '0 0 clamp(50px,6vw,90px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 'clamp(36px,4vw,52px)' }}>
          <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>(01)</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('inDetail')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(40px,5vw,76px)' }}>
          {product.features.map((feat, i) => {
            const f = pimg(imgs.features[i], '16/11');
            return (
              <div key={feat.title} className={`sp-featrow${i % 2 === 1 ? ' sp-featrow--rev' : ''}`}>
                <div style={{ flex: 1.1, minWidth: 0 }}>
                  <Placeholder
                    label={`${feat.title} — ${product.short}`}
                    src={f.src}
                    alt={`${product.short} — ${feat.title}`}
                    sizes="(max-width: 860px) 100vw, 50vw"
                    fit={f.fit}
                    bg={f.bg}
                    light
                    ratio={f.ratio}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(26px,3vw,40px)', lineHeight: 0.98, letterSpacing: '-.02em', textTransform: 'uppercase', margin: '0 0 18px' }}>{feat.title}</h3>
                  <p style={{ fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 460, margin: 0 }}>{feat.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Datasheet ---------- */}
      <section id="specs" className="section--dark">
        <div className="container section">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(36px,4vw,56px)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
                <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>(02)</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--on-dark-faint)' }}>{t('specsEyebrow')}</span>
              </div>
              <h2 className="h2">{t('specsTitle')}<span className="accent">.</span></h2>
            </div>
            <ModalButton type="quote" source={`product_${product.key}_spec`} product={product.name} className="btn btn--ghost-light">
              {t('downloadSpec')} <ArrowDown size={15} />
            </ModalButton>
          </div>
          <div className="sp-specs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 clamp(32px,5vw,80px)' }}>
            {product.specs.map((sp) => (
              <div key={sp.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, padding: '18px 0', borderBottom: '1px solid var(--line-dark)' }}>
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{sp.k}</span>
                <span style={{ fontSize: 15.5, fontWeight: 600, textAlign: 'right' }}>{sp.v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Colours ---------- */}
      <section className="container section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 'clamp(30px,3vw,44px)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
              <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>(03)</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('coloursEyebrow')}</span>
            </div>
            <h2 className="h2 h2--sm">{t('coloursTitle')}<span className="accent">.</span></h2>
          </div>
          <div style={{ maxWidth: 340 }}>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 18px' }}>
              {t('coloursNote')}
            </p>
            <ModalButton type="samples" source={`product_${product.key}_colours`} product={product.name} className="btn btn--ghost btn--sm">
              {t('requestSamples')} <ArrowRight size={14} className="btn__arrow" />
            </ModalButton>
          </div>
        </div>
        {product.colourChart ? (
          <ColourChart
            entries={product.colourChart.map((c) => ({
              ...c,
              name: colourLabel(c.name),
              finish: c.finish ? colourLabel(c.finish) : c.finish,
            }))}
            note={product.colourChartNote}
          />
        ) : (
          <div className="sp-colours" style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
            {product.colours.map((col) => {
              const sw = swatch(col);
              return (
                <div key={col}>
                  <div
                    role="img"
                    aria-label={colourLabel(col)}
                    style={{ aspectRatio: '1/1', background: sw.background, border: sw.border }}
                  />
                  <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 10 }}>{colourLabel(col)}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- Applications ---------- */}
      <section className="section--surface">
        <div className="container section--sm">
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 26 }}>
            <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>(04)</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('appsEyebrow')}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {product.applications.map((app) => (
              <span key={app} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(16px,1.6vw,22px)', letterSpacing: '-.01em', background: '#fff', border: '1px solid var(--border-2)', padding: '14px 22px' }}>
                {app}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Related ---------- */}
      {related.length > 0 && (
        <section className="container section">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 'clamp(30px,3vw,44px)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
                <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>(05)</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{t('relatedEyebrow')}</span>
              </div>
              <h2 className="h2 h2--sm">{t('relatedTitle')}<span className="accent">.</span></h2>
            </div>
            <Link href="/products" className="lnk" style={{ fontWeight: 700, fontSize: 13.5, letterSpacing: '.05em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              {t('allSolutions')} <span style={{ color: 'var(--red)' }}>→</span>
            </Link>
          </div>
          <div className="sp-related" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {related.map((rel) => (
              <Link key={rel.slug} href={`/products/${rel.slug}`} className="zoom-wrap" style={{ border: '1px solid var(--border)', textDecoration: 'none', display: 'block' }}>
                <div style={{ overflow: 'hidden' }}>
                  <Placeholder
                    label={`${rel.name}`}
                    src={pimg(productImage(rel.slug).hero, '16/10').src}
                    alt={rel.name}
                    sizes="(max-width: 860px) 100vw, 30vw"
                    light
                    ratio="16/10"
                    className="zoom-img"
                    decorative
                  />
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 10 }}>{rel.mount}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, letterSpacing: '-.01em', margin: '0 0 8px' }}>{rel.short}</h3>
                  <div style={{ fontSize: 13.5, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {rel.category} <span style={{ color: 'var(--red)' }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- CTA ---------- */}
      <section id="quote" className="section--red">
        <div className="container section" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 13, marginBottom: 24 }}>
            <span style={{ width: 34, height: 2, background: '#fff' }} />
            <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#fff' }}>{t('ctaKicker')}</span>
            <span style={{ width: 34, height: 2, background: '#fff' }} />
          </div>
          <h2 className="h2" style={{ color: '#fff', margin: '0 0 30px' }}>{t('ctaTitle')}<span style={{ color: 'var(--black)' }}>?</span></h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
            <ModalButton type="quote" source={`product_${product.key}_cta`} product={product.name} trackQuote className="btn btn--dark">
              {t('quote')} <ArrowRight size={16} />
            </ModalButton>
            <Link href="/contact" className="btn btn--ghost-light">
              {t('dealer')}
            </Link>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .sp-featrow { display: flex; align-items: center; gap: clamp(28px,4vw,60px); }
        .sp-featrow--rev { flex-direction: row-reverse; }
        @media (max-width: 860px) {
          .sp-hero { grid-template-columns: 1fr !important; }
          .sp-featrow, .sp-featrow--rev { flex-direction: column !important; }
          .sp-specs { grid-template-columns: 1fr !important; }
          .sp-related { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          .sp-highlights { grid-template-columns: 1fr 1fr !important; }
          .sp-colours { grid-template-columns: repeat(3,1fr) !important; }
        }
      ` }} />
    </article>
  );
}
