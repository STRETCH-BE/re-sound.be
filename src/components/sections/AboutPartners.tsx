'use client';

import { useTranslations } from 'next-intl';
import type { Partner } from '@/config/site';

interface AboutPartnersProps {
  /** Real partners only — see PARTNERS in src/config/site.ts. */
  partners: Partner[];
}

/**
 * "Partners — Working Together" block. Renders nothing while the partner
 * list is empty (the previous version showed "Partner 1 … Partner 4"
 * placeholders on the live site).
 */
export default function AboutPartners({ partners }: AboutPartnersProps) {
  const t = useTranslations('about.partners');

  if (partners.length === 0) return null;

  return (
    <section className="about-partners">
      <div className="partners-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>

        <div className="partners-grid">
          {partners.map((partner) => (
            <div key={partner.name} className="partner-card">
              <div className="partner-logo" aria-hidden="true">🤝</div>
              <h3>
                {partner.url ? (
                  <a href={partner.url} target="_blank" rel="noopener noreferrer">
                    {partner.name}
                  </a>
                ) : (
                  partner.name
                )}
              </h3>
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

        .partner-card h3 a {
          color: inherit;
          text-decoration: none;
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
