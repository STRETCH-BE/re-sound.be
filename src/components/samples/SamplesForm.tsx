'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { analytics } from '@/lib/analytics';

import { SAMPLE_FAMILIES, productRangeFor, sampleRanges } from './sampleRanges';

/**
 * Same values as the former SampleKitModal: the English country name is what
 * the lead e-mail shows; the visible label comes from sampleKit.countries.*.
 */
const COUNTRY_OPTIONS = [
  { value: 'Belgium', labelKey: 'belgium' },
  { value: 'Netherlands', labelKey: 'netherlands' },
  { value: 'Luxembourg', labelKey: 'luxembourg' },
  { value: 'France', labelKey: 'france' },
  { value: 'Germany', labelKey: 'germany' },
  { value: 'Other', labelKey: 'other' },
] as const;

const PROJECT_TYPES = ['office', 'education', 'healthcare', 'hospitality', 'residential', 'other'] as const;

const LEAD_EMAIL = 'leads@stretchgroup.be';

type Status = 'idle' | 'sending' | 'success' | 'error';

const field = (fd: FormData, name: string) => String(fd.get(name) ?? '').trim();

/**
 * Sample-kit request form — the client island of /samples.
 *
 * Native validation only (required attributes plus one custom validity for
 * "tick at least one range"). Posts the same shape as every other lead form
 * to /api/lead, shows an inline confirmation in place of the form and fires
 * the lead_sample event with the families of the ranges picked.
 */
