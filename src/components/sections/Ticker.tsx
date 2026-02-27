'use client';

import { useTranslations } from 'next-intl';

export default function Ticker() {
  const t = useTranslations('ticker');

  const items = [
    { icon: '♻️', label: t('recycled') },
    { icon: '🔊', label: t('classA') },
    { icon: '🔥', label: t('fire') },
    { icon: '🇧🇪', label: t('belgium') },
    { icon: '🔄', label: t('takeback') },
    { icon: '🪵', label: t('veneer') },
    { icon: '🎨', label: t('colors') },
    { icon: '📐', label: t('custom') },
  ];

  // Duplicate for seamless infinite scroll
  const allItems = [...items, ...items];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {allItems.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" aria-hidden="true" />
            {item.icon} {item.label}
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-bar {
          background: var(--brand-blue);
          height: 44px;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
        }

        .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: ticker 32s linear infinite;
          will-change: transform;
        }

        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 0 1.8rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          flex-shrink: 0;
        }

        .ticker-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        /* Fade edges */
        .ticker-bar::before,
        .ticker-bar::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 60px;
          z-index: 2;
          pointer-events: none;
        }

        .ticker-bar::before {
          left: 0;
          background: linear-gradient(to right, var(--brand-blue), transparent);
        }

        .ticker-bar::after {
          right: 0;
          background: linear-gradient(to left, var(--brand-blue), transparent);
        }
      `}</style>
    </div>
  );
}
