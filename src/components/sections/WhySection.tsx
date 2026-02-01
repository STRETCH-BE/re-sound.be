'use client';

import { useTranslations } from 'next-intl';

export default function WhySection() {
  const t = useTranslations('why');

  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: t('features.performance.title'),
      description: t('features.performance.description'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      title: t('features.durability.title'),
      description: t('features.durability.description'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      title: t('features.circular.title'),
      description: t('features.circular.description'),
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" />
        </svg>
      ),
      title: t('features.customization.title'),
      description: t('features.customization.description'),
    },
  ];

  return (
    <section className="why-section">
      <div className="why-grid">
        <div className="why-content">
          <span className="section-tag">{t('tag')}</span>
          <h2>{t('title')}</h2>
          <p className="subtitle">{t('subtitle')}</p>

          <div className="features-list">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="why-visual">
          <div className="circular-diagram">
            <div className="circle-outer" />
            <div className="circle-middle">
              <div className="circle-center">
                <span>100%</span>
                <p>{t('diagramLabel')}</p>
              </div>
            </div>
            <div className="orbit-item orbit-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M8 12l2 2 4-4" />
              </svg>
            </div>
            <div className="orbit-item orbit-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#197FC7" strokeWidth="2">
                <path d="M21 12a9 9 0 11-9-9" />
                <path d="M21 3v6h-6" />
              </svg>
            </div>
            <div className="orbit-item orbit-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <path d="M12 2v8m0 0l4-4m-4 4L8 6" />
                <path d="M2 12h4m12 0h4" />
                <path d="M12 22v-8m0 0l4 4m-4-4l-4 4" />
              </svg>
            </div>
            <div className="orbit-item orbit-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 6V4a2 2 0 012-2h8a2 2 0 012 2v2" />
                <path d="M12 12h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .why-section {
          padding: 80px 24px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .why-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .section-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #197FC7;
          margin-bottom: 16px;
        }

        h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
          margin: 0 0 16px 0;
        }

        .subtitle {
          font-size: 1.125rem;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 40px 0;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .feature-icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .feature-icon :global(svg) {
          width: 24px;
          height: 24px;
          color: #197FC7;
        }

        .feature-text {
          padding-top: 2px;
        }

        .feature-text h4 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .feature-text p {
          font-size: 0.9375rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }

        /* Circular Diagram */
        .why-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .circular-diagram {
          position: relative;
          width: 400px;
          height: 400px;
        }

        .circle-outer {
          position: absolute;
          inset: 0;
          border: 2px dashed #cbd5e1;
          border-radius: 50%;
        }

        .circle-middle {
          position: absolute;
          inset: 60px;
          background: linear-gradient(135deg, #197FC7 0%, #1565a0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .circle-center {
          text-align: center;
          color: white;
        }

        .circle-center span {
          font-size: 3rem;
          font-weight: 700;
          display: block;
        }

        .circle-center p {
          font-size: 1rem;
          margin: 4px 0 0 0;
          opacity: 0.9;
        }

        .orbit-item {
          position: absolute;
          width: 48px;
          height: 48px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .orbit-item :global(svg) {
          width: 24px;
          height: 24px;
        }

        .orbit-1 {
          top: 50%;
          left: -24px;
          transform: translateY(-50%);
        }

        .orbit-2 {
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
        }

        .orbit-3 {
          bottom: -24px;
          left: 50%;
          transform: translateX(-50%);
        }

        .orbit-4 {
          top: 50%;
          right: -24px;
          transform: translateY(-50%);
        }

        @media (max-width: 968px) {
          .why-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .why-visual {
            order: -1;
          }

          .circular-diagram {
            width: 320px;
            height: 320px;
          }

          .circle-middle {
            inset: 48px;
          }

          .circle-center span {
            font-size: 2.5rem;
          }

          h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .why-section {
            padding: 60px 16px;
          }

          .circular-diagram {
            width: 280px;
            height: 280px;
          }

          .circle-middle {
            inset: 40px;
          }

          .orbit-item {
            width: 40px;
            height: 40px;
          }

          .orbit-item :global(svg) {
            width: 20px;
            height: 20px;
          }

          .feature-icon {
            width: 40px;
            height: 40px;
          }

          .feature-icon :global(svg) {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </section>
  );
}
