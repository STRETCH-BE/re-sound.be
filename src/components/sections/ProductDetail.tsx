'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface ProductDetailProps {
  slug: string;
  title: string;
  description: string;
  gradient: 'blue' | 'dark' | 'accent';
}

const gradients = {
  blue: 'linear-gradient(135deg, var(--brand-blue-light), var(--brand-blue))',
  dark: 'linear-gradient(135deg, var(--brand-blue), var(--deep-blue))',
  accent: 'linear-gradient(135deg, var(--accent), #229687)',
};

export default function ProductDetail({ slug, title, description, gradient }: ProductDetailProps) {
  const t = useTranslations('products');

  return (
    <section className="product-detail">
      <div className="product-detail-inner">
        <div className="product-detail-visual">
          <div className="product-visual-box" style={{ background: gradients[gradient] }}>
            <div className="product-visual-texture" />
          </div>
        </div>

        <div className="product-detail-content">
          <span className="section-tag">{t('tag')}</span>
          <h1>{title}</h1>
          <p>{description}</p>

          <div className="product-detail-actions">
            <Link href="/contact" className="btn-primary">
              {t('requestQuote')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/sustainability" className="btn-secondary">
              {t('learnCircular')}
            </Link>
          </div>

          <div className="product-highlights">
            <div className="highlight">
              <span className="highlight-icon">🎯</span>
              <div>
                <strong>{t('highlights.absorption.title')}</strong>
                <span>{t('highlights.absorption.value')}</span>
              </div>
            </div>
            <div className="highlight">
              <span className="highlight-icon">♻️</span>
              <div>
                <strong>{t('highlights.recyclable.title')}</strong>
                <span>{t('highlights.recyclable.value')}</span>
              </div>
            </div>
            <div className="highlight">
              <span className="highlight-icon">🇧🇪</span>
              <div>
                <strong>{t('highlights.origin.title')}</strong>
                <span>{t('highlights.origin.value')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail {
          padding: 8rem 4rem 4rem;
          background: var(--cream);
        }

        .product-detail-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .product-visual-box {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 30px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }

        .product-visual-texture {
          position: absolute;
          inset: 20px;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 3px,
            rgba(255, 255, 255, 0.05) 3px,
            rgba(255, 255, 255, 0.05) 6px
          );
          border-radius: 20px;
        }

        .product-detail-content h1 {
          font-size: 3rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 1.5rem;
          letter-spacing: -1px;
        }

        .product-detail-content > p {
          color: #666;
          font-size: 1.15rem;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .product-detail-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .product-highlights {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid var(--sand);
        }

        .highlight {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .highlight-icon {
          font-size: 1.5rem;
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .highlight div {
          display: flex;
          flex-direction: column;
        }

        .highlight strong {
          font-size: 0.9rem;
          color: var(--deep-blue);
        }

        .highlight span {
          font-size: 0.85rem;
          color: #888;
        }

        @media (max-width: 992px) {
          .product-detail {
            padding: 6rem 1.5rem 3rem;
          }

          .product-detail-inner {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .product-visual-box {
            max-width: 400px;
            margin: 0 auto;
          }

          .product-detail-content h1 {
            font-size: 2.2rem;
          }
        }

        @media (max-width: 576px) {
          .product-detail {
            padding: 5rem 1rem 2rem;
          }

          .product-detail-content h1 {
            font-size: 1.8rem;
          }

          .product-detail-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
