'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';

import { analytics } from '@/lib/analytics';

/**
 * Every visible string, translated by the server component that mounts the
 * gate (BoothPriceGuide). The guide page provides no NextIntlClientProvider,
 * so the island takes plain props and stays free of next-intl hooks — which
 * also keeps it trivially dynamic-importable.
 */
export interface PriceListGateLabels {
  tag: string;
  title: string;
  text: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  honeypot: string;
  /** Consent sentence, may contain the privacy-policy link */
  consent: ReactNode;
  submit: string;
  sending: string;
  successTitle: string;
  successText: string;
  successLink: string;
  /** 400/422 from the API: the details did not validate */
  errorInvalid: string;
  /** Any other failure */
  error: string;
}

interface PriceListGateProps {
  locale: string;
  labels: PriceListGateLabels;
}

type Status = 'idle' | 'sending' | 'success' | 'error';
type ErrorKey = 'error' | 'errorInvalid';

const FALLBACK_FILENAME = 're-sound-phone-booth-price-list.pdf';

/** File name from a Content-Disposition header (RFC 6266), else the fallback. */
function filenameFrom(disposition: string | null): string {
  if (!disposition) return FALLBACK_FILENAME;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      /* fall through to the plain form */
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain ? plain[1].trim() : FALLBACK_FILENAME;
}

const field = (fd: FormData, name: string) => String(fd.get(name) ?? '').trim();

/**
 * Price-list gate: a compact card under the booth price table. First name,
 * last name, company and e-mail (plus the honeypot) go to POST /api/pricelist,
 * which answers with the PDF bytes; the gate turns them into an object URL,
 * triggers the download and keeps a link as a fallback for browsers that
 * block the programmatic click. Fires lead_pricelist on success.
 */
export default function PriceListGate({ locale, labels }: PriceListGateProps) {
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<ErrorKey>('error');
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null);

  // Release the object URL when the gate unmounts.
  useEffect(() => {
    if (!download) return;
    const { url } = download;
    return () => URL.revokeObjectURL(url);
  }, [download]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus('sending');
    try {
      const res = await fetch('/api/pricelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: field(fd, 'firstName'),
          lastName: field(fd, 'lastName'),
          email: field(fd, 'email'),
          company: field(fd, 'company'),
          locale,
          // Honeypot — the API drops the submission when it is filled.
          website: String(fd.get('website') ?? ''),
        }),
      });

      if (!res.ok) {
        setErrorKey(res.status === 400 || res.status === 422 ? 'errorInvalid' : 'error');
        setStatus('error');
        return;
      }

      // Only a PDF body is a download; any other 200 (the honeypot answer)
      // just shows the success state.
      if (res.headers.get('content-type')?.includes('application/pdf')) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const name = filenameFrom(res.headers.get('content-disposition'));
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownload({ url, name });
      }
      setStatus('success');
      analytics.leadPricelist({ locale, product_range: 'booths' });
    } catch {
      setErrorKey('error');
      setStatus('error');
    }
  }

  const fid = (name: string) => `${id}-${name}`;

  return (
    <section className="ps-section guide-text-section plg-section" id="price-list" aria-labelledby={fid('title')}>
      <div className="ps-header">
        <span className="section-tag">{labels.tag}</span>
        <h2 id={fid('title')}>{labels.title}</h2>
        <p>{labels.text}</p>
      </div>

      <div className="plg-card">
        {status === 'success' ? (
          <div className="plg-success" role="status" aria-live="polite">
            <h3>{labels.successTitle}</h3>
            <p>{labels.successText}</p>
            {download && (
              <a className="btn-primary" href={download.url} download={download.name}>
                {labels.successLink}
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="plg-form">
            <div className="plg-row">
              <div className="plg-field">
                <label htmlFor={fid('firstName')}>
                  {labels.firstName} <span className="plg-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('firstName')} name="firstName" type="text" required maxLength={100} autoComplete="given-name" />
              </div>
              <div className="plg-field">
                <label htmlFor={fid('lastName')}>
                  {labels.lastName} <span className="plg-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('lastName')} name="lastName" type="text" required maxLength={100} autoComplete="family-name" />
              </div>
            </div>
            <div className="plg-row">
              <div className="plg-field">
                <label htmlFor={fid('company')}>
                  {labels.company} <span className="plg-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('company')} name="company" type="text" required maxLength={200} autoComplete="organization" />
              </div>
              <div className="plg-field">
                <label htmlFor={fid('email')}>
                  {labels.email} <span className="plg-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('email')} name="email" type="email" required maxLength={200} autoComplete="email" />
              </div>
            </div>

            {/* Honeypot: visually hidden but visible to bots. Real users skip it. */}
            <div className="hp-field" aria-hidden="true">
              <label htmlFor={fid('website')}>{labels.honeypot}</label>
              <input type="text" id={fid('website')} name="website" tabIndex={-1} autoComplete="off" />
            </div>

            <label className="plg-consent">
              <input type="checkbox" name="consent" required />
              <span>{labels.consent}</span>
            </label>

            {status === 'error' && (
              <p className="plg-error" role="alert">
                {labels[errorKey]}
              </p>
            )}

            <button type="submit" className="btn-primary plg-submit" disabled={status === 'sending'}>
              {status === 'sending' ? labels.sending : labels.submit}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .plg-section {
          padding-top: 3rem;
          padding-bottom: 4rem;
        }
        .plg-card {
          max-width: 720px;
          margin: 0 auto;
          background: white;
          border: 1px solid #e6ecf1;
          border-radius: var(--radius-md);
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(13, 58, 92, 0.06);
        }
        .plg-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .plg-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .plg-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          min-width: 0;
        }
        .plg-field label {
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--deep-blue);
        }
        .plg-req {
          color: #e53e3e;
        }
        .plg-field input {
          width: 100%;
          padding: 0.8rem 1.1rem;
          border: 2px solid var(--sand);
          border-radius: 12px;
          font: inherit;
          font-size: 0.98rem;
          color: var(--charcoal);
          background: white;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .plg-field input:focus {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px var(--brand-blue-pale);
        }
        .plg-consent {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #4b5563;
          line-height: 1.5;
          cursor: pointer;
        }
        .plg-consent input {
          width: 1.1rem;
          height: 1.1rem;
          margin-top: 0.15rem;
          flex-shrink: 0;
          accent-color: var(--brand-blue);
        }
        .plg-consent :global(a) {
          color: var(--brand-blue);
          text-decoration: underline;
        }
        .plg-error {
          padding: 0.9rem 1.1rem;
          border-radius: 12px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 0.92rem;
          margin: 0;
        }
        .plg-submit {
          align-self: flex-start;
        }
        .plg-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .plg-success {
          text-align: center;
          padding: 1rem 0;
        }
        .plg-success h3 {
          font-size: 1.35rem;
          color: var(--deep-blue);
          margin: 0 0 0.6rem;
        }
        .plg-success p {
          color: #555;
          line-height: 1.7;
          margin: 0 0 1.25rem;
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

        @media (max-width: 640px) {
          .plg-card {
            padding: 1.5rem;
          }
          .plg-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
