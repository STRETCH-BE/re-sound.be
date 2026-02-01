'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Lead Form Data Interface
interface LeadFormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyType: string;
}

// Color options for rPET - Panel
const colorOptions = [
  { id: 'midnight', name: 'Midnight', color: '#1a1a1a', hex: '#1a1a1a', isDark: true, description: 'Deep black, reminiscent of a moonlit sky' },
  { id: 'titan', name: 'Titan', color: '#4a4a4a', hex: '#4a4a4a', isDark: true, description: 'Characteristic dark gray, like steel' },
  { id: 'silver', name: 'Silver', color: '#808080', hex: '#808080', isDark: false, description: 'Modern industrial elegance' },
  { id: 'marble', name: 'Marble', color: '#b0b0b0', hex: '#b0b0b0', isDark: false, description: 'Minimalist light gray aesthetic' },
  { id: 'frost', name: 'Frost', color: '#e8e8e8', hex: '#e8e8e8', isDark: false, description: 'Pure white simplicity' },
  { id: 'custom', name: 'Custom RAL/NCS', color: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #ffeaa7 100%)', hex: '#rainbow', isDark: false, description: 'Any color from RAL or NCS palette' },
];

// Thickness options
const thicknessOptions = [
  { id: '12mm', value: 12, name: '12mm', weight: '3 kg/m²', description: 'Lightweight solution' },
  { id: '18mm', value: 18, name: '18mm', weight: '3.5 kg/m²', description: 'Balanced performance' },
  { id: '24mm', value: 24, name: '24mm', weight: '4 kg/m²', description: 'Maximum absorption' },
];

// Application options
const applicationOptions = [
  { id: 'walls', name: 'Wall Panels', icon: '🧱', description: 'Sound-absorbing wall cladding' },
  { id: 'ceilings', name: 'Ceiling Panels', icon: '⬆️', description: 'Acoustic ceiling solutions' },
  { id: 'dividers', name: 'Room Dividers', icon: '📏', description: 'Functional space separation' },
  { id: 'furniture', name: 'Furniture', icon: '🪑', description: 'Custom acoustic furniture' },
];

// Default hero image
const defaultHeroImage = '/images/products/rpet-panel/hero-rPET-Flat.jpg';

// Lead Generation Form Modal
function LeadGenModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  downloadFile,
  isSubmitting 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: LeadFormData) => void;
  downloadFile: string;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<LeadFormData>({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    companyType: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);

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
      setConsentChecked(false);
    }
  }, [isOpen]);

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consentChecked) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  const displayName = downloadFile?.split('/').pop()?.replace('.pdf', '').replace(/-/g, ' ') || 'Document';

  const overlayStyle: React.CSSProperties = {
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
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    maxWidth: '540px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
    padding: '2rem 2.5rem',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
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
  };

  const bodyStyle: React.CSSProperties = {
    padding: '1.5rem 2.5rem',
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyle: React.CSSProperties = {
    padding: '1rem 2.5rem 2rem',
    borderTop: '1px solid #e8ecf0',
    backgroundColor: '#ffffff',
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.9rem 1rem',
    border: '2px solid #e8ecf0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    background: '#fafbfc',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#0a1628',
    display: 'block',
    marginBottom: '0.4rem',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: isSubmitting || !consentChecked ? 'not-allowed' : 'pointer',
    opacity: isSubmitting || !consentChecked ? 0.7 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
          }} />
          
          <button style={closeButtonStyle} onClick={onClose}>✕</button>
          
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

        <div style={bodyStyle}>
          <form id="lead-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>
                Company Name <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  First Name <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Last Name <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Email Address <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Phone Number <span style={{ color: '#e53935' }}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+32 XXX XX XX XX"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  Position / Role <span style={{ color: '#e53935' }}>*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select...</option>
                  <option value="owner">Owner / CEO</option>
                  <option value="director">Director / Manager</option>
                  <option value="architect">Architect</option>
                  <option value="designer">Designer</option>
                  <option value="engineer">Engineer</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="procurement">Procurement / Purchasing</option>
                  <option value="consultant">Consultant</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>
                  Type of Company <span style={{ color: '#e53935' }}>*</span>
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  required
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select...</option>
                  <option value="architecture">Architecture Firm</option>
                  <option value="interior-design">Interior Design</option>
                  <option value="construction">Construction Company</option>
                  <option value="acoustic-consultant">Acoustic Consultant</option>
                  <option value="real-estate">Real Estate / Property</option>
                  <option value="corporate">Corporate / Office</option>
                  <option value="hospitality">Hospitality / Hotels</option>
                  <option value="education">Education / Schools</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
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
                  required
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    accentColor: '#197FC7',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span>
                  I agree to receive communications from Re-Sound and accept the privacy policy.
                </span>
              </label>
            </div>
          </form>
        </div>

        <div style={footerStyle}>
          <button 
            type="submit" 
            form="lead-form"
            disabled={isSubmitting || !consentChecked} 
            style={submitButtonStyle}
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

