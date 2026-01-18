'use client';

import { useTranslations } from 'next-intl';

export default function ImpactStats() {
  const t = useTranslations('sustainability.impact');

  const stats = [
    { number: '50+', unit: t('units.tons'), label: t('textilesSaved') },
    { number: '10K+', unit: 'm²', label: t('panelsProduced') },
    { number: '0%', unit: '', label: t('wasteToLandfill') },
    { number: '100%', unit: '', label: t('returnRate') },
  ];

  return (
    <section className="impact-stats">
      <div className="impact-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>

        <div className="impact-grid">
          {stats.map((stat, index) => (
            <div key={index} className="impact-card">
              <span className="impact-number">
                {stat.number}
                {stat.unit && <small>{stat.unit}</small>}
              </span>
              <span className="impact-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .impact-stats {
          padding: 6rem 4rem;
          background: var(--deep-blue);
          color: white;
        }

        .impact-inner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .impact-inner .section-tag {
          color: var(--brand-blue-light);
        }

        .impact-inner h2 {
          font-size: 2.5rem;
          margin: 0.5rem 0 4rem;
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .impact-card {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .impact-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
        }

        .impact-number {
          display: block;
          font-family: var(--font-heading);
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--brand-blue-light);
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .impact-number small {
          font-size: 1.5rem;
          margin-left: 0.25rem;
        }

        .impact-label {
          font-size: 1rem;
          opacity: 0.85;
        }

        @media (max-width: 992px) {
          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .impact-stats {
            padding: 3rem 1rem;
          }

          .impact-inner h2 {
            font-size: 1.8rem;
          }

          .impact-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .impact-number {
            font-size: 2.5rem;
          }

          .impact-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
