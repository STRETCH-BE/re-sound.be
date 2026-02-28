'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

interface Veneer {
  name: string;
  code: string;
  heroImage: string;   // full-panel image shown in the hero when selected
  swatchImage: string; // small swatch image
}

const VENEERS: Veneer[] = [
  {
    name: 'Silk Oak',
    code: 'RW-SILK',
    heroImage: '/images/products/rwood-groove/silk-oak.jpg',
    swatchImage: '/images/products/rwood-groove/swatches/silk-oak.jpg',
  },
  {
    name: 'Straw Oak',
    code: 'RW-STRAW',
    heroImage: '/images/products/rwood-groove/straw-oak.jpg',
    swatchImage: '/images/products/rwood-groove/swatches/straw-oak.jpg',
  },
  {
    name: 'Umber Oak',
    code: 'RW-UMBER',
    heroImage: '/images/products/rwood-groove/umber-oak.jpg',
    swatchImage: '/images/products/rwood-groove/swatches/umber-oak.jpg',
  },
  {
    name: 'Tobacco Walnut',
    code: 'RW-TOB',
    heroImage: '/images/products/rwood-groove/tobacco-walnut.jpg',
    swatchImage: '/images/products/rwood-groove/swatches/tobacco-walnut.jpg',
  },
  {
    name: 'Walnut',
    code: 'RW-WAL',
    heroImage: '/images/products/rwood-groove/walnut.jpg',
    swatchImage: '/images/products/rwood-groove/swatches/walnut.jpg',
  },
  {
    name: 'Ash White',
    code: 'RW-ASH',
    heroImage: '/images/products/rwood-veneer/ASH-White-1.jpg',
    swatchImage: '/images/products/rwood-veneer/ASH-White.jpg',
  },
  {
    name: 'Birch Sliced',
    code: 'RW-BIR',
    heroImage: '/images/products/rwood-veneer/Birch-Sliced.jpg',
    swatchImage: '/images/products/rwood-veneer/Birch-Sliced.jpg',
  },
  {
    name: 'Beech White',
    code: 'RW-BEECH',
    heroImage: '/images/products/rwood-veneer/Beech-White.jpg',
    swatchImage: '/images/products/rwood-veneer/Beech-White.jpg',
  },
];

// The first 5 veneers appear in the strip (groove range — they have full-panel photos)
const STRIP_VENEERS = VENEERS.slice(0, 5);

const DEFAULT_HERO = '/images/products/rwood-groove/hero-rWood-Groove.webp';

