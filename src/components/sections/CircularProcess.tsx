'use client';

import { useTranslations } from 'next-intl';

export default function CircularProcess() {
  const t = useTranslations('sustainability.process');

  const steps = [
    {
      number: '01',
      icon: '📦',
      title: t('collect.title'),
      description: t('collect.description'),
    },
    {
      number: '02',
      icon: '⚙️',
      title: t('process.title'),
      description: t('process.description'),
    },
    {
      number: '03',
      icon: '🎨',
      title: t('create.title'),
      description: t('create.description'),
    },
    {
      number: '04',
      icon: '🔄',
      title: t('return.title'),
      description: t('return.description'),
    },
  ];

  return (
    <section className="circular-process">
      <div className="process-inner">
        <span className="section-tag">{t('tag')}</span>
        <h2>{t('title')}</h2>

        <div className="process-timeline">
          {steps.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .circular-process {
          padding: 6rem 4rem;
          background: var(--cream);
        }

        .process-inner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .process-inner h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 4rem;
        }

        .process-timeline {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          position: relative;
        }

        .process-step {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          position: relative;
          transition: all 0.3s ease;
        }

        .process-step:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .step-number {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--brand-blue);
          color: white;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .step-icon {
          font-size: 3rem;
          margin: 1rem 0;
        }

        .process-step h3 {
          font-size: 1.2rem;
          color: var(--deep-blue);
          margin-bottom: 0.75rem;
        }

        .process-step p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
        }

        .step-connector {
          display: none;
        }

        @media (max-width: 992px) {
          .circular-process {
            padding: 4rem 1.5rem;
          }

          .process-timeline {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .circular-process {
            padding: 3rem 1rem;
          }

          .process-inner h2 {
            font-size: 1.8rem;
          }

          .process-timeline {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }

          .process-step {
            padding: 1.5rem;
          }
        }
      `}</style>
    </section>
  );
}
