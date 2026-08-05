'use client';

// ============================================================================
// LEAD MODAL — the core conversion component. A context provider renders ONE
// modal instance; any CTA calls useLeadModal().open(type) to show it. The modal
// matches the CtaModal mockup (7 types). On success it fires Enhanced
// Conversions (hashed, marketing-consent only), the unified generateLead event,
// and Clarity tags — then posts to /api/lead.
// ============================================================================
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { X, ArrowRight, Check } from 'lucide-react';
import {
  MODAL_CONFIGS,
  TRAINING_DATE_DETAIL,
  type ModalType,
  type FormField,
} from '@/lib/forms-config';
import { localizeModalConfig, type ModalMessages } from '@/lib/localize-content';
import { analytics, sha256, normalizeEmail, normalizePhone } from '@/lib/analytics';
import { getConsent } from '@/lib/consent';

type OpenOptions = {
  /** Tracking source label (e.g. 'hero', 'product_pvc', 'footer'). */
  source?: string;
  /** Product slug for analytics, when opened from a product context. */
  product?: string;
  /** For gated downloads: the file to deliver once the lead is submitted. */
  download?: { url: string; filename: string; label: string };
};

/** Programmatically download a same-origin file (used after a gated submit). */
function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

type LeadModalContextValue = {
  open: (type: ModalType, options?: OpenOptions) => void;
  close: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function useLeadModal(): LeadModalContextValue {
  const ctx = useContext(LeadModalContext);
  if (!ctx) throw new Error('useLeadModal must be used within <LeadModalProvider>');
  return ctx;
}

type Status = 'form' | 'sending' | 'sent' | 'error';

export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<ModalType | null>(null);
  const [opts, setOpts] = useState<OpenOptions>({});

  const open = useCallback((t: ModalType, options: OpenOptions = {}) => {
    setOpts(options);
    setType(t);
  }, []);
  const close = useCallback(() => setType(null), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      {type && <LeadGenModal type={type} options={opts} onClose={close} />}
    </LeadModalContext.Provider>
  );
}

// ---------------------------------------------------------------------------

