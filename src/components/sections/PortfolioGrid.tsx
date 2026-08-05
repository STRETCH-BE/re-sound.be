'use client';

// Client-side filterable portfolio grid. Filter buttons switch the active
// category; the grid re-renders from the static project list. Pure client
// state, no data fetching.
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { projects, projectFilters } from '@/lib/content';
import Placeholder from '@/components/ui/Placeholder';

export default function PortfolioGrid() {
  const t = useTranslations('inspirationPage');
  const tpc = useTranslations('projectCards');
  const tpr = useTranslations('projects');
  const title = (slug: string, fallback: string) =>
    (tpr.raw(slug) as { title?: string } | undefined)?.title ?? fallback;
  const cat = (c: string) => (tpc.has(`cats.${c}`) ? tpc(`cats.${c}`) : c);
  const meta = (slug: string, m: string) => (tpc.has(`metas.${slug}`) ? tpc(`metas.${slug}`) : m);
  const [active, setActive] = useState('all');

  const shown = useMemo(
    () => (active === 'all' ? projects : projects.filter((p) => p.key === active)),
    [active],
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 'clamp(28px,3vw,40px)' }}>
        <div role="tablist" aria-label={t('filterAria')} style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {projectFilters.map((f, fi) => {
            const on = active === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={on}
                onClick={() => setActive(f.key)}
                style={{
                  font: 'inherit',
                  cursor: 'pointer',
                  fontSize: 12.5,
                  fontWeight: 700,
                  letterSpacing: '.04em',
                  textTransform: 'uppercase',
                  padding: '9px 16px',
                  border: on ? '1px solid var(--black)' : '1px solid var(--border)',
                  background: on ? 'var(--black)' : '#fff',
                  color: on ? '#fff' : 'var(--text-muted)',
                  transition: 'all .15s',
                }}
              >
                {t(`filters.${fi}`)}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
          {t('showing', { count: shown.length })}
        </span>
      </div>

      <div className="pf-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {shown.map((p) => (
          <Link
            key={p.slug}
            href={`/inspiration/${p.slug}`}
            className="zoom-wrap pf-card"
            style={{ display: 'block', margin: 0, border: '1px solid var(--border)', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ overflow: 'hidden' }}>
              <Placeholder
              label={`${title(p.slug, p.title)} — ${cat(p.cat)}`}
              src={p.image}
              alt={`${title(p.slug, p.title)} — ${cat(p.cat)}`}
              sizes="(max-width: 980px) 50vw, 25vw"
              light
              ratio="4/3"
              className="zoom-img"
            />
            </div>
            <div style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 9 }}>{cat(p.cat)}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-.01em', margin: '0 0 5px' }}>{title(p.slug, p.title)}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-faint)' }}>{meta(p.slug, p.meta)}</div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 860px) { .pf-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 540px) { .pf-grid { grid-template-columns: 1fr !important; } }
      ` }} />
    </div>
  );
}
