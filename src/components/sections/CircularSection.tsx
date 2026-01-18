'use client';

import { useTranslations } from 'next-intl';

export default function CircularSection() {
  const t = useTranslations('circular');

  const steps = [
    { number: 1, title: t('steps.collect.title'), description: t('steps.collect.description') },
    { number: 2, title: t('steps.transform.title'), description: t('steps.transform.description') },
    { number: 3, title: t('steps.install.title'), description: t('steps.install.description') },
    { number: 4, title: t('steps.return.title'), description: t('steps.return.description') },
  ];

  return (
    <section className="circular-section">
      <div className="circular-grid">
        <div className="circular-content">
          <span className="section-tag">{t('tag')}</span>
          <h2>
            {t('title')} <em>{t('titleHighlight')}</em>
          </h2>
          <p>{t('subtitle')}</p>

          <div className="process-steps">
            {steps.map((step) => (
              <div key={step.number} className="step">
                <span className="step-number">{step.number}</span>
                <div className="step-text">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="loop-visual">
          <div className="loop-diagram">
            <div className="loop-circle">
              <div className="loop-arrow" />
            </div>
            <div className="loop-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9" />
              </svg>
              <span>{t('loopLabel')}</span>
            </div>
            <div className="loop-node">📦</div>
            <div className="loop-node">♻️</div>
            <div className="loop-node">🏠</div>
            <div className="loop-node">🔄</div>
          </div>
        </div>
      </div>
    </section>
  );
}
