'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-content">
        <div className="hero-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {t('badge')}
        </div>
        <h1>
          {t('title')} <em>{t('titleHighlight')}</em>
        </h1>
        <p>{t('subtitle')}</p>
        <div className="hero-buttons">
          <Link href="/products" className="btn-primary">
            {t('ctaPrimary')}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/sustainability" className="btn-secondary">
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>

      {/* UPDATED: Hero visual with actual image */}
      <div className="hero-visual">
        <div className="panel-showcase">
          {/* Option 1: Next.js Image component (recommended) */}
          <div className="panel-image-wrapper">
            <Image
              src="images/products/rwood-groove/seamless installation.jpg"
              alt="Re-Sound circular acoustic panels"
              fill
              style={{ objectFit: 'cover' }}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Optional: Keep texture overlay for visual effect */}
          <div className="panel-overlay" />
        </div>
        <div className="panel-tag">♻️ {t('panelTag')}</div>
      </div>

      <style jsx>{`
        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 8rem 4rem 4rem;
          min-height: 90vh;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f8f6f3 0%, #ffffff 50%, #e8f4fc 100%);
          z-index: -1;
        }

        .hero-content {
          z-index: 1;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #197FC7;
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-bottom: 1.5rem;
        }

        .hero-content h1 {
          font-size: 3.5rem;
          color: #0a1628;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }

        .hero-content h1 em {
          color: #197FC7;
          font-style: normal;
        }

        .hero-content p {
          font-size: 1.2rem;
          color: #555;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
        }

        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .panel-showcase {
          position: relative;
          width: 100%;
          max-width: 550px;
          aspect-ratio: 4/5;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .panel-image-wrapper {
          position: absolute;
          inset: 0;
        }

        /* Optional overlay for branding effect */
        .panel-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 0%,
            transparent 60%,
            rgba(10, 22, 40, 0.3) 100%
          );
          pointer-events: none;
        }

        .panel-tag {
          position: absolute;
          bottom: -1rem;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0.75rem 1.5rem;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #0a1628;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
        }

        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            padding: 6rem 2rem 3rem;
            min-height: auto;
            gap: 3rem;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .panel-showcase {
            max-width: 400px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 5rem 1.5rem 2rem;
          }

          .hero-content h1 {
            font-size: 2rem;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .panel-showcase {
            max-width: 300px;
          }
        }
      `}</style>
    </section>
  );
}
