'use client';

// Inline version of the lead form, driven by the same MODAL_CONFIGS as the
// modal. Used where the mockups embed a form directly in the page (partner
// application, training booking) rather than behind a CTA. Posts to /api/lead,
// fires generateLead, and supports an optional date-picker (training).
import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { MODAL_CONFIGS, TRAINING_DATE_DETAIL, type ModalType } from '@/lib/forms-config';
import { localizeModalConfig, type ModalMessages } from '@/lib/localize-content';
import { analytics } from '@/lib/analytics';

type Status = 'idle' | 'sending' | 'sent' | 'error';

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function InlineLeadForm({
  type,
  source,
  dark = false,
}: {
  type: ModalType;
  source: string;
  /** Render for a dark/red background (lightens labels & borders). */
  dark?: boolean;
}) {
  const tf = useTranslations('forms');
  const ti = useTranslations('inlineLead');
  const tm = useTranslations('modals');
  const cfg = localizeModalConfig(MODAL_CONFIGS[type], tm.raw(type) as ModalMessages);
  const [status, setStatus] = useState<Status>('idle');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    for (const f of cfg.fields) data[f.name] = String(fd.get(f.name) ?? '').trim();
    data._gotcha = String(fd.get('_gotcha') ?? '');

    const next: Record<string, string> = {};
    for (const f of cfg.fields) {
      if (f.required && !data[f.name]) next[f.name] = tf('validation.required');
      if (f.inputType === 'email' && data[f.name] && !isEmail(data[f.name])) next[f.name] = tf('validation.email');
    }
    if (!consent) next.__consent = tf('validation.consent');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
      });
      if (!res.ok) throw new Error('failed');
      analytics.generateLead({ source });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  const fg = dark ? '#fff' : 'var(--text-muted-2)';
  const muted = dark ? 'rgba(255,255,255,.85)' : 'var(--text-muted)';
  const cardBg = dark ? 'rgba(255,255,255,.06)' : '#fff';
  const cardBorder = dark ? '1px solid rgba(255,255,255,.22)' : '1px solid var(--border)';

  if (status === 'sent') {
    return (
      <div style={{ background: cardBg, border: cardBorder, padding: 'clamp(30px,4vw,48px)', textAlign: 'center', color: dark ? '#fff' : undefined }}>
        <span style={{ display: 'inline-flex', width: 54, height: 54, borderRadius: '50%', background: dark ? '#fff' : 'var(--red)', color: dark ? 'var(--red)' : '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Check size={24} />
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, textTransform: 'uppercase', letterSpacing: '-.02em', margin: '0 0 10px' }}>{cfg.sentTitle}</h3>
        <p style={{ color: dark ? 'rgba(255,255,255,.85)' : 'var(--text-muted)', margin: 0 }}>{cfg.sentMsg}</p>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: fg, marginBottom: 8 };
  const errStyle: React.CSSProperties = { color: dark ? '#fff' : 'var(--red)', fontSize: 12, marginTop: 6, fontWeight: dark ? 700 : 400 };
  const fieldClass = dark ? 'field field--on-dark' : 'field';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

      {cfg.showDates && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {TRAINING_DATE_DETAIL.map((d, i) => ({
            date: (tm.raw('trainingDates') as string[])[i] ?? d.date,
            note: (tm.raw('trainingDateNotes') as string[])[i] ?? d.note,
          })).map((d) => (
            <div key={d.date} style={{ border: cardBorder, padding: '14px 16px', background: cardBg }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: dark ? '#fff' : 'var(--black)' }}>{d.date}</div>
              <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,.75)' : 'var(--text-faint)', marginTop: 4 }}>{d.note}</div>
            </div>
          ))}
        </div>
      )}

      <div className="ilf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {cfg.fields.map((f) => (
          <div key={f.name} style={{ gridColumn: f.full || f.kind === 'area' ? '1 / -1' : undefined }}>
            <label style={labelStyle} htmlFor={`ilf-${f.name}`}>
              {f.label}{f.required ? ' *' : ''}
            </label>
            {f.kind === 'select' ? (
              <select id={`ilf-${f.name}`} name={f.name} className={fieldClass} defaultValue={f.options?.[0]}>
                {f.options?.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : f.kind === 'area' ? (
              <textarea id={`ilf-${f.name}`} name={f.name} className={fieldClass} rows={4} placeholder={f.placeholder} aria-invalid={!!errors[f.name]} style={{ resize: 'vertical' }} />
            ) : (
              <input id={`ilf-${f.name}`} name={f.name} type={f.inputType || 'text'} className={fieldClass} placeholder={f.placeholder} aria-invalid={!!errors[f.name]} />
            )}
            {errors[f.name] && <div style={errStyle}>{errors[f.name]}</div>}
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 18, cursor: 'pointer', fontSize: 13.5, lineHeight: 1.5, color: muted }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: dark ? '#fff' : 'var(--red)', width: 16, height: 16, flexShrink: 0 }} />
        <span>
          {ti('consentPrefix')}{' '}
          <Link href="/privacy" className="lnk" style={{ color: dark ? '#fff' : 'var(--red)', textDecoration: 'underline' }}>{ti('consentPrivacy')}</Link>.
        </span>
      </label>
      {errors.__consent && <div style={errStyle}>{errors.__consent}</div>}

      {status === 'error' && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: dark ? 'rgba(0,0,0,.25)' : '#fff', border: `1px solid ${dark ? '#fff' : 'var(--red)'}`, color: dark ? '#fff' : 'var(--red)', fontSize: 13.5 }}>
          {tf('errorMessage')}
        </div>
      )}

      <button type="submit" className={dark ? 'btn btn--dark' : 'btn btn--primary'} disabled={status === 'sending'} style={{ marginTop: 22, width: '100%', justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}>
        {status === 'sending' ? tf('sending') : <>{cfg.submitLabel} <ArrowRight size={16} /></>}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .field--on-dark { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.28); color: #fff; }
        .field--on-dark::placeholder { color: rgba(255,255,255,.55); }
        .field--on-dark option { color: #0a0a0a; }
        @media (max-width: 560px){ .ilf-grid { grid-template-columns: 1fr !important; } }
      ` }} />
    </form>
  );
}
