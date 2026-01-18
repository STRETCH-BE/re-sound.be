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

// Color options for the Solid product
const colorOptions = [
  { id: 'denim', name: 'Denim', swatch: '/images/products/solid/swatches/denim.webp', image: '/images/products/solid/hero-denim.webp', isDark: true },
  { id: 'antracite', name: 'Antracite', swatch: '/images/products/solid/swatches/antracite.webp', image: '/images/products/solid/hero-antracite.webp', isDark: true },
  { id: 'silver', name: 'Silver', swatch: '/images/products/solid/swatches/silver.webp', image: '/images/products/solid/hero-silver.webp', isDark: false },
  { id: 'sky', name: 'Sky', swatch: '/images/products/solid/swatches/sky.webp', image: '/images/products/solid/hero-sky.webp', isDark: false },
  { id: 'mint', name: 'Mint', swatch: '/images/products/solid/swatches/mint.webp', image: '/images/products/solid/hero-mint.webp', isDark: false },
  { id: 'taupe', name: 'Taupe', swatch: '/images/products/solid/swatches/taupe.webp', image: '/images/products/solid/hero-taupe.webp', isDark: false },
];

// Lead Generation Form Modal - Using inline styles for proper rendering
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
      setConsentChecked(false);
    }
  }, [isOpen]);

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

  // Handle escape key
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

  // Extract filename for display
  const displayName = downloadFile?.split('/').pop()?.replace('.pdf', '').replace(/-/g, ' ') || 'Document';

  // Inline styles for proper modal overlay
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
        {/* Header */}
        <div style={headerStyle}>
          {/* Decorative circle */}
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

        {/* Body */}
        <div style={bodyStyle}>
          <form id="lead-form" onSubmit={handleSubmit}>
            {/* Company Name */}
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

            {/* Name Row */}
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

            {/* Contact Row */}
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

            {/* Role Row */}
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

            {/* Consent */}
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

        {/* Fixed Footer with Submit Button */}
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

