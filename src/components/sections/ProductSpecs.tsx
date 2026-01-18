'use client';

import { useTranslations } from 'next-intl';

interface ProductSpecsProps {
  slug: string;
}

export default function ProductSpecs({ slug }: ProductSpecsProps) {
  const t = useTranslations('specs');

  const specs = {
    interior: [
      { label: t('dimensions'), value: '595 x 595 mm / Custom' },
      { label: t('thickness'), value: '25mm / 40mm / 50mm' },
      { label: t('weight'), value: '2.5 - 4 kg/m²' },
      { label: t('absorption'), value: 'αw 0.95 - 1.00' },
      { label: t('fireClass'), value: 'B-s1, d0 (EN 13501-1)' },
      { label: t('material'), value: t('recycledTextiles') },
    ],
    solid: [
      { label: t('dimensions'), value: '1200 x 600 mm / Custom' },
      { label: t('thickness'), value: '24mm / 40mm' },
      { label: t('weight'), value: '3 - 4.5 kg/m²' },
      { label: t('absorption'), value: 'αw 0.90 - 1.00' },
      { label: t('fireClass'), value: 'B-s1, d0 (EN 13501-1)' },
      { label: t('material'), value: t('recycledTextiles') },
    ],
    divide: [
      { label: t('dimensions'), value: '1600 x 800 mm / Custom' },
      { label: t('thickness'), value: '40mm panel' },
      { label: t('height'), value: '1200 - 2000 mm' },
      { label: t('absorption'), value: 'αw 0.85 - 0.95' },
      { label: t('fireClass'), value: 'B-s1, d0 (EN 13501-1)' },
      { label: t('material'), value: t('recycledTextiles') },
    ],
  };

  const productSpecs = specs[slug as keyof typeof specs] || specs.interior;

  return (
    <section className="product-specs">
      <div className="specs-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>

        <div className="specs-grid">
          {productSpecs.map((spec, index) => (
            <div key={index} className="spec-item">
              <span className="spec-label">{spec.label}</span>
              <span className="spec-value">{spec.value}</span>
            </div>
          ))}
        </div>

        <div className="specs-certifications">
          <h3>{t('certifications')}</h3>
          <div className="cert-badges">
            <div className="cert-badge">CE</div>
            <div className="cert-badge">ISO 9001</div>
            <div className="cert-badge">ISO 14001</div>
            <div className="cert-badge">OEKO-TEX®</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-specs {
          padding: 6rem 4rem;
          background: white;
        }

        .specs-inner {
          max-width: 1000px;
          margin: 0 auto;
        }

        .specs-inner h2 {
          font-size: 2rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 3rem;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .spec-item {
          display: flex;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: var(--cream);
          border-radius: 12px;
        }

        .spec-label {
          font-weight: 500;
          color: var(--deep-blue);
        }

        .spec-value {
          color: #666;
        }

        .specs-certifications {
          margin-top: 3rem;
          padding-top: 3rem;
          border-top: 1px solid var(--sand);
        }

        .specs-certifications h3 {
          font-size: 1.1rem;
          color: var(--deep-blue);
          margin-bottom: 1.5rem;
        }

        .cert-badges {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cert-badge {
          padding: 0.75rem 1.5rem;
          background: var(--brand-blue-pale);
          color: var(--brand-blue);
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .product-specs {
            padding: 4rem 1.5rem;
          }

          .specs-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 576px) {
          .product-specs {
            padding: 3rem 1rem;
          }

          .spec-item {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </section>
  );
}
