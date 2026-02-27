'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function DualCTA() {
  const t = useTranslations('dualCta');

  return (
    <section className="dual-cta">

      {/* LEFT: rWood samples */}
      <div className="cta-half cta-left">
        <div className="cta-img">
          <Image
            src="/images/products/rwood-groove/gallery-1.webp"
            alt="rWood natural veneer acoustic panel samples"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="50vw"
          />
        </div>
        <div className="cta-overlay overlay-warm" />
        <div className="cta-body">
          <span className="cta-eyebrow">{t('left.eyebrow')}</span>
          <h3>{t('left.title')}</h3>
          <p>{t('left.subtitle')}</p>
          <Link href="/contact?type=samples" className="btn-warm">
            {t('left.cta')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* RIGHT: Quote request */}
      <div className="cta-half cta-right">
        <div className="cta-img">
          <Image
            src="/images/products/interior/overview.jpg"
            alt="Modern space with Re-Sound circular acoustic panels"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="50vw"
          />
        </div>
        <div className="cta-overlay overlay-blue" />
        <div className="cta-body">
          <span className="cta-eyebrow">{t('right.eyebrow')}</span>
          <h3>{t('right.title')}</h3>
          <p>{t('right.subtitle')}</p>
          <Link href="/contact" className="btn-primary">
            {t('right.cta')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .dual-cta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 54vh;
          min-height: 380px;
        }

        .cta-half {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding: 3.5rem;
        }

        .cta-img {
          position: absolute;
          inset: 0;
          transition: transform 7s ease;
        }

        .cta-half:hover .cta-img {
          transform: scale(1.04);
        }

        .cta-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
        }

        .overlay-warm {
          background: linear-gradient(135deg, rgba(20, 10, 3, 0.9) 0%, rgba(30, 16, 5, 0.55) 100%);
        }

        .overlay-blue {
          background: linear-gradient(135deg, rgba(5, 15, 32, 0.92) 0%, rgba(10, 28, 55, 0.55) 100%);
        }

        .cta-body {
          position: relative;
          z-index: 2;
          color: white;
          max-width: 28rem;
        }

        .cta-eyebrow {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.6rem;
        }

        .cta-body h3 {
          font-family: var(--font-heading);
          font-size: clamp(1.7rem, 2.5vw, 2.2rem);
          font-weight: 800;
          letter-spacing: -0.8px;
          line-height: 1.1;
          margin-bottom: 0.6rem;
          color: white;
        }

        .cta-body p {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.58);
          margin-bottom: 1.5rem;
          line-height: 1.65;
        }

        /* ── BUTTONS ── */
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

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .dual-cta {
            grid-template-columns: 1fr;
            height: auto;
          }

          .cta-half {
            min-height: 48vw;
            padding: 2.5rem;
          }
        }

        @media (max-width: 480px) {
          .cta-half {
            min-height: 56vw;
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
