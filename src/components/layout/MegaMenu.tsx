'use client';

// Rich three-panel mega menu (icon category rail → live item list → promo card),
// matching the homepage mockup. Used for both the Solutions and Technical nav
// items. Hovering/focusing a category in the rail swaps the middle list; every
// link points to a real page (product pages, #spec anchors, guides, samples).
import { useState } from 'react';
import {
  Layers,
  AudioLines,
  Lightbulb,
  LayoutGrid,
  Home,
  Circle,
  Square,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ModalButton } from '@/components/ui/ModalButton';
import Placeholder from '@/components/ui/Placeholder';

export type MegaItem = { title: string; sub: string; href: string; soon?: boolean };
export type MegaCategory = { icon: LucideIcon; title: string; desc: string; href: string; items: MegaItem[] };

type ImagePromo = { kind: 'image'; title: string; body?: string; ctaLabel: string; source?: string; ctaHref?: string; image?: string };
type DarkPromo = { kind: 'dark'; eyebrow: string; title: string; body: string; ctaLabel: string; ctaHref: string };

export type MegaConfig = {
  railLabel: string;
  allLabel: string;
  allHref: string;
  categories: MegaCategory[];
  promo: ImagePromo | DarkPromo;
};

// Structure (icons, hrefs, flags) lives here; every label comes from the
// `megaMenu` messages namespace, keyed by category/item index.
type Skeleton = { icon: LucideIcon; href: string; items: { href: string; soon?: boolean }[] }[];

const SOLUTIONS_SKELETON: Skeleton = [
  {
    icon: Layers,
    href: '/products',
    items: [
      { href: '/products/polyester-stretch-ceiling' },
      { href: '/products/pvc-stretch-ceiling' },
      { href: '/products/prefab-ceiling-unit', soon: true },
      { href: '/products' },
    ],
  },
  {
    icon: AudioLines,
    href: '/products/acoustic-stretch-system',
    items: [
      { href: '/products/acoustic-stretch-system' },
      { href: '/blog/stretch-ceiling-acoustics-explained' },
      { href: '/datasheets' },
    ],
  },
  {
    icon: Lightbulb,
    href: '/products/light-print-stretch-ceiling',
    items: [
      { href: '/products/light-print-stretch-ceiling' },
      { href: '/products/starry-sky' },
      { href: '/products/custom-print' },
    ],
  },
  {
    icon: LayoutGrid,
    href: '/products/prefab-ceiling-unit',
    items: [
      { href: '/products/prefab-ceiling-unit' },
      { href: '/products/prefab-lighting-elements' },
      { href: '/products/inspection-hatch' },
    ],
  },
  {
    icon: Home,
    href: '/inspiration',
    items: [
      { href: '/applications/living-cinema' },
      { href: '/applications/bathroom-kitchen' },
      { href: '/applications/office-retail' },
      { href: '/inspiration' },
    ],
  },
];

const TECHNICAL_SKELETON: Skeleton = [
  {
    icon: Circle,
    href: '/technical/polyester/datasheet',
    items: [
      { href: '/technical/polyester/datasheet' },
      { href: '/technical/polyester/colours' },
      { href: '/technical/polyester/fire-safety' },
      { href: '/technical/polyester/installation' },
      { href: '/technical/polyester/specification' },
      { href: '/technical/polyester/faq' },
    ],
  },
  {
    icon: Square,
    href: '/technical/pvc/datasheet',
    items: [
      { href: '/technical/pvc/datasheet' },
      { href: '/technical/pvc/colours' },
      { href: '/technical/pvc/fire-safety' },
      { href: '/technical/pvc/installation' },
      { href: '/technical/pvc/specification' },
      { href: '/technical/pvc/faq' },
    ],
  },
];

