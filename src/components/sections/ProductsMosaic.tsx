'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export default function ProductsMosaic() {
  const t = useTranslations('products');

  const products = [
    {
      slug: 'interior',
      series: 'Interior Series · INT-W-M',
      image: '/images/products/interior/interior_card.webp',
      tall: true,
    },
    {
      slug: 'solid',
      series: 'Solid Series · SOL-W-M',
      image: '/images/products/solid/solid_card.webp',
      tall: false,
    },
    {
      slug: 'rwood-groove',
      series: 'rWood Series · RW-W-M',
      image: '/images/products/rwood-groove/hero-rWood-Groove.webp',
      tall: false,
    },
    {
      slug: 'divide',
      series: 'Divide Series · DIV-FS',
      image: '/images/products/divide/divide_card.webp',
      tall: false,
    },
    {
      slug: 'rpet-groove',
      series: 'rPET Series · RPET-W-M',
      image: '/images/products/rpet-groove/hero-rpet-groove.webp',
      tall: false,
    },
  ];

  const applications = [
    { label: '🏢 Office', image: '/images/products/interior/installatie_interior.jpg' },
    { label: '🍽️ Hospitality', image: '/images/products/interior/gallery-1.jpg' },
    { label: '📚 Education', image: '/images/products/interior/gallery-2.jpg' },
    { label: '🏥 Healthcare', image: '/images/products/interior/gallery-3.jpg' },
  ];

  return (
    <section className="products-mosaic">

      {/* ── HEADER ── */}
      <div className="mosaic-header">
        <div className="header-left">
          <div className="label-blue">{t('tag')}</div>
          <h2>
            {t('title')} <em>{t('titleHighlight')}</em>
          </h2>
        </div>
        <div className="header-right">
          <p>{t('mosaicSubtitle')}</p>
          <Link href="/products" className="view-all">
            {t('viewAll')} →
          </Link>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="mosaic-grid">
        {products.map((p) => (
          <div key={p.slug} className={`mc ${p.tall ? 'mc-tall' : ''}`}>
            <div className="mc-img">
              <Image
                src={p.image}
                alt={t(`${p.slug}.title`)}
                fill
                style={{ objectFit: 'cover' }}
                sizes={p.tall ? '(max-width: 768px) 100vw, 35vw' : '(max-width: 768px) 50vw, 22vw'}
              />
            </div>
            <div className="mc-overlay" />
            <div className="mc-content">
              <span className="mc-series">{p.series}</span>
              <h3 className="mc-name">{t(`${p.slug}.title`)}</h3>
              <p className="mc-desc">{t(`${p.slug}.description`)}</p>
              <Link href={`/products/${p.slug}`} className="mc-link">
                {t('learnMore')} →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ── APPLICATION STRIP ── */}
      <div className="app-strip">
        {applications.map((a) => (
          <div key={a.label} className="app-cell">
            <div className="app-img">
              <Image
                src={a.image}
                alt={a.label}
                fill
                style={{ objectFit: 'cover' }}
                sizes="25vw"
              />
            </div>
            <div className="app-overlay" />
            <div className="app-label">{a.label}</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .products-mosaic {
          background: var(--cream);
          padding: 7rem 3.5rem 0;
        }

        /* ── HEADER ── */
        .mosaic-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          gap: 2rem;
        }

        .label-blue {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brand-blue);
          margin-bottom: 1rem;
        }

        .label-blue::before {
          content: '';
          width: 1.4rem;
          height: 2px;
          background: var(--brand-blue);
          border-radius: 1px;
          display: inline-block;
        }

        .header-left h2 {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -1.5px;
          line-height: 1.1;
          color: var(--charcoal);
        }

        .header-left h2 em {
          font-style: italic;
          color: var(--brand-blue);
        }

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.6rem;
          max-width: 22rem;
          text-align: right;
        }

        .header-right p {
          font-size: 0.88rem;
          color: var(--charcoal);
          opacity: 0.55;
          line-height: 1.65;
        }

        .view-all {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brand-blue);
          text-decoration: none;
          transition: gap 0.2s, letter-spacing 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .view-all:hover {
          gap: 0.6rem;
        }

        /* ── MOSAIC GRID ── */
        .mosaic-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          grid-template-rows: 54vh 36vh;
          gap: 10px;
        }

        .mc {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
        }

        .mc-tall {
          grid-row: span 2;
        }

        .mc-img {
          position: absolute;
          inset: 0;
          transition: transform 0.6s ease;
        }

        .mc:hover .mc-img {
          transform: scale(1.05);
        }

        .mc-img :global(img) {
          filter: brightness(0.82);
          transition: filter 0.4s ease;
        }

        .mc:hover .mc-img :global(img) {
          filter: brightness(0.94);
        }

        .mc-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(13, 58, 92, 0.9) 0%,
            rgba(13, 58, 92, 0.2) 50%,
            transparent 80%
          );
          transition: background 0.3s;
          z-index: 1;
        }

        .mc:hover .mc-overlay {
          background: linear-gradient(
            to top,
            rgba(13, 58, 92, 0.92) 0%,
            rgba(13, 58, 92, 0.35) 60%,
            transparent 85%
          );
        }

        .mc-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.8rem;
        }

        .mc-series {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--brand-blue-light);
          margin-bottom: 0.3rem;
        }

        .mc-name {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.4rem;
          letter-spacing: -0.3px;
        }

        .mc-desc {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.62);
          line-height: 1.5;
          margin-bottom: 0.85rem;
          max-width: 18rem;
        }

        .mc-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-decoration: none;
          background: rgba(25, 127, 199, 0.3);
          border: 1px solid rgba(25, 127, 199, 0.5);
          backdrop-filter: blur(6px);
          padding: 0.3rem 0.8rem;
          border-radius: var(--radius-full);
          opacity: 0;
          transform: translateY(6px);
          transition: all 0.3s;
          width: fit-content;
        }

        .mc:hover .mc-link {
          opacity: 1;
          transform: translateY(0);
        }

        .mc-link:hover {
          background: var(--brand-blue);
        }

        /* ── APPLICATION STRIP ── */
        .app-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 10px;
          padding-bottom: 7rem;
        }

        .app-cell {
          position: relative;
          border-radius: var(--radius-md);
          overflow: hidden;
          height: 18vh;
          min-height: 130px;
          cursor: pointer;
        }

        .app-img {
          position: absolute;
          inset: 0;
          transition: transform 0.4s ease;
        }

        .app-cell:hover .app-img {
          transform: scale(1.06);
        }

        .app-img :global(img) {
          filter: brightness(0.65);
          transition: filter 0.3s;
        }

        .app-cell:hover .app-img :global(img) {
          filter: brightness(0.85);
        }

        .app-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(13, 58, 92, 0.6), transparent 55%);
          z-index: 1;
        }

        .app-label {
          position: absolute;
          bottom: 0.85rem;
          left: 0.85rem;
          z-index: 2;
          background: rgba(253, 254, 255, 0.92);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.75rem;
          font-family: var(--font-heading);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--charcoal);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1200px) {
          .mosaic-grid {
            grid-template-columns: 1.3fr 1fr 1fr;
            grid-template-rows: 46vh 32vh;
          }
        }

        @media (max-width: 900px) {
          .products-mosaic {
            padding: 5rem 2rem 0;
          }

          .mosaic-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-right {
            align-items: flex-start;
            text-align: left;
          }

          .mosaic-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 44vh 32vh 32vh;
          }

          .mc-tall {
            grid-row: span 1;
          }
        }

        @media (max-width: 640px) {
          .products-mosaic {
            padding: 4rem 1.5rem 0;
          }

          .mosaic-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }

          .mc {
            height: 52vw;
            min-height: 220px;
          }

          .mc-tall {
            height: 70vw;
          }

          .app-strip {
            grid-template-columns: repeat(2, 1fr);
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </section>
  );
}
