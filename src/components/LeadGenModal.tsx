'use client';

import { useState, useEffect } from 'react';

// ==========================================
// TYPES
// ==========================================
export interface LeadFormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyType: string;
}

interface LeadGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeadFormData) => Promise<void>;
  downloadFile?: string;
  isSubmitting?: boolean;
}

// ==========================================
// DROPDOWN OPTIONS
// ==========================================
const companyTypes = [
  { value: '', label: 'Select...' },
  { value: 'architect', label: 'Architect / Design Firm' },
  { value: 'interior-designer', label: 'Interior Designer' },
  { value: 'contractor', label: 'General Contractor' },
  { value: 'acoustic-consultant', label: 'Acoustic Consultant' },
  { value: 'facility-manager', label: 'Facility Manager' },
  { value: 'real-estate', label: 'Real Estate Developer' },
  { value: 'manufacturer', label: 'Manufacturer / Distributor' },
  { value: 'corporate', label: 'Corporate / End User' },
  { value: 'other', label: 'Other' },
];

const positionOptions = [
  { value: '', label: 'Select...' },
  { value: 'owner', label: 'Owner / CEO' },
  { value: 'director', label: 'Director / Manager' },
  { value: 'architect', label: 'Architect' },
  { value: 'designer', label: 'Designer' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'procurement', label: 'Procurement / Purchasing' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'other', label: 'Other' },
];

// ==========================================
// COMPONENT
// ==========================================
export default function LeadGenModal({
  isOpen,
  onClose,
  onSubmit,
  downloadFile = '',
  isSubmitting = false,
}: LeadGenModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    companyType: '',
  });

  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [consentChecked, setConsentChecked] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        companyType: '',
      });
      setErrors({});
      setConsentChecked(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Required';
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.position) newErrors.position = 'Required';
    if (!formData.companyType) newErrors.companyType = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && consentChecked;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  // Extract filename for display
  const displayName = downloadFile?.split('/').pop()?.replace('.pdf', '').replace(/-/g, ' ') || 'Document';

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 22, 40, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          maxWidth: '540px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
          padding: '2rem 2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
          }} />
          
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '36px',
              height: '36px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              fontSize: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            ✕
          </button>

          <div style={{
            width: '52px',
            height: '52px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            position: 'relative',
            zIndex: 1,
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>

          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 0.5rem',
            position: 'relative',
            zIndex: 1,
          }}>
            Download Technical Documentation
          </h3>

          <p style={{
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.85)',
            margin: 0,
            position: 'relative',
            zIndex: 1,
          }}>
            Fill in your details to access our product specifications
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: 'white',
            marginTop: '0.75rem',
            position: 'relative',
            zIndex: 1,
            textTransform: 'capitalize',
          }}>
            📄 {displayName}
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: '2rem 2.5rem 2.5rem',
          overflowY: 'auto',
          maxHeight: 'calc(90vh - 200px)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Company Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                Company Name <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  border: `2px solid ${errors.companyName ? '#e53935' : '#e8ecf0'}`,
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  background: errors.companyName ? '#fef2f2' : '#fafbfc',
                  boxSizing: 'border-box',
                }}
              />
              {errors.companyName && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.companyName}</span>}
            </div>

            {/* Name Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                  First Name <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: `2px solid ${errors.firstName ? '#e53935' : '#e8ecf0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: errors.firstName ? '#fef2f2' : '#fafbfc',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.firstName && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.firstName}</span>}
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                  Last Name <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: `2px solid ${errors.lastName ? '#e53935' : '#e8ecf0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: errors.lastName ? '#fef2f2' : '#fafbfc',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.lastName && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.lastName}</span>}
              </div>
            </div>

            {/* Contact Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                  Email Address <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: `2px solid ${errors.email ? '#e53935' : '#e8ecf0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: errors.email ? '#fef2f2' : '#fafbfc',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.email && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.email}</span>}
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                  Phone Number <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+32 XXX XX XX XX"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: `2px solid ${errors.phone ? '#e53935' : '#e8ecf0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: errors.phone ? '#fef2f2' : '#fafbfc',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.phone && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.phone}</span>}
              </div>
            </div>

            {/* Role Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                  Position / Role <span style={{ color: '#e53935' }}>*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: `2px solid ${errors.position ? '#e53935' : '#e8ecf0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: errors.position ? '#fef2f2' : '#fafbfc',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  {positionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.position && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.position}</span>}
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' }}>
                  Type of Company <span style={{ color: '#e53935' }}>*</span>
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: `2px solid ${errors.companyType ? '#e53935' : '#e8ecf0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: errors.companyType ? '#fef2f2' : '#fafbfc',
                    boxSizing: 'border-box',
                    cursor: 'pointer',
                  }}
                >
                  {companyTypes.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {errors.companyType && <span style={{ fontSize: '0.78rem', color: '#e53935' }}>{errors.companyType}</span>}
              </div>
            </div>

            {/* Consent */}
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#4b5563',
                lineHeight: 1.5,
              }}>
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    accentColor: '#197FC7',
                    cursor: 'pointer',
                  }}
                />
                <span>
                  I agree to receive communications from Re-Sound and accept the privacy policy.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !consentChecked}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: 'Syne, sans-serif',
                cursor: isSubmitting || !consentChecked ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !consentChecked ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Processing...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Now
                </>
              )}
            </button>
          </form>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
