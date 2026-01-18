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
  downloadFileName?: string;
  isSubmitting?: boolean;
}

// ==========================================
// DROPDOWN OPTIONS
// ==========================================
const companyTypes = [
  { value: '', label: 'Select company type...' },
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
  { value: '', label: 'Select your position...' },
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
  downloadFileName = 'Document',
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LeadFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.position) newErrors.position = 'Please select your position';
    if (!formData.companyType) newErrors.companyType = 'Please select company type';

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

  // Extract filename from path for display
  const displayName = downloadFileName || downloadFile?.split('/').pop()?.replace('.pdf', '') || 'Document';

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 22, 40, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: #ffffff;
          border-radius: 20px;
          max-width: 540px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          position: relative;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          background: linear-gradient(135deg, #197FC7 0%, #125a8c 100%);
          padding: 2rem 2.5rem;
          position: relative;
          overflow: hidden;
        }

        .modal-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
        }

        .modal-header::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: 10%;
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: rotate(90deg);
        }

        .header-icon {
          width: 52px;
          height: 52px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          position: relative;
          z-index: 1;
        }

        .header-title {
          font-family: 'Syne', var(--font-heading), sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin: 0 0 0.5rem;
          position: relative;
          z-index: 1;
        }

        .header-subtitle {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 0;
          position: relative;
          z-index: 1;
        }

        .file-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          color: white;
          margin-top: 0.75rem;
          position: relative;
          z-index: 1;
        }

        .modal-body {
          padding: 2rem 2.5rem 2.5rem;
          overflow-y: auto;
          max-height: calc(90vh - 180px);
        }

        .form-grid {
          display: grid;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0a1628;
        }

        .required {
          color: #e53935;
          margin-left: 2px;
        }

        .form-input,
        .form-select {
          padding: 0.9rem 1rem;
          border: 2px solid #e8ecf0;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: inherit;
          color: #0a1628;
          background: #fafbfc;
          transition: all 0.2s ease;
          width: 100%;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #197FC7;
          background: white;
          box-shadow: 0 0 0 4px rgba(25, 127, 199, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-input.error,
        .form-select.error {
          border-color: #e53935;
          background: #fef2f2;
        }

        .error-message {
          font-size: 0.78rem;
          color: #e53935;
          margin-top: 0.25rem;
        }

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
          background-color: #fafbfc;
        }

        .consent-group {
          margin-top: 0.5rem;
        }

        .consent-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.85rem;
          color: #4b5563;
          line-height: 1.5;
        }

        .consent-checkbox {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          flex-shrink: 0;
          accent-color: #197FC7;
          cursor: pointer;
        }

        .consent-label a {
          color: #197FC7;
          text-decoration: none;
        }

        .consent-label a:hover {
          text-decoration: underline;
        }

        .submit-button {
          width: 100%;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #197FC7 0%, #125a8c 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          font-family: 'Syne', var(--font-heading), sans-serif;
          cursor: pointer;
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .submit-button:hover:not(:disabled)::before {
          left: 100%;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(25, 127, 199, 0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 540px) {
          .modal-container {
            margin: 0.5rem;
            max-height: 95vh;
          }
          .modal-header {
            padding: 1.5rem;
          }
          .modal-body {
            padding: 1.5rem;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .header-title {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <button className="close-button" onClick={onClose} aria-label="Close">
              ✕
            </button>
            <div className="header-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 className="header-title">Download Technical Documentation</h3>
            <p className="header-subtitle">Fill in your details to access our product specifications</p>
            <div className="file-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {displayName}
            </div>
          </div>

          {/* Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Company Name */}
                <div className="form-group full-width">
                  <label className="form-label">
                    Company Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter your company name"
                    className={`form-input ${errors.companyName ? 'error' : ''}`}
                  />
                  {errors.companyName && <span className="error-message">{errors.companyName}</span>}
                </div>

                {/* Name Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className={`form-input ${errors.firstName ? 'error' : ''}`}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className={`form-input ${errors.lastName ? 'error' : ''}`}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                {/* Contact Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Phone <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+32 XXX XX XX XX"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>

                {/* Role Row */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Position <span className="required">*</span>
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className={`form-select ${errors.position ? 'error' : ''}`}
                    >
                      {positionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.position && <span className="error-message">{errors.position}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Company Type <span className="required">*</span>
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className={`form-select ${errors.companyType ? 'error' : ''}`}
                    >
                      {companyTypes.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {errors.companyType && <span className="error-message">{errors.companyType}</span>}
                  </div>
                </div>

                {/* Consent */}
                <div className="consent-group">
                  <label className="consent-label">
                    <input
                      type="checkbox"
                      className="consent-checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                    />
                    <span>
                      I agree to receive communications from Re-Sound about products and services. 
                      View our <a href="/privacy-policy" target="_blank">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting || !consentChecked}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" />
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
