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
          <p>{t('subtitle')}</p>

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
            <div className="orbit-item">🌱</div>
            <div className="orbit-item">🔄</div>
            <div className="orbit-item">🎯</div>
            <div className="orbit-item">🏭</div>
          </div>
        </div>
      </div>
    </section>
  );
}
