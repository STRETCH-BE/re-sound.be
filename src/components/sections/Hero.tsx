'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="hero">

      {/* ── LEFT PANEL: rWood / Natural ── */}
      <div className="panel panel-left">
        <div className="panel-img">
          <Image
            src="/images/products/rwood-groove/hero-rWood-Groove.webp"
            alt="rWood acoustic panel with natural wood veneer"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
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
            <Link href="/products/rwood-groove" className="btn-warm">
              {t('rwood.ctaPrimary')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/products/rwood-veneer" className="btn-ghost">
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
            <Link href="/products" className="btn-primary">
              {t('circular.ctaPrimary')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/sustainability" className="btn-ghost">
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

      {/* Center divider */}
      <div className="center-divider" />

      <style jsx>{`
        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          padding-top: 68px;
          position: relative;
        }

        /* ── PANEL BASE ── */
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
          transition: transform 8s ease;
        }

        .panel:hover .panel-img {
          transform: scale(1.03);
        }

        .panel-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .panel-overlay-warm {
          background: linear-gradient(
            to top,
            rgba(15, 7, 2, 0.94) 0%,
            rgba(15, 7, 2, 0.58) 45%,
            rgba(15, 7, 2, 0.12) 100%
          );
        }

        .panel-overlay-blue {
          background: linear-gradient(
            to top,
            rgba(5, 18, 38, 0.95) 0%,
            rgba(5, 18, 38, 0.58) 45%,
            rgba(5, 18, 38, 0.12) 100%
          );
        }

        .panel-content {
          position: relative;
          z-index: 2;
          padding: 3.5rem 4rem 4.5rem;
        }

        /* ── BADGES ── */
        .panel-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0.38rem 0.9rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.6rem;
          width: fit-content;
          animation: fadeUp 0.6s 0.05s both;
        }

        .badge-warm {
          background: rgba(139, 98, 53, 0.22);
          color: #d4a97a;
          border: 1px solid rgba(200, 160, 100, 0.32);
        }

        .badge-blue {
          background: rgba(25, 127, 199, 0.22);
          color: #7fc4f0;
          border: 1px solid rgba(25, 127, 199, 0.38);
        }

        /* ── HEADINGS ── */
        .panel-content h1 {
          font-size: clamp(2.6rem, 4vw, 4rem);
          font-weight: 800;
          letter-spacing: -2.5px;
          line-height: 1.02;
          color: #fff;
          margin-bottom: 1.2rem;
          animation: fadeUp 0.65s 0.18s both;
        }

        .panel-left h1 em {
          color: #d4a97a;
          font-style: italic;
        }

        .panel-right h1 em {
          color: var(--brand-blue-light);
          font-style: italic;
        }

        .panel-content p {
          font-size: 0.98rem;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.65);
          max-width: 27rem;
          margin-bottom: 1.8rem;
          animation: fadeUp 0.65s 0.3s both;
        }

        /* ── PILLS ── */
        .pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-bottom: 1.8rem;
          animation: fadeUp 0.65s 0.42s both;
        }

        .pill {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.3rem 0.72rem;
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
        }

        .pill-warm {
          background: rgba(200, 160, 100, 0.18);
          color: #d4a97a;
          border: 1px solid rgba(200, 160, 100, 0.3);
        }

        .pill-blue {
          background: rgba(25, 127, 199, 0.2);
          color: #7fc4f0;
          border: 1px solid rgba(25, 127, 199, 0.35);
        }

        /* ── CTA BUTTONS ── */
        .cta-row {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 0;
          animation: fadeUp 0.65s 0.54s both;
        }

        .btn-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #8b6235;
          color: white;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.72rem 1.5rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          transition: all 0.25s;
        }

        .btn-warm:hover {
          background: #7a5430;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(139, 98, 53, 0.3);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--brand-blue);
          color: white;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.72rem 1.5rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          transition: all 0.25s;
        }

        .btn-primary:hover {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(25, 127, 199, 0.3);
        }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.72rem 1.5rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          transition: all 0.25s;
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* ── STATS ── */
        .stat-row {
          display: flex;
          gap: 0;
          margin-top: 2.2rem;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          overflow: hidden;
          backdrop-filter: blur(10px);
          width: fit-content;
          animation: fadeUp 0.65s 0.66s both;
        }

        .stat {
          display: flex;
          flex-direction: column;
          padding: 0.85rem 1.4rem;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .stat:last-child {
          border-right: none;
        }

        .stat-num {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.5px;
        }

        .stat-lbl {
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.42);
          margin-top: 0.2rem;
          white-space: nowrap;
        }

        /* ── CENTER BAR ── */
        .center-divider {
          position: absolute;
          top: 68px;
          bottom: 0;
          left: 50%;
          width: 1px;
          background: rgba(255, 255, 255, 0.14);
          z-index: 10;
          pointer-events: none;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .panel {
            min-height: 90vh;
          }

          .center-divider {
            display: none;
          }

          .panel-content {
            padding: 3rem 2.5rem 3.5rem;
          }

          .panel-content h1 {
            font-size: 2.8rem;
          }
        }

        @media (max-width: 640px) {
          .panel {
            min-height: 80vh;
          }

          .panel-content {
            padding: 2.5rem 1.5rem 3rem;
          }

          .panel-content h1 {
            font-size: 2.2rem;
            letter-spacing: -1.5px;
          }

          .stat-row {
            flex-wrap: wrap;
            width: 100%;
          }

          .stat {
            flex: 1 1 calc(50% - 1px);
          }
        }
      `}</style>
    </section>
  );
}
