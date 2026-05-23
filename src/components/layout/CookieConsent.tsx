'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  CONSENT_OPEN_EVENT,
  getConsent,
  setConsent,
} from '@/lib/consent';

/**
 * Granular cookie consent banner.
 *
 * Three categories:
 *  - Necessary   (always on; required for the site to function)
 *  - Analytics   (GA4, Microsoft Clarity)
 *  - Marketing   (Meta Pixel, Bing UET)
 *
 * Two views:
 *  - Compact:  short description + "Accept all" / "Reject all" / "Customise"
 *  - Settings: per-category toggles + "Save preferences"
 *
 * Reopens when any code dispatches the `consent-open-banner` event
 * (the footer "Manage cookies" link does this).
 */
export default function CookieConsent() {
  const t = useTranslations('cookies');
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // First-load: show only if no stored consent yet
  useEffect(() => {
    const stored = getConsent();
    if (!stored) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
    }
  }, []);

  // Listen for "open banner" requests (e.g. footer link)
  useEffect(() => {
    const open = () => {
      const stored = getConsent();
      if (stored) {
        setAnalytics(stored.analytics);
        setMarketing(stored.marketing);
      }
      setShowSettings(true);
      setIsVisible(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  const persist = useCallback((a: boolean, m: boolean) => {
    setConsent({ analytics: a, marketing: m });
    setIsVisible(false);
    setShowSettings(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <div className="cookie-content">
        <div className="cookie-text">
          <h3 id="cookie-banner-title">🍪 {t('title')}</h3>
          <p>
            {t('description')}{' '}
            <a href="/privacy" className="cookie-link">
              {t('readPolicy')}
            </a>
          </p>
        </div>

        {showSettings && (
          <div className="cookie-settings">
            <label className="cookie-row cookie-row-locked">
              <span className="cookie-row-text">
                <span className="cookie-row-title">{t('necessary.title')}</span>
                <span className="cookie-row-desc">
                  {t('necessary.description')}
                </span>
              </span>
              <span className="cookie-toggle cookie-toggle-locked">
                {t('alwaysOn')}
              </span>
            </label>

            <label className="cookie-row">
              <span className="cookie-row-text">
                <span className="cookie-row-title">{t('analytics.title')}</span>
                <span className="cookie-row-desc">
                  {t('analytics.description')}
                </span>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                aria-label={t('analytics.title')}
              />
            </label>

            <label className="cookie-row">
              <span className="cookie-row-text">
                <span className="cookie-row-title">{t('marketing.title')}</span>
                <span className="cookie-row-desc">
                  {t('marketing.description')}
                </span>
              </span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                aria-label={t('marketing.title')}
              />
            </label>
          </div>
        )}

        <div className="cookie-actions">
          {!showSettings && (
            <>
              <button
                type="button"
                onClick={() => persist(true, true)}
                className="btn-primary"
              >
                {t('acceptAll')}
              </button>
              <button
                type="button"
                onClick={() => persist(false, false)}
                className="btn-secondary"
              >
                {t('rejectAll')}
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="btn-link"
              >
                {t('customise')}
              </button>
            </>
          )}
          {showSettings && (
            <>
              <button
                type="button"
                onClick={() => persist(analytics, marketing)}
                className="btn-primary"
              >
                {t('savePreferences')}
              </button>
              <button
                type="button"
                onClick={() => persist(true, true)}
                className="btn-secondary"
              >
                {t('acceptAll')}
              </button>
              <button
                type="button"
                onClick={() => persist(false, false)}
                className="btn-link"
              >
                {t('rejectAll')}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.12);
          z-index: 1000;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }

        .cookie-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        .cookie-text h3 {
          font-size: 1.1rem;
          color: var(--deep-blue);
          margin-bottom: 0.25rem;
        }
        .cookie-text p {
          color: #555;
          font-size: 0.95rem;
          margin: 0;
        }
        .cookie-link {
          color: var(--brand-blue);
          text-decoration: underline;
        }

        .cookie-settings {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: #f7f9fb;
          border-radius: 12px;
        }

        .cookie-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.5rem 0;
          cursor: pointer;
        }
        .cookie-row-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .cookie-row-title {
          font-weight: 600;
          color: var(--deep-blue);
          font-size: 0.95rem;
        }
        .cookie-row-desc {
          color: #666;
          font-size: 0.85rem;
        }
        .cookie-row input[type='checkbox'] {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: var(--brand-blue);
        }

        .cookie-toggle-locked {
          font-size: 0.8rem;
          padding: 0.25rem 0.6rem;
          background: #c9d6e0;
          color: #2a2a2a;
          border-radius: 999px;
          font-weight: 600;
        }

        .cookie-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .cookie-actions .btn-primary,
        .cookie-actions .btn-secondary {
          padding: 0.65rem 1.25rem;
          font-size: 0.9rem;
        }

        .cookie-actions .btn-link {
          background: none;
          border: none;
          color: var(--brand-blue);
          font-size: 0.9rem;
          text-decoration: underline;
          padding: 0.65rem 0.5rem;
          cursor: pointer;
        }

        @media (min-width: 900px) {
          .cookie-content {
            grid-template-columns: 1fr auto;
            grid-template-areas: 'text actions' 'settings settings';
            align-items: center;
            gap: 1.5rem 2rem;
          }
          .cookie-text { grid-area: text; }
          .cookie-actions { grid-area: actions; flex-shrink: 0; }
          .cookie-settings { grid-area: settings; }
        }

        @media (max-width: 768px) {
          .cookie-banner {
            padding: 1.25rem 1rem;
          }
          .cookie-actions {
            justify-content: stretch;
          }
          .cookie-actions .btn-primary,
          .cookie-actions .btn-secondary {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
