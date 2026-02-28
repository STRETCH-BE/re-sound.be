'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

// ─── Sample Kit Modal ────────────────────────────────────────────────────────

interface SampleFormData {
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
  { id: 'interior',       label: 'Interior',           emoji: '🎨' },
  { id: 'solid',          label: 'Solid',              emoji: '⬛' },
  { id: 'divide',         label: 'Divide',             emoji: '📐' },
  { id: 'rwood-groove',   label: 'rWood – Groove',     emoji: '🪵' },
  { id: 'rwood-perf',     label: 'rWood – Perf',       emoji: '🔵' },
  { id: 'rpet-groove',    label: 'rPET – Groove',      emoji: '♻️' },
  { id: 'rpet-panel',     label: 'rPET – Panel',       emoji: '🟦' },
];

const EMPTY_FORM: SampleFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  company: '', address: '', city: '', country: 'Belgium',
  samples: [], message: '',
};

function SampleKitModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<SampleFormData>(EMPTY_FORM);
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

    const payload = {
      firstName:    form.firstName,
      lastName:     form.lastName,
      email:        form.email,
      phone:        form.phone,
      companyName:  form.company,
      position:     '',
      companyType:  '',
      source:       'Sample Kit Request — Homepage',
      downloadedFile: `Samples: ${form.samples.join(', ')}`,
      // Extra fields forwarded in the notes
      extraFields: {
        shippingAddress: `${form.address}, ${form.city}, ${form.country}`,
        requestedSamples: form.samples.join(', '),
        notes: form.message,
      },
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setConsent(false);
    setStatus('idle');
    onClose();
  }

  const isValid = form.firstName && form.lastName && form.email &&
                  form.address && form.city && form.samples.length > 0 && consent;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-label="Order Sample Kit">

        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">🪵 rWood · rPET · Textile</span>
            <h2 className="modal-title">Order Your Sample Kit</h2>
            <p className="modal-sub">Fill in your details and we'll ship a free sample kit within 3–5 business days.</p>
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="success-icon">✅</div>
            <h3>Request received!</h3>
            <p>We'll prepare your sample kit and ship it to <strong>{form.city}</strong> within 3–5 business days. Check your inbox for a confirmation.</p>
            <button className="dcta-btn-warm" onClick={handleClose}>Close</button>
          </div>
        ) : (
          <form className="modal-form" onSubmit={handleSubmit} noValidate>

            {/* Contact */}
            <fieldset className="form-section">
              <legend>Contact details</legend>
              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="sk-first">First name *</label>
                  <input id="sk-first" type="text" required placeholder="Marie"
                    value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="sk-last">Last name *</label>
                  <input id="sk-last" type="text" required placeholder="Dupont"
                    value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="sk-email">Email *</label>
                  <input id="sk-email" type="email" required placeholder="marie@studio.be"
                    value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="sk-phone">Phone</label>
                  <input id="sk-phone" type="tel" placeholder="+32 ..."
                    value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="sk-company">Company / Studio</label>
                <input id="sk-company" type="text" placeholder="Studio Dupont"
                  value={form.company} onChange={(e) => set('company', e.target.value)} />
              </div>
            </fieldset>

            {/* Shipping */}
            <fieldset className="form-section">
              <legend>Shipping address</legend>
              <div className="form-field">
                <label htmlFor="sk-address">Street & number *</label>
                <input id="sk-address" type="text" required placeholder="Antwerpsesteenweg 42"
                  value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="sk-city">City *</label>
                  <input id="sk-city" type="text" required placeholder="Gent"
                    value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="sk-country">Country</label>
                  <select id="sk-country" value={form.country} onChange={(e) => set('country', e.target.value)}>
                    <option>Belgium</option>
                    <option>Netherlands</option>
                    <option>Luxembourg</option>
                    <option>France</option>
                    <option>Germany</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Sample selection */}
            <fieldset className="form-section">
              <legend>Which samples would you like? *</legend>
              <p className="section-hint">Select all that apply — minimum 1</p>
              <div className="sample-grid">
                {SAMPLE_OPTIONS.map((s) => {
                  const active = form.samples.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`sample-chip${active ? ' sample-chip-active' : ''}`}
                      onClick={() => toggleSample(s.id)}
                      aria-pressed={active}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                      {active && (
                        <svg className="chip-check" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Notes */}
            <div className="form-field">
              <label htmlFor="sk-msg">Additional notes <span className="optional">(optional)</span></label>
              <textarea id="sk-msg" rows={3} placeholder="E.g. I'm an architect specifying a 200m² office refurbishment..."
                value={form.message} onChange={(e) => set('message', e.target.value)} />
            </div>

            {/* Consent */}
            <label className="consent-row">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I agree that Re-Sound may contact me about this request. <a href="/privacy" target="_blank">Privacy policy</a></span>
            </label>

            {/* Error */}
            {status === 'error' && (
              <p className="form-error">Something went wrong. Please email us directly at <a href="mailto:leads_be@stretchgroup.be">leads_be@stretchgroup.be</a></p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="dcta-btn-submit"
              disabled={!isValid || status === 'sending'}
            >
              {status === 'sending' ? (
                <>
                  <svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  Send Sample Request
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

// ─── DualCTA Section ─────────────────────────────────────────────────────────

export default function DualCTA() {
  const t = useTranslations('dualCta');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section className="dual-cta">

        {/* LEFT: rWood samples */}
        <div className="cta-half cta-left">
          <div className="cta-img">
            <Image
              src="/images/products/rwood-groove/gallery-1.webp"
              alt="rWood natural veneer acoustic panel samples"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="50vw"
            />
          </div>
          <div className="cta-overlay overlay-warm" />
          <div className="cta-body">
            <span className="cta-eyebrow">{t('left.eyebrow')}</span>
            <h3>{t('left.title')}</h3>
            <p>{t('left.subtitle')}</p>
            <button
              className="dcta-btn-warm"
              onClick={() => setModalOpen(true)}
            >
              {t('left.cta')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* RIGHT: Quote request */}
        <div className="cta-half cta-right">
          <div className="cta-img">
            <Image
              src="/images/products/interior/overview.jpg"
              alt="Modern space with Re-Sound circular acoustic panels"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              sizes="50vw"
            />
          </div>
          <div className="cta-overlay overlay-blue" />
          <div className="cta-body">
            <span className="cta-eyebrow">{t('right.eyebrow')}</span>
            <h3>{t('right.title')}</h3>
            <p>{t('right.subtitle')}</p>
            <Link href="/contact" className="dcta-btn-blue">
              {t('right.cta')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scoped layout styles */}
        <style jsx>{`
          .dual-cta {
            display: grid;
            grid-template-columns: 1fr 1fr;
            height: 56vh;
            min-height: 400px;
          }

          .cta-half {
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: flex-end;
            padding: 3.5rem;
          }

          .cta-img {
            position: absolute;
            inset: 0;
            transition: transform 8s ease;
          }
          .cta-half:hover .cta-img {
            transform: scale(1.05);
          }

          .cta-overlay {
            position: absolute;
            inset: 0;
            z-index: 1;
          }
          .overlay-warm {
            background: linear-gradient(
              to top,
              rgba(10, 4, 1, 0.95) 0%,
              rgba(10, 4, 1, 0.65) 45%,
              rgba(10, 4, 1, 0.15) 100%
            );
          }
          .overlay-blue {
            background: linear-gradient(
              to top,
              rgba(2, 10, 28, 0.96) 0%,
              rgba(2, 10, 28, 0.65) 45%,
              rgba(2, 10, 28, 0.15) 100%
            );
          }

          .cta-body {
            position: relative;
            z-index: 2;
            color: white;
            max-width: 26rem;
          }

          .cta-eyebrow {
            display: block;
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.45);
            margin-bottom: 0.55rem;
          }

          .cta-body h3 {
            font-family: var(--font-heading);
            font-size: clamp(1.6rem, 2.4vw, 2.1rem);
            font-weight: 800;
            letter-spacing: -0.8px;
            line-height: 1.1;
            margin-bottom: 0.55rem;
            color: white;
          }

          .cta-body > p {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.52);
            margin-bottom: 1.4rem;
            line-height: 1.65;
          }

          @media (max-width: 768px) {
            .dual-cta { grid-template-columns: 1fr; height: auto; }
            .cta-half { min-height: 52vw; padding: 2.5rem; }
          }
          @media (max-width: 480px) {
            .cta-half { min-height: 60vw; padding: 2rem 1.5rem; }
          }
        `}</style>
      </section>

      {/* Modal */}
      <SampleKitModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ─────────────────────────────────────────────
          GLOBAL STYLES
          Buttons on <Link> + <button> both need global
          scope because Link renders as <a> and loses
          the styled-jsx hash attribute entirely.
      ───────────────────────────────────────────── */}
      <style jsx global>{`
        /* ── Warm CTA button (brown) ── */
        .dcta-btn-warm {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #8b6235;
          color: #fff !important;
          font-weight: 700;
          font-size: 0.84rem;
          padding: 0.68rem 1.4rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          font-family: var(--font-body);
          white-space: nowrap;
        }
        .dcta-btn-warm:hover {
          background: #7a5430;
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(139, 98, 53, 0.35);
        }

        /* ── Blue CTA button ── */
        .dcta-btn-blue {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--brand-blue);
          color: #fff !important;
          font-weight: 700;
          font-size: 0.84rem;
          padding: 0.68rem 1.4rem;
          border-radius: var(--radius-full);
          text-decoration: none !important;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .dcta-btn-blue:hover {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(25, 127, 199, 0.35);
        }

        /* ── Modal backdrop ── */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9000;
          background: rgba(4, 12, 28, 0.72);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: flex-end;
          animation: backdropIn 0.25s ease both;
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Modal sheet (slides in from right) ── */
        .modal-sheet {
          background: #fff;
          width: 100%;
          max-width: 540px;
          height: 100dvh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          animation: sheetIn 0.32s cubic-bezier(0.32, 0, 0.07, 1) both;
          box-shadow: -16px 0 48px rgba(0, 0, 0, 0.22);
        }
        @keyframes sheetIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }

        /* ── Modal header ── */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          padding: 2rem 2rem 1.5rem;
          border-bottom: 1px solid #f0ece5;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 2;
        }
        .modal-eyebrow {
          display: block;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8b6235;
          margin-bottom: 0.35rem;
        }
        .modal-title {
          font-family: var(--font-heading);
          font-size: 1.45rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--charcoal);
          margin: 0 0 0.3rem;
        }
        .modal-sub {
          font-size: 0.82rem;
          color: #888;
          line-height: 1.5;
          margin: 0;
        }
        .modal-close {
          flex-shrink: 0;
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 50%;
          background: #f4f1ec;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          transition: background 0.15s, color 0.15s;
          margin-top: 0.2rem;
        }
        .modal-close:hover { background: #ebe6dc; color: #333; }

        /* ── Form layout ── */
        .modal-form {
          padding: 1.5rem 2rem 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }

        .form-section {
          border: none;
          padding: 0;
          margin: 0;
        }
        .form-section legend {
          font-family: var(--font-heading);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--charcoal);
          margin-bottom: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .form-section legend::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #ece8e0;
        }
        .section-hint {
          font-size: 0.75rem;
          color: #aaa;
          margin: -0.5rem 0 0.9rem;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .form-field label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #555;
          letter-spacing: 0.02em;
        }
        .optional {
          font-weight: 400;
          color: #aaa;
        }
        .form-field input,
        .form-field select,
        .form-field textarea {
          border: 1.5px solid #e4e0d8;
          border-radius: 8px;
          padding: 0.58rem 0.85rem;
          font-size: 0.85rem;
          font-family: var(--font-body);
          color: var(--charcoal);
          background: #fafaf8;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          resize: vertical;
        }
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          border-color: #8b6235;
          background: #fff;
        }

        /* ── Sample chip grid ── */
        .sample-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .sample-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.38rem 0.8rem;
          border-radius: var(--radius-full);
          border: 1.5px solid #e4e0d8;
          background: #fafaf8;
          color: #666;
          cursor: pointer;
          transition: all 0.15s;
          font-family: var(--font-body);
        }
        .sample-chip:hover {
          border-color: #c9a87a;
          color: #8b6235;
          background: #fdf6ee;
        }
        .sample-chip-active {
          background: #8b6235 !important;
          border-color: #8b6235 !important;
          color: #fff !important;
        }
        .chip-check {
          flex-shrink: 0;
        }

        /* ── Consent ── */
        .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          cursor: pointer;
        }
        .consent-row input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          margin-top: 0.15rem;
          flex-shrink: 0;
          accent-color: #8b6235;
        }
        .consent-row span {
          font-size: 0.75rem;
          color: #888;
          line-height: 1.5;
        }
        .consent-row a {
          color: #8b6235;
          text-decoration: underline;
        }

        /* ── Error ── */
        .form-error {
          font-size: 0.8rem;
          color: #c0392b;
          background: #fdf0ee;
          border: 1px solid #f5c6c0;
          border-radius: 8px;
          padding: 0.7rem 1rem;
        }
        .form-error a { color: #c0392b; font-weight: 600; }

        /* ── Submit button ── */
        .dcta-btn-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #8b6235;
          color: #fff;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 0.8rem 1.8rem;
          border-radius: var(--radius-full);
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          font-family: var(--font-body);
          width: 100%;
        }
        .dcta-btn-submit:hover:not(:disabled) {
          background: #7a5430;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(139, 98, 53, 0.3);
        }
        .dcta-btn-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* ── Spinner ── */
        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Success state ── */
        .modal-success {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 2.5rem;
          gap: 1rem;
        }
        .success-icon { font-size: 3rem; }
        .modal-success h3 {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--charcoal);
        }
        .modal-success p {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.65;
          max-width: 22rem;
        }
        .modal-success p strong { color: var(--charcoal); }

        /* ── Mobile ── */
        @media (max-width: 580px) {
          .modal-sheet { max-width: 100%; border-radius: 16px 16px 0 0; height: 92dvh; }
          .modal-backdrop { align-items: flex-end; }
          .form-row-2 { grid-template-columns: 1fr; }
          .modal-header, .modal-form { padding-left: 1.5rem; padding-right: 1.5rem; }
        }
      `}</style>
    </>
  );
}
