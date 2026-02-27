'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function RWoodShowcase() {
  const t = useTranslations('rwood');

  const veneers = [
    {
      name: 'Silk Oak',
      code: 'RW-SILK',
      image: '/images/products/rwood-groove/swatches/silk-oak.jpg',
    },
    {
      name: 'Straw Oak',
      code: 'RW-STRAW',
      image: '/images/products/rwood-groove/swatches/straw-oak.jpg',
    },
    {
      name: 'Umber Oak',
      code: 'RW-UMBER',
      image: '/images/products/rwood-groove/swatches/umber-oak.jpg',
    },
    {
      name: 'Tobacco Walnut',
      code: 'RW-TOB',
      image: '/images/products/rwood-groove/swatches/tobacco-walnut.jpg',
    },
    {
      name: 'Walnut',
      code: 'RW-WAL',
      image: '/images/products/rwood-groove/swatches/walnut.jpg',
    },
    {
      name: 'Ash White',
      code: 'RW-ASH',
      image: '/images/products/rwood-veneer/ASH-White.jpg',
    },
    {
      name: 'Birch Sliced',
      code: 'RW-BIR',
      image: '/images/products/rwood-veneer/Birch-Sliced.jpg',
    },
    {
      name: 'Beech White',
      code: 'RW-BEECH',
      image: '/images/products/rwood-veneer/Beech-White.jpg',
    },
  ];

  const veneerStrip = [
    { name: 'Silk Oak', image: '/images/products/rwood-groove/silk-oak.jpg' },
    { name: 'Tobacco Walnut', image: '/images/products/rwood-groove/tobacco-walnut.jpg' },
    { name: 'Umber Oak', image: '/images/products/rwood-groove/umber-oak.jpg' },
    { name: 'Walnut', image: '/images/products/rwood-groove/walnut.jpg' },
    { name: 'Straw Oak', image: '/images/products/rwood-groove/straw-oak.jpg' },
  ];

  const specs = [
    { key: t('specAbsorptionKey'), val: 'αw 0.90 – 0.95' },
    { key: t('specFireKey'), val: 'B-s1,d0' },
    { key: t('specThicknessKey'), val: '40 mm' },
    { key: t('specVariantsKey'), val: t('specVariantsVal') },
    { key: t('specCoreKey'), val: t('specCoreVal') },
    { key: t('specStandardKey'), val: t('specStandardVal') },
  ];

  return (
    <section className="rwood-section">

      {/* ── HERO IMAGE + TEXT OVERLAY ── */}
      <div className="rwood-hero">
        <div className="rwood-hero-img">
          <Image
            src="/images/products/rwood-groove/hero-rWood-Groove.webp"
            alt="rWood acoustic panel with natural wood veneer finish"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="100vw"
          />
        </div>
        <div className="rwood-hero-overlay" />

        <div className="rwood-hero-text">
          <div className="section-tag-warm">{t('tag')}</div>
          <h2>
            {t('heroTitle')} <em>{t('heroTitleHighlight')}</em>
          </h2>
          <p>{t('heroSubtitle')}</p>
          <div className="rwood-hero-cta">
            <Link href="/products/rwood-groove" className="btn-warm">
              {t('ctaExplore')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/contact" className="btn-ghost-white">
              {t('ctaSample')}
            </Link>
          </div>
        </div>

        {/* Floating spec card */}
        <div className="spec-float">
          <div className="spec-float-tag">{t('floatTag')}</div>
          <div className="spec-float-grid">
            <div className="sfg-cell">
              <span className="sfg-k">{t('specAbsorptionKey')}</span>
              <span className="sfg-v">αw 0.95</span>
            </div>
            <div className="sfg-cell">
              <span className="sfg-k">{t('specFireKey')}</span>
              <span className="sfg-v">B-s1,d0</span>
            </div>
            <div className="sfg-cell">
              <span className="sfg-k">{t('specThicknessKey')}</span>
              <span className="sfg-v">40 mm</span>
            </div>
            <div className="sfg-cell">
              <span className="sfg-k">{t('specCoreKey')}</span>
              <span className="sfg-v">{t('specCoreVal')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── VENEER STRIP ── */}
      <div className="veneer-strip">
        {veneerStrip.map((v) => (
          <div key={v.name} className="veneer-cell">
            <Image
              src={v.image}
              alt={`${v.name} veneer`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="20vw"
            />
            <div className="veneer-label">
              <span className="veneer-name">{v.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── INFO + SWATCHES ── */}
      <div className="rwood-bottom">

        {/* Specs panel */}
        <div className="rwood-info">
          <div className="section-tag-warm">{t('specsTag')}</div>
          <h3>{t('specsTitle')}</h3>
          <p>{t('specsBody')}</p>

          <div className="specs-grid">
            {specs.map((s) => (
              <div key={s.key} className="spec-cell">
                <span className="spec-k">{s.key}</span>
                <span className="spec-v">{s.val}</span>
              </div>
            ))}
          </div>

          <div className="info-cta">
            <Link href="/products/rwood-groove" className="btn-warm">
              {t('ctaFullSpec')}
            </Link>
            <Link href="/documents/rwood-groove/datasheet.pdf" className="btn-outline-warm" target="_blank">
              {t('ctaDatasheet')}
            </Link>
          </div>
        </div>

        {/* Veneer swatches panel */}
        <div className="rwood-swatches">
          <div className="section-tag-warm">{t('swatchesTag')}</div>
          <h3>{t('swatchesTitle')}</h3>
          <p>{t('swatchesBody')}</p>

          <div className="swatch-grid">
            {veneers.map((v) => (
              <div key={v.code} className="swatch-item">
                <div className="swatch-img">
                  <Image
                    src={v.image}
                    alt={v.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                  />
                </div>
                <span className="swatch-name">{v.name}</span>
              </div>
            ))}
          </div>

          <Link href="/contact" className="btn-primary sample-btn">
            {t('ctaOrderSamples')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .rwood-section {
          background: #f5efe6;
        }

        /* ── HERO ── */
        .rwood-hero {
          position: relative;
          height: 68vh;
          min-height: 500px;
          overflow: hidden;
        }

        .rwood-hero-img {
          position: absolute;
          inset: 0;
          transition: transform 6s ease;
        }

        .rwood-hero:hover .rwood-hero-img {
          transform: scale(1.03);
        }

        .rwood-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(15, 7, 2, 0.82) 0%,
            rgba(15, 7, 2, 0.4) 55%,
            transparent 100%
          );
          z-index: 1;
        }

        .rwood-hero-text {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 4rem 5rem;
          max-width: 44rem;
          color: white;
        }

        .rwood-hero-text h2 {
          font-size: clamp(2.4rem, 4vw, 3.8rem);
          font-weight: 800;
          letter-spacing: -2px;
          line-height: 1.05;
          margin-bottom: 0.8rem;
          color: white;
        }

        .rwood-hero-text h2 em {
          font-style: italic;
          color: #d4a97a;
        }

        .rwood-hero-text p {
          font-size: 1rem;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.7);
          max-width: 28rem;
          margin-bottom: 1.6rem;
        }

        .rwood-hero-cta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        /* Floating spec card */
        .spec-float {
          position: absolute;
          bottom: 3rem;
          right: 4rem;
          z-index: 3;
          background: rgba(253, 254, 255, 0.97);
          backdrop-filter: blur(16px);
          border-radius: var(--radius-lg);
          padding: 1.4rem 1.8rem;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(139, 98, 53, 0.12);
          min-width: 17rem;
        }

        .spec-float-tag {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b6235;
          margin-bottom: 0.7rem;
        }

        .spec-float-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e4e0d8;
          border-radius: var(--radius-sm);
          overflow: hidden;
        }

        .sfg-cell {
          background: white;
          padding: 0.6rem 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .sfg-k {
          font-size: 0.57rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b0a898;
        }

        .sfg-v {
          font-family: var(--font-heading);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        /* ── VENEER STRIP ── */
        .veneer-strip {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
          height: 26vh;
          min-height: 180px;
        }

        .veneer-cell {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .veneer-cell :global(img) {
          filter: brightness(0.82) saturate(0.9);
          transition: all 0.45s ease;
        }

        .veneer-cell:hover :global(img) {
          transform: scale(1.07);
          filter: brightness(1) saturate(1.1);
        }

        .veneer-label {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(15, 7, 2, 0.85), transparent);
          padding: 0.7rem 0.8rem 0.6rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .veneer-cell:hover .veneer-label {
          opacity: 1;
        }

        .veneer-name {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
          display: block;
        }

        /* ── BOTTOM ROW ── */
        .rwood-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .rwood-info {
          background: #f5efe6;
          padding: 4.5rem 5rem;
          border-right: 1px solid rgba(139, 98, 53, 0.1);
        }

        .rwood-info h3,
        .rwood-swatches h3 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--charcoal);
          margin-bottom: 0.7rem;
        }

        .rwood-info p,
        .rwood-swatches p {
          font-size: 0.95rem;
          line-height: 1.8;
          color: var(--charcoal);
          opacity: 0.6;
          margin-bottom: 2rem;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          background: rgba(139, 98, 53, 0.15);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .spec-cell {
          background: white;
          padding: 0.95rem 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          transition: background 0.2s;
        }

        .spec-cell:hover {
          background: #fffdf9;
        }

        .spec-k {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
        }

        .spec-v {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        .info-cta {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        /* ── SWATCHES ── */
        .rwood-swatches {
          background: white;
          padding: 4.5rem 5rem;
        }

        .swatch-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 2rem;
        }

        .swatch-item {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .swatch-img {
          position: relative;
          height: 3.5rem;
          border-radius: var(--radius-sm);
          overflow: hidden;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .swatch-item:hover .swatch-img {
          transform: translateY(-3px) scale(1.04);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        }

        .swatch-name {
          font-size: 0.62rem;
          font-weight: 600;
          color: #888;
          text-align: center;
          letter-spacing: 0.04em;
        }

        .sample-btn {
          width: 100%;
          justify-content: center;
        }

        /* ── SECTION LABELS ── */
        .section-tag-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b6235;
          margin-bottom: 1.1rem;
        }

        .section-tag-warm::before {
          content: '';
          width: 1.4rem;
          height: 2px;
          background: #8b6235;
          border-radius: 1px;
          display: inline-block;
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
          border: none;
          cursor: pointer;
        }

        .btn-warm:hover {
          background: #7a5430;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(139, 98, 53, 0.28);
        }

        .btn-outline-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: transparent;
          color: #8b6235;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.72rem 1.5rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          border: 2px solid rgba(139, 98, 53, 0.28);
          transition: all 0.25s;
        }

        .btn-outline-warm:hover {
          border-color: #8b6235;
          background: rgba(139, 98, 53, 0.06);
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
          box-shadow: 0 12px 28px rgba(25, 127, 199, 0.28);
        }

        .btn-ghost-white {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.72rem 1.5rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          border: 1.5px solid rgba(255, 255, 255, 0.28);
          transition: all 0.25s;
        }

        .btn-ghost-white:hover {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .rwood-hero-text {
            padding: 3rem;
          }

          .spec-float {
            display: none;
          }

          .veneer-strip {
            grid-template-columns: repeat(3, 1fr);
            height: 22vh;
          }

          .rwood-bottom {
            grid-template-columns: 1fr;
          }

          .rwood-info {
            border-right: none;
            border-bottom: 1px solid rgba(139, 98, 53, 0.1);
            padding: 3.5rem 3rem;
          }

          .rwood-swatches {
            padding: 3.5rem 3rem;
          }

          .swatch-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 640px) {
          .rwood-hero {
            min-height: 440px;
          }

          .rwood-hero-text {
            padding: 2rem 1.5rem;
          }

          .rwood-hero-text h2 {
            font-size: 2.2rem;
          }

          .veneer-strip {
            grid-template-columns: repeat(2, 1fr);
            height: 28vh;
          }

          .swatch-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }

          .rwood-info,
          .rwood-swatches {
            padding: 2.5rem 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