export default function SamplesForm() {
  const t = useTranslations('samples.form');
  const tf = useTranslations('samples.families');
  const tk = useTranslations('sampleKit');
  const locale = useLocale();
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [submittedName, setSubmittedName] = useState('');
  const firstRangeRef = useRef<HTMLInputElement>(null);

  // "At least one range" is the one rule native attributes cannot express: a
  // custom validity on the first checkbox surfaces it in the browser's own
  // validation bubble, and any change clears it again.
  function clearRangeValidity() {
    firstRangeRef.current?.setCustomValidity('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const ids = fd.getAll('ranges').map(String);
    if (ids.length === 0) {
      firstRangeRef.current?.setCustomValidity(t('fields.rangesRequired'));
      form.reportValidity();
      return;
    }

    const firstName = field(fd, 'firstName');
    const country = field(fd, 'country');
    const address = field(fd, 'address');
    const projectType = field(fd, 'projectType');
    const area = field(fd, 'area');

    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName: field(fd, 'lastName'),
          email: field(fd, 'email'),
          phone: '',
          companyName: field(fd, 'company'),
          position: '',
          companyType: '',
          source: 'Samples page',
          downloadedFile: 'Sample kit',
          extraFields: {
            requestedSamples: ids.join(', '),
            shippingAddress: [address, country].filter(Boolean).join('\n'),
            notes: area ? `Project type: ${projectType}; ${area} m²` : `Project type: ${projectType}`,
          },
          // Honeypot — /api/lead silently drops the submission when it is filled.
          website: String(fd.get('website') ?? ''),
        }),
      });
      if (!res.ok) {
        setStatus('error');
        return;
      }
      setSubmittedName(firstName);
      setStatus('success');
      analytics.leadSample({ locale, product_range: productRangeFor(ids) });
    } catch {
      setStatus('error');
    }
  }

  const fid = (name: string) => `${id}-${name}`;

  return (
    <div className="sf">
      {status === 'success' ? (
        <div className="sf-success" role="status" aria-live="polite">
          <h3>{t('success.title')}</h3>
          <p>{t('success.body', { firstName: submittedName })}</p>
          <button type="button" className="btn-secondary" onClick={() => setStatus('idle')}>
            {t('success.another')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="sf-form">
          {/* Contact */}
          <fieldset className="sf-group">
            <legend>{tk('sections.contact')}</legend>
            <div className="sf-row">
              <div className="sf-field">
                <label htmlFor={fid('firstName')}>
                  {t('fields.firstName')} <span className="sf-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('firstName')} name="firstName" type="text" required maxLength={100} autoComplete="given-name" placeholder={tk('fields.firstNamePlaceholder')} />
              </div>
              <div className="sf-field">
                <label htmlFor={fid('lastName')}>
                  {t('fields.lastName')} <span className="sf-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('lastName')} name="lastName" type="text" required maxLength={100} autoComplete="family-name" placeholder={tk('fields.lastNamePlaceholder')} />
              </div>
            </div>
            <div className="sf-row">
              <div className="sf-field">
                <label htmlFor={fid('company')}>
                  {t('fields.company')} <span className="sf-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('company')} name="company" type="text" required maxLength={200} autoComplete="organization" placeholder={tk('fields.companyPlaceholder')} />
              </div>
              <div className="sf-field">
                <label htmlFor={fid('email')}>
                  {t('fields.email')} <span className="sf-req" aria-hidden="true">*</span>
                </label>
                <input id={fid('email')} name="email" type="email" required maxLength={200} autoComplete="email" placeholder={tk('fields.emailPlaceholder')} />
              </div>
            </div>
            <div className="sf-field">
              <label htmlFor={fid('country')}>
                {t('fields.country')} <span className="sf-req" aria-hidden="true">*</span>
              </label>
              <select id={fid('country')} name="country" required defaultValue="Belgium" autoComplete="country-name">
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{tk(`countries.${c.labelKey}`)}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {/* Ranges */}
          <fieldset className="sf-group">
            <legend>{t('sections.ranges')}</legend>
            <p className="sf-hint">{t('fields.rangesHint')}</p>
            {SAMPLE_FAMILIES.map((family, fi) => (
              <div className="sf-family" key={family}>
                <span className="sf-family-name">{tf(family)}</span>
                <div className="sf-chips">
                  {sampleRanges(family).map((r, ri) => (
                    <label className="sf-chip" key={r.id}>
                      <input
                        type="checkbox"
                        name="ranges"
                        value={r.id}
                        onChange={clearRangeValidity}
                        ref={fi === 0 && ri === 0 ? firstRangeRef : undefined}
                      />
                      <span>{r.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>

          {/* Project */}
          <fieldset className="sf-group">
            <legend>{t('sections.project')}</legend>
            <div className="sf-row">
              <div className="sf-field">
                <label htmlFor={fid('projectType')}>
                  {t('fields.projectType')} <span className="sf-req" aria-hidden="true">*</span>
                </label>
                <select id={fid('projectType')} name="projectType" required defaultValue="">
                  <option value="" disabled>{t('fields.projectTypePlaceholder')}</option>
                  {PROJECT_TYPES.map((p) => (
                    <option key={p} value={p}>{t(`projectTypes.${p}`)}</option>
                  ))}
                </select>
              </div>
              <div className="sf-field">
                <label htmlFor={fid('area')}>
                  {t('fields.area')} <span className="sf-optional">{tk('fields.optional')}</span>
                </label>
                <input id={fid('area')} name="area" type="number" min={1} step={1} inputMode="numeric" placeholder={t('fields.areaPlaceholder')} />
              </div>
            </div>
          </fieldset>

          {/* Delivery */}
          <fieldset className="sf-group">
            <legend>{t('sections.delivery')}</legend>
            <div className="sf-field">
              <label htmlFor={fid('address')}>
                {t('fields.address')} <span className="sf-optional">{tk('fields.optional')}</span>
              </label>
              <textarea id={fid('address')} name="address" rows={3} maxLength={1000} autoComplete="street-address" placeholder={t('fields.addressPlaceholder')} />
              <span className="sf-hint">{t('fields.addressHint')}</span>
            </div>
          </fieldset>

          {/* Honeypot: visually hidden but visible to bots. Real users skip it. */}
          <div className="hp-field" aria-hidden="true">
            <label htmlFor={fid('website')}>{t('fields.honeypot')}</label>
            <input type="text" id={fid('website')} name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="sf-consent">
            <input type="checkbox" name="consent" required />
            <span>
              {tk.rich('consent', {
                link: (chunks) => <Link href="/privacy" prefetch={false}>{chunks}</Link>,
              })}
            </span>
          </label>

          {status === 'error' && (
            <p className="sf-error" role="alert">
              {tk.rich('error', {
                email: LEAD_EMAIL,
                link: (chunks) => <a href={`mailto:${LEAD_EMAIL}`}>{chunks}</a>,
              })}
            </p>
          )}

          <button type="submit" className="btn-primary sf-submit" disabled={status === 'sending'}>
            {status === 'sending' ? tk('sending') : t('submit')}
          </button>
        </form>
      )}

      <style jsx>{`
        .sf {
          max-width: 860px;
          margin: 0 auto;
        }
        .sf-form {
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
        }
        .sf-group {
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .sf-group legend {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--deep-blue);
          padding: 0;
          margin-bottom: 0.9rem;
        }
        .sf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .sf-field {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          min-width: 0;
        }
        .sf-field label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--deep-blue);
        }
        .sf-req {
          color: #e53e3e;
        }
        .sf-optional {
          font-weight: 400;
          color: #767676;
        }
        .sf-field input,
        .sf-field select,
        .sf-field textarea {
          width: 100%;
          padding: 0.9rem 1.25rem;
          border: 2px solid var(--sand);
          border-radius: 12px;
          font: inherit;
          font-size: 1rem;
          color: var(--charcoal);
          background: white;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .sf-field textarea {
          resize: vertical;
          min-height: 96px;
        }
        .sf-field input:focus,
        .sf-field select:focus,
        .sf-field textarea:focus {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px var(--brand-blue-pale);
        }
        .sf-field input::placeholder,
        .sf-field textarea::placeholder {
          color: #aaa;
        }
        .sf-hint {
          font-size: 0.85rem;
          color: #767676;
          margin: 0;
        }
        .sf-family {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sf-family-name {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--brand-blue);
        }
        .sf-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .sf-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 0.95rem;
          border: 2px solid var(--sand);
          border-radius: var(--radius-full);
          background: white;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--charcoal);
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .sf-chip:has(input:checked) {
          border-color: var(--brand-blue);
          background: var(--brand-blue-pale);
          color: var(--deep-blue);
        }
        .sf-chip:focus-within {
          box-shadow: 0 0 0 3px var(--brand-blue-pale);
        }
        .sf-chip input {
          width: 1rem;
          height: 1rem;
          margin: 0;
          accent-color: var(--brand-blue);
        }
        .sf-consent {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #4b5563;
          line-height: 1.5;
          cursor: pointer;
        }
        .sf-consent input {
          width: 1.1rem;
          height: 1.1rem;
          margin-top: 0.15rem;
          flex-shrink: 0;
          accent-color: var(--brand-blue);
        }
        .sf-consent :global(a) {
          color: var(--brand-blue);
          text-decoration: underline;
        }
        .sf-error {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 0.95rem;
          margin: 0;
        }
        .sf-error :global(a) {
          color: inherit;
          font-weight: 600;
        }
        .sf-submit {
          align-self: flex-start;
        }
        .sf-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .sf-success {
          text-align: center;
          padding: 3rem 1.5rem;
          background: white;
          border: 1px solid #e6ecf1;
          border-radius: var(--radius-md);
        }
        .sf-success h3 {
          font-size: 1.5rem;
          color: var(--deep-blue);
          margin: 0 0 0.75rem;
        }
        .sf-success p {
          color: #555;
          line-height: 1.7;
          max-width: 520px;
          margin: 0 auto 1.5rem;
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
          .sf-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
