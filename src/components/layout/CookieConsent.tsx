'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function CookieConsent() {
  const t = useTranslations('cookies');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    window.dispatchEvent(new CustomEvent('consent-given', { detail: 'accepted' }));
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
    window.dispatchEvent(new CustomEvent('consent-given', { detail: 'rejected' }));
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <div className="cookie-text">
          <h3>🍪 {t('title')}</h3>
          <p>{t('description')}</p>
        </div>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="btn-primary">
            {t('accept')}
          </button>
          <button onClick={handleReject} className="btn-secondary">
            {t('reject')}
          </button>
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
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          animation: slideUp 0.4s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .cookie-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .cookie-text h3 {
          font-size: 1.1rem;
          color: var(--deep-blue);
          margin-bottom: 0.25rem;
        }

        .cookie-text p {
          color: #666;
          font-size: 0.95rem;
          margin: 0;
        }

        .cookie-actions {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
        }

        .cookie-actions .btn-primary,
        .cookie-actions .btn-secondary {
          padding: 0.75rem 1.5rem;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .cookie-banner {
            padding: 1.25rem 1rem;
          }

          .cookie-content {
            flex-direction: column;
            text-align: center;
            gap: 1.25rem;
          }

          .cookie-actions {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .cookie-actions {
            flex-direction: column;
          }

          .cookie-actions .btn-primary,
          .cookie-actions .btn-secondary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