function buildCategories(skeleton: Skeleton, t: ReturnType<typeof useTranslations>): MegaCategory[] {
  return skeleton.map((c, i) => ({
    icon: c.icon,
    href: c.href,
    title: t(`cats.${i}.title`),
    desc: t(`cats.${i}.desc`),
    items: c.items.map((item, j) => ({
      href: item.href,
      soon: item.soon,
      title: t(`cats.${i}.items.${j}.title`),
      sub: t(`cats.${i}.items.${j}.sub`),
    })),
  }));
}

// --- Solutions ------------------------------------------------------------
export function useSolutionsMenu(): MegaConfig {
  const t = useTranslations('megaMenu.solutions');
  return {
    railLabel: t('railLabel'),
    allLabel: t('allLabel'),
    allHref: '/products',
    promo: { kind: 'image', title: t('promoTitle'), ctaLabel: t('promoCta'), source: 'header_mega_solutions', image: '/images/home/Hero.jpg' },
    categories: buildCategories(SOLUTIONS_SKELETON, t),
  };
}

// --- Technical ------------------------------------------------------------
export function useTechnicalMenu(): MegaConfig {
  const t = useTranslations('megaMenu.technical');
  return {
    railLabel: t('railLabel'),
    allLabel: t('allLabel'),
    allHref: '/products',
    promo: {
      kind: 'image',
      title: t('promoTitle'),
      body: t('promoBody'),
      ctaLabel: t('promoCta'),
      ctaHref: '/contact',
      image: '/images/home/installer.jpg',
    },
    categories: buildCategories(TECHNICAL_SKELETON, t),
  };
}

