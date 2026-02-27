'use client';

import { useTranslations } from 'next-intl';

export default function WhyCards() {
  const t = useTranslations('why');

  const cards = [
    {
      icon: '🔊',
      value: 'Class A',
      label: t('features.performance.title'),
      desc: t('features.performance.description'),
    },
    {
      icon: '🔥',
      value: 'B-s1,d0',
      label: t('features.durability.title'),
      desc: t('features.durability.description'),
    },
    {
      icon: '🎨',
      value: '50+',
      label: t('features.customization.title'),
      desc: t('features.customization.description'),
    },
    {
      icon: '🇧🇪',
      value: t('belgianLabel'),
      label: t('features.circular.title'),
      desc: t('features.circular.description'),
    },
  ];

  return (
    <section className="why-section">
      <div className="why-inner">

        <div className="why-header">
          <div className="label-blue">{t('tag')}</div>
          <h2>
            {t('title')} <em>{t('titleHighlight')}</em>
          </h2>
          <p>{t('subtitle')}</p>
        </div>

        <div className="why-grid">
          {cards.map((c) => (
            <div key={c.value} className="why-card">
              <div className="card-icon">{c.icon}</div>
              <div className="card-value">{c.value}</div>
              <div className="card-label">{c.label}</div>
              <p className="card-desc">{c.desc}</p>
              <div className="card-glow" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .why-section {
          background: white;
          padding: 7rem 3.5rem;
        }

        .why-inner {
          max-width: 1300px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .why-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .label-blue {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brand-blue);
          margin-bottom: 1.1rem;
        }

        .label-blue::before {
          content: '';
          width: 1.4rem;
          height: 2px;
          background: var(--brand-blue);
          border-radius: 1px;
          display: inline-block;
        }

        .why-header h2 {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: var(--charcoal);
          margin-bottom: 0.75rem;
        }

        .why-header h2 em {
          font-style: italic;
          color: var(--brand-blue);
        }

        .why-header p {
          font-size: 1rem;
          color: var(--charcoal);
          opacity: 0.55;
          max-width: 38rem;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── CARDS ── */
        .why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .why-card {
          background: var(--cream);
          border: 1px solid rgba(25, 127, 199, 0.08);
          border-radius: var(--radius-lg);
          padding: 2.2rem 1.8rem;
          position: relative;
          overflow: hidden;
          transition: all 0.25s;
        }

        .why-card:hover {
          background: white;
          border-color: rgba(25, 127, 199, 0.22);
          transform: translateY(-5px);
          box-shadow: 0 20px 45px rgba(25, 127, 199, 0.1);
        }

        .card-icon {
          width: 2.8rem;
          height: 2.8rem;
          border-radius: var(--radius-md);
          background: var(--brand-blue-pale);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          margin-bottom: 1.2rem;
        }

        .card-value {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -1px;
          color: var(--brand-blue);
          line-height: 1;
          margin-bottom: 0.3rem;
        }

        .card-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--charcoal);
          margin-bottom: 0.55rem;
        }

        .card-desc {
          font-size: 0.8rem;
          color: var(--charcoal);
          opacity: 0.55;
          line-height: 1.6;
        }

        /* corner glow */
        .card-glow {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 4.5rem;
          height: 4.5rem;
          background: radial-gradient(at bottom right, rgba(25, 127, 199, 0.07), transparent 70%);
          border-radius: var(--radius-lg);
          pointer-events: none;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .why-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .why-section {
            padding: 5rem 1.5rem;
          }

          .why-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
