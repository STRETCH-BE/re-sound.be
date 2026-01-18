'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="hero">
      <div className="hero-bg" />

      <div className="hero-content">
        <div className="hero-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {t('badge')}
        </div>

        <h1>
          {t('title')} <em>{t('titleHighlight')}</em>
        </h1>

        <p>{t('subtitle')}</p>

        <div className="hero-buttons">
          <Link href="/products" className="btn-primary">
            {t('ctaPrimary')}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/sustainability" className="btn-secondary">
            {t('ctaSecondary')}
          </Link>
        </div>
      </div>

      <div className="hero-visual">
        <div className="panel-showcase">
          <div className="panel-texture" />
        </div>
        <div className="panel-tag">♻️ {t('panelTag')}</div>
      </div>
    </section>
  );
}
