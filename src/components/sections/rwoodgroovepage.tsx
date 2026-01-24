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

// Wood finish options for rWood - Groove
const woodFinishOptions = [
  { id: 'oak-natural', name: 'Silk Oak', swatch: '/images/products/rwood-groove/swatches/silk-oak.jpg', image: '/images/products/rwood-groove/silk-oak.jpg', isDark: false },
  { id: 'oak-white', name: 'Straw Oak', swatch: '/images/products/rwood-groove/swatches/straw-oak.jpg', image: '/images/products/rwood-groove/straw-oak.jpg', isDark: false },
  { id: 'oak-clear', name: 'Umber Oak', swatch: '/images/products/rwood-groove/swatches/umber-oak.jpg', image: '/images/products/rwood-groove/umber-oak.jpg', isDark: false },
  { id: 'oak-brown', name: 'Walnut', swatch: '/images/products/rwood-groove/swatches/walnut.jpg', image: '/images/products/rwood-groove/walnut.jpg', isDark: true },
  { id: 'oak-dark', name: 'Tobacco Walnut', swatch: '/images/products/rwood-groove/swatches/tobacco-walnut.jpg', image: '/images/products/rwood-groove/tobacco-walnut.jpg', isDark: true },
];

// Felt backing options
const feltOptions = [
  { id: 'black', name: 'Black Felt', color: '#1a1a1a' },
  { id: 'grey', name: 'Grey Felt', color: '#6b6b6b' },
];

// Panel variant options
const variantOptions = [
  { id: 'original', name: 'Original', lamellas: 6, lamellaWidth: '34mm', description: 'Classic 6-lamella design' },
  { id: 'mixed', name: 'Mixed', lamellas: 6, lamellaWidth: '50/30/22mm', description: 'Dynamic mixed widths' },
  { id: '4-lamella', name: '4-Lamella', lamellas: 4, lamellaWidth: '59mm', description: 'Bold wide strips' },
  { id: '3-lamella', name: '3-Lamella', lamellas: 3, lamellaWidth: '84mm', description: 'Statement wide panels' },
];

// Default hero image (shown before any swatch is selected)
const defaultHeroImage = '/images/products/rwood-groove/rWood-Groove_detail.jpg';

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