export default function RPETPanelProductPage() {
  const t = useTranslations('products.rpet-panel');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<typeof colorOptions[0] | null>(null);
  const [selectedThickness, setSelectedThickness] = useState(thicknessOptions[1]); // 18mm default
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get the current hero image based on selected color
  const getHeroImage = () => {
    if (!selectedColor || selectedColor.id === 'custom') return defaultHeroImage;
    return `/images/products/rpet-panel/colors/${selectedColor.id}.jpg`;
  };

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rpet-panel/product-data-sheet.pdf' },
    { id: 'installation-guide', name: 'Installation Guide', icon: '🔧', file: '/documents/rpet-panel/installation-guide.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report (ISO 354)', icon: '📊', file: '/documents/rpet-panel/acoustic-test-report.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate (EN 13501-1)', icon: '🔥', file: '/documents/rpet-panel/fire-certificate.pdf' },
    { id: 'oeko-tex-certificate', name: 'OEKO-TEX® Certificate', icon: '🏷️', file: '/documents/rpet-panel/oeko-tex-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rpet-panel/sustainability-declaration.pdf' },
  ];

  const handleDownloadClick = (fileUrl: string) => {
    setSelectedDownload(fileUrl);
    setIsModalOpen(true);
  };

  const handleColorSelect = (color: typeof colorOptions[0]) => {
    if (!selectedColor || color.id !== selectedColor.id) {
      setIsImageLoading(true);
      setSelectedColor(color);
    }
  };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          downloadedFile: selectedDownload.split('/').pop(),
          source: 'rPET - Panel Product Page',
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        const link = document.createElement('a');
        link.href = selectedDownload;
        link.download = selectedDownload.split('/').pop() || 'download.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'colors', label: 'Colors' },
    { id: 'applications', label: 'Applications' },
    { id: 'acoustics', label: 'Acoustics' },
    { id: 'processing', label: 'Processing' },
    { id: 'specs', label: 'Specifications' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'downloads', label: 'Downloads' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="rpet-panel-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">RECYCLED PET ACOUSTIC PANELS</span>
          <h1>rPET - Panel</h1>
          <p className="hero-tagline">Sustainable Silence, Infinite Possibilities</p>
          <p className="hero-description">
            Transform any space with rPET - Panel acoustic panels. Made from 100% recycled 
            PET bottles, these lightweight yet powerful sound absorbers deliver maximum 
            acoustic performance with minimal environmental impact.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">♻️</span>
              <span className="usp-text">100% Recyclable PET</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔇</span>
              <span className="usp-text">αw up to 1.00</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🪶</span>
              <span className="usp-text">Only 3-4 kg/m²</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary">
              Request a Quote
            </Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">
              View Specifications
            </a>
          </div>

          <p className="hero-price">Starting from <strong>€35</strong> per m² excl. VAT</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={getHeroImage()}
                alt={`rPET - Panel acoustic panel${selectedColor ? ` in ${selectedColor.name}` : ''}`}
                fill
                style={{ objectFit: 'cover' }}
                priority
                onLoad={() => setIsImageLoading(false)}
              />
            </div>
            {isImageLoading && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
          
          <div className="color-selector">
            <span className="selector-label">Select Panel Color</span>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`color-option ${selectedColor?.id === color.id ? 'active' : ''}`}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                >
                  <span 
                    className="color-swatch" 
                    style={{ background: color.color }}
                  />
                  {selectedColor?.id === color.id && (
                    <span className={`color-check ${color.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-color-name">{selectedColor?.name || 'Select a color'}</span>
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <nav className="product-nav">
        <div className="nav-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview" className="content-section overview-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-panel/overview-recycled.jpg"
                alt="rPET - Panel recycled PET bottles transformation"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">CIRCULAR DESIGN</span>
            <h2>From Bottles to Better Spaces</h2>
            <p>
              rPET - Panel transforms recycled PET bottles into high-performance acoustic 
              panels. Each panel diverts plastic waste from landfills while creating 
              healthier, quieter environments. It&apos;s the sound-absorbing alternative 
              to MDF—but at a fraction of the weight.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Made from up to 50% recycled PET bottles
              </li>
              <li>
                <span className="check">✓</span>
                100% recyclable at end of life
              </li>
              <li>
                <span className="check">✓</span>
                Lightweight: only 3-4 kg/m²
              </li>
              <li>
                <span className="check">✓</span>
                Free from chemical binders
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="content-section benefits-section dark">
        <div className="benefits-header">
          <span className="section-tag">WHY rPET - PANEL</span>
          <h2>Five Reasons to Choose rPET</h2>
          <p>
            Discover why architects, designers, and acoustic consultants choose 
            rPET - Panel for their most demanding projects.
          </p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🌱</div>
            <h4>Ecoustic</h4>
            <p>Made from recycled PET bottles, fully recyclable, and contributing to a circular economy.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⭐</div>
            <h4>Excellent</h4>
            <p>Acoustic absorption up to αw 1.00—the highest rating possible for sound absorption.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🛠️</div>
            <h4>Easy to Handle</h4>
            <p>Lightweight and stable. Cut, drill, mill, and install with standard tools.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💚</div>
            <h4>People-Friendly</h4>
            <p>Anti-static, skin-friendly, anti-allergenic. No VOC or formaldehyde emissions.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎨</div>
            <h4>Endless Possibilities</h4>
            <p>5 standard colors plus any RAL/NCS. Add fabric, laminate, veneer, or custom prints.</p>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section id="colors" className="content-section colors-section">
        <div className="colors-header">
          <span className="section-tag">COLOR OPTIONS</span>
          <h2>Express Your Style</h2>
          <p>
            Choose from 5 sophisticated standard colors or specify any custom color 
            from the RAL or NCS palette. Every shade maintains the same outstanding 
            acoustic performance.
          </p>
        </div>

        <div className="colors-grid">
          {colorOptions.map((color) => (
            <div 
              key={color.id} 
              className={`color-card ${selectedColor?.id === color.id ? 'active' : ''}`}
              onClick={() => handleColorSelect(color)}
            >
              <div 
                className="color-preview"
                style={{ background: color.color }}
              >
                {color.id === 'custom' && (
                  <span className="custom-label">Any Color</span>
                )}
              </div>
              <div className="color-info">
                <h4>{color.name}</h4>
                <p>{color.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="finishing-teaser">
          <div className="teaser-content">
            <h3>Want More Options?</h3>
            <p>
              All base colors can be combined with finishing layers like acoustic fabrics, 
              HPL laminate, real wood veneer, or custom prints—without compromising 
              acoustic performance.
            </p>
          </div>
          <div className="finishing-options-preview">
            <div className="finish-chip">
              <span className="finish-icon">🧶</span>
              <span>Acoustic Fabrics</span>
            </div>
            <div className="finish-chip">
              <span className="finish-icon">📋</span>
              <span>HPL/CPL Laminate</span>
            </div>
            <div className="finish-chip">
              <span className="finish-icon">🌳</span>
              <span>Real Wood Veneer</span>
            </div>
            <div className="finish-chip">
              <span className="finish-icon">🖼️</span>
              <span>Custom Print</span>
            </div>
          </div>
        </div>
      </section>

      {/* Applications Section */}
      <section id="applications" className="content-section applications-section dark">
        <div className="applications-header">
          <span className="section-tag">APPLICATIONS</span>
          <h2>Design, Construct, Build</h2>
          <p>
            Every building and every room is unique. rPET - Panel adapts to any 
            acoustic challenge with versatile applications.
          </p>
        </div>

        <div className="applications-grid">
          {applicationOptions.map((app) => (
            <div key={app.id} className="application-card">
              <div className="app-icon">{app.icon}</div>
              <h4>{app.name}</h4>
              <p>{app.description}</p>
            </div>
          ))}
        </div>

        <div className="application-showcase">
          <div className="showcase-grid">
            <div className="showcase-item large">
              <div className="image-container">
                <Image
                  src="/images/products/rpet-panel/application-office.jpg"
                  alt="Acoustic wall panels in modern office"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="showcase-label">Open Plan Offices</div>
            </div>
            <div className="showcase-item">
              <div className="image-container">
                <Image
                  src="/images/products/rpet-panel/application-bank.jpg"
                  alt="Ceiling panels in restaurant"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="showcase-label">Banks</div>
            </div>
            <div className="showcase-item">
              <div className="image-container">
                <Image
                  src="/images/products/rpet-panel/application-education.jpg"
                  alt="Acoustic treatment in classroom"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="showcase-label">Education</div>
            </div>
          </div>
        </div>
      </section>

      {/* Acoustic Performance Section */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="acoustics-header">
          <span className="section-tag">PERFORMANCE</span>
          <h2>Best-in-Class Sound Absorption</h2>
          <p>
            rPET - Panel achieves the maximum possible acoustic absorption rating. 
            The unique fiber structure traps and dissipates sound energy, dramatically 
            reducing reverberation and improving speech clarity.
          </p>
        </div>

        <div className="acoustics-main-grid">
          {/* Left: Panel cross-section */}
          <div className="panel-diagram">
            <div className="diagram-title">How It Works</div>
            <div className="fiber-visualization">
              <div className="sound-wave-entry">
                <div className="wave"></div>
                <div className="wave"></div>
                <div className="wave"></div>
              </div>
              <div className="fiber-layer">
                <div className="fiber-detail">
                  <div className="fibers">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="fiber" style={{ 
                        transform: `rotate(${Math.random() * 180}deg)`,
                        left: `${(i % 5) * 25}%`,
                        top: `${Math.floor(i / 5) * 25}%`,
                      }} />
                    ))}
                  </div>
                </div>
                <div className="layer-label">
                  <strong>Compressed PET Fibers</strong>
                  <span>Sound energy converted to heat</span>
                </div>
              </div>
            </div>
            
            <div className="thickness-selector">
              <span className="selector-title">Panel Thickness</span>
              <div className="thickness-options">
                {thicknessOptions.map((thickness) => (
                  <button
                    key={thickness.id}
                    className={`thickness-option ${selectedThickness.id === thickness.id ? 'active' : ''}`}
                    onClick={() => setSelectedThickness(thickness)}
                  >
                    <span className="thickness-value">{thickness.name}</span>
                    <span className="thickness-weight">{thickness.weight}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Performance metrics */}
          <div className="performance-metrics">
            <div className="main-rating">
              <div className="rating-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e8f4fc" strokeWidth="8"/>
                  <circle 
                    cx="60" cy="60" r="54" 
                    fill="none" 
                    stroke="#197FC7" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="339"
                    strokeDashoffset="0"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="rating-content">
                  <span className="rating-value">αw 1.00</span>
                  <span className="rating-label">Maximum</span>
                </div>
              </div>
              <div className="rating-badge">
                <span className="badge-icon">★</span>
                <span className="badge-text">Class A</span>
              </div>
            </div>

            <div className="metric-cards">
              <div className="metric-card">
                <div className="metric-value">100%</div>
                <div className="metric-label">Sound Absorbed</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">ISO 354</div>
                <div className="metric-label">Test Standard</div>
              </div>
            </div>

            <div className="test-note">
              <p>
                <strong>Test Configuration:</strong> 24mm panel on 50mm frame with 
                polyester wool insulation achieves αw 1.00
              </p>
            </div>

            <div className="certification-note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#197FC7" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Independently tested &amp; certified to ISO 11654</span>
            </div>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <h4>Speech Clarity</h4>
            <p>Dramatically improve intelligibility in meeting rooms and classrooms</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
            </div>
            <h4>Reduced Stress</h4>
            <p>Create calmer environments that boost wellbeing and productivity</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
              </svg>
            </div>
            <h4>Privacy</h4>
            <p>Reduce sound transmission between spaces for confidential conversations</p>
          </div>
        </div>
      </section>

      {/* Processing Section */}
      <section id="processing" className="content-section processing-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">EASY TO WORK WITH</span>
            <h2>Process Like MDF, Weighs Like Nothing</h2>
            <p>
              rPET - Panel combines the workability of MDF with incredibly light weight. 
              Cut it with a saw, mill it on CNC, drill it, v-cut it—the material handles 
              beautifully with standard workshop tools.
            </p>
            
            <div className="processing-methods">
              <div className="method">
                <div className="method-icon">🪚</div>
                <div className="method-content">
                  <h4>Sawing</h4>
                  <p>Manual or electric—clean cuts every time</p>
                </div>
              </div>
              <div className="method">
                <div className="method-icon">⚙️</div>
                <div className="method-content">
                  <h4>CNC Cutting & Milling</h4>
                  <p>Precision shapes and custom profiles</p>
                </div>
              </div>
              <div className="method">
                <div className="method-icon">🔩</div>
                <div className="method-content">
                  <h4>Drilling & Screwing</h4>
                  <p>Secure fixing without splitting</p>
                </div>
              </div>
              <div className="method">
                <div className="method-icon">📐</div>
                <div className="method-content">
                  <h4>V-Cut Bending</h4>
                  <p>Create 3D shapes and corners</p>
                </div>
              </div>
            </div>

            <div className="processing-quote">
              <p>&ldquo;You soon find out that rPET - Panel can be processed as quickly and easily as an MDF board.&rdquo;</p>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-panel/processing-cnc.jpg"
                alt="CNC processing of rPET panels"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="content-section sustainability-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-panel/overview-recycled.jpg"
                alt="Recycled PET bottles"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Acoustic Comfort, Environmental Respect</h2>
            <p>
              rPET - Panel embodies the circular economy. Each panel contains up to 50% 
              recycled PET bottles, and at end of life, the entire panel can be recycled 
              again. No waste, no compromise.
            </p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <span className="sustain-icon">🍾</span>
                <div>
                  <h4>Up to 50% Recycled Content</h4>
                  <p>Made from post-consumer PET bottles</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">♻️</span>
                <div>
                  <h4>100% Recyclable</h4>
                  <p>Full material recovery at end of life</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🏷️</span>
                <div>
                  <h4>OEKO-TEX® Standard 100</h4>
                  <p>Class 1 certified for human safety</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">💨</span>
                <div>
                  <h4>Class A+ Emissions</h4>
                  <p>No VOC or formaldehyde (ISO 16000)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specs" className="content-section specs-section">
        <div className="specs-header">
          <span className="section-tag">TECHNICAL</span>
          <h2>Specifications</h2>
        </div>

        <div className="specs-grid">
          <div className="spec-card">
            <h4>Dimensions</h4>
            <table>
              <tbody>
                <tr>
                  <td>Standard panel</td>
                  <td>1,200 × 2,750 mm</td>
                </tr>
                <tr>
                  <td>Custom maximum</td>
                  <td>3,000 × 2,000 mm</td>
                </tr>
                <tr>
                  <td>Thickness options</td>
                  <td>12 / 18 / 24 mm</td>
                </tr>
                <tr>
                  <td>Custom thickness</td>
                  <td>Up to 40 mm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Acoustic Performance</h4>
            <table>
              <tbody>
                <tr>
                  <td>Absorption coefficient (αw)</td>
                  <td>Up to 1.00</td>
                </tr>
                <tr>
                  <td>Absorption class</td>
                  <td>Class A</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>ISO 354 / ISO 11654</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Physical Properties</h4>
            <table>
              <tbody>
                <tr>
                  <td>Material</td>
                  <td>100% PET (polyester)</td>
                </tr>
                <tr>
                  <td>Recycled content</td>
                  <td>Up to 50%</td>
                </tr>
                <tr>
                  <td>Weight (12mm)</td>
                  <td>3 kg/m²</td>
                </tr>
                <tr>
                  <td>Weight (24mm)</td>
                  <td>4 kg/m²</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Fire Safety</h4>
            <table>
              <tbody>
                <tr>
                  <td>European classification</td>
                  <td>B-s2, d0</td>
                </tr>
                <tr>
                  <td>German standard</td>
                  <td>Bs1 (DIN 4102)</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>EN 13501-1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Health & Environment</h4>
            <table>
              <tbody>
                <tr>
                  <td>OEKO-TEX®</td>
                  <td>Standard 100, Class 1</td>
                </tr>
                <tr>
                  <td>VOC emissions</td>
                  <td>Class A+ (ISO 16000)</td>
                </tr>
                <tr>
                  <td>Formaldehyde</td>
                  <td>None</td>
                </tr>
                <tr>
                  <td>Chemical binders</td>
                  <td>None</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Colors & Finishes</h4>
            <table>
              <tbody>
                <tr>
                  <td>Standard colors</td>
                  <td>5 (Midnight to Frost)</td>
                </tr>
                <tr>
                  <td>Custom colors</td>
                  <td>Any RAL / NCS</td>
                </tr>
                <tr>
                  <td>Finish options</td>
                  <td>Fabric, HPL, Veneer, Print</td>
                </tr>
                <tr>
                  <td>Recyclability</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="content-section gallery-section">
        <div className="gallery-header">
          <span className="section-tag">INSPIRATION</span>
          <h2>Projects & Installations</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gallery-item">
              <div className="image-container gallery">
                <Image
                  src={`/images/products/rpet-panel/gallery-${i}.webp`}
                  alt={`rPET - Panel installation example ${i}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Downloads Section */}
      <section id="downloads" className="content-section downloads-section">
        <div className="downloads-header">
          <span className="section-tag">RESOURCES</span>
          <h2>Downloads</h2>
        </div>

        <div className="downloads-grid">
          {downloads.map((download) => (
            <button
              key={download.id}
              onClick={() => handleDownloadClick(download.file)}
              className="download-card"
            >
              <div className="download-icon">{download.icon}</div>
              <div className="download-info">
                <h4>{download.name}</h4>
                <span>PDF</span>
              </div>
              <span className="download-arrow">↓</span>
            </button>
          ))}
        </div>
      </section>

      {/* Samples Section */}
      <section className="content-section samples-section dark">
        <div className="samples-content">
          <div className="samples-text">
            <span className="section-tag">GET STARTED</span>
            <h2>Request Your Sample Package</h2>
            <p>
              Experience the quality of rPET - Panel firsthand. Our customized sample 
              package includes color swatches, thickness options, and finishing samples 
              to help you make the perfect choice.
            </p>
            <Link href="/contact?subject=samples" className="btn-primary">
              Request Free Samples
            </Link>
          </div>
          <div className="samples-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-panel/samples-package.jpg"
                alt="rPET - Panel sample package"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lead Generation Modal */}
      <LeadGenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLeadSubmit}
        downloadFile={selectedDownload}
        isSubmitting={isSubmitting}
      />

      {/* CTA Section */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>
            Get a personalized quote for your project. Our team will help you 
            choose the perfect color, thickness, and finish.
          </p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large">
              Request a Quote
            </Link>
            <a href="tel:+3232846818" className="btn-secondary large">
              Call Us: +32 3 284 68 18
            </a>
          </div>
          <p className="cta-note">
            Free samples available • Made in Belgium • 100% Recyclable
          </p>
        </div>
      </section>

      <style jsx>{`
        .rpet-panel-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --eco-green: #2e7d32;
          --eco-green-light: #e8f5e9;
        }

        .product-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 8rem 4rem 4rem;
          background: linear-gradient(135deg, var(--cream) 0%, white 100%);
          min-height: 80vh;
          align-items: center;
        }

        .product-tag {
          display: inline-block;
          background: var(--eco-green);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .hero-content h1 {
          font-size: 4.5rem;
          color: var(--deep-blue);
          margin-bottom: 0.5rem;
          letter-spacing: -2px;
        }

        .hero-tagline {
          font-size: 1.5rem;
          color: var(--eco-green);
          font-weight: 500;
          margin-bottom: 1.5rem;
        }

        .hero-description {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.8;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        .hero-usps {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .usp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .usp-icon { font-size: 1.5rem; }
        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }

        .hero-ctas {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: var(--brand-blue);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
        }

        .btn-primary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: transparent;
          color: var(--deep-blue);
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          border: 2px solid var(--deep-blue);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-secondary:hover {
          background: var(--deep-blue);
          color: white;
        }

        .btn-secondary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        .hero-price { font-size: 0.95rem; color: #666; }
        .hero-price strong { color: var(--deep-blue); font-size: 1.2rem; }

        .hero-image {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .image-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          aspect-ratio: 4/5;
          border-radius: 24px;
          overflow: hidden;
          background: var(--cream);
        }

        .image-wrapper {
          position: absolute;
          inset: 0;
          transition: opacity 0.3s ease;
        }

        .image-wrapper.loading { opacity: 0.7; }

        .image-loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.5);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--brand-blue-pale);
          border-top-color: var(--brand-blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .color-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 2rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .selector-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .color-options { display: flex; gap: 0.6rem; }

        .color-option {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid transparent;
          background: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover { transform: scale(1.1); }

        .color-option.active {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue);
        }

        .color-swatch {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .color-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .color-check.on-dark { color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
        .color-check.on-light { color: var(--deep-blue); text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); }

        .selected-color-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }

        .image-container.gallery { aspect-ratio: 1; }
        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        .product-nav {
          position: sticky;
          top: 80px;
          z-index: 90;
          background: white;
          border-bottom: 1px solid #eee;
          padding: 0 4rem;
        }

        .nav-inner {
          display: flex;
          gap: 0;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-item {
          padding: 1.25rem 1.25rem;
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-item:hover { color: var(--brand-blue); }
        .nav-item.active { color: var(--brand-blue); border-bottom-color: var(--brand-blue); }

        .content-section { padding: 6rem 4rem; }
        .content-section.dark { background: var(--deep-blue); color: white; }
        .content-section.dark .section-content h2 { color: white; }
        .content-section.dark .section-content p { color: rgba(255, 255, 255, 0.8); }

        .section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
        }

        .section-grid.reverse { direction: rtl; }
        .section-grid.reverse > * { direction: ltr; }

        .section-tag {
          display: inline-block;
          background: var(--eco-green-light);
          color: var(--eco-green);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .content-section.dark .section-tag {
          background: rgba(46, 125, 50, 0.3);
          color: #81c784;
        }

        .section-content h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }

        .section-content p {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .feature-list { list-style: none; padding: 0; margin: 0; }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          font-size: 1rem;
          color: var(--charcoal);
        }

        .content-section.dark .feature-list li { color: rgba(255, 255, 255, 0.9); }
        .check { color: var(--eco-green); font-weight: bold; }

        /* Benefits Section */
        .benefits-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .benefits-header h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .benefits-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .benefit-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .benefit-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
        }

        .benefit-card .benefit-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .benefit-card h4 { color: white; font-size: 1rem; margin-bottom: 0.5rem; }
        .benefit-card p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin: 0; line-height: 1.5; }

        /* Colors Section */
        .colors-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .colors-header h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .colors-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }

        .colors-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto 4rem;
        }

        .color-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .color-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .color-card.active {
          border-color: var(--brand-blue);
        }

        .color-preview {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .color-info {
          padding: 1rem;
          text-align: center;
        }

        .color-info h4 { font-size: 1rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .color-info p { font-size: 0.8rem; color: #888; margin: 0; }

        .finishing-teaser {
          display: flex;
          align-items: center;
          gap: 3rem;
          padding: 2rem;
          background: var(--cream);
          border-radius: 16px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .teaser-content { flex: 1; }
        .teaser-content h3 { font-size: 1.25rem; color: var(--deep-blue); margin-bottom: 0.5rem; }
        .teaser-content p { font-size: 0.95rem; color: #666; margin: 0; }

        .finishing-options-preview {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .finish-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border-radius: 20px;
          font-size: 0.85rem;
          color: var(--deep-blue);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* Applications Section */
        .applications-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .applications-header h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .applications-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .applications-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto 4rem;
        }

        .application-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .application-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .app-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .application-card h4 { color: white; margin-bottom: 0.5rem; }
        .application-card p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin: 0; }

        .application-showcase {
          max-width: 1200px;
          margin: 0 auto;
        }

        .showcase-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1.5rem;
        }

        .showcase-item {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
        }

        .showcase-item .image-container {
          aspect-ratio: 16/10;
          border-radius: 16px;
        }

        .showcase-item.large .image-container {
          aspect-ratio: 4/3;
        }

        .showcase-label {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        /* Acoustics Section */
        .acoustics-section {
          background: var(--cream);
        }

        .acoustics-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .acoustics-header h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .acoustics-header p {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.8;
        }

        .acoustics-main-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          max-width: 1100px;
          margin: 0 auto 4rem;
          align-items: center;
        }

        .panel-diagram {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }

        .diagram-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 2rem;
          text-align: center;
        }

        .fiber-visualization {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .sound-wave-entry {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .sound-wave-entry .wave {
          width: 4px;
          background: var(--brand-blue);
          border-radius: 2px;
          animation: wave-pulse 1.5s ease-in-out infinite;
        }

        .sound-wave-entry .wave:nth-child(1) { height: 20px; animation-delay: 0s; }
        .sound-wave-entry .wave:nth-child(2) { height: 30px; animation-delay: 0.2s; }
        .sound-wave-entry .wave:nth-child(3) { height: 24px; animation-delay: 0.4s; }

        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(0.6); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 0.8; }
        }

        .fiber-layer {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .fiber-detail {
          height: 100px;
          background: linear-gradient(135deg, #808080 0%, #606060 100%);
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .fibers {
          position: absolute;
          inset: 0;
        }

        .fiber {
          position: absolute;
          width: 30px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 1px;
        }

        .layer-label {
          text-align: center;
        }

        .layer-label strong {
          display: block;
          font-size: 0.95rem;
          color: var(--deep-blue);
        }

        .layer-label span {
          font-size: 0.8rem;
          color: #888;
        }

        .thickness-selector {
          background: var(--cream);
          padding: 1.5rem;
          border-radius: 12px;
        }

        .selector-title {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .thickness-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .thickness-option {
          padding: 0.75rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .thickness-option:hover {
          border-color: var(--brand-blue);
        }

        .thickness-option.active {
          border-color: var(--brand-blue);
          background: var(--brand-blue-pale);
        }

        .thickness-value {
          display: block;
          font-size: 1rem;
          font-weight: 600;
          color: var(--deep-blue);
        }

        .thickness-weight {
          font-size: 0.75rem;
          color: #888;
        }

        .performance-metrics {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .main-rating {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .rating-ring {
          position: relative;
          width: 160px;
          height: 160px;
        }

        .rating-ring svg {
          width: 100%;
          height: 100%;
        }

        .rating-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .rating-content .rating-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--deep-blue);
        }

        .rating-content .rating-label {
          font-size: 0.85rem;
          color: #888;
        }

        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, var(--eco-green) 0%, #1b5e20 100%);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .badge-icon { font-size: 1rem; }

        .metric-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          width: 100%;
        }

        .metric-card {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--brand-blue);
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.8rem;
          color: #888;
        }

        .test-note {
          padding: 1rem;
          background: white;
          border-radius: 12px;
          width: 100%;
        }

        .test-note p {
          font-size: 0.85rem;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }

        .certification-note {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(46, 125, 50, 0.08);
          border-radius: 12px;
          font-size: 0.9rem;
          color: var(--deep-blue);
        }

        .acoustics-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .benefit {
          text-align: center;
          padding: 2.5rem 2rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .benefit:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .benefit-icon-wrap {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.25rem;
          background: var(--eco-green-light);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--eco-green);
        }

        .benefit h4 {
          font-size: 1.1rem;
          color: var(--deep-blue);
          margin-bottom: 0.5rem;
        }

        .benefit p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          line-height: 1.6;
        }

        /* Processing Section */
        .processing-methods {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .method {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .method-icon {
          width: 48px;
          height: 48px;
          background: rgba(25, 127, 199, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .method-content h4 { color: white; margin: 0 0 0.25rem; font-size: 1rem; }
        .method-content p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin: 0; }

        .processing-quote {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border-left: 3px solid var(--brand-blue);
          border-radius: 0 12px 12px 0;
        }

        .processing-quote p {
          font-style: italic;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        /* Sustainability Section */
        .sustainability-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .sustain-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .sustain-icon { font-size: 1.5rem; flex-shrink: 0; }
        .sustain-item h4 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: #666; margin: 0; }

        /* Specs Section */
        .specs-header { text-align: center; margin-bottom: 3rem; }
        .specs-header h2 { font-size: 2.5rem; color: var(--deep-blue); }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .spec-card {
          background: var(--cream);
          padding: 1.5rem;
          border-radius: 16px;
        }

        .spec-card h4 {
          font-size: 1rem;
          color: var(--eco-green);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spec-card table { width: 100%; }

        .spec-card td {
          padding: 0.5rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .spec-card tr:last-child td { border-bottom: none; }
        .spec-card td:first-child { color: #666; }
        .spec-card td:last-child { text-align: right; font-weight: 600; color: var(--deep-blue); }

        /* Gallery Section */
        .gallery-header { text-align: center; margin-bottom: 3rem; }
        .gallery-header h2 { font-size: 2.5rem; color: var(--deep-blue); }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-item { border-radius: 16px; overflow: hidden; }

        /* Downloads Section */
        .downloads-header { text-align: center; margin-bottom: 3rem; }
        .downloads-header h2 { font-size: 2.5rem; color: var(--deep-blue); }

        .downloads-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .download-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--cream);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .download-card:hover {
          background: var(--eco-green-light);
          transform: translateY(-2px);
        }

        .download-icon { font-size: 2rem; }
        .download-info h4 { font-size: 0.95rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .download-info span { font-size: 0.8rem; color: #888; }
        .download-arrow { margin-left: auto; font-size: 1.2rem; color: var(--eco-green); }

        /* Samples Section */
        .samples-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1100px;
          margin: 0 auto;
          align-items: center;
        }

        .samples-text h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .samples-text p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); margin-bottom: 2rem; line-height: 1.8; }

        .samples-image .image-container {
          aspect-ratio: 4/3;
          border-radius: 16px;
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
          text-align: center;
        }

        .cta-content { max-width: 700px; margin: 0 auto; }
        .cta-content h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .cta-content > p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .cta-section .btn-primary { background: white; color: var(--brand-blue); }
        .cta-section .btn-primary:hover { background: var(--cream); }
        .cta-section .btn-secondary { border-color: white; color: white; }
        .cta-section .btn-secondary:hover { background: white; color: var(--brand-blue); }
        .cta-note { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .product-hero {
            grid-template-columns: 1fr;
            padding: 6rem 2rem 3rem;
            min-height: auto;
          }
          .hero-content h1 { font-size: 3rem; }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .section-grid.reverse { direction: ltr; }
          .specs-grid, .downloads-grid, .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .benefits-grid { grid-template-columns: repeat(3, 1fr); }
          .colors-grid { grid-template-columns: repeat(3, 1fr); }
          .applications-grid { grid-template-columns: repeat(2, 1fr); }
          .showcase-grid { grid-template-columns: 1fr 1fr; }
          .showcase-item.large { grid-column: span 2; }
          .sustainability-features { grid-template-columns: 1fr; }
          .acoustics-main-grid { grid-template-columns: 1fr; gap: 3rem; }
          .panel-diagram { max-width: 500px; margin: 0 auto; }
          .acoustics-benefits { grid-template-columns: 1fr; max-width: 400px; }
          .samples-content { grid-template-columns: 1fr; }
          .finishing-teaser { flex-direction: column; text-align: center; }
        }

        @media (max-width: 768px) {
          .content-section { padding: 4rem 1.5rem; }
          .product-nav { padding: 0 1rem; overflow-x: auto; }
          .nav-inner { min-width: max-content; }
          .nav-item { padding: 1rem; font-size: 0.85rem; }
          .hero-usps { flex-direction: column; gap: 1rem; }
          .hero-ctas { flex-direction: column; }
          .section-content h2 { font-size: 2rem; }
          .specs-grid, .downloads-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .benefits-grid { grid-template-columns: 1fr; }
          .colors-grid { grid-template-columns: repeat(2, 1fr); }
          .applications-grid { grid-template-columns: 1fr; }
          .showcase-grid { grid-template-columns: 1fr; }
          .showcase-item.large { grid-column: span 1; }
          .cta-buttons { flex-direction: column; }
          .color-options { flex-wrap: wrap; justify-content: center; }
          .processing-methods { grid-template-columns: 1fr; }
          .metric-cards { grid-template-columns: 1fr; }
          .thickness-options { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
