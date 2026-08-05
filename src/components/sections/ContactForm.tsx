'use client';

// Standalone contact form (contact page). Mirrors the lead-modal submission
// flow — client validation, honeypot, success/error states — but posts to
// /api/contact and fires the contact-form analytics event. Uses no <form>-less
// hacks: a real <form> with onSubmit, controlled only where needed.
import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { analytics } from '@/lib/analytics';

type Status = 'idle' | 'sending' | 'sent' | 'error';

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactForm() {
  const t = useTranslations('forms');
  const tc = useTranslations('contactPage.form');
  const subjects = tc.raw('subjects') as string[];
  const timelines = tc.raw('timelines') as string[];
  const [status, setStatus] = useState<Status>('idle');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      subject: String(fd.get('subject') ?? '').trim(),
      timeline: String(fd.get('timeline') ?? '').trim(),
      message: String(fd.get('message') ?? '').trim(),
      _gotcha: String(fd.get('_gotcha') ?? ''),
    };

    const next: Record<string, string> = {};
    if (!data.name) next.name = t('validation.required');
    if (!data.email) next.email = t('validation.required');
    else if (!isEmail(data.email)) next.email = t('validation.email');
    if (!data.message) next.message = t('validation.required');
    if (!consent) next.__consent = t('validation.consent');
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('failed');
      analytics.submitContactForm(true);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ border: '1px solid var(--border)', background: '#fff', padding: 'clamp(32px,4vw,52px)', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: 'var(--red)', color: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Check size={26} />
        </span>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, textTransform: 'uppercase', letterSpacing: '-.02em', margin: '0 0 10px' }}>
          {t('successTitle')}
        </h3>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('successMessage')}</p>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text-muted-2)', marginBottom: 8 };
  const errStyle: React.CSSProperties = { color: 'var(--red)', fontSize: 12, marginTop: 6 };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
      <div className="cf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle} htmlFor="cf-name">{t('fields.name')}</label>
          <input id="cf-name" name="name" className="field" placeholder={t('placeholders.name')} aria-invalid={!!errors.name} />
          {errors.name && <div style={errStyle}>{errors.name}</div>}
        </div>
        <div>
          <label style={labelStyle} htmlFor="cf-email">{t('fields.email')}</label>
          <input id="cf-email" name="email" type="email" className="field" placeholder={t('placeholders.email')} aria-invalid={!!errors.email} />
          {errors.email && <div style={errStyle}>{errors.email}</div>}
        </div>
        <div>
          <label style={labelStyle} htmlFor="cf-phone">{t('fields.phone')}</label>
          <input id="cf-phone" name="phone" type="tel" className="field" placeholder={t('placeholders.phone')} />
        </div>
        <div>
          <label style={labelStyle} htmlFor="cf-subject">{t('fields.subject')}</label>
          <select id="cf-subject" name="subject" className="field" defaultValue={subjects[0]}>
            {subjects.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle} htmlFor="cf-timeline">{tc('timelineLabel')}</label>
          <select id="cf-timeline" name="timeline" className="field" defaultValue={timelines[0]}>
            {timelines.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle} htmlFor="cf-message">{t('fields.message')}</label>
          <textarea id="cf-message" name="message" className="field" rows={5} placeholder={t('placeholders.message')} aria-invalid={!!errors.message} style={{ resize: 'vertical' }} />
          {errors.message && <div style={errStyle}>{errors.message}</div>}
        </div>
      </div>

      <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 18, cursor: 'pointer', fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--red)', width: 16, height: 16, flexShrink: 0 }} />
        <span>
          {tc('consentPrefix')}{' '}
          <Link href="/privacy" className="lnk" style={{ color: 'var(--red)' }}>{tc('consentPrivacy')}</Link>.
        </span>
      </label>
      {errors.__consent && <div style={errStyle}>{errors.__consent}</div>}

      {status === 'error' && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: '#fff', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 13.5 }}>
          {t('errorMessage')}
        </div>
      )}

      <button type="submit" className="btn btn--primary" disabled={status === 'sending'} style={{ marginTop: 22, width: '100%', justifyContent: 'center', opacity: status === 'sending' ? 0.7 : 1 }}>
        {status === 'sending' ? t('sending') : <>{tc('submit')} <ArrowRight size={16} /></>}
      </button>
      <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-faint)', textAlign: 'center' }}>{t('reassurance')}</p>

      <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 560px){ .cf-grid { grid-template-columns: 1fr !important; } }` }} />
    </form>
  );
}