export default function RWoodGrooveProductPage() {
  const t = useTranslations('products.rwood-groove');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState<typeof woodFinishOptions[0] | null>(null);
  const [selectedFelt, setSelectedFelt] = useState(feltOptions[0]);
  const [selectedVariant, setSelectedVariant] = useState(variantOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get the current hero image - default or selected finish
  const currentHeroImage = selectedFinish ? selectedFinish.image : defaultHeroImage;

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rwood-groove/product-data-sheet.pdf' },
    { id: 'installation-guide', name: 'Installation Guide', icon: '🔧', file: '/documents/rwood-groove/installation-guide.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/rwood-groove/acoustic-test-report.pdf' },
    { id: 'color-finish-guide', name: 'Color & Finish Guide', icon: '🎨', file: '/documents/rwood-groove/color-finish-guide.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/rwood-groove/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rwood-groove/sustainability-declaration.pdf' },
  ];

  const handleDownloadClick = (fileUrl: string) => {
    setSelectedDownload(fileUrl);
    setIsModalOpen(true);
  };

  const handleFinishSelect = (finish: typeof woodFinishOptions[0]) => {
    if (!selectedFinish || finish.id !== selectedFinish.id) {
      setIsImageLoading(true);
      setSelectedFinish(finish);
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
          source: 'rWood - Groove Product Page',
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
    { id: 'variants', label: 'Variants' },
    { id: 'finishes', label: 'Finishes' },
    { id: 'acoustics', label: 'Acoustics' },
    { id: 'installation', label: 'Installation' },
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
    <div className="rwood-groove-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">ACOUSTIC WOOD PANELS</span>
          <h1>rWood - Groove</h1>
          <p className="hero-tagline">Natural Beauty, Perfect Acoustics</p>
          <p className="hero-description">
            Bring natural warmth and sophisticated style to any space with rWood - Groove 
            acoustic panels. Premium oak and walnut veneers combined with sound-absorbing 
            felt backing create harmony between aesthetics and acoustics.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🌳</span>
              <span className="usp-text">FSC® Certified Wood</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔇</span>
              <span className="usp-text">Class A Absorption</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🇪🇺</span>
              <span className="usp-text">Made in Europe</span>
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

          <p className="hero-price">Starting from <strong>€89</strong> per panel excl. VAT</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={`rWood - Groove acoustic panel${selectedFinish ? ` in ${selectedFinish.name}` : ''}`}
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
          
          <div className="finish-selector">
            <span className="selector-label">Select Wood Finish</span>
            <div className="finish-options">
              {woodFinishOptions.map((finish) => (
                <button
                  key={finish.id}
                  className={`finish-option ${selectedFinish?.id === finish.id ? 'active' : ''}`}
                  onClick={() => handleFinishSelect(finish)}
                  title={finish.name}
                  aria-label={`Select ${finish.name} finish`}
                >
                  <span 
                    className="finish-swatch" 
                    style={{ backgroundImage: `url(${finish.swatch})` }}
                  />
                  {selectedFinish?.id === finish.id && (
                    <span className={`finish-check ${finish.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-finish-name">{selectedFinish?.name || 'Select a finish'}</span>
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
                src="/images/products/rwood-groove/Where Nature Meets Design.webp"
                alt="rWood - Groove acoustic panel in modern interior"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">CRAFTSMANSHIP</span>
            <h2>Where Nature Meets Design</h2>
            <p>
              rWood - Groove panels transform any room into a space of natural beauty and 
              acoustic comfort. Each panel features premium A-grade oak or walnut veneer, 
              precisely grooved to create the signature linear aesthetic while maximizing 
              sound absorption through integrated felt backing.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Premium A-grade oak and walnut veneers
              </li>
              <li>
                <span className="check">✓</span>
                Integrated acoustic felt backing
              </li>
              <li>
                <span className="check">✓</span>
                Seamless panel-to-panel connection
              </li>
              <li>
                <span className="check">✓</span>
                Suitable for walls and ceilings
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Variants Section */}
      <section id="variants" className="content-section variants-section dark">
        <div className="variants-header">
          <span className="section-tag">DESIGN OPTIONS</span>
          <h2>Choose Your Style</h2>
          <p>
            Four distinct groove patterns to match any architectural vision. From classic 
            balanced proportions to bold wide strips—find the perfect expression for your space.
          </p>
        </div>

        <div className="variants-grid">
          {variantOptions.map((variant) => (
            <div 
              key={variant.id} 
              className={`variant-card ${selectedVariant.id === variant.id ? 'active' : ''}`}
              onClick={() => setSelectedVariant(variant)}
            >
              <div className="variant-visual">
                <div className={`lamella-preview lamella-${variant.lamellas}`}>
                  {[...Array(variant.lamellas)].map((_, i) => (
                    <div key={i} className="lamella" />
                  ))}
                </div>
              </div>
              <div className="variant-info">
                <h4>{variant.name}</h4>
                <span className="lamella-count">{variant.lamellas} Lamellas</span>
                <p>{variant.description}</p>
                <span className="lamella-width">Width: {variant.lamellaWidth}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Finishes Section */}
      <section id="finishes" className="content-section finishes-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">MATERIALS</span>
            <h2>Premium Finishes</h2>
            <p>
              Every rWood - Groove panel is crafted with A-grade veneer, ensuring consistent 
              grain patterns and superior quality. Choose from our range of oiled and painted 
              finishes to perfectly complement your interior design.
            </p>
            
            <div className="finish-categories">
              <div className="finish-category">
                <h4>Oak Collection</h4>
                <p>Natural, White, Clear, Brown, Dark Brown, and Black oil finishes. Each brings out the distinctive oak grain in a unique way.</p>
              </div>
              <div className="finish-category">
                <h4>Walnut</h4>
                <p>Rich, warm tones with distinctive grain patterns. The premium choice for sophisticated interiors.</p>
              </div>
            </div>

            <div className="felt-options">
              <h4>Felt Backing Options</h4>
              <div className="felt-selector">
                {feltOptions.map((felt) => (
                  <button
                    key={felt.id}
                    className={`felt-option ${selectedFelt.id === felt.id ? 'active' : ''}`}
                    onClick={() => setSelectedFelt(felt)}
                  >
                    <span className="felt-swatch" style={{ backgroundColor: felt.color }} />
                    <span className="felt-name">{felt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-groove/rWood-Groove_detail.jpg"
                alt="Wood finish samples"
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
          <h2>Superior Sound Absorption</h2>
          <p>
            The unique groove design combined with high-quality acoustic felt creates 
            exceptional sound absorption. Reduce echo, eliminate noise, and create 
            spaces that are as comfortable to the ear as they are to the eye.
          </p>
        </div>

        <div className="acoustics-visual">
          <div className="panel-cross-section">
            <div className="cross-section-diagram">
              <div className="diagram-layer veneer">
                <span className="layer-label">Oak/Walnut Veneer</span>
              </div>
              <div className="diagram-layer mdf">
                <span className="layer-label">MDF Core</span>
              </div>
              <div className="diagram-layer grooves">
                <div className="groove"></div>
                <div className="groove"></div>
                <div className="groove"></div>
                <span className="layer-label">Sound Entry Grooves</span>
              </div>
              <div className="diagram-layer felt">
                <span className="layer-label">Acoustic Felt</span>
              </div>
            </div>
          </div>

          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">αw 0.90</span>
              <span className="rating-label">Absorption</span>
            </div>
            <p>Class A Acoustic Performance</p>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <span className="benefit-icon">🎯</span>
            <h4>Reduced Reverberation</h4>
            <p>Control echo and improve speech clarity</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">😌</span>
            <h4>Increased Comfort</h4>
            <p>Create calmer, more peaceful environments</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">📊</span>
            <h4>Tested Performance</h4>
            <p>Independently verified acoustic data</p>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">EASY INSTALL</span>
            <h2>Seamless Installation</h2>
            <p>
              rWood - Groove panels feature an innovative tongue-and-groove connection 
              system that ensures invisible joints and a cohesive surface. Whether you&apos;re 
              a professional installer or a skilled DIYer, our system makes installation 
              straightforward.
            </p>
            
            <div className="installation-steps">
              <div className="install-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Prepare Surface</h4>
                  <p>Mount battens or apply adhesive to clean, dry surface</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Position First Panel</h4>
                  <p>Start from corner, ensure level alignment</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Connect Panels</h4>
                  <p>Slide tongue into groove for seamless connection</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Complete & Finish</h4>
                  <p>Add end mouldings for a professional result</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-groove/seamless installation.jpg"
                alt="Panel installation process"
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
                src="/images/products/rwood-groove/FSC_CERT.webp"
                alt="Sustainable forestry"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Responsibly Sourced</h2>
            <p>
              Every rWood - Groove panel is crafted with sustainability at its core. 
              Our FSC® certification guarantees that the wood comes from responsibly 
              managed forests that provide environmental, social, and economic benefits.
            </p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <span className="sustain-icon">🌲</span>
                <div>
                  <h4>FSC® Certified</h4>
                  <p>Wood from responsibly managed forests</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">♻️</span>
                <div>
                  <h4>Recycled Felt</h4>
                  <p>Acoustic backing from recycled materials</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🏭</span>
                <div>
                  <h4>European Production</h4>
                  <p>Reduced transport emissions</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">📋</span>
                <div>
                  <h4>EPD Available</h4>
                  <p>Full environmental product declaration</p>
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
                  <td>Panel width</td>
                  <td>300 mm</td>
                </tr>
                <tr>
                  <td>Panel length</td>
                  <td>2400 / 2780 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>19 mm</td>
                </tr>
                <tr>
                  <td>Groove depth</td>
                  <td>15 mm</td>
                </tr>
                <tr>
                  <td>Groove width</td>
                  <td>15 mm</td>
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
                  <td>0.90</td>
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
            <h4>Materials</h4>
            <table>
              <tbody>
                <tr>
                  <td>Veneer</td>
                  <td>A-grade Oak / Walnut</td>
                </tr>
                <tr>
                  <td>Core</td>
                  <td>MDF (standard / moisture-resistant / fire-retardant)</td>
                </tr>
                <tr>
                  <td>Felt</td>
                  <td>Recycled PET (3mm)</td>
                </tr>
                <tr>
                  <td>Finish</td>
                  <td>Oil / Lacquer</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Fire Safety</h4>
            <table>
              <tbody>
                <tr>
                  <td>Standard panels</td>
                  <td>D-s2, d2</td>
                </tr>
                <tr>
                  <td>Fire-retardant MDF</td>
                  <td>B-s1, d0</td>
                </tr>
                <tr>
                  <td>Felt</td>
                  <td>B-s1, d0</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>EN 13501</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Certifications</h4>
            <table>
              <tbody>
                <tr>
                  <td>Wood sourcing</td>
                  <td>FSC® certified</td>
                </tr>
                <tr>
                  <td>Felt certification</td>
                  <td>OEKO-TEX® Standard 100</td>
                </tr>
                <tr>
                  <td>Environmental</td>
                  <td>EPD available</td>
                </tr>
                <tr>
                  <td>VOC emissions</td>
                  <td>E1 / Low emission</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Applications</h4>
            <table>
              <tbody>
                <tr>
                  <td>Installation</td>
                  <td>Walls & Ceilings</td>
                </tr>
                <tr>
                  <td>Environment</td>
                  <td>Interior (dry areas)</td>
                </tr>
                <tr>
                  <td>Moisture-resistant</td>
                  <td>Available for humid areas</td>
                </tr>
                <tr>
                  <td>Connection</td>
                  <td>Tongue & groove</td>
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
                  src={`/images/products/rwood-groove/gallery-${i}.webp`}
                  alt={`rWood - Groove installation example ${i}`}
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

      {/* Accessories Section */}
      <section className="content-section accessories-section dark">
        <div className="accessories-header">
          <span className="section-tag">COMPLETE THE LOOK</span>
          <h2>Accessories</h2>
          <p>Professional finishing touches for a perfect result</p>
        </div>

        <div className="accessories-grid">
          <div className="accessory-card">
            <div className="accessory-icon">📏</div>
            <h4>End Mouldings</h4>
            <p>Clean edges where panels meet other surfaces</p>
          </div>
          <div className="accessory-card">
            <div className="accessory-icon">🔲</div>
            <h4>Corner Profiles</h4>
            <p>Seamless internal and external corner solutions</p>
          </div>
          <div className="accessory-card">
            <div className="accessory-icon">📐</div>
            <h4>Mounting Battens</h4>
            <p>Hidden fixing system for walls and ceilings</p>
          </div>
          <div className="accessory-card">
            <div className="accessory-icon">🎨</div>
            <h4>Touch-up Kit</h4>
            <p>Matching oils for repairs and maintenance</p>
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
            choose the perfect finish and configuration.
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
            Free samples available • Made in Europe • FSC® Certified
          </p>
        </div>
      </section>

      <style jsx>{`
        .rwood-groove-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --wood-warm: #8B6914;
          --wood-light: #D4A954;
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
          color: var(--wood-warm);
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

        .finish-selector {
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

        .finish-options { display: flex; gap: 0.6rem; }

        .finish-option {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          border: 3px solid transparent;
          background: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .finish-option:hover { transform: scale(1.1); }

        .finish-option.active {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue);
        }

        .finish-swatch {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 5px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background-size: cover;
          background-position: center;
        }

        .finish-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .finish-check.on-dark { color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
        .finish-check.on-light { color: var(--deep-blue); text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); }

        .selected-finish-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }

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

        /* Variants Section */
        .variants-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .variants-header h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .variants-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .variants-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .variant-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .variant-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .variant-card.active {
          background: rgba(25, 127, 199, 0.2);
          border-color: var(--brand-blue);
        }

        .variant-visual {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .lamella-preview {
          display: flex;
          gap: 4px;
          height: 80px;
        }

        .lamella {
          background: linear-gradient(180deg, #c4a77d 0%, #8b6914 100%);
          border-radius: 2px;
          height: 100%;
        }

        .lamella-6 .lamella { width: 12px; }
        .lamella-4 .lamella { width: 18px; }
        .lamella-3 .lamella { width: 24px; }

        .variant-info { text-align: center; }
        .variant-info h4 { color: white; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .lamella-count { font-size: 0.85rem; color: #7ec8f5; }
        .variant-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin: 0.5rem 0; }
        .lamella-width { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* Finishes Section */
        .finish-categories {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .finish-category {
          padding: 1.5rem;
          background: var(--cream);
          border-radius: 12px;
        }

        .finish-category h4 {
          color: var(--deep-blue);
          margin-bottom: 0.5rem;
        }

        .finish-category p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
          line-height: 1.6;
        }

        .felt-options h4 {
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .felt-selector {
          display: flex;
          gap: 1rem;
        }

        .felt-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .felt-option:hover { border-color: var(--brand-blue); }

        .felt-option.active {
          border-color: var(--brand-blue);
          background: var(--brand-blue-pale);
        }

        .felt-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .felt-name { font-size: 0.9rem; font-weight: 500; color: var(--charcoal); }

        /* Acoustics Section */
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
          gap: 6rem;
          margin-bottom: 4rem;
        }

        .cross-section-diagram {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 200px;
        }

        .diagram-layer {
          position: relative;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .diagram-layer.veneer {
          background: linear-gradient(90deg, #c4a77d 0%, #d4a954 50%, #c4a77d 100%);
          border-radius: 8px 8px 0 0;
          height: 20px;
        }

        .diagram-layer.mdf {
          background: #d4c4a0;
          height: 40px;
        }

        .diagram-layer.grooves {
          background: #d4c4a0;
          height: 30px;
          display: flex;
          gap: 20px;
          padding: 0 20px;
        }

        .groove {
          width: 16px;
          height: 100%;
          background: #333;
          border-radius: 0 0 4px 4px;
        }

        .diagram-layer.felt {
          background: #333;
          border-radius: 0 0 8px 8px;
          height: 15px;
        }

        .layer-label {
          position: absolute;
          right: -150px;
          font-size: 0.8rem;
          color: #666;
          white-space: nowrap;
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

        /* Installation Section */
        .installation-steps {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .install-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: var(--brand-blue);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content h4 { color: white; margin: 0 0 0.25rem; }
        .step-content p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin: 0; }

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
          background: var(--brand-blue-pale);
          transform: translateY(-2px);
        }

        .download-icon { font-size: 2rem; }
        .download-info h4 { font-size: 0.95rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .download-info span { font-size: 0.8rem; color: #888; }
        .download-arrow { margin-left: auto; font-size: 1.2rem; color: var(--brand-blue); }

        /* Accessories Section */
        .accessories-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .accessories-header h2 { font-size: 2.5rem; color: white; margin-bottom: 0.5rem; }
        .accessories-header p { color: rgba(255, 255, 255, 0.7); }

        .accessories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .accessory-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .accessory-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .accessory-card h4 { color: white; margin-bottom: 0.5rem; }
        .accessory-card p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin: 0; }

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
          .variants-grid { grid-template-columns: repeat(2, 1fr); }
          .accessories-grid { grid-template-columns: repeat(2, 1fr); }
          .acoustics-visual { flex-direction: column; gap: 3rem; }
          .acoustics-benefits { grid-template-columns: 1fr; }
          .finish-categories { grid-template-columns: 1fr; }
          .sustainability-features { grid-template-columns: 1fr; }
          .layer-label { display: none; }
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
          .variants-grid { grid-template-columns: 1fr; }
          .accessories-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
          .felt-selector { flex-wrap: wrap; }
          .finish-options { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
