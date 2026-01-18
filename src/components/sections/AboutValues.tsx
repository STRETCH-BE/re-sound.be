'use client';

import { useTranslations } from 'next-intl';

export default function AboutValues() {
  const t = useTranslations('about.values');

  const values = [
    {
      icon: '♻️',
      title: t('circular.title'),
      description: t('circular.description'),
    },
    {
      icon: '🎯',
      title: t('quality.title'),
      description: t('quality.description'),
    },
    {
      icon: '🤝',
      title: t('partnership.title'),
      description: t('partnership.description'),
    },
    {
      icon: '💡',
      title: t('innovation.title'),
      description: t('innovation.description'),
    },
  ];

  return (
    <section className="about-values">
      <div className="values-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>

        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <span className="value-icon">{value.icon}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .about-values {
          padding: 6rem 4rem;
          background: var(--cream);
        }

        .values-inner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .values-inner h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 3rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .value-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .value-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }

        .value-card h3 {
          font-size: 1.2rem;
          color: var(--deep-blue);
          margin-bottom: 0.75rem;
        }

        .value-card p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
        }

        @media (max-width: 992px) {
          .about-values {
            padding: 4rem 1.5rem;
          }

          .values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .about-values {
            padding: 3rem 1rem;
          }

          .values-inner h2 {
            font-size: 1.8rem;
          }

          .values-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .value-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
