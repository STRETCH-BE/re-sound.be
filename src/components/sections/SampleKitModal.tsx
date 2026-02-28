'use client';

import React, { useState } from 'react';

export interface SampleFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  country: string;
  samples: string[];
  message: string;
}

const SAMPLE_OPTIONS = [
  { id: 'interior',     label: 'Interior',       emoji: '🎨' },
  { id: 'solid',        label: 'Solid',          emoji: '⬛' },
  { id: 'divide',       label: 'Divide',         emoji: '📐' },
  { id: 'rwood-groove', label: 'rWood – Groove', emoji: '🪵' },
  { id: 'rwood-perf',   label: 'rWood – Perf',   emoji: '🔵' },
  { id: 'rpet-groove',  label: 'rPET – Groove',  emoji: '♻️' },
  { id: 'rpet-panel',   label: 'rPET – Panel',   emoji: '🟦' },
];

const EMPTY: SampleFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  company: '', address: '', city: '', country: 'Belgium',
  samples: [], message: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SampleKitModal({ open, onClose }: Props) {
  const [form, setForm] = useState<SampleFormData>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  if (!open) return null;

  function set(field: keyof SampleFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleSample(id: string) {
    setForm((f) => ({
      ...f,
      samples: f.samples.includes(id)
        ? f.samples.filter((s) => s !== id)
        : [...f.samples, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent || form.samples.length === 0) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName:    form.firstName,
          lastName:     form.lastName,
          email:        form.email,
          phone:        form.phone,
          companyName:  form.company,
          position:     '',
          companyType:  '',
          source:       'Sample Kit Request — Homepage',
          downloadedFile: `Samples: ${form.samples.join(', ')}`,
          extraFields: {
            shippingAddress: `${form.address}, ${form.city}, ${form.country}`,
            requestedSamples: form.samples.join(', '),
            notes: form.message,
          },
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function handleClose() {
    setForm(EMPTY);
    setConsent(false);
    setStatus('idle');
    onClose();
  }

  const isValid =
    !!form.firstName && !!form.lastName && !!form.email &&
    !!form.address && !!form.city && form.samples.length > 0 && consent;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(4,12,28,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        animation: 'skBackdropIn 0.25s ease both',
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order Sample Kit"
        style={{
          background: '#fff', width: '100%', maxWidth: 540,
          height: '100dvh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          animation: 'skSheetIn 0.32s cubic-bezier(0.32,0,0.07,1) both',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.22)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem',
          padding: '2rem 2rem 1.5rem', borderBottom: '1px solid #f0ece5',
          position: 'sticky', top: 0, background: '#fff', zIndex: 2,
        }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8b6235', marginBottom: '0.35rem' }}>
              🪵 rWood · rPET · Textile
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--charcoal)', margin: '0 0 0.3rem' }}>
              Order Your Sample Kit
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#888', lineHeight: 1.5, margin: 0 }}>
              Fill in your details and we&apos;ll ship a free sample kit within 3&ndash;5 business days.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              flexShrink: 0, width: '2.2rem', height: '2.2rem', borderRadius: '50%',
              background: '#f4f1ec', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#666', marginTop: '0.2rem',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success */}
        {status === 'success' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 2.5rem', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--charcoal)', margin: 0 }}>Request received!</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.65, maxWidth: '22rem', margin: 0 }}>
              We&apos;ll prepare your sample kit and ship it to <strong>{form.city}</strong> within 3&ndash;5 business days. Check your inbox for a confirmation.
            </p>
            <button
              onClick={handleClose}
              style={{
                marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: '#8b6235', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                padding: '0.7rem 1.6rem', borderRadius: '9999px', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate style={{ padding: '1.5rem 2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

            {/* Contact */}
            <Section title="Contact details">
              <Row2>
                <Field label="First name *"><input type="text" required placeholder="Marie" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></Field>
                <Field label="Last name *"><input type="text" required placeholder="Dupont" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></Field>
              </Row2>
              <Row2>
                <Field label="Email *"><input type="email" required placeholder="marie@studio.be" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
                <Field label="Phone"><input type="tel" placeholder="+32 ..." value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
              </Row2>
              <Field label="Company / Studio"><input type="text" placeholder="Studio Dupont" value={form.company} onChange={(e) => set('company', e.target.value)} /></Field>
            </Section>

            {/* Shipping */}
            <Section title="Shipping address">
              <Field label="Street & number *"><input type="text" required placeholder="Antwerpsesteenweg 42" value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
              <Row2>
                <Field label="City *"><input type="text" required placeholder="Gent" value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
                <Field label="Country">
                  <select value={form.country} onChange={(e) => set('country', e.target.value)}>
                    <option>Belgium</option><option>Netherlands</option><option>Luxembourg</option>
                    <option>France</option><option>Germany</option><option>Other</option>
                  </select>
                </Field>
              </Row2>
            </Section>

            {/* Sample selection */}
            <Section title="Which samples would you like? *" hint="Select all that apply — minimum 1">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {SAMPLE_OPTIONS.map((s) => {
                  const active = form.samples.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSample(s.id)}
                      aria-pressed={active}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.75rem', fontWeight: 600,
                        padding: '0.38rem 0.8rem', borderRadius: '9999px',
                        border: `1.5px solid ${active ? '#8b6235' : '#e4e0d8'}`,
                        background: active ? '#8b6235' : '#fafaf8',
                        color: active ? '#fff' : '#666',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                      {active && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Notes */}
            <Field label="Additional notes" optional>
              <textarea rows={3} placeholder="E.g. I'm an architect specifying a 200m² office..." value={form.message} onChange={(e) => set('message', e.target.value)} />
            </Field>

            {/* Consent */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                style={{ width: '1rem', height: '1rem', marginTop: '0.15rem', flexShrink: 0, accentColor: '#8b6235' }} />
              <span style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.5 }}>
                I agree that Re-Sound may contact me about this request.{' '}
                <a href="/privacy" target="_blank" style={{ color: '#8b6235', textDecoration: 'underline' }}>Privacy policy</a>
              </span>
            </label>

            {/* Error */}
            {status === 'error' && (
              <p style={{ fontSize: '0.8rem', color: '#c0392b', background: '#fdf0ee', border: '1px solid #f5c6c0', borderRadius: 8, padding: '0.7rem 1rem', margin: 0 }}>
                Something went wrong. Email us at{' '}
                <a href="mailto:leads_be@stretchgroup.be" style={{ color: '#c0392b', fontWeight: 600 }}>leads_be@stretchgroup.be</a>
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!isValid || status === 'sending'}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                background: '#8b6235', color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                padding: '0.8rem 1.8rem', borderRadius: '9999px', border: 'none',
                cursor: isValid && status !== 'sending' ? 'pointer' : 'not-allowed',
                opacity: !isValid || status === 'sending' ? 0.45 : 1,
                fontFamily: 'var(--font-body)', width: '100%',
                transition: 'background 0.2s, transform 0.2s',
              }}
            >
              {status === 'sending' ? 'Sending…' : (
                <>Send Sample Request <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14m-7-7l7 7-7 7" /></svg></>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Animation keyframes injected once */}
      <style>{`
        @keyframes skBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes skSheetIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </div>
  );
}

// ─── tiny layout helpers (no styled-jsx, just inline) ───────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <legend style={{
        fontFamily: 'var(--font-heading)', fontSize: '0.76rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--charcoal)',
        display: 'block', width: '100%', marginBottom: hint ? '0.1rem' : '0.25rem',
        paddingBottom: '0.5rem', borderBottom: '1px solid #ece8e0',
      }}>{title}</legend>
      {hint && <p style={{ fontSize: '0.72rem', color: '#aaa', margin: '0 0 0.2rem' }}>{hint}</p>}
      {children}
    </fieldset>
  );
}

function Row2({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>{children}</div>;
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #e4e0d8', borderRadius: 8, padding: '0.58rem 0.85rem',
    fontSize: '0.85rem', fontFamily: 'var(--font-body)', color: 'var(--charcoal)',
    background: '#fafaf8', outline: 'none', width: '100%', boxSizing: 'border-box',
    resize: 'vertical' as const,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.28rem' }}>
      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#555' }}>
        {label}{optional && <span style={{ fontWeight: 400, color: '#aaa' }}> (optional)</span>}
      </label>
      {/* Clone child with merged style */}
      {Array.isArray(children)
        ? children
        : React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, { style: { ...inputStyle, ...(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.style } })
          : children
      }
    </div>
  );
}