export default function SolidProductPage() {
  const t = useTranslations('products.solid');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/solid/product-data-sheet.pdf' },
    { id: 'installation-manual', name: 'Installation Manual', icon: '📋', file: '/documents/solid/installation-manual.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/solid/acoustic-test-report.pdf' },
    { id: 'color-fabric-guide', name: 'Color & Fabric Guide', icon: '🎨', file: '/documents/solid/color-fabric-guide.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/solid/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/solid/sustainability-declaration.pdf' },
  ];

  const handleDownloadClick = (fileUrl: string) => {
    setSelectedDownload(fileUrl);
    setIsModalOpen(true);
  };

  const handleColorSelect = (color: typeof colorOptions[0]) => {
    if (color.id !== selectedColor.id) {
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
          source: 'Solid Product Page',
        }),
      });

      if (response.ok) {
        // Close modal and trigger download
        setIsModalOpen(false);
        
        // Create download link and trigger it
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
    { id: 'features', label: 'Features' },
    { id: 'acoustics', label: 'Acoustics' },
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
    <div className="solid-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">ACOUSTIC WALL PANELS</span>
          <h1>Solid</h1>
          <p className="hero-tagline">High-Impact Acoustics, Effortless Installation</p>
          <p className="hero-description">
            Meet Re-Sound Solid—your high-impact acoustic wall panel designed for maximum 
            performance with minimal effort. Large format panels with exceptional sound 
            absorption, easy hook installation, and circular design principles.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🔊</span>
              <span className="usp-text">High Absorption</span>
            </div>
            <div className="usp">
              <span className="usp-icon">📐</span>
              <span className="usp-text">1200 × 600 mm</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔧</span>
              <span className="usp-text">Hook System</span>
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

          <p className="hero-price">Starting from <strong>€407</strong> excl. VAT per panel</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={selectedColor.image}
                alt={`Re-Sound Solid acoustic wall panel in ${selectedColor.name}`}
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
          
          {/* Color Selector */}
          <div className="color-selector">
            <span className="color-selector-label">Select Color</span>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`color-option ${selectedColor.id === color.id ? 'active' : ''}`}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                >
                  <span 
                    className="color-swatch" 
                    style={{ backgroundImage: `url(${color.swatch})` }}
                  />
                  {selectedColor.id === color.id && (
                    <span className={`color-check ${color.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-color-name">{selectedColor.name}</span>
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
                src="/images/products/solid/overview.jpg"
                alt="Solid panel complete package"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">COMPLETE SOLUTION</span>
            <h2>All Essentials, One Package</h2>
            <p>
              Re-Sound Solid provides everything you need to optimize your space's acoustics. 
              This large-format acoustic wall panel comes complete with core material, an 
              elegant fabric cover, and the full mounting system—ready for professional results.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                High-performance acoustic core
              </li>
              <li>
                <span className="check">✓</span>
                Elegant removable fabric cover
              </li>
              <li>
                <span className="check">✓</span>
                Complete hook mounting system
              </li>
              <li>
                <span className="check">✓</span>
                Large format for maximum impact
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Carefree Installation Section */}
      <section id="features" className="content-section features-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">EASE OF USE</span>
            <h2>Carefree Installation</h2>
            <p>
              Our convenient hook system makes installation a breeze. No specialized 
              tools, no complex procedures—just simple, secure mounting that anyone 
              can do. The robust hook system ensures your panels stay securely in 
              place while remaining easy to reposition when needed.
            </p>
            <div className="install-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span className="step-text">Mount the rail</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span className="step-text">Hook the panel</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span className="step-text">Enjoy the silence</span>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/solid/installation.jpg"
                alt="Easy hook installation system"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Low Maintenance Section */}
      <section className="content-section maintenance-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/solid/maintenance.jpg"
                alt="Removable cover for easy cleaning"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">LOW MAINTENANCE</span>
            <h2>Always Looking Fresh</h2>
            <p>
              The removable cover makes cleaning effortless. Simply remove, wash, 
              and reattach—your Solid panels will maintain their original appearance 
              for years. This practical design extends product life and ensures your 
              space always looks professional.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Removable fabric cover
              </li>
              <li>
                <span className="check">✓</span>
                Machine washable at 30°C
              </li>
              <li>
                <span className="check">✓</span>
                Stain-resistant options available
              </li>
              <li>
                <span className="check">✓</span>
                Replacement covers available
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Circular Design Section */}
      <section className="content-section circular-section">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Circular by Design</h2>
            <p>
              Re-Sound Solid is carefully designed with circularity at its core. 
              Made from recycled textiles and industrial waste, each panel contributes 
              to a more sustainable future. At end of life, panels can be fully 
              recycled—completing the circular loop.
            </p>
            <div className="circular-stats">
              <div className="stat">
                <span className="stat-number">80%</span>
                <span className="stat-label">Recycled content</span>
              </div>
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">Waste to landfill</span>
              </div>
              <div className="stat">
                <span className="stat-number">∞</span>
                <span className="stat-label">Recyclable cycles</span>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/solid/circular.jpg"
                alt="Circular design - recycled materials"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Acoustic Performance Section */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="acoustics-header">
          <span className="section-tag">PERFORMANCE</span>
          <h2>High-Impact Sound Absorption</h2>
          <p>
            Re-Sound Solid delivers exceptional acoustic performance with its substantial 
            dimensions and high-quality core material. The large surface area provides 
            significant sound absorption, creating comfortable, productive environments.
          </p>
        </div>

        <div className="acoustics-visual">
          <div className="frequency-bars">
            <div className="freq-group">
              <div className="freq-bar low">
                <div className="bar-fill" style={{ height: '80%' }}></div>
              </div>
              <span className="freq-label">Low</span>
              <span className="freq-range">125-500 Hz</span>
            </div>
            <div className="freq-group">
              <div className="freq-bar mid">
                <div className="bar-fill" style={{ height: '92%' }}></div>
              </div>
              <span className="freq-label">Mid</span>
              <span className="freq-range">500-2000 Hz</span>
            </div>
            <div className="freq-group">
              <div className="freq-bar high">
                <div className="bar-fill" style={{ height: '95%' }}></div>
              </div>
              <span className="freq-label">High</span>
              <span className="freq-range">2000-4000 Hz</span>
            </div>
          </div>

          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">αw 0.95</span>
              <span className="rating-label">Class A</span>
            </div>
            <p>Excellent absorption across all frequencies</p>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <span className="benefit-icon">🗣️</span>
            <h4>Improved Speech Clarity</h4>
            <p>Reduce reverberation for clearer conversations</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🧠</span>
            <h4>Enhanced Focus</h4>
            <p>Minimize distracting background noise</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">📐</span>
            <h4>Maximum Coverage</h4>
            <p>Large format for high-impact results</p>
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
                  <td>Panel size</td>
                  <td>1200 × 600 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>50 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>~5 kg per panel</td>
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
                  <td>0.95</td>
                </tr>
                <tr>
                  <td>Absorption class</td>
                  <td>Class A</td>
                </tr>
                <tr>
                  <td>NRC</td>
                  <td>0.90</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Materials</h4>
            <table>
              <tbody>
                <tr>
                  <td>Core</td>
                  <td>Recycled textile fiber</td>
                </tr>
                <tr>
                  <td>Binder</td>
                  <td>Bio-based adhesive</td>
                </tr>
                <tr>
                  <td>Cover</td>
                  <td>Recycled fabric</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Fire Safety</h4>
            <table>
              <tbody>
                <tr>
                  <td>Fire rating</td>
                  <td>B-s1, d0</td>
                </tr>
                <tr>
                  <td>Standard</td>
                  <td>EN 13501-1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Sustainability</h4>
            <table>
              <tbody>
                <tr>
                  <td>Recycled content</td>
                  <td>≥80%</td>
                </tr>
                <tr>
                  <td>End of life</td>
                  <td>100% recyclable</td>
                </tr>
                <tr>
                  <td>VOC emissions</td>
                  <td>Low / A+</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Installation</h4>
            <table>
              <tbody>
                <tr>
                  <td>Mounting</td>
                  <td>Hook system</td>
                </tr>
                <tr>
                  <td>Installation time</td>
                  <td>~3 min per panel</td>
                </tr>
                <tr>
                  <td>Tools required</td>
                  <td>Drill, level</td>
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
          <h2>Solid in Action</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gallery-item">
              <div className="image-container gallery">
                <Image
                  src={`/images/products/solid/gallery-${i}.jpg`}
                  alt={`Solid panel installation example ${i}`}
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
            calculate the right amount of panels and find the perfect configuration.
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
            Free shipping in Belgium • Return for recycling included
          </p>
        </div>
      </section>

      <style jsx>{`
        .solid-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
        }

        /* Hero Section */
        .product-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 8rem 4rem 4rem;
          background: linear-gradient(135deg, var(--brand-blue-pale) 0%, white 100%);
          min-height: 80vh;
          align-items: center;
        }

        .product-tag {
          display: inline-block;
          background: var(--brand-blue);
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
          color: var(--brand-blue);
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

        .usp-icon {
          font-size: 1.5rem;
        }

        .usp-text {
          font-weight: 600;
          color: var(--deep-blue);
          font-size: 0.9rem;
        }

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

        .btn-primary.large {
          padding: 1.25rem 2.5rem;
          font-size: 1.1rem;
        }

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

        .btn-secondary.large {
          padding: 1.25rem 2.5rem;
          font-size: 1.1rem;
        }

        .hero-price {
          font-size: 0.95rem;
          color: #666;
        }

        .hero-price strong {
          color: var(--deep-blue);
          font-size: 1.2rem;
        }

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
          aspect-ratio: 4/3;
          border-radius: 24px;
          overflow: hidden;
          background: var(--brand-blue-pale);
        }

        .image-wrapper {
          position: absolute;
          inset: 0;
          transition: opacity 0.3s ease;
        }

        .image-wrapper.loading {
          opacity: 0.7;
        }

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

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Color Selector */
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

        .color-selector-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .color-options {
          display: flex;
          gap: 0.75rem;
        }

        .color-option {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid transparent;
          background: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

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
          background-size: cover;
          background-position: center;
        }

        .color-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: bold;
        }

        .color-check.on-dark {
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .color-check.on-light {
          color: var(--deep-blue);
          text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
        }

        .selected-color-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--deep-blue);
        }

        .image-container.gallery {
          aspect-ratio: 1;
        }

        .section-image .image-container {
          width: 100%;
          max-width: none;
        }

        /* Sticky Navigation */
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
          padding: 1.25rem 1.5rem;
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          color: var(--brand-blue);
        }

        .nav-item.active {
          color: var(--brand-blue);
          border-bottom-color: var(--brand-blue);
        }

        /* Content Sections */
        .content-section {
          padding: 6rem 4rem;
        }

        .content-section.dark {
          background: var(--deep-blue);
          color: white;
        }

        .content-section.dark .section-content h2 {
          color: white;
        }

        .content-section.dark .section-content p {
          color: rgba(255, 255, 255, 0.8);
        }

        .section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
        }

        .section-grid.reverse {
          direction: rtl;
        }

        .section-grid.reverse > * {
          direction: ltr;
        }

        .section-tag {
          display: inline-block;
          background: var(--brand-blue-pale);
          color: var(--brand-blue);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }

        .content-section.dark .section-tag {
          background: rgba(25, 127, 199, 0.3);
          color: #7ec8f5;
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

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          font-size: 1rem;
          color: var(--charcoal);
        }

        .content-section.dark .feature-list li {
          color: rgba(255, 255, 255, 0.9);
        }

        .check {
          color: var(--brand-blue);
          font-weight: bold;
        }

        /* Installation Steps */
        .install-steps {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .step-number {
          width: 36px;
          height: 36px;
          background: var(--brand-blue);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
        }

        .step-text {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        /* Circular Stats */
        .circular-stats {
          display: flex;
          gap: 2.5rem;
          margin-top: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--brand-blue);
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
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

        .acoustics-visual {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 6rem;
          margin-bottom: 4rem;
        }

        .frequency-bars {
          display: flex;
          gap: 2rem;
          align-items: flex-end;
        }

        .freq-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .freq-bar {
          width: 60px;
          height: 150px;
          background: #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }

        .bar-fill {
          width: 100%;
          background: var(--brand-blue);
          border-radius: 8px;
          transition: height 0.5s ease;
        }

        .freq-bar.low .bar-fill {
          background: #5ba3d9;
        }

        .freq-bar.mid .bar-fill {
          background: var(--brand-blue);
        }

        .freq-bar.high .bar-fill {
          background: var(--brand-blue-dark);
        }

        .freq-label {
          font-weight: 600;
          color: var(--deep-blue);
        }

        .freq-range {
          font-size: 0.75rem;
          color: #888;
        }

        .absorption-rating {
          text-align: center;
        }

        .rating-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: var(--brand-blue);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .rating-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
        }

        .rating-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .absorption-rating > p {
          font-size: 0.9rem;
          color: #666;
        }

        .acoustics-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .benefit {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 16px;
        }

        .benefit-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
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
        }

        /* Specs Section */
        .specs-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .specs-header h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
        }

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
          color: var(--brand-blue);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .spec-card table {
          width: 100%;
        }

        .spec-card td {
          padding: 0.5rem 0;
          font-size: 0.9rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .spec-card tr:last-child td {
          border-bottom: none;
        }

        .spec-card td:first-child {
          color: #666;
        }

        .spec-card td:last-child {
          text-align: right;
          font-weight: 600;
          color: var(--deep-blue);
        }

        /* Gallery Section */
        .gallery-section {
          background: var(--deep-blue);
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .gallery-header h2 {
          font-size: 2.5rem;
          color: white;
        }

        .gallery-header .section-tag {
          background: rgba(25, 127, 199, 0.3);
          color: #7ec8f5;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-item {
          border-radius: 16px;
          overflow: hidden;
        }

        /* Downloads Section */
        .downloads-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .downloads-header h2 {
          font-size: 2.5rem;
          color: var(--deep-blue);
        }

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
          background: var(--brand-blue-pale);
          transform: translateY(-2px);
        }

        .download-icon {
          font-size: 2rem;
        }

        .download-info h4 {
          font-size: 0.95rem;
          color: var(--deep-blue);
          margin-bottom: 0.25rem;
        }

        .download-info span {
          font-size: 0.8rem;
          color: #888;
        }

        .download-arrow {
          margin-left: auto;
          font-size: 1.2rem;
          color: var(--brand-blue);
        }

        /* CTA Section */
        .cta-section {
          background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
          text-align: center;
        }

        .cta-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .cta-content > p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2rem;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .cta-section .btn-primary {
          background: white;
          color: var(--brand-blue);
        }

        .cta-section .btn-primary:hover {
          background: var(--cream);
        }

        .cta-section .btn-secondary {
          border-color: white;
          color: white;
        }

        .cta-section .btn-secondary:hover {
          background: white;
          color: var(--brand-blue);
        }

        .cta-note {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .product-hero {
            grid-template-columns: 1fr;
            padding: 6rem 2rem 3rem;
            min-height: auto;
          }

          .hero-content h1 {
            font-size: 3rem;
          }

          .section-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .section-grid.reverse {
            direction: ltr;
          }

          .specs-grid,
          .downloads-grid,
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .acoustics-visual {
            flex-direction: column;
            gap: 3rem;
          }

          .acoustics-benefits {
            grid-template-columns: 1fr;
          }

          .install-steps {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .content-section {
            padding: 4rem 1.5rem;
          }

          .product-nav {
            padding: 0 1rem;
            overflow-x: auto;
          }

          .nav-inner {
            min-width: max-content;
          }

          .nav-item {
            padding: 1rem;
            font-size: 0.85rem;
          }

          .hero-usps {
            flex-direction: column;
            gap: 1rem;
          }

          .hero-ctas {
            flex-direction: column;
          }

          .section-content h2 {
            font-size: 2rem;
          }

          .specs-grid,
          .downloads-grid {
            grid-template-columns: 1fr;
          }

          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cta-buttons {
            flex-direction: column;
          }

          .circular-stats {
            flex-wrap: wrap;
            justify-content: center;
          }

          .color-options {
            gap: 0.5rem;
          }

          .color-option {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
}
