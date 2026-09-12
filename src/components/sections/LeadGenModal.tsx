'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/Icon';

export interface LeadFormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyType: string;
  /** Honeypot — must stay empty. /api/lead silently drops submissions where it's filled. */
  website?: string;
}

interface LeadGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => void;
  downloadFile: string;
  isSubmitting: boolean;
}

export default function LeadGenModal({
  isOpen,
  onClose,
  onSubmit,
  downloadFile,
  isSubmitting,
}: LeadGenModalProps) {
  const t = useTranslations('leadModal');

  const [formData, setFormData] = useState<LeadFormData>({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    companyType: '',
    website: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({ companyName: '', firstName: '', lastName: '', email: '', phone: '', position: '', companyType: '', website: '' });
      setConsentChecked(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Focus management: move focus into the dialog on open, trap Tab inside it,
  // and restore focus to the previously focused element on close.
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const modal = modalRef.current;
      if (!modal) return [] as HTMLElement[];
      return Array.from(
        modal.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]')
      ).filter((el) => el.tabIndex >= 0 && !el.hasAttribute('disabled'));
    };

    getFocusable()[0]?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? modalRef.current?.contains(active) : false;
      if (e.shiftKey) {
        if (active === first || !inside) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !inside) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      document.removeEventListener('keydown', handleTab);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayName = downloadFile?.split('/').pop()?.replace('.pdf', '').replace(/-/g, ' ') || 'Document';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consentChecked) onSubmit(formData);
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10, 22, 40, 0.85)', backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '1rem', zIndex: 99999,
  };
  const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '540px', width: '100%',
    maxHeight: '90vh', overflow: 'hidden', position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column',
  };
  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
    padding: '2rem 2.5rem', position: 'relative', overflow: 'hidden', flexShrink: 0,
  };
  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px',
    background: 'rgba(255, 255, 255, 0.15)', border: 'none', borderRadius: '50%',
    color: 'white', fontSize: '1.25rem', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  };
  const bodyStyle: React.CSSProperties = { padding: '1.5rem 2.5rem', overflowY: 'auto', flex: 1 };
  const footerStyle: React.CSSProperties = {
    padding: '1rem 2.5rem 2rem', borderTop: '1px solid #e8ecf0',
    backgroundColor: '#ffffff', flexShrink: 0,
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.9rem 1rem', border: '2px solid #e8ecf0',
    borderRadius: '10px', fontSize: '0.95rem', background: '#fafbfc', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem',
  };
  const submitButtonStyle: React.CSSProperties = {
    width: '100%', padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
    color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
    cursor: isSubmitting || !consentChecked ? 'not-allowed' : 'pointer',
    opacity: isSubmitting || !consentChecked ? 0.7 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leadgen-modal-title"
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%' }} />
          <button type="button" aria-label="Close" style={closeButtonStyle} onClick={onClose}>✕</button>
          <div style={{ width: '52px', height: '52px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3 id="leadgen-modal-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem', position: 'relative', zIndex: 1 }}>
            {t('title')}
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, position: 'relative', zIndex: 1 }}>
            {t('subtitle')}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', color: 'white', marginTop: '0.75rem', position: 'relative', zIndex: 1, textTransform: 'capitalize' }}>
            <Icon name="document" size={14} />
            {displayName}
          </div>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          <form id="lead-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="leadgen-companyname" style={labelStyle}>{t('companyName')} <span style={{ color: '#e53935' }}>*</span></label>
              <input id="leadgen-companyname" type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                placeholder={t('companyNamePlaceholder')} required style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="leadgen-firstname" style={labelStyle}>{t('firstName')} <span style={{ color: '#e53935' }}>*</span></label>
                <input id="leadgen-firstname" type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                  placeholder={t('firstNamePlaceholder')} required style={inputStyle} />
              </div>
              <div>
                <label htmlFor="leadgen-lastname" style={labelStyle}>{t('lastName')} <span style={{ color: '#e53935' }}>*</span></label>
                <input id="leadgen-lastname" type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                  placeholder={t('lastNamePlaceholder')} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="leadgen-email" style={labelStyle}>{t('email')} <span style={{ color: '#e53935' }}>*</span></label>
                <input id="leadgen-email" type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder={t('emailPlaceholder')} required style={inputStyle} />
              </div>
              <div>
                <label htmlFor="leadgen-phone" style={labelStyle}>{t('phone')} <span style={{ color: '#e53935' }}>*</span></label>
                <input id="leadgen-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder={t('phonePlaceholder')} required style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="leadgen-position" style={labelStyle}>{t('position')} <span style={{ color: '#e53935' }}>*</span></label>
                <select id="leadgen-position" name="position" value={formData.position} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">{t('positionPlaceholder')}</option>
                  <option value="owner">{t('positions.owner')}</option>
                  <option value="director">{t('positions.director')}</option>
                  <option value="architect">{t('positions.architect')}</option>
                  <option value="designer">{t('positions.designer')}</option>
                  <option value="engineer">{t('positions.engineer')}</option>
                  <option value="project-manager">{t('positions.projectManager')}</option>
                  <option value="procurement">{t('positions.procurement')}</option>
                  <option value="consultant">{t('positions.consultant')}</option>
                  <option value="other">{t('positions.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="leadgen-companytype" style={labelStyle}>{t('companyType')} <span style={{ color: '#e53935' }}>*</span></label>
                <select id="leadgen-companytype" name="companyType" value={formData.companyType} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">{t('companyTypePlaceholder')}</option>
                  <option value="architecture">{t('companyTypes.architecture')}</option>
                  <option value="interior-design">{t('companyTypes.interiorDesign')}</option>
                  <option value="construction">{t('companyTypes.construction')}</option>
                  <option value="acoustic-consultant">{t('companyTypes.acousticConsultant')}</option>
                  <option value="real-estate">{t('companyTypes.realEstate')}</option>
                  <option value="corporate">{t('companyTypes.corporate')}</option>
                  <option value="hospitality">{t('companyTypes.hospitality')}</option>
                  <option value="education">{t('companyTypes.education')}</option>
                  <option value="healthcare">{t('companyTypes.healthcare')}</option>
                  <option value="retail">{t('companyTypes.retail')}</option>
                  <option value="other">{t('companyTypes.other')}</option>
                </select>
              </div>
            </div>

            {/* Honeypot: visually hidden but visible to bots. Real users skip it. */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
              <label htmlFor="leadgen-website">{t('honeypot')}</label>
              <input
                type="text"
                id="leadgen-website"
                name="website"
                value={formData.website ?? ''}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5 }}>
                <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)}
                  required style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#197FC7', cursor: 'pointer', flexShrink: 0 }} />
                <span>{t('consent')}</span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button type="submit" form="lead-form" disabled={isSubmitting || !consentChecked} style={submitButtonStyle}>
            {isSubmitting ? (
              <>
                <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                {t('submitting')}
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {t('submit')}
              </>
            )}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
