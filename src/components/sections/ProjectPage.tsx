// Project detail page body for /inspiration/[slug]. Mirrors the depth of the
// old project pages: story hook + narrative, highlight callouts, products &
// materials, a fact sheet (region/year/area/architect/dealer), gallery, and a
// project-specific FAQ. All rich fields are optional and degrade gracefully.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Placeholder from '@/components/ui/Placeholder';
import { ModalButton } from '@/components/ui/ModalButton';
import { getProduct } from '@/lib/products';
import type { Project } from '@/lib/content';

export default function ProjectPage({ project }: { project: Project }) {
  const t = useTranslations('projectPage');
  const tp = useTranslations('productPage');
  const tc = useTranslations('catalog');
  const tpc = useTranslations('projectCards');
  const cat = tpc.has(`cats.${project.cat}`) ? tpc(`cats.${project.cat}`) : project.cat;
  const meta = tpc.has(`metas.${project.slug}`) ? tpc(`metas.${project.slug}`) : project.meta;
  const solutions = (project.solutions ?? [])
    .map((slug) => {
      const p = getProduct(slug);
      return p ? { slug, name: (tc.raw(p.key) as { name?: string } | undefined)?.name ?? p.name } : null;
    })
    .filter((x): x is { slug: string; name: string } => x !== null);

  const gallery = project.gallery ?? [];
  const facts = project.facts ?? [];
  const highlights = project.highlights ?? [];
  const materials = project.materials ?? [];
  const faqs = project.faqs ?? [];
  const lead = project.hook ?? project.summary;
  const hasSidebar = facts.length > 0 || solutions.length > 0;

  return (
    <article className="container" style={{ padding: 'clamp(20px,3vw,32px) 0 clamp(50px,6vw,90px)' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: 'clamp(20px,2.6vw,30px)' }}>
        <ol style={{ listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>
          <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{tp('home')}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href="/inspiration" style={{ color: 'inherit', textDecoration: 'none' }}>{t('crumbInspiration')}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" style={{ color: 'var(--red)' }}>{project.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <div style={{ maxWidth: 820, marginBottom: 'clamp(24px,3vw,38px)' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 12 }}>{cat}</div>
        <h1 className="h1" style={{ fontSize: 'clamp(34px,6vw,72px)', lineHeight: 0.98, margin: '0 0 16px' }}>{project.title}<span className="accent">.</span></h1>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: lead ? 16 : 0 }}>{meta}</div>
        {lead && <p className="lead" style={{ margin: 0 }}>{lead}</p>}
      </div>

      {/* Hero image */}
      <div style={{ border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 'clamp(34px,4vw,56px)' }}>
        <Placeholder
          label={`${project.title} — ${cat}`}
          src={project.image}
          alt={`${project.title} — ${cat}`}
          priority
          sizes="100vw"
          ratio="16/9"
          light
        />
      </div>

      {/* Body + sidebar */}
      <div className={hasSidebar ? 'pj-grid' : 'pj-grid pj-grid--full'}>
        <div style={{ minWidth: 0 }}>
          {(project.description ?? []).map((para, i) => (
            <p key={i} style={{ fontSize: 'clamp(15px,1.5vw,17px)', lineHeight: 1.7, color: 'var(--text-muted)', margin: '0 0 18px' }}>{para}</p>
          ))}

          {highlights.length > 0 && (
            <div className="pj-highlights" style={{ margin: 'clamp(26px,3vw,38px) 0 0' }}>
              {highlights.map((h) => (
                <div key={h} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '13px 16px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <Check size={16} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{h}</span>
                </div>
              ))}
            </div>
          )}

          {materials.length > 0 && (
            <div style={{ marginTop: 'clamp(30px,3.4vw,44px)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(18px,2vw,24px)', letterSpacing: '-.01em', margin: '0 0 16px' }}>{t('materialsTitle')}</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid var(--border)' }}>
                {materials.map((m) => (
                  <li key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 2px', borderBottom: '1px solid var(--border)', fontSize: 14.5, lineHeight: 1.5 }}>
                    <span aria-hidden style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', flexShrink: 0, marginTop: 8 }} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {hasSidebar && (
          <aside className="pj-aside">
            {facts.length > 0 && (
              <div style={{ border: '1px solid var(--border)', background: 'var(--surface)', padding: '6px 18px 18px', marginBottom: 24 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-faint-2)', padding: '16px 0 6px' }}>{t('detailsTitle')}</div>
                <dl style={{ margin: 0 }}>
                  {facts.map((f) => (
                    <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '11px 0', borderTop: '1px solid var(--border)' }}>
                      <dt style={{ fontSize: 13, color: 'var(--text-faint-2)', flexShrink: 0 }}>{f.label}</dt>
                      <dd style={{ margin: 0, fontSize: 13.5, fontWeight: 600, textAlign: 'right' }}>
                        {f.href ? (
                          <a href={f.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', textDecoration: 'none' }}>{f.value}</a>
                        ) : f.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {solutions.length > 0 && (
              <>
                <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 12 }}>{t('solutionsUsed')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {solutions.map((s) => (
                    <Link key={s.slug} href={`/products/${s.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 15px', border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', fontSize: 14, fontWeight: 600 }}>
                      {s.name} <ArrowRight size={14} style={{ color: 'var(--red)', flexShrink: 0 }} />
                    </Link>
                  ))}
                </div>
              </>
            )}

            <ModalButton type="quote" source={`project_${project.slug}`} product={project.title} className="btn btn--primary" style={{ width: '100%', justifyContent: 'center' }}>
              {t('similarCta')} <ArrowRight size={15} />
            </ModalButton>
          </aside>
        )}
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section style={{ marginTop: 'clamp(46px,5vw,72px)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-faint-2)', marginBottom: 18 }}>{t('gallery')}</div>
          <div className="pj-gallery">
            {gallery.map((src, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
                <Placeholder label={`${project.title} — ${t('photo')} ${i + 1}`} src={src} alt={`${project.title} — ${t('photo')} ${i + 1}`} sizes="(max-width: 760px) 100vw, 33vw" ratio="4/3" light />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Project FAQ */}
      {faqs.length > 0 && (
        <section style={{ marginTop: 'clamp(46px,5vw,72px)', maxWidth: 820 }}>
          <h2 className="h2 h2--sm" style={{ fontSize: 'clamp(22px,2.6vw,30px)', margin: '0 0 clamp(18px,2vw,26px)' }}>{t('faqTitle')}<span className="accent">.</span></h2>
          <div>
            {faqs.map((f) => (
              <div key={f.q} style={{ padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(16px,1.7vw,19px)', letterSpacing: '-.01em', margin: '0 0 9px' }}>{f.q}</h3>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Back + CTA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 'clamp(46px,5vw,72px)', paddingTop: 'clamp(28px,3vw,40px)', borderTop: '1px solid var(--border)' }}>
        <Link href="/inspiration" className="btn btn--ghost btn--sm"><ArrowLeft size={14} /> {t('allProjects')}</Link>
        <Link href="/products" className="btn btn--ghost btn--sm">{t('exploreSolutions')} <ArrowRight size={14} /></Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pj-grid { display: grid; grid-template-columns: 1fr 300px; gap: clamp(28px,4vw,56px); align-items: start; }
        .pj-grid--full { grid-template-columns: 1fr; max-width: 820px; }
        .pj-aside { position: sticky; top: 96px; }
        .pj-highlights { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .pj-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        @media (max-width: 760px) {
          .pj-grid { grid-template-columns: 1fr; }
          .pj-aside { position: static; }
          .pj-highlights { grid-template-columns: 1fr; }
          .pj-gallery { grid-template-columns: 1fr 1fr; }
        }
      ` }} />
    </article>
  );
}
