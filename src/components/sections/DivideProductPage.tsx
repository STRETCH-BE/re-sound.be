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

// Color options for the Divide product
const colorOptions = [
  { id: 'denim', name: 'Denim', swatch: '/images/products/divide/swatches/denim.webp', image: '/images/products/divide/hero-denim.webp', isDark: true },
  { id: 'antracite', name: 'Antracite', swatch: '/images/products/divide/swatches/antracite.webp', image: '/images/products/divide/hero-antracite.webp', isDark: true },
  { id: 'silver', name: 'Silver', swatch: '/images/products/divide/swatches/silver.webp', image: '/images/products/divide/hero-silver.webp', isDark: false },
  { id: 'sky', name: 'Sky', swatch: '/images/products/divide/swatches/sky.webp', image: '/images/products/divide/hero-sky.webp', isDark: false },
  { id: 'mint', name: 'Mint', swatch: '/images/products/divide/swatches/mint.webp', image: '/images/products/divide/hero-mint.webp', isDark: false },
  { id: 'taupe', name: 'Taupe', swatch: '/images/products/divide/swatches/taupe.webp', image: '/images/products/divide/hero-taupe.webp', isDark: false },
];

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

export default function DivideProductPage() {
  const t = useTranslations('products.divide');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/divide/product-data-sheet.pdf' },
    { id: 'configuration-guide', name: 'Configuration Guide', icon: '📋', file: '/documents/divide/configuration-guide.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/divide/acoustic-test-report.pdf' },
    { id: 'color-fabric-guide', name: 'Color & Fabric Guide', icon: '🎨', file: '/documents/divide/color-fabric-guide.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/divide/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/divide/sustainability-declaration.pdf' },
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
          source: 'Divide Product Page',
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
    { id: 'features', label: 'Features' },
    { id: 'modular', label: 'Modular' },
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
    <div className="divide-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">ACOUSTIC ROOM DIVIDER</span>
          <h1>Divide</h1>
          <p className="hero-tagline">Snap to Redefine, Split for Style</p>
          <p className="hero-description">
            Meet Re-Sound Divide—the first freestanding acoustic screen designed for 
            flexible use. Easily divide your space, create privacy zones, and eliminate 
            background noise with our innovative modular system.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🧲</span>
              <span className="usp-text">Magnetic Connect</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔄</span>
              <span className="usp-text">Fully Modular</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🦶</span>
              <span className="usp-text">Freestanding</span>
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

          <p className="hero-price">Starting from <strong>€1,238</strong> excl. VAT</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={selectedColor.image}
                alt={`Re-Sound Divide acoustic room divider in ${selectedColor.name}`}
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
                src="/images/products/divide/overview.webp"
                alt="Divide acoustic room divider"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">INNOVATION</span>
            <h2>Redefine Your Space</h2>
            <p>
              Re-Sound Divide is the first freestanding acoustic product designed for 
              ultimate flexibility. Create private zones, divide open spaces, and 
              control background noise—all while maintaining the freedom to reconfigure 
              as your needs change.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Freestanding design—no installation needed
              </li>
              <li>
                <span className="check">✓</span>
                Magnetic connection system
              </li>
              <li>
                <span className="check">✓</span>
                Lightweight and easy to move
              </li>
              <li>
                <span className="check">✓</span>
                Circular by design
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Integrated Base Section */}
      <section id="features" className="content-section features-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">STABILITY</span>
            <h2>Integrated Base</h2>
            <p>
              Thanks to the integrated base, Divide is always stable and stands freely 
              on any floor. The lightweight modules can be easily moved for optimal 
              flexibility—perfect for dynamic work environments that need to adapt 
              quickly.
            </p>
            <div className="feature-highlights">
              <div className="highlight">
                <span className="highlight-icon">⚖️</span>
                <div>
                  <h4>Perfectly Balanced</h4>
                  <p>Stable on any surface without fixing</p>
                </div>
              </div>
              <div className="highlight">
                <span className="highlight-icon">🪶</span>
                <div>
                  <h4>Lightweight</h4>
                  <p>Easy to move and reposition</p>
                </div>
              </div>
              <div className="highlight">
                <span className="highlight-icon">🛡️</span>
                <div>
                  <h4>Floor-Safe</h4>
                  <p>Soft base protects all floor types</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/divide/integrated-base.webp"
                alt="Divide integrated base detail"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Magnetic Connection Section */}
      <section className="content-section magnetic-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/divide/magnetic-connection.webp"
                alt="Magnetic connection detail"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">EFFORTLESS</span>
            <h2>Magnetic Connection</h2>
            <p>
              The modules connect effortlessly through subtle magnets integrated into 
              the fabric. Assemble and disassemble with ease—invisible, subtly processed, 
              yet strong enough for worry-free use. No tools, no complexity, just snap 
              and go.
            </p>
            <div className="connect-demo">
              <div className="connect-step">
                <div className="step-visual snap">
                  <span>🧲</span>
                </div>
                <span className="step-label">Snap together</span>
              </div>
              <div className="connect-arrow">→</div>
              <div className="connect-step">
                <div className="step-visual align">
                  <span>✨</span>
                </div>
                <span className="step-label">Auto-align</span>
              </div>
              <div className="connect-arrow">→</div>
              <div className="connect-step">
                <div className="step-visual done">
                  <span>✓</span>
                </div>
                <span className="step-label">Done!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modular System Section */}
      <section id="modular" className="content-section modular-section">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">FLEXIBILITY</span>
            <h2>Modular System</h2>
            <p>
              Decide the layout of your space yourself. Divide is a modular system 
              that adapts to your needs. Whether you choose a long room divider or 
              several short configurations—let your creativity run wild.
            </p>
            <div className="config-options">
              <div className="config">
                <div className="config-visual">
                  <div className="module"></div>
                </div>
                <span>Single</span>
              </div>
              <div className="config">
                <div className="config-visual">
                  <div className="module"></div>
                  <div className="module"></div>
                </div>
                <span>Double</span>
              </div>
              <div className="config">
                <div className="config-visual">
                  <div className="module"></div>
                  <div className="module"></div>
                  <div className="module"></div>
                </div>
                <span>Triple</span>
              </div>
              <div className="config">
                <div className="config-visual corner">
                  <div className="module"></div>
                  <div className="module rotated"></div>
                </div>
                <span>Corner</span>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/divide/modular.webp"
                alt="Modular configurations"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Circular Design Section */}
      <section className="content-section circular-section dark">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/divide/circular.webp"
                alt="Circular design - recycled materials"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Circular by Design</h2>
            <p>
              Like all Re-Sound products, Divide is carefully designed with circularity 
              at its core. Made from recycled textiles and industrial waste, contributing 
              to a more sustainable future. At end of life, return it to us for free 
              recycling.
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
        </div>
      </section>

      {/* Acoustic Performance Section */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="acoustics-header">
          <span className="section-tag">PERFORMANCE</span>
          <h2>Dual-Sided Sound Absorption</h2>
          <p>
            Re-Sound Divide absorbs sound from both sides, making it perfect for 
            creating acoustic privacy in open environments. Stop being disturbed 
            by background noise and create focused, productive spaces.
          </p>
        </div>

        <div className="acoustics-visual">
          <div className="dual-absorption">
            <div className="absorption-side left">
              <div className="wave-lines">
                <span></span><span></span><span></span>
              </div>
              <span className="side-label">Sound absorbed</span>
            </div>
            <div className="divider-panel">
              <Image
                src="/images/products/divide/panel-section.png"
                alt="Divide panel cross-section"
                width={80}
                height={200}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="absorption-side right">
              <div className="wave-lines">
                <span></span><span></span><span></span>
              </div>
              <span className="side-label">Sound absorbed</span>
            </div>
          </div>

          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">αw 0.85</span>
              <span className="rating-label">Per side</span>
            </div>
            <p>Excellent dual-sided absorption</p>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <span className="benefit-icon">🔇</span>
            <h4>Noise Reduction</h4>
            <p>Block distracting background conversations</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔒</span>
            <h4>Privacy Zones</h4>
            <p>Create focused work areas in open spaces</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🎯</span>
            <h4>Better Focus</h4>
            <p>Improve concentration and productivity</p>
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
                  <td>Module width</td>
                  <td>800 mm</td>
                </tr>
                <tr>
                  <td>Module height</td>
                  <td>1600 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>45 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>~8 kg per module</td>
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
                  <td>0.85</td>
                </tr>
                <tr>
                  <td>Absorption class</td>
                  <td>Class A</td>
                </tr>
                <tr>
                  <td>Dual-sided</td>
                  <td>Yes</td>
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
                  <td>Cover</td>
                  <td>Recycled fabric</td>
                </tr>
                <tr>
                  <td>Base</td>
                  <td>Recycled steel</td>
                </tr>
                <tr>
                  <td>Magnets</td>
                  <td>Neodymium</td>
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
            <h4>Features</h4>
            <table>
              <tbody>
                <tr>
                  <td>Connection</td>
                  <td>Magnetic snap</td>
                </tr>
                <tr>
                  <td>Setup time</td>
                  <td>Instant</td>
                </tr>
                <tr>
                  <td>Tools required</td>
                  <td>None</td>
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
          <h2>Divide in Action</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gallery-item">
              <div className="image-container gallery">
                <Image
                  src={`/images/products/divide/gallery-${i}.webp`}
                  alt={`Divide room divider installation example ${i}`}
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
            find the perfect configuration for your space.
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
        .divide-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
        }

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
          aspect-ratio: 3/4;
          border-radius: 24px;
          overflow: hidden;
          background: var(--brand-blue-pale);
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

        .color-selector-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .color-options { display: flex; gap: 0.75rem; }

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
        .check { color: var(--brand-blue); font-weight: bold; }

        .feature-highlights {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-top: 1.5rem;
        }

        .highlight { display: flex; align-items: flex-start; gap: 1rem; }
        .highlight-icon { font-size: 1.5rem; flex-shrink: 0; }
        .highlight h4 { font-size: 1rem; color: white; margin: 0 0 0.25rem; }
        .highlight p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin: 0; }

        .connect-demo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--cream);
          border-radius: 16px;
        }

        .connect-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .step-visual {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .step-visual.snap { background: var(--brand-blue-pale); }
        .step-visual.align { background: #e8f5e9; }
        .step-visual.done { background: var(--brand-blue); color: white; }
        .step-label { font-size: 0.85rem; font-weight: 600; color: var(--charcoal); }
        .connect-arrow { font-size: 1.5rem; color: #ccc; }

        .config-options { display: flex; gap: 1.5rem; margin-top: 2rem; }

        .config {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .config-visual {
          display: flex;
          gap: 4px;
          padding: 1rem;
          background: var(--brand-blue-pale);
          border-radius: 12px;
          min-width: 60px;
          justify-content: center;
        }

        .config-visual.corner { flex-wrap: wrap; width: 70px; }

        .module {
          width: 20px;
          height: 50px;
          background: var(--brand-blue);
          border-radius: 4px;
        }

        .module.rotated { transform: rotate(90deg); margin-top: 15px; margin-left: -15px; }
        .config span { font-size: 0.85rem; font-weight: 600; color: var(--charcoal); }

        .circular-stats { display: flex; gap: 2.5rem; margin-top: 2rem; }
        .stat { text-align: center; }
        .stat-number { display: block; font-size: 2.5rem; font-weight: 700; color: #7ec8f5; }
        .stat-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); }

        .acoustics-section { background: var(--cream); }

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

        .acoustics-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }

        .acoustics-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .dual-absorption { display: flex; align-items: center; gap: 1rem; }

        .absorption-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .wave-lines { display: flex; flex-direction: column; gap: 6px; }

        .wave-lines span {
          width: 40px;
          height: 3px;
          background: var(--brand-blue);
          border-radius: 2px;
          opacity: 0.6;
        }

        .wave-lines span:nth-child(1) { width: 30px; }
        .wave-lines span:nth-child(2) { width: 40px; opacity: 0.8; }
        .wave-lines span:nth-child(3) { width: 25px; opacity: 0.4; }

        .absorption-side.left .wave-lines { align-items: flex-end; }
        .absorption-side.right .wave-lines { align-items: flex-start; }

        .side-label {
          font-size: 0.75rem;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .divider-panel {
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .absorption-rating { text-align: center; }

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

        .rating-value { font-size: 1.8rem; font-weight: 700; color: white; }
        .rating-label { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); }
        .absorption-rating > p { font-size: 0.9rem; color: #666; }

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

        .benefit-icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
        .benefit h4 { font-size: 1.1rem; color: var(--deep-blue); margin-bottom: 0.5rem; }
        .benefit p { font-size: 0.9rem; color: #666; margin: 0; }

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
          color: var(--brand-blue);
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

        .gallery-section { background: var(--deep-blue); }
        .gallery-header { text-align: center; margin-bottom: 3rem; }
        .gallery-header h2 { font-size: 2.5rem; color: white; }
        .gallery-header .section-tag { background: rgba(25, 127, 199, 0.3); color: #7ec8f5; }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-item { border-radius: 16px; overflow: hidden; }

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
          background: var(--brand-blue-pale);
          transform: translateY(-2px);
        }

        .download-icon { font-size: 2rem; }
        .download-info h4 { font-size: 0.95rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .download-info span { font-size: 0.8rem; color: #888; }
        .download-arrow { margin-left: auto; font-size: 1.2rem; color: var(--brand-blue); }

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
          .acoustics-visual { flex-direction: column; gap: 3rem; }
          .acoustics-benefits { grid-template-columns: 1fr; }
          .config-options { flex-wrap: wrap; justify-content: center; }
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
          .cta-buttons { flex-direction: column; }
          .circular-stats { flex-wrap: wrap; justify-content: center; }
          .connect-demo { flex-direction: column; }
          .connect-arrow { transform: rotate(90deg); }
          .color-options { gap: 0.5rem; }
          .color-option { width: 38px; height: 38px; }
        }
      `}</style>
    </div>
  );
}
