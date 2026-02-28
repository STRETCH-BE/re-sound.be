'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import SampleKitModal from './SampleKitModal';

export default function DualCTA() {
  const t = useTranslations('dualCta');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
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
            <button className="dcta-btn-warm" onClick={() => setModalOpen(true)}>
              {t('left.cta')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </button>
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
            <Link href="/contact" className="dcta-btn-blue">
              {t('right.cta')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Modal (separate file — avoids styled-jsx mixed-mode panic) */}
      <SampleKitModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* All styles global — Link renders <a> so scoped hash never applies */}
      <style jsx global>{`
        .dual-cta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 56vh;
          min-height: 400px;
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
          transition: transform 8s ease;
        }
        .cta-half:hover .cta-img {
          transform: scale(1.05);
        }
        .cta-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .overlay-warm {
          background: linear-gradient(
            to top,
            rgba(10,4,1,0.96) 0%,
            rgba(10,4,1,0.62) 45%,
            rgba(10,4,1,0.12) 100%
          );
        }
        .overlay-blue {
          background: linear-gradient(
            to top,
            rgba(2,10,28,0.97) 0%,
            rgba(2,10,28,0.65) 45%,
            rgba(2,10,28,0.12) 100%
          );
        }
        .cta-body {
          position: relative;
          z-index: 2;
          color: white;
          max-width: 26rem;
        }
        .cta-eyebrow {
          display: block;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 0.55rem;
        }
        .cta-body h3 {
          font-family: var(--font-heading);
          font-size: clamp(1.6rem, 2.4vw, 2.1rem);
          font-weight: 800;
          letter-spacing: -0.8px;
          line-height: 1.1;
          margin-bottom: 0.55rem;
          color: white;
        }
        .cta-body > p {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.52);
          margin-bottom: 1.4rem;
          line-height: 1.65;
        }

        /* ── Warm button — also used on <button> so needs global */
        .dcta-btn-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #8b6235;
          color: #fff !important;
          font-weight: 700;
          font-size: 0.84rem;
          padding: 0.68rem 1.4rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          white-space: nowrap;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .dcta-btn-warm:hover {
          background: #7a5430;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(139,98,53,0.35);
        }

        /* ── Blue button — on <Link> so needs global */
        .dcta-btn-blue {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--brand-blue);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.84rem;
          padding: 0.68rem 1.4rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .dcta-btn-blue:hover {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(25,127,199,0.35);
        }

        @media (max-width: 768px) {
          .dual-cta { grid-template-columns: 1fr; height: auto; }
          .cta-half { min-height: 52vw; padding: 2.5rem; }
        }
        @media (max-width: 480px) {
          .cta-half { min-height: 60vw; padding: 2rem 1.5rem; }
        }
      `}</style>
    </>
  );
}
