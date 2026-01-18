'use client';

import { useTranslations } from 'next-intl';

export default function AboutStory() {
  const t = useTranslations('about.story');

  return (
    <section className="about-story">
      <div className="story-inner">
        <div className="story-content">
          <span className="section-tag">{t('tag')}</span>
          <h2>{t('title')}</h2>
          <p>{t('paragraph1')}</p>
          <p>{t('paragraph2')}</p>
          <p>{t('paragraph3')}</p>
        </div>

        <div className="story-visual">
          <div className="story-image">
            <div className="image-placeholder">
              <span>🏭</span>
              <p>{t('imagePlaceholder')}</p>
            </div>
          </div>
          <div className="story-stat">
            <span className="stat-year">2021</span>
            <span className="stat-label">{t('founded')}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-story {
          padding: 6rem 4rem;
          background: white;
        }

        .story-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-content h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin: 0.5rem 0 2rem;
          letter-spacing: -1px;
        }

        .story-content p {
          color: #666;
          font-size: 1.05rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .story-visual {
          position: relative;
        }

        .story-image {
          background: var(--cream);
          border-radius: 24px;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .image-placeholder span {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .image-placeholder p {
          color: #888;
          font-size: 0.9rem;
        }

        .story-stat {
          position: absolute;
          bottom: -30px;
          left: 30px;
          background: var(--brand-blue);
          color: white;
          padding: 1.5rem 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(25, 127, 199, 0.3);
        }

        .stat-year {
          display: block;
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        @media (max-width: 992px) {
          .about-story {
            padding: 4rem 1.5rem;
          }

          .story-inner {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .story-visual {
            order: -1;
          }

          .story-content h2 {
            font-size: 2rem;
          }
        }

        @media (max-width: 576px) {
          .about-story {
            padding: 3rem 1rem;
          }

          .story-content h2 {
            font-size: 1.8rem;
          }

          .story-stat {
            bottom: -20px;
            left: 20px;
            padding: 1rem 1.5rem;
          }

          .stat-year {
            font-size: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