export default function MegaMenu({ config, onNavigate }: { config: MegaConfig; onNavigate: () => void }) {
  const tm = useTranslations('megaMenu');
  const [active, setActive] = useState(0);
  const cat = config.categories[active] ?? config.categories[0];

  return (
    <div className="container mega-grid">
      {/* Rail */}
      <div className="mega-rail">
        <div className="mega-rail-label">{config.railLabel}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {config.categories.map((c, i) => {
            const on = i === active;
            const Icon = c.icon;
            return (
              <Link
                key={c.title}
                href={c.href}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={onNavigate}
                className="mega-cat"
                style={{
                  background: on ? 'var(--surface)' : 'transparent',
                  borderLeft: `2px solid ${on ? 'var(--red)' : 'transparent'}`,
                }}
              >
                <span className="mega-cat-ic" style={{ color: on ? 'var(--red)' : 'var(--text-faint-2)' }}>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <span>
                  <span className="mega-cat-t">{c.title}</span>
                  <span className="mega-cat-d">{c.desc}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <Link href={config.allHref} onClick={onNavigate} className="btn btn--ghost btn--sm mega-all">
          {config.allLabel} <span style={{ color: 'var(--red)' }}>→</span>
        </Link>
      </div>

      {/* Active items */}
      <div className="mega-items">
        <div className="mega-items-label">{cat.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {cat.items.map((item) => (
            <Link key={item.title} href={item.href} onClick={onNavigate} className="megaitem">
              <span className="megaitem-text">
                <span className="megaitem-t">
                  {item.title}
                  {item.soon && <span className="megaitem-soon">{tm('comingSoon')}</span>}
                </span>
                <span className="megaitem-s">{item.sub}</span>
              </span>
              <span className="megaitem-arrow" aria-hidden>→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo */}
      {config.promo.kind === 'image' ? (
        <div className="mega-promo" style={{ position: 'relative', minHeight: 300, overflow: 'hidden' }}>
          <Placeholder
            label="Featured ceiling"
            src={config.promo.image}
            alt={config.promo.title}
            sizes="360px"
            style={{ position: 'absolute', inset: 0, height: '100%' }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 22, background: 'linear-gradient(to top, rgba(0,0,0,.78), rgba(0,0,0,0))' }}>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, lineHeight: 1.05, marginBottom: config.promo.body ? 8 : 11 }}>
              {config.promo.title}
            </div>
            {config.promo.body && (
              <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 12.5, lineHeight: 1.5, margin: '0 0 14px' }}>
                {config.promo.body}
              </p>
            )}
            {config.promo.ctaHref ? (
              <Link href={config.promo.ctaHref} onClick={onNavigate} className="mega-promo-cta">
                {config.promo.ctaLabel} <span style={{ color: 'var(--red)' }}>→</span>
              </Link>
            ) : (
              <ModalButton type="quote" source={config.promo.source ?? 'header_mega'} trackQuote className="mega-promo-cta">
                {config.promo.ctaLabel} <span style={{ color: 'var(--red)' }}>→</span>
              </ModalButton>
            )}
          </div>
        </div>
      ) : (
        <div className="mega-promo" style={{ position: 'relative', minHeight: 300, background: 'var(--black)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--red)' }}>
            {config.promo.eyebrow}
          </div>
          <div>
            <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, lineHeight: 1.05, marginBottom: 10 }}>
              {config.promo.title}
            </div>
            <p style={{ color: 'var(--on-dark-muted)', fontSize: 13, lineHeight: 1.55, margin: '0 0 16px' }}>{config.promo.body}</p>
            <Link href={config.promo.ctaHref} onClick={onNavigate} className="mega-promo-cta">
              {config.promo.ctaLabel} <span style={{ color: 'var(--red)' }}>→</span>
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        .mega-grid {
          padding: clamp(22px, 2.6vw, 34px) var(--gutter);
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr) 330px;
          gap: clamp(20px, 2.6vw, 44px);
        }
        .mega-rail {
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border);
          padding-right: 22px;
        }
        .mega-rail-label,
        .mega-items-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 0 16px 12px;
        }
        .mega-rail-label {
          color: var(--text-faint-2);
        }
        .mega-items-label {
          color: var(--red);
          padding: 2px 0 16px 14px;
        }
        .mega-cat {
          display: flex;
          gap: 15px;
          align-items: flex-start;
          padding: 12px 16px;
          text-decoration: none;
          transition: background 0.15s ease;
        }
        .mega-cat-ic {
          display: inline-flex;
          margin-top: 1px;
          transition: color 0.15s ease;
        }
        .mega-cat-t {
          display: block;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.005em;
          color: var(--black);
        }
        .mega-cat-d {
          display: block;
          font-size: 12.5px;
          color: var(--text-faint);
          margin-top: 2px;
        }
        .mega-all {
          margin-top: 16px;
          width: 100%;
          justify-content: center;
        }
        .megaitem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 14px;
          border-bottom: 1px solid #f1efeb;
          text-decoration: none;
          position: relative;
          transition: background 0.15s ease, padding-left 0.15s ease;
        }
        .megaitem::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 3px;
          height: 58%;
          background: var(--red);
          transform: translateY(-50%) scaleY(0);
          transform-origin: center;
          transition: transform 0.15s ease;
        }
        .megaitem:hover {
          background: var(--surface);
          padding-left: 20px;
        }
        .megaitem:hover::before {
          transform: translateY(-50%) scaleY(1);
        }
        .megaitem-text {
          display: block;
          min-width: 0;
        }
        .megaitem-t {
          display: block;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.01em;
          color: var(--black);
          transition: color 0.15s ease;
        }
        .megaitem:hover .megaitem-t {
          color: var(--red);
        }
        .megaitem-s {
          display: block;
          font-size: 13px;
          color: var(--text-faint);
          margin-top: 3px;
        }
        .megaitem-soon {
          display: inline-block;
          margin-left: 10px;
          font-family: var(--font-body);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--red);
          background: rgba(255, 0, 0, 0.09);
          padding: 3px 7px;
          vertical-align: middle;
          position: relative;
          top: -2px;
          white-space: nowrap;
        }
        .megaitem-arrow {
          color: var(--red);
          font-size: 17px;
          flex-shrink: 0;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.15s ease, transform 0.15s ease;
        }
        .megaitem:hover .megaitem-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .mega-promo-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          text-decoration: none;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid var(--red);
          padding: 0 0 3px;
        }
      `}</style>
    </div>
  );
}
