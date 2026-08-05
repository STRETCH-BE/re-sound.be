// Technical hub page body. Left rail lists the six topics for the membrane;
// the right column renders the active topic. Datasheet/Colours/FAQ reuse product
// data; Fire safety/Installation/Specification come from technical.ts.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { ModalButton } from '@/components/ui/ModalButton';
import ColourChart from '@/components/sections/ColourChart';
import { getProduct } from '@/lib/products';
import { localizeProduct, type CatalogEntry } from '@/lib/localize-product';
import { localizeTechMembrane, type TechMembraneMessages } from '@/lib/localize-content';
import type { Faq } from '@/lib/content';
import {
  techTopics,
  techMembranes,
  type TechMembraneKey,
  type TechTopicKey,
} from '@/lib/technical';

export default function TechnicalPage({
  membrane,
  topic,
}: {
  membrane: TechMembraneKey;
  topic: TechTopicKey;
}) {
  const tt = useTranslations('technical');
  const t = useTranslations('techPage');
  const tc = useTranslations('catalog');
  const tp = useTranslations('productPage');
  const tf = useTranslations('catalogFaqs');
  const tCol = useTranslations('colourNames');
  const m = localizeTechMembrane(techMembranes[membrane], tt.raw(membrane) as TechMembraneMessages);
  const baseProduct = getProduct(m.productSlug);
  const product = baseProduct ? localizeProduct(baseProduct, tc.raw(baseProduct.key) as CatalogEntry) : undefined;
  const faqs = baseProduct ? ((tf.raw(baseProduct.key) as Faq[] | undefined) ?? baseProduct.faqs) : [];
  const colourLabel = (name: string) => (tCol.has(name) ? tCol(name) : name);
  const topicIdx = techTopics.findIndex((x) => x.key === topic);
  const topicLabel = tt(`topics.${topicIdx}.label`);

  return (
    <article className="container" style={{ padding: 'clamp(20px,3vw,32px) 0 clamp(50px,6vw,90px)' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: 'clamp(22px,3vw,34px)' }}>
        <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>
          <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{tp('home')}</Link></li>
          <li aria-hidden>/</li>
          <li>{t('crumbTechnical')}</li>
          <li aria-hidden>/</li>
          <li><Link href={`/technical/${m.key}/datasheet`} style={{ color: 'inherit', textDecoration: 'none' }}>{m.short}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" style={{ color: 'var(--red)' }}>{topicLabel}</li>
        </ol>
      </nav>

      <div className="tech-grid">
        {/* Side nav */}
        <aside className="tech-rail">
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 16 }}>{m.label}</div>
          <nav>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {techTopics.map((topicItem, i) => {
                const active = topicItem.key === topic;
                return (
                  <li key={topicItem.key}>
                    <Link
                      href={`/technical/${m.key}/${topicItem.key}`}
                      className="tech-link"
                      style={{
                        borderLeft: active ? '2px solid var(--red)' : '2px solid transparent',
                        background: active ? 'var(--surface)' : 'transparent',
                        color: active ? 'var(--text)' : 'var(--text-muted)',
                        fontWeight: active ? 700 : 500,
                      }}
                      aria-current={active ? 'page' : undefined}
                    >
                      {tt(`topics.${i}.label`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <Link href={`/products/${m.productSlug}`} className="btn btn--ghost btn--sm" style={{ marginTop: 22 }}>
            {t('viewProduct')} <ArrowRight size={14} />
          </Link>
        </aside>

        {/* Content */}
        <div className="tech-body" style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 16 }}>
            <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 13, letterSpacing: '.16em' }}>{t('eyebrowTech')}</span>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{m.short}</span>
          </div>
          <h1 className="h2" style={{ margin: '0 0 14px' }}>{topicLabel}<span className="accent">.</span></h1>
          <p className="lead" style={{ maxWidth: 620, margin: '0 0 clamp(28px,3.4vw,44px)' }}>{m.blurb}</p>

          {topic === 'datasheet' && product && (
            <>
              <div className="tech-specs">
                {product.specs.map((sp) => (
                  <div key={sp.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{sp.k}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 600, textAlign: 'right' }}>{sp.v}</span>
                  </div>
                ))}
              </div>
              <ModalButton type="quote" source={`technical_${m.key}_datasheet`} product={product.name} className="btn btn--primary" >
                {t('datasheetCta')} <ArrowDown size={15} />
              </ModalButton>
            </>
          )}

          {topic === 'colours' && product?.colourChart && (
            <>
              <ColourChart
                entries={product.colourChart.map((c) => ({
                  ...c,
                  name: colourLabel(c.name),
                  finish: c.finish ? colourLabel(c.finish) : c.finish,
                }))}
                note={product.colourChartNote}
              />
              <div style={{ marginTop: 28 }}>
                <ModalButton type="samples" source={`technical_${m.key}_colours`} product={product.name} className="btn btn--ghost btn--sm">
                  {t('samplesCta')} <ArrowRight size={14} />
                </ModalButton>
              </div>
            </>
          )}

          {topic === 'fire-safety' && (
            <>
              <p style={{ fontSize: 'clamp(15px,1.5vw,17px)', lineHeight: 1.65, color: 'var(--text-muted)', margin: '0 0 28px', maxWidth: 680 }}>{m.fireSafety.intro}</p>
              <div className="tech-specs" style={{ marginBottom: 32 }}>
                {m.fireSafety.rows.map((r) => (
                  <div key={r.k} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, padding: '15px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>{r.k}</span>
                    <span style={{ fontSize: 15.5, fontWeight: 700, textAlign: 'right' }}>{r.v}</span>
                  </div>
                ))}
              </div>
              {m.fireSafety.body.map((p, i) => (
                <p key={i} style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-muted)', margin: '0 0 16px', maxWidth: 680 }}>{p}</p>
              ))}
            </>
          )}

          {topic === 'installation' && (
            <>
              <p style={{ fontSize: 'clamp(15px,1.5vw,17px)', lineHeight: 1.65, color: 'var(--text-muted)', margin: '0 0 clamp(26px,3vw,38px)', maxWidth: 680 }}>{m.installation.intro}</p>
              <ol style={{ listStyle: 'none', margin: 0, padding: 0, counterReset: 'step' }}>
                {m.installation.steps.map((s) => (
                  <li key={s.title} className="tech-step">
                    <div className="tech-step-n" aria-hidden>{String(m.installation.steps.indexOf(s) + 1).padStart(2, '0')}</div>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(17px,1.8vw,21px)', letterSpacing: '-.01em', margin: '0 0 7px' }}>{s.title}</h2>
                      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {topic === 'specification' && (
            <>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-muted)', margin: '0 0 22px', maxWidth: 680 }}>{m.specification.intro}</p>
              <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: 'clamp(20px,2.6vw,30px)', fontSize: 15, lineHeight: 1.75, color: 'var(--text)', maxWidth: 720 }}>
                {m.specification.clause}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-faint-2)', margin: '14px 0 0' }}>{t('copyHint')}</p>
            </>
          )}

          {topic === 'faq' && product && (
            <div style={{ maxWidth: 760 }}>
              {faqs.map((f) => (
                <div key={f.q} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(16px,1.7vw,20px)', letterSpacing: '-.01em', margin: '0 0 9px' }}>{f.q}</h2>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>{f.a}</p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ background: 'var(--black)', padding: 'clamp(26px,3.4vw,44px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginTop: 'clamp(40px,5vw,64px)' }}>
            <div>
              <h2 className="h2 h2--sm" style={{ color: '#fff', fontSize: 'clamp(22px,2.6vw,30px)', margin: '0 0 8px' }}>{t('ctaTitle')}</h2>
              <p style={{ color: 'var(--on-dark-muted)', fontSize: 14.5, lineHeight: 1.55, margin: 0, maxWidth: 460 }}>{t('ctaBody')}</p>
            </div>
            <ModalButton type="quote" source={`technical_${m.key}_${topic}_cta`} product={m.label} className="btn btn--primary">
              {t('ctaBtn')} <ArrowRight size={16} />
            </ModalButton>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tech-grid { display: grid; grid-template-columns: 232px 1fr; gap: clamp(28px,4vw,64px); align-items: start; }
        .tech-rail { position: sticky; top: 96px; }
        .tech-link { display: block; padding: 9px 14px; font-size: 14px; text-decoration: none; line-height: 1.3; }
        .tech-link:hover { background: var(--surface); color: var(--text); }
        .tech-step { display: grid; grid-template-columns: 56px 1fr; gap: 6px; padding: 0 0 clamp(22px,2.6vw,30px); }
        .tech-step-n { font-family: var(--font-display); font-weight: 800; font-size: 22px; color: var(--red); line-height: 1; }
        @media (max-width: 860px) {
          .tech-grid { grid-template-columns: 1fr; }
          .tech-rail { position: static; border-bottom: 1px solid var(--border); padding-bottom: 18px; margin-bottom: 6px; }
        }
      ` }} />
    </article>
  );
}
