'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Newsletter() {
  const t = useTranslations('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call - in real app, connect to Mailchimp/ConvertKit/etc.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setStatus('success');
    setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-content">
          <span className="section-tag">{t('tag')}</span>
          <h2>{t('title')}</h2>
          <p>{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="newsletter-form">
          {status === 'success' ? (
            <div className="success-message">
              <span>✓</span>
              {t('success')}
            </div>
          ) : (
            <>
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('placeholder')}
                  required
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? t('subscribing') : t('subscribe')}
                </button>
              </div>
              <p className="privacy-note">{t('privacy')}</p>
            </>
          )}
        </form>
      </div>

      <style jsx>{`
        .newsletter {
          padding: 6rem 4rem;
          background: var(--brand-blue);
          color: white;
        }

        .newsletter-inner {
          max-width: 800px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .newsletter-content .section-tag {
          color: var(--brand-blue-pale);
        }

        .newsletter-content h2 {
          font-size: 2rem;
          margin: 0.5rem 0 1rem;
        }

        .newsletter-content p {
          opacity: 0.9;
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          gap: 0.75rem;
        }

        .input-group input {
          flex: 1;
          padding: 1rem 1.25rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          outline: none;
          transition: all 0.3s ease;
        }

        .input-group input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .input-group input:focus {
          background: rgba(255, 255, 255, 0.25);
        }

        .newsletter-form .btn-primary {
          background: white;
          color: var(--brand-blue);
          border: none;
          white-space: nowrap;
        }

        .newsletter-form .btn-primary:hover {
          background: var(--cream);
        }

        .privacy-note {
          font-size: 0.85rem;
          opacity: 0.7;
          margin: 0;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          font-size: 1rem;
        }

        .success-message span {
          width: 28px;
          height: 28px;
          background: white;
          color: var(--brand-blue);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .newsletter {
            padding: 4rem 1.5rem;
          }

          .newsletter-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .input-group {
            flex-direction: column;
          }

          .newsletter-form .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .newsletter {
            padding: 3rem 1rem;
          }

          .newsletter-content h2 {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </section>
  );
}