export default function RWoodShowcase() {
  const t = useTranslations('rwood');
  const [activeVeneer, setActiveVeneer] = useState<Veneer | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  const currentHero = activeVeneer?.heroImage ?? DEFAULT_HERO;
  const currentLabel = activeVeneer
    ? `${activeVeneer.code} · ${activeVeneer.name}`
    : t('floatTag');

  function selectVeneer(v: Veneer) {
    if (activeVeneer?.code === v.code) return;
    setActiveVeneer(v);
    setFadeKey((k) => k + 1); // triggers CSS fade animation
  }

  const specs = [
    { key: t('specAbsorptionKey'), val: 'αw 0.90 – 0.95' },
    { key: t('specFireKey'), val: 'B-s1,d0' },
    { key: t('specThicknessKey'), val: '40 mm' },
    { key: t('specVariantsKey'), val: t('specVariantsVal') },
    { key: t('specCoreKey'), val: t('specCoreVal') },
    { key: t('specStandardKey'), val: t('specStandardVal') },
  ];

  return (
    <section className="rwood-section">

      {/* ── HERO IMAGE + TEXT OVERLAY ── */}
      <div className="rwood-hero">

        {/* Fading image layer — key change triggers re-mount for CSS fade-in */}
        <div className="rwood-hero-img" key={fadeKey}>
          <Image
            src={currentHero}
            alt={activeVeneer ? `${activeVeneer.name} rWood acoustic panel` : 'rWood acoustic panel'}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="100vw"
            priority
          />
        </div>
        <div className="rwood-hero-overlay" />

        <div className="rwood-hero-text">
          <div className="section-tag-warm">{t('tag')}</div>
          <h2>
            {t('heroTitle')} <em>{t('heroTitleHighlight')}</em>
          </h2>
          <p>{t('heroSubtitle')}</p>
          <div className="rwood-hero-cta">
            <Link href="/products/rwood-groove" className="rwood-btn-warm">
              {t('ctaExplore')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/contact" className="rwood-btn-ghost">
              {t('ctaSample')}
            </Link>
          </div>
        </div>

        {/* Floating spec card */}
        <div className="spec-float">
          <div className="spec-float-tag">{currentLabel}</div>
          <div className="spec-float-grid">
            <div className="sfg-cell">
              <span className="sfg-k">{t('specAbsorptionKey')}</span>
              <span className="sfg-v">αw 0.95</span>
            </div>
            <div className="sfg-cell">
              <span className="sfg-k">{t('specFireKey')}</span>
              <span className="sfg-v">B-s1,d0</span>
            </div>
            <div className="sfg-cell">
              <span className="sfg-k">{t('specThicknessKey')}</span>
              <span className="sfg-v">40 mm</span>
            </div>
            <div className="sfg-cell">
              <span className="sfg-k">{t('specCoreKey')}</span>
              <span className="sfg-v">{t('specCoreVal')}</span>
            </div>
          </div>
          {/* Active veneer indicator */}
          {activeVeneer && (
            <div className="spec-float-swatch">
              <div className="spec-swatch-img">
                <Image
                  src={activeVeneer.swatchImage}
                  alt={activeVeneer.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="32px"
                />
              </div>
              <span>{activeVeneer.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── VENEER STRIP (clickable) ── */}
      <div className="veneer-strip">
        {STRIP_VENEERS.map((v) => {
          const isActive = activeVeneer?.code === v.code;
          return (
            <div
              key={v.code}
              className={`veneer-cell${isActive ? ' veneer-cell-active' : ''}`}
              onClick={() => selectVeneer(v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectVeneer(v)}
              aria-label={`View ${v.name} veneer`}
              aria-pressed={isActive}
            >
              <Image
                src={v.heroImage}
                alt={`${v.name} veneer`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="20vw"
              />
              <div className="veneer-overlay" />
              <div className="veneer-label">
                <span className="veneer-name">{v.name}</span>
              </div>
              {isActive && <div className="veneer-active-bar" />}
            </div>
          );
        })}
      </div>

      {/* ── INFO + SWATCHES ── */}
      <div className="rwood-bottom">

        {/* Specs panel */}
        <div className="rwood-info">
          <div className="section-tag-warm">{t('specsTag')}</div>
          <h3>{t('specsTitle')}</h3>
          <p>{t('specsBody')}</p>

          <div className="specs-grid">
            {specs.map((s) => (
              <div key={s.key} className="spec-cell">
                <span className="spec-k">{s.key}</span>
                <span className="spec-v">{s.val}</span>
              </div>
            ))}
          </div>

          <div className="info-cta">
            <Link href="/products/rwood-groove" className="rwood-btn-warm">
              {t('ctaFullSpec')}
            </Link>
            <Link href="/documents/rwood-groove/datasheet.pdf" className="rwood-btn-outline" target="_blank">
              {t('ctaDatasheet')}
            </Link>
          </div>
        </div>

        {/* Veneer swatches panel (all 8, also clickable) */}
        <div className="rwood-swatches">
          <div className="section-tag-warm">{t('swatchesTag')}</div>
          <h3>{t('swatchesTitle')}</h3>
          <p>{t('swatchesBody')}</p>

          <div className="swatch-grid">
            {VENEERS.map((v) => {
              const isActive = activeVeneer?.code === v.code;
              return (
                <div
                  key={v.code}
                  className={`swatch-item${isActive ? ' swatch-active' : ''}`}
                  onClick={() => selectVeneer(v)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && selectVeneer(v)}
                  aria-label={`Select ${v.name}`}
                  aria-pressed={isActive}
                >
                  <div className="swatch-img-wrap">
                    <Image
                      src={v.swatchImage}
                      alt={v.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="80px"
                    />
                    {isActive && (
                      <div className="swatch-check">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="swatch-name">{v.name}</span>
                </div>
              );
            })}
          </div>

          <Link href="/contact" className="rwood-btn-primary sample-btn">
            {t('ctaOrderSamples')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          STYLES
          Buttons on <Link> use :global() so the hash
          isn't applied — <a> tags don't receive jsx attrs
      ───────────────────────────────────────────── */}
      <style jsx>{`
        .rwood-section {
          background: #f5efe6;
        }

        /* ── HERO ── */
        .rwood-hero {
          position: relative;
          height: 68vh;
          min-height: 500px;
          overflow: hidden;
        }

        .rwood-hero-img {
          position: absolute;
          inset: 0;
          animation: heroFadeIn 0.55s ease both;
        }

        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }

        .rwood-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(12, 5, 1, 0.88) 0%,
            rgba(12, 5, 1, 0.45) 50%,
            rgba(12, 5, 1, 0.05) 100%
          );
          z-index: 1;
        }

        .rwood-hero-text {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 4rem 5rem;
          max-width: 44rem;
        }

        .rwood-hero-text h2 {
          font-size: clamp(2.4rem, 4vw, 3.8rem);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.05;
          margin-bottom: 0.8rem;
          color: white;
        }

        .rwood-hero-text h2 em {
          font-style: italic;
          color: #d4a97a;
        }

        .rwood-hero-text > p {
          font-size: 0.95rem;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.65);
          max-width: 28rem;
          margin-bottom: 1.6rem;
        }

        .rwood-hero-cta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        /* Floating spec card */
        .spec-float {
          position: absolute;
          bottom: 3rem;
          right: 4rem;
          z-index: 3;
          background: rgba(253, 254, 255, 0.97);
          backdrop-filter: blur(16px);
          border-radius: var(--radius-lg);
          padding: 1.4rem 1.8rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(139, 98, 53, 0.12);
          min-width: 17rem;
        }

        .spec-float-tag {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b6235;
          margin-bottom: 0.7rem;
          transition: all 0.3s;
        }

        .spec-float-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e4e0d8;
          border-radius: var(--radius-sm);
          overflow: hidden;
          margin-bottom: 0.8rem;
        }

        .sfg-cell {
          background: white;
          padding: 0.6rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .sfg-k {
          font-size: 0.57rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b0a898;
        }

        .sfg-v {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        /* Active veneer row inside spec card */
        .spec-float-swatch {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border-top: 1px solid #ece8e0;
          padding-top: 0.7rem;
          animation: heroFadeIn 0.35s ease both;
        }

        .spec-swatch-img {
          position: relative;
          width: 2rem;
          height: 2rem;
          border-radius: 4px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid #ddd;
        }

        .spec-float-swatch span {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        /* ── VENEER STRIP ── */
        .veneer-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          height: 26vh;
          min-height: 180px;
        }

        .veneer-cell {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          outline: none;
        }

        .veneer-cell :global(img) {
          filter: brightness(0.78) saturate(0.85);
          transition: filter 0.4s ease, transform 0.5s ease;
        }

        .veneer-cell:hover :global(img),
        .veneer-cell-active :global(img) {
          filter: brightness(1) saturate(1.08);
          transform: scale(1.05);
        }

        .veneer-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10, 4, 1, 0.65) 0%, transparent 60%);
          z-index: 1;
        }

        .veneer-label {
          position: absolute;
          bottom: 0.7rem;
          left: 0.8rem;
          right: 0.8rem;
          z-index: 2;
          opacity: 0;
          transform: translateY(5px);
          transition: opacity 0.25s, transform 0.25s;
        }

        .veneer-cell:hover .veneer-label,
        .veneer-cell-active .veneer-label {
          opacity: 1;
          transform: translateY(0);
        }

        .veneer-name {
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          display: block;
          text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        }

        /* Orange bar at top of active strip cell */
        .veneer-active-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #d4a97a;
          z-index: 3;
        }

        /* ── BOTTOM ROW ── */
        .rwood-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .rwood-info {
          background: #f5efe6;
          padding: 4.5rem 5rem;
          border-right: 1px solid rgba(139, 98, 53, 0.1);
        }

        .rwood-info h3,
        .rwood-swatches h3 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--charcoal);
          margin-bottom: 0.7rem;
        }

        .rwood-info > p,
        .rwood-swatches > p {
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--charcoal);
          opacity: 0.6;
          margin-bottom: 2rem;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(139, 98, 53, 0.15);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .spec-cell {
          background: white;
          padding: 0.95rem 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .spec-k {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
        }

        .spec-v {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        .info-cta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        /* ── SWATCHES ── */
        .rwood-swatches {
          background: white;
          padding: 4.5rem 5rem;
        }

        .swatch-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 2rem;
        }

        .swatch-item {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          outline: none;
        }

        .swatch-img-wrap {
          position: relative;
          height: 3.5rem;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 2px solid transparent;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }

        .swatch-item:hover .swatch-img-wrap {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        }

        .swatch-active .swatch-img-wrap {
          border-color: #8b6235;
          box-shadow: 0 0 0 3px rgba(139, 98, 53, 0.22);
          transform: translateY(-2px);
        }

        /* Checkmark badge on active swatch */
        .swatch-check {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 1.1rem;
          height: 1.1rem;
          background: #8b6235;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .swatch-name {
          font-size: 0.6rem;
          font-weight: 600;
          color: #999;
          text-align: center;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }

        .swatch-active .swatch-name {
          color: #8b6235;
          font-weight: 700;
        }

        .sample-btn {
          width: 100%;
          justify-content: center;
        }

        /* ── SECTION LABELS ── */
        .section-tag-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b6235;
          margin-bottom: 1.1rem;
        }

        .section-tag-warm::before {
          content: '';
          width: 1.4rem;
          height: 2px;
          background: #8b6235;
          border-radius: 1px;
          display: inline-block;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .rwood-hero-text { padding: 3rem; }
          .spec-float { display: none; }
          .veneer-strip { grid-template-columns: repeat(3, 1fr); height: 22vh; }
          .rwood-bottom { grid-template-columns: 1fr; }
          .rwood-info { border-right: none; border-bottom: 1px solid rgba(139, 98, 53, 0.1); padding: 3.5rem 3rem; }
          .rwood-swatches { padding: 3.5rem 3rem; }
        }

        @media (max-width: 640px) {
          .rwood-hero { min-height: 440px; }
          .rwood-hero-text { padding: 2rem 1.5rem; }
          .rwood-hero-text h2 { font-size: 2.2rem; }
          .veneer-strip { grid-template-columns: repeat(3, 1fr); height: 28vh; }
          .swatch-grid { grid-template-columns: repeat(4, 1fr); gap: 6px; }
          .rwood-info, .rwood-swatches { padding: 2.5rem 1.5rem; }
        }
      `}</style>

      {/* ── GLOBAL BUTTON STYLES ──
          <Link> renders as <a> — styled-jsx doesn't inject its hash
          onto React components, so scoped rules never match the <a>.
          :global() emits real CSS that hits the DOM directly. */}
      <style jsx global>{`
        .rwood-btn-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #8b6235;
          color: #fff !important;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.7rem 1.45rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .rwood-btn-warm:hover {
          background: #7a5430;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(139, 98, 53, 0.32);
        }

        .rwood-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85) !important;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 0.7rem 1.45rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .rwood-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .rwood-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: #8b6235 !important;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 0.7rem 1.45rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: 2px solid rgba(139, 98, 53, 0.3);
          transition: border-color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .rwood-btn-outline:hover {
          border-color: #8b6235;
          background: rgba(139, 98, 53, 0.06);
        }

        .rwood-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--brand-blue);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.7rem 1.45rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .rwood-btn-primary:hover {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(25, 127, 199, 0.3);
        }
      `}</style>
    </section>
  );
}
