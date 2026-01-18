'use client';

import { useTranslations } from 'next-intl';

export default function AboutPartners() {
  const t = useTranslations('about.partners');

  const partners = [
    { name: 'Partner 1', type: t('types.supplier') },
    { name: 'Partner 2', type: t('types.research') },
    { name: 'Partner 3', type: t('types.distribution') },
    { name: 'Partner 4', type: t('types.certification') },
  ];

  return (
    <section className="about-partners">
      <div className="partners-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>

        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div key={index} className="partner-card">
              <div className="partner-logo">🤝</div>
              <h3>{partner.name}</h3>
              <p>{partner.type}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .about-partners {
          padding: 6rem 4rem;
          background: var(--deep-blue);
          color: white;
        }

        .partners-inner {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .partners-inner .section-tag {
          color: var(--brand-blue-light);
        }

        .partners-inner h2 {
          font-size: 2rem;
          margin: 0.5rem 0 3rem;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .partner-card {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          transition: all 0.3s ease;
        }

        .partner-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .partner-logo {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .partner-card h3 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .partner-card p {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        @media (max-width: 992px) {
          .partners-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .about-partners {
            padding: 3rem 1rem;
          }

          .partners-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .partner-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
