'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import Input from '@/components/ui/Input';
import { track } from '@/lib/analytics';
import { leadNotes, type CalculationResult } from '@/lib/acoustics/calculate';
import { recommendedFamilies } from '@/lib/acoustics/recommend';

interface CalculatorLeadFormProps {
  result: CalculationResult;
}

/**
 * "Send me this calculation and a quote" — posts to /api/lead with the
 * calculation summarised in extraFields.notes (same route and required
 * fields as the sample-kit and download forms).
 */
export default function CalculatorLeadForm({ result }: CalculatorLeadFormProps) {
  const t = useTranslations('calculator.lead');
  const locale = useLocale();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!result.valid) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('sending');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: String(data.get('company') ?? ''),
          firstName: String(data.get('firstName') ?? ''),
          lastName: String(data.get('lastName') ?? ''),
          email: String(data.get('email') ?? ''),
          phone: '',
          position: '',
          companyType: '',
          source: 'Acoustic calculator',
          downloadedFile: 'RT60 calculation',
          extraFields: { notes: leadNotes(result) },
          website: String(data.get('website') ?? ''),
        }),
      });
      if (res.ok) {
        setStatus('success');
        track('lead_calculator', { locale, product_range: recommendedFamilies(result.recommendations) });
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="calc-lead">
      <div className="calc-lead-row">
        <Input name="firstName" label={t('firstName')} autoComplete="given-name" required />
        <Input name="lastName" label={t('lastName')} autoComplete="family-name" required />
      </div>
      <div className="calc-lead-row">
        <Input name="company" label={t('company')} autoComplete="organization" required />
        <Input name="email" type="email" label={t('email')} autoComplete="email" required />
      </div>

      {/* Honeypot: visually hidden but visible to bots. Real users skip it. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="calc-website">{t('honeypot')}</label>
        <input type="text" id="calc-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-status" role="status" aria-live="polite">
        {status === 'success' && (
          <div className="form-message success">
            <span aria-hidden="true">&#10003;</span> {t('success')}
          </div>
        )}
        {status === 'error' && (
          <div className="form-message error">
            <span aria-hidden="true">!</span> {t('error')}
          </div>
        )}
        {!result.valid && <p className="calc-lead-incomplete">{t('incomplete')}</p>}
      </div>

      <button type="submit" className="btn-primary" disabled={status === 'sending' || !result.valid}>
        {status === 'sending' ? t('sending') : t('submit')}
      </button>

      <p className="form-consent">
        {t.rich('privacyNotice', {
          link: (chunks) => <a href={`/${locale}/privacy`}>{chunks}</a>,
        })}
      </p>

      <style jsx>{`
        .calc-lead {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .calc-lead-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          font-size: 0.95rem;
        }

        .form-message.success {
          background: #e6f7f0;
          color: #059669;
        }

        .form-message.error {
          background: #fef2f2;
          color: #dc2626;
        }

        .form-message span {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: white;
        }

        .form-message.success span {
          background: #059669;
        }

        .form-message.error span {
          background: #dc2626;
        }

        .calc-lead-incomplete {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }

        .calc-lead .btn-primary {
          align-self: flex-start;
        }

        /* Visually-hidden honeypot — invisible to real users, parseable by bots */
        .hp-field {
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
        }

        .form-consent {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
        }

        .form-consent :global(a) {
          color: var(--brand-blue);
          text-decoration: underline;
        }

        @media (max-width: 576px) {
          .calc-lead-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .calc-lead .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </form>
  );
}
