'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function CircularLoop() {
  const t = useTranslations('circular');

  const steps = [
    {
      num: '01',
      title: t('steps.collect.title'),
      desc: t('steps.collect.description'),
    },
    {
      num: '02',
      title: t('steps.transform.title'),
      desc: t('steps.transform.description'),
    },
    {
      num: '03',
      title: t('steps.install.title'),
      desc: t('steps.install.description'),
    },
    {
      num: '04',
      title: t('steps.return.title'),
      desc: t('steps.return.description'),
    },
  ];

  return (
    <section className="loop-section">
      <div className="loop-inner">

        {/* ── LEFT: TEXT + STEPS ── */}
        <div className="loop-left">
          <div className="label-white">{t('tag')}</div>
          <h2>
            {t('title')} <em>{t('titleHighlight')}</em>
          </h2>
          <p className="loop-intro">{t('subtitle')}</p>

          <div className="step-grid">
            {steps.map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>

          <Link href="/sustainability" className="btn-primary">
            {t('cta')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* ── RIGHT: CIRCLE VISUAL ── */}
        <div className="loop-right">
          <div className="ring-wrap">
            {/* Spinning dashed rings */}
            <div className="ring ring-a" />
            <div className="ring ring-b" />

            {/* Centre image */}
            <div className="ring-img">
              <Image
                src="/images/products/interior/circular.jpg"
                alt="Circular economy — acoustic panels recycling process"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 80vw, 35vw"
              />
              <div className="ring-img-overlay" />
            </div>

            {/* Floating stat pills */}
            <div className="stat-pill stat-top">
              <span className="sp-num">100%</span>
              <span className="sp-lbl">{t('statRecycled')}</span>
            </div>
            <div className="stat-pill stat-right">
              <span className="sp-num">0 kg</span>
              <span className="sp-lbl">{t('statLandfill')}</span>
            </div>
            <div className="stat-pill stat-bottom">
              <span className="sp-num">{t('statFreeLabel')}</span>
              <span className="sp-lbl">{t('statTakeback')}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loop-section {
          background: var(--deep-blue);
          padding: 7rem 3.5rem;
          position: relative;
          overflow: hidden;
        }

        /* background ring decoration */
        .loop-section::before {
          content: '';
          position: absolute;
          right: -8%;
          top: 50%;
          transform: translateY(-50%);
          width: 50%;
          aspect-ratio: 1;
          border-radius: 50%;
          border: 80px solid rgba(255, 255, 255, 0.025);
          pointer-events: none;
        }

        .loop-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7rem;
          align-items: center;
        }

        /* ── LABEL ── */
        .label-white {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.45);
          margin-bottom: 1.3rem;
        }

        .label-white::before {
          content: '';
          width: 1.4rem;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 1px;
          display: inline-block;
        }

        /* ── HEADINGS ── */
        .loop-left h2 {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: white;
          margin-bottom: 1rem;
        }

        .loop-left h2 em {
          font-style: italic;
          color: var(--brand-blue-light);
        }

        .loop-intro {
          font-size: 0.98rem;
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.52);
          max-width: 30rem;
          margin-bottom: 2.5rem;
        }

        /* ── STEPS ── */
        .step-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 2.5rem;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          padding: 1.2rem 1.4rem;
          transition: background 0.25s;
        }

        .step-card:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .step-num {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--brand-blue-light);
          margin-bottom: 0.45rem;
        }

        .step-title {
          font-family: var(--font-heading);
          font-size: 0.92rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.3rem;
        }

        .step-desc {
          font-size: 0.76rem;
          color: rgba(255, 255, 255, 0.42);
          line-height: 1.55;
        }

        /* ── BUTTON ── */
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

        /* ── RING VISUAL ── */
        .loop-right {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ring-wrap {
          position: relative;
          width: min(24rem, 100%);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Actual image circle */
        .ring-img {
          position: relative;
          width: 75%;
          aspect-ratio: 1;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid rgba(25, 127, 199, 0.32);
          z-index: 2;
          box-shadow: 0 0 80px rgba(25, 127, 199, 0.14);
        }

        .ring-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(13, 58, 92, 0.45);
          z-index: 1;
        }

        /* Spinning dashed rings */
        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(25, 127, 199, 0.22);
          inset: 0;
        }

        .ring-a {
          animation: spin 22s linear infinite;
        }

        .ring-b {
          inset: -12%;
          border-color: rgba(25, 127, 199, 0.1);
          animation: spin 38s linear infinite reverse;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Floating stat pills */
        .stat-pill {
          position: absolute;
          z-index: 5;
          background: rgba(253, 254, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-full);
          padding: 0.45rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.05rem;
        }

        .stat-top {
          top: 0;
          left: 50%;
          transform: translate(-50%, -40%);
        }

        .stat-right {
          right: 0;
          top: 50%;
          transform: translate(40%, -50%);
        }

        .stat-bottom {
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 40%);
        }

        .sp-num {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        .sp-lbl {
          font-size: 0.55rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
          white-space: nowrap;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .loop-inner {
            grid-template-columns: 1fr;
            gap: 4rem;
          }

          .loop-right {
            order: -1;
          }

          .ring-wrap {
            width: min(20rem, 80%);
          }
        }

        @media (max-width: 640px) {
          .loop-section {
            padding: 5rem 1.5rem;
          }

          .step-grid {
            grid-template-columns: 1fr;
          }

          .ring-wrap {
            width: min(16rem, 90%);
          }
        }
      `}</style>
    </section>
  );
}