function LeadGenModal({
  type,
  options,
  onClose,
}: {
  type: ModalType;
  options: OpenOptions;
  onClose: () => void;
}) {
  const t = useTranslations('forms');
  const tm = useTranslations('modals');
  const cfg = localizeModalConfig(MODAL_CONFIGS[type], tm.raw(type) as ModalMessages);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const [status, setStatus] = useState<Status>('form');
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ESC to close + body scroll lock + focus into the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const firstField = dialogRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button',
    );
    firstField?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Simple focus trap.
  const onKeyDownTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  function validate(data: Record<string, string>): boolean {
    const next: Record<string, string> = {};
    for (const f of cfg.fields) {
      if (f.required && !data[f.name]?.trim()) {
        next[f.name] = t('validation.required');
      }
      if (f.inputType === 'email' && data[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[f.name])) {
        next[f.name] = t('validation.email');
      }
    }
    if (!consentChecked) next.__consent = t('validation.consent');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Record<string, string> = {};
    for (const f of cfg.fields) {
      data[f.name] = String(fd.get(f.name) ?? '').trim();
    }
    if (!validate(data)) return;

    setStatus('sending');
    const source = options.source || type;
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source,
          product: options.product,
          downloadedFile: options.download?.label,
        }),
      });
      if (!res.ok) throw new Error('Request failed');

      // Gated download: deliver the file now that the lead is captured.
      if (options.download) {
        triggerDownload(options.download.url, options.download.filename);
      }

      // ---- Conversion events (best-effort, never block the UI) ----
      const consent = getConsent();
      const email = data.email;
      try {
        if (consent?.marketing && window.gtag && email) {
          await window.gtag('set', 'user_data', {
            sha256_email_address: await sha256(normalizeEmail(email)),
            sha256_phone_number: data.phone ? await sha256(normalizePhone(data.phone)) : undefined,
          });
        }
      } catch {
        /* no-op */
      }
      analytics.generateLead({ product: options.product, source });
      if (type === 'samples') {
        analytics.sampleRequest(data.colours || '', data.productLine || '');
      }
      try {
        window.clarity?.('set', 'lead_status', 'submitted');
        if (options.product) window.clarity?.('set', 'lead_product', options.product);
        if (data.company || data.companyName) {
          window.clarity?.('set', 'company', data.company || data.companyName);
        }
        if (email) window.clarity?.('identify', email);
        window.clarity?.('upgrade', 'submitted_lead');
      } catch {
        /* no-op */
      }

      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      onClick={onClose}
      onKeyDown={onKeyDownTrap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(10,10,10,.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        animation: 'ctamFade .18s ease',
      }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        style={{
          background: '#fff',
          width: '100%',
          maxWidth: 560,
          maxHeight: '92vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: 'var(--shadow-lg)',
          animation: 'ctamRise .22s ease',
        }}
      >
        <button
          onClick={onClose}
          aria-label={tm('close')}
          className="ctam-x"
          style={{
            position: 'absolute',
            right: 12,
            top: 12,
            width: 40,
            height: 40,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--black)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <X size={22} strokeWidth={2} />
        </button>

        <div style={{ padding: 'clamp(26px,4vw,44px)' }}>
          {status === 'sent' ? (
            <div style={{ textAlign: 'center', padding: 'clamp(22px,3vw,44px) 6px' }}>
              <div
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: '50%',
                  background: 'var(--red)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 22px',
                }}
              >
                <Check size={28} strokeWidth={2.5} />
              </div>
              <h3
                id={titleId}
                className="h2 h2--sm"
                style={{ fontSize: 26, marginBottom: 12 }}
              >
                {cfg.sentTitle}
              </h3>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  maxWidth: 340,
                  margin: '0 auto 24px',
                }}
              >
                {cfg.sentMsg}
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                {options.download && (
                  <a
                    href={options.download.url}
                    download={options.download.filename}
                    className="btn btn--primary btn--sm"
                    style={{ textDecoration: 'none' }}
                  >
                    {tm('downloadDatasheet')} <ArrowRight size={15} />
                  </a>
                )}
                <button onClick={onClose} className="btn btn--dark btn--sm">
                  {tm('close')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 26, height: 2, background: 'var(--red)' }} />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-faint-2)',
                  }}
                >
                  STRETCH&reg;
                </span>
              </div>
              <h2
                id={titleId}
                className="h2 h2--sm"
                style={{ fontSize: 'clamp(24px,3.2vw,33px)', lineHeight: 0.98, marginBottom: 10 }}
              >
                {cfg.title}
              </h2>
              <p
                id={descId}
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: 'var(--text-muted)',
                  margin: '0 0 24px',
                }}
              >
                {cfg.subtitle}
              </p>

              {cfg.showDates && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}
                >
                  {TRAINING_DATE_DETAIL.map((d, i) => ({
                    date: (tm.raw('trainingDates') as string[])[i] ?? d.date,
                    note: (tm.raw('trainingDateNotes') as string[])[i] ?? d.note,
                  })).map((d) => (
                    <div
                      key={d.date}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        border: '1px solid var(--border)',
                        padding: '13px 16px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          fontSize: 15,
                          letterSpacing: '-.01em',
                        }}
                      >
                        {d.date}
                      </span>
                      <span style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{d.note}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 15,
                    marginBottom: 18,
                  }}
                >
                  {cfg.fields.map((f) => (
                    <Field key={f.name} field={f} error={errors[f.name]} />
                  ))}
                </div>

                <ConsentRow
                  checked={consentChecked}
                  onChange={setConsentChecked}
                  error={errors.__consent}
                  privacyLabel={t('consentPrivacy')}
                  consentPrefix={t('consentPrefix')}
                />

                {status === 'error' && (
                  <p className="field-error" role="alert" style={{ marginBottom: 12 }}>
                    {t('errorMessage')}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={status === 'sending'}
                  style={{ width: '100%', justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}
                >
                  {status === 'sending' ? t('sending') : cfg.submitLabel}
                  {status !== 'sending' && <ArrowRight size={16} />}
                </button>
                <p
                  style={{
                    fontSize: 11.5,
                    color: 'var(--text-faint-2)',
                    textAlign: 'center',
                    margin: '14px 0 0',
                  }}
                >
                  {t('reassurance')}
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes ctamFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes ctamRise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .ctam-x:hover {
          color: var(--red) !important;
        }
      `}</style>
    </div>
  );
}

function Field({ field, error }: { field: FormField; error?: string }) {
  const tm = useTranslations('modals');
  const id = `f-${field.name}`;
  const invalid = Boolean(error);
  const describedBy = invalid ? `${id}-err` : undefined;
  return (
    <div style={{ gridColumn: field.full ? '1 / -1' : 'auto' }}>
      <label htmlFor={id} className="field-label">
        {field.label}
        {field.required && <span style={{ color: 'var(--red)' }}> *</span>}
      </label>
      {field.kind === 'text' && (
        <input
          id={id}
          name={field.name}
          className="field"
          type={field.inputType || 'text'}
          placeholder={field.placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          required={field.required}
        />
      )}
      {field.kind === 'select' && (
        <select
          id={id}
          name={field.name}
          className="field"
          defaultValue=""
          aria-invalid={invalid}
          aria-describedby={describedBy}
        >
          <option value="" disabled>
            {tm('select')}
          </option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      )}
      {field.kind === 'area' && (
        <textarea
          id={id}
          name={field.name}
          className="field"
          placeholder={field.placeholder}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          style={{ minHeight: 92, resize: 'vertical' }}
        />
      )}
      {invalid && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function ConsentRow({
  checked,
  onChange,
  error,
  privacyLabel,
  consentPrefix,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  privacyLabel: string;
  consentPrefix: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          fontSize: 12.5,
          lineHeight: 1.5,
          color: 'var(--text-muted)',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
          style={{ marginTop: 3, width: 16, height: 16, accentColor: 'var(--red)', flex: '0 0 auto' }}
        />
        <span>
          {consentPrefix}{' '}
          <Link href="/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--red)', textDecoration: 'underline' }}>
            {privacyLabel}
          </Link>
          .
        </span>
      </label>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
