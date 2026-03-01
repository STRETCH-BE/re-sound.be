'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="hero-split">

      {/* ── LEFT PANEL: rWood / Natural ── */}
      <div className="panel panel-left">
        <div className="panel-img">
          <Image
            src="/images/products/rwood-micro/finish-detail.webp"
            alt="rWood acoustic panel with natural wood veneer"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            priority
            sizes="50vw"
          />
        </div>
        <div className="panel-overlay panel-overlay-warm" />

        <div className="panel-content">
          <div className="panel-badge badge-warm">
            <span>🪵</span> {t('rwood.badge')}
          </div>

          <h1>
            {t('rwood.title')}<br />
            <em>{t('rwood.titleHighlight')}</em>
          </h1>

          <p>{t('rwood.subtitle')}</p>

          <div className="pill-row">
            {['🪵 Real Wood Veneer', '♻️ Recycled Core', '⊞ Solid & Perforated', 'αw 0.95'].map((pill) => (
              <span key={pill} className="pill pill-warm">{pill}</span>
            ))}
          </div>

          <div className="cta-row">
            <Link href="/products/rwood-groove" className="hero-btn-warm">
              {t('rwood.ctaPrimary')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/products/rwood-veneer" className="hero-btn-ghost-warm">
              {t('rwood.ctaSecondary')}
            </Link>
          </div>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">5+</span>
              <span className="stat-lbl">{t('rwood.statVeneers')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">40mm</span>
              <span className="stat-lbl">{t('rwood.statThickness')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">αw 0.95</span>
              <span className="stat-lbl">{t('rwood.statAbsorption')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">B-s1,d0</span>
              <span className="stat-lbl">{t('rwood.statFire')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Circular Range ── */}
      <div className="panel panel-right">
        <div className="panel-img">
          <Image
            src="/images/products/interior/hero.webp"
            alt="Circular acoustic panels in a modern office"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
            sizes="50vw"
          />
        </div>
        <div className="panel-overlay panel-overlay-blue" />

        <div className="panel-content">
          <div className="panel-badge badge-blue">
            <span>♻️</span> {t('circular.badge')}
          </div>

          <h1>
            {t('circular.title')}<br />
            <em>{t('circular.titleHighlight')}</em>
          </h1>

          <p>{t('circular.subtitle')}</p>

          <div className="pill-row">
            {['♻️ 100% Recycled', '🔄 Free Take-Back', '🎨 50+ Colors', '🇧🇪 Belgium'].map((pill) => (
              <span key={pill} className="pill pill-blue">{pill}</span>
            ))}
          </div>

          <div className="cta-row">
            <Link href="/products" className="hero-btn-blue">
              {t('circular.ctaPrimary')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/sustainability" className="hero-btn-ghost-blue">
              {t('circular.ctaSecondary')}
            </Link>
          </div>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">100%</span>
              <span className="stat-lbl">{t('circular.statRecycled')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">0 kg</span>
              <span className="stat-lbl">{t('circular.statLandfill')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{t('circular.statFreeLabel')}</span>
              <span className="stat-lbl">{t('circular.statTakeback')}</span>
            </div>
            <div className="stat">
              <span className="stat-num">50+</span>
              <span className="stat-lbl">{t('circular.statColors')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center divider line */}
      <div className="center-divider" />

      <style jsx>{`
        /* ─────────────────────────────────────────────
           HERO — Full-bleed, goes under the fixed nav.
           No top gap. Images cover from y:0.
        ───────────────────────────────────────────── */
        .hero-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 100vh;
          min-height: 700px;
          position: relative;
          /* NO padding-top — hero sits behind fixed nav */
        }

        /* ── PANEL ── */
        .panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }

        .panel-img {
          position: absolute;
          inset: 0;
          transition: transform 9s ease;
        }

        .panel:hover .panel-img {
          transform: scale(1.04);
        }

        /* ── OVERLAYS ──
           Heavy at bottom for legibility, transparent at top
           so the photo reads behind the nav */
        .panel-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .panel-overlay-warm {
          background: linear-gradient(
            to top,
            rgba(10, 4, 1, 0.97) 0%,
            rgba(10, 4, 1, 0.78) 32%,
            rgba(10, 4, 1, 0.35) 58%,
            rgba(10, 4, 1, 0.06) 100%
          );
        }

        .panel-overlay-blue {
          background: linear-gradient(
            to top,
            rgba(2, 10, 24, 0.97) 0%,
            rgba(2, 10, 24, 0.80) 32%,
            rgba(2, 10, 24, 0.38) 58%,
            rgba(2, 10, 24, 0.06) 100%
          );
        }

        /* ── CONTENT ──
           margin-top: auto pushes it to the bottom.
           padding-bottom gives breathing room above footer. */
        .panel-content {
          position: relative;
          z-index: 2;
          margin-top: auto;
          padding: 0 3.5rem 3.5rem;
          display: flex;
          flex-direction: column;
        }

        /* ── BADGES ── */
        .panel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.3rem;
          width: fit-content;
          animation: fadeUp 0.55s 0.05s both;
        }

        .badge-warm {
          background: rgba(139, 98, 53, 0.3);
          color: #e0b87a;
          border: 1px solid rgba(220, 170, 100, 0.45);
        }

        .badge-blue {
          background: rgba(25, 127, 199, 0.3);
          color: #8ecef5;
          border: 1px solid rgba(25, 127, 199, 0.5);
        }

        /* ── HEADINGS ── */
        .panel-content h1 {
          font-size: clamp(2.2rem, 3.4vw, 3.6rem);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.04;
          color: #fff;
          margin: 0 0 0.9rem;
          animation: fadeUp 0.6s 0.15s both;
        }

        .panel-left h1 em {
          color: #d4a97a;
          font-style: italic;
        }

        .panel-right h1 em {
          color: #7fc4f0;
          font-style: italic;
        }

        .panel-content > p {
          font-size: 0.875rem;
          line-height: 1.72;
          color: rgba(255, 255, 255, 0.58);
          max-width: 25rem;
          margin: 0 0 1.3rem;
          animation: fadeUp 0.6s 0.25s both;
        }

        /* ── PILLS ── */
        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.38rem;
          margin-bottom: 1.3rem;
          animation: fadeUp 0.6s 0.35s both;
        }

        .pill {
          font-size: 0.63rem;
          font-weight: 600;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          backdrop-filter: blur(6px);
          letter-spacing: 0.02em;
        }

        .pill-warm {
          background: rgba(200, 155, 90, 0.18);
          color: #e0b87a;
          border: 1px solid rgba(200, 155, 90, 0.35);
        }

        .pill-blue {
          background: rgba(25, 127, 199, 0.2);
          color: #8ecef5;
          border: 1px solid rgba(25, 127, 199, 0.4);
        }

        /* ── CTA BUTTONS ── */
        .cta-row {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          animation: fadeUp 0.6s 0.45s both;
        }

        /* Buttons use :global() because <Link> renders as <a> and
           styled-jsx doesn't inject its hash onto third-party components */
        :global(.hero-btn-warm) {
          display: inline-flex;
          align-items: center;
          gap: 0.38rem;
          background: #8b6235;
          color: #fff !important;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.65rem 1.35rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        :global(.hero-btn-warm:hover) {
          background: #7a5430;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(139, 98, 53, 0.38);
        }

        :global(.hero-btn-ghost-warm) {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.82) !important;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.65rem 1.35rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: 1.5px solid rgba(255, 255, 255, 0.24);
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        :global(.hero-btn-ghost-warm:hover) {
          background: rgba(255, 255, 255, 0.16);
          border-color: rgba(255, 255, 255, 0.44);
        }

        :global(.hero-btn-blue) {
          display: inline-flex;
          align-items: center;
          gap: 0.38rem;
          background: var(--brand-blue);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.8rem;
          padding: 0.65rem 1.35rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        :global(.hero-btn-blue:hover) {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(25, 127, 199, 0.38);
        }

        :global(.hero-btn-ghost-blue) {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.82) !important;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.65rem 1.35rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: 1.5px solid rgba(255, 255, 255, 0.2);
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        :global(.hero-btn-ghost-blue:hover) {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(255, 255, 255, 0.4);
        }

        /* ── STAT BAR ── */
        .stat-row {
          display: flex;
          margin-top: 1.6rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-md);
          overflow: hidden;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          width: fit-content;
          animation: fadeUp 0.6s 0.55s both;
        }

        .stat {
          display: flex;
          flex-direction: column;
          padding: 0.75rem 1.15rem;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat:last-child {
          border-right: none;
        }

        .stat-num {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.4px;
        }

        .stat-lbl {
          font-size: 0.54rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.38);
          margin-top: 0.2rem;
          white-space: nowrap;
        }

        /* ── CENTER DIVIDER ── */
        .center-divider {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: rgba(255, 255, 255, 0.14);
          z-index: 10;
          pointer-events: none;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .hero-split {
            grid-template-columns: 1fr;
            height: auto;
          }
          .panel {
            min-height: 90vh;
          }
          .center-divider {
            display: none;
          }
          .panel-content {
            padding: 0 2.5rem 3rem;
          }
        }

        @media (max-width: 640px) {
          .panel {
            min-height: 85vh;
          }
          .panel-content {
            padding: 0 1.5rem 2.5rem;
          }
          .panel-content h1 {
            font-size: 2rem;
            letter-spacing: -1.2px;
          }
          .stat-row {
            width: 100%;
          }
          .stat {
            flex: 1;
            padding: 0.65rem 0.7rem;
          }
          .cta-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </section>
  );
}
