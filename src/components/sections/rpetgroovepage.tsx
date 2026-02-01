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

// Color options for rPET - Groove (12 colors)
const colorOptions = [
  { id: 'beige', name: 'Beige', hex: '#FFFFF0', image: '/images/products/rpet-groove/rPET-Groove-Beige.jpg', isDark: false },
  { id: 'grey', name: 'Grey', hex: '#BAB9A9', image: '/images/products/rpet-groove/rPET-Groove-grey.jpg', isDark: false },
  { id: 'anthracite', name: 'Anthracite', hex: '#393D47', image: '/images/products/rpet-groove/rPET-Groove-Anthracit.jpg', isDark: false },
  { id: 'black', name: 'Black', hex: '#000000', image: '/images/products/rpet-groove/rPET-Groove-Black.jpg', isDark: false },
];

// Groove pattern options
const patternOptions = [
  { id: 'line', name: 'Line', grooves: 'Vertical', spacing: '25mm', description: 'Clean parallel lines' },
  { id: 'wave', name: 'Wave', grooves: 'Curved', spacing: '30mm', description: 'Organic flowing curves' },
  { id: 'chevron', name: 'Chevron', grooves: 'Angled', spacing: '25mm', description: 'Dynamic V-pattern' },
  { id: 'grid', name: 'Grid', grooves: 'Cross-hatch', spacing: '40mm', description: 'Modern intersecting lines' },
];

// Thickness options
const thicknessOptions = [
  { id: '12mm', name: '12mm', nrc: '0.55', description: 'Standard absorption' },
  { id: '24mm', name: '24mm', nrc: '0.75', description: 'Enhanced absorption' },
  { id: '36mm', name: '36mm', nrc: '0.90', description: 'Maximum absorption' },
];

// Default hero image
const defaultHeroImage = '/images/products/rpet-groove/rPET-Groove-Beige-Home_offce.png';

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

export default function RPetGrooveProductPage() {
  const t = useTranslations('products.rpet-groove');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<typeof colorOptions[0] | null>(null);
  const [selectedPattern, setSelectedPattern] = useState(patternOptions[0]);
  const [selectedThickness, setSelectedThickness] = useState(thicknessOptions[1]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get the current hero image - default or selected color
  const currentHeroImage = selectedColor ? selectedColor.image : defaultHeroImage;

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rpet-groove/product-data-sheet.pdf' },
    { id: 'installation-guide', name: 'Installation Guide', icon: '🔧', file: '/documents/rpet-groove/installation-guide.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/rpet-groove/acoustic-test-report.pdf' },
    { id: 'color-chart', name: 'Color Chart', icon: '🎨', file: '/documents/rpet-groove/color-chart.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/rpet-groove/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rpet-groove/sustainability-declaration.pdf' },
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
          source: 'rPET - Groove Product Page',
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
    { id: 'patterns', label: 'Patterns' },
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
    <div className="rpet-groove-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">RECYCLED PET ACOUSTIC PANELS</span>
          <h1>rPET - Groove</h1>
          <p className="hero-tagline">From Bottles to Silence</p>
          <p className="hero-description">
            Transform your space with rPET - Groove acoustic panels. Made from 100% recycled 
            plastic bottles, these elegant grooved panels combine contemporary design with 
            exceptional sound absorption. Efficiency meets elegance.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">♻️</span>
              <span className="usp-text">100% Recycled PET</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔇</span>
              <span className="usp-text">Up to NRC 0.90</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🎨</span>
              <span className="usp-text">12 Designer Colors</span>
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

          <p className="hero-price">Starting from <strong>€65</strong> per panel excl. VAT</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={`rPET - Groove acoustic panel${selectedColor ? ` in ${selectedColor.name}` : ''}`}
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
            <span className="selector-label">Select Color</span>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`color-option ${selectedColor?.id === color.id ? 'active' : ''}`}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                >
                  <span 
                    className="color-swatch" 
                    style={{ backgroundColor: color.hex }}
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
                src="/images/products/rpet-groove/design-meets-sustainability.jpg"
                alt="rPET - Groove acoustic panel in modern office"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">CIRCULAR DESIGN</span>
            <h2>Design Meets Sustainability</h2>
            <p>
              rPET - Groove panels bring a contemporary touch to any space while reducing 
              noise disturbances. The visible slat design creates visual depth and texture, 
              perfect for modern offices, meeting rooms, lobbies, restaurants, and reception areas.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Made from 100% recycled plastic bottles
              </li>
              <li>
                <span className="check">✓</span>
                Precision CNC-cut groove patterns
              </li>
              <li>
                <span className="check">✓</span>
                Lightweight and easy to handle
              </li>
              <li>
                <span className="check">✓</span>
                Suitable for walls and ceilings
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Recycling Story Section */}
      <section className="content-section recycling-section dark">
        <div className="recycling-content">
          <span className="section-tag">THE JOURNEY</span>
          <h2>From Plastic Bottle to Acoustic Panel</h2>
          <p>
            Each rPET - Groove panel gives new life to approximately 60 recycled plastic bottles. 
            Our manufacturing process transforms post-consumer PET waste into high-performance 
            acoustic felt, creating a truly circular product.
          </p>
          
          <div className="recycling-steps">
            <div className="recycling-step">
              <div className="step-icon">🍾</div>
              <div className="step-number">01</div>
              <h4>Collection</h4>
              <p>Post-consumer plastic bottles are collected and sorted</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="recycling-step">
              <div className="step-icon">⚙️</div>
              <div className="step-number">02</div>
              <h4>Processing</h4>
              <p>Bottles are cleaned, shredded, and melted into PET fibers</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="recycling-step">
              <div className="step-icon">🧵</div>
              <div className="step-number">03</div>
              <h4>Felting</h4>
              <p>Fibers are compressed into dense acoustic felt sheets</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="recycling-step">
              <div className="step-icon">✨</div>
              <div className="step-number">04</div>
              <h4>Finishing</h4>
              <p>CNC precision cutting creates the signature groove patterns</p>
            </div>
          </div>

          <div className="recycling-stat">
            <div className="stat-number">~60</div>
            <div className="stat-label">Recycled bottles per panel</div>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section id="colors" className="content-section colors-section">
        <div className="colors-header">
          <span className="section-tag">PALETTE</span>
          <h2>Multiple Designer Colors</h2>
          <p>
            From neutral tones to bold accents, our curated color palette fits seamlessly 
            into any interior design concept. All colors are achieved through dope-dyeing, 
            ensuring excellent color fastness and UV resistance.
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
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor?.id === color.id && (
                  <span className={`color-check-large ${color.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                )}
              </div>
              <span className="color-name">{color.name}</span>
            </div>
          ))}
        </div>

        <div className="color-features">
          <div className="color-feature">
            <span className="feature-icon">☀️</span>
            <h4>UV Resistant</h4>
            <p>Colors stay vibrant even in sunlit spaces</p>
          </div>
          <div className="color-feature">
            <span className="feature-icon">🧹</span>
            <h4>Easy Clean</h4>
            <p>Vacuum or wipe with damp cloth</p>
          </div>
          <div className="color-feature">
            <span className="feature-icon">🔄</span>
            <h4>Consistent</h4>
            <p>Batch-to-batch color consistency guaranteed</p>
          </div>
        </div>
      </section>

      {/* Patterns Section */}
      <section id="patterns" className="content-section patterns-section dark">
        <div className="patterns-header">
          <span className="section-tag">DESIGN OPTIONS</span>
          <h2>Choose Your Pattern</h2>
          <p>
            Four distinctive groove patterns to match any architectural vision. From clean 
            parallel lines to dynamic chevrons, each pattern is precision-cut using CNC 
            technology for perfect consistency.
          </p>
        </div>

        <div className="patterns-grid">
          {patternOptions.map((pattern) => (
            <div 
              key={pattern.id} 
              className={`pattern-card ${selectedPattern.id === pattern.id ? 'active' : ''}`}
              onClick={() => setSelectedPattern(pattern)}
            >
              <div className="pattern-visual">
                <div className={`pattern-preview pattern-${pattern.id}`}>
                  {pattern.id === 'line' && (
                    <>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                    </>
                  )}
                  {pattern.id === 'wave' && (
                    <svg viewBox="0 0 100 80" className="wave-svg">
                      <path d="M0 20 Q25 10 50 20 T100 20" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <path d="M0 40 Q25 30 50 40 T100 40" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <path d="M0 60 Q25 50 50 60 T100 60" fill="none" stroke="currentColor" strokeWidth="3"/>
                    </svg>
                  )}
                  {pattern.id === 'chevron' && (
                    <>
                      <div className="chevron-line"></div>
                      <div className="chevron-line"></div>
                      <div className="chevron-line"></div>
                    </>
                  )}
                  {pattern.id === 'grid' && (
                    <div className="grid-pattern">
                      <div className="grid-h"></div>
                      <div className="grid-h"></div>
                      <div className="grid-v"></div>
                      <div className="grid-v"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="pattern-info">
                <h4>{pattern.name}</h4>
                <span className="pattern-type">{pattern.grooves} grooves</span>
                <p>{pattern.description}</p>
                <span className="pattern-spacing">Spacing: {pattern.spacing}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Acoustic Performance Section */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="acoustics-header">
          <span className="section-tag">PERFORMANCE</span>
          <h2>Superior Sound Absorption</h2>
          <p>
            The unique groove design combined with high-density recycled PET felt creates 
            exceptional sound absorption. Reduce echo, eliminate noise, and create 
            spaces that are as comfortable to the ear as they are to the eye.
          </p>
        </div>

        <div className="acoustics-main-grid">
          {/* Left: Exploded diagram */}
          <div className="exploded-diagram">
            <div className="diagram-title">Panel Cross-Section</div>
            <div className="exploded-layers">
              <div className="exploded-layer">
                <div className="layer-visual pet-surface-layer">
                  <div className="groove-cuts">
                    <div className="cut"></div>
                    <div className="cut"></div>
                    <div className="cut"></div>
                  </div>
                </div>
                <div className="layer-info">
                  <span className="layer-name">Grooved Surface</span>
                  <span className="layer-desc">CNC-cut pattern for visual depth</span>
                </div>
              </div>
              
              <div className="layer-connector">
                <svg viewBox="0 0 24 40" fill="none">
                  <path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/>
                </svg>
              </div>
              
              <div className="exploded-layer">
                <div className="layer-visual pet-core-layer"></div>
                <div className="layer-info">
                  <span className="layer-name">High-Density PET Core</span>
                  <span className="layer-desc">Sound absorption layer</span>
                </div>
              </div>
              
              <div className="layer-connector">
                <svg viewBox="0 0 24 40" fill="none">
                  <path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/>
                </svg>
              </div>
              
              <div className="exploded-layer">
                <div className="layer-visual pet-back-layer"></div>
                <div className="layer-info">
                  <span className="layer-name">Mounting Surface</span>
                  <span className="layer-desc">Direct wall/ceiling attachment</span>
                </div>
              </div>
            </div>
            
            {/* Sound wave animation */}
            <div className="sound-waves">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
              <span className="wave-label">Sound waves absorbed</span>
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
                    strokeDasharray="305"
                    strokeDashoffset="30"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <div className="rating-content">
                  <span className="rating-value">NRC 0.90</span>
                  <span className="rating-label">36mm thickness</span>
                </div>
              </div>
              <div className="rating-badge">
                <span className="badge-icon">★</span>
                <span className="badge-text">Class A</span>
              </div>
            </div>

            <div className="thickness-selector">
              <h4>Select Thickness</h4>
              <div className="thickness-options">
                {thicknessOptions.map((thickness) => (
                  <button
                    key={thickness.id}
                    className={`thickness-option ${selectedThickness.id === thickness.id ? 'active' : ''}`}
                    onClick={() => setSelectedThickness(thickness)}
                  >
                    <span className="thickness-value">{thickness.name}</span>
                    <span className="thickness-nrc">NRC {thickness.nrc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="certification-note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#197FC7" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Tested according to ISO 354 &amp; ASTM C423</span>
            </div>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h4>Reduced Reverberation</h4>
            <p>Control echo and improve speech clarity in any room</p>
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
            <h4>Increased Comfort</h4>
            <p>Create calmer, more peaceful environments</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10"/>
                <path d="M18 20V4"/>
                <path d="M6 20v-4"/>
              </svg>
            </div>
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
            <h2>Simple Installation</h2>
            <p>
              rPET - Groove panels are designed for quick and easy installation. Their 
              lightweight construction means a single person can handle the panels, and 
              multiple mounting options give you flexibility for any project.
            </p>
            
            <div className="installation-steps">
              <div className="install-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Plan Layout</h4>
                  <p>Measure space and plan panel arrangement</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Prepare Surface</h4>
                  <p>Ensure wall/ceiling is clean and dry</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Mount Panels</h4>
                  <p>Use adhesive, clips, or mechanical fixings</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Enjoy</h4>
                  <p>Immediate acoustic improvement</p>
                </div>
              </div>
            </div>

            <div className="mounting-options">
              <h4>Mounting Options</h4>
              <div className="mounting-grid">
                <div className="mounting-option">
                  <span className="mounting-icon">🧲</span>
                  <span>Adhesive</span>
                </div>
                <div className="mounting-option">
                  <span className="mounting-icon">📎</span>
                  <span>Z-clips</span>
                </div>
                <div className="mounting-option">
                  <span className="mounting-icon">🔩</span>
                  <span>Screws</span>
                </div>
                <div className="mounting-option">
                  <span className="mounting-icon">🧱</span>
                  <span>Battens</span>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-groove//Users/stretch/Downloads/processing-cnc.jpg"
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
                src="/images/products/rpet-groove/overview-recycled.jpg"
                alt="Recycled materials"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Truly Circular</h2>
            <p>
              rPET - Groove panels embody the circular economy. Made entirely from 
              post-consumer recycled plastic, they can be recycled again at end of life. 
              We offer free take-back to ensure nothing goes to waste.
            </p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <span className="sustain-icon">♻️</span>
                <div>
                  <h4>100% Recycled</h4>
                  <p>Made from post-consumer PET bottles</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🔄</span>
                <div>
                  <h4>Fully Recyclable</h4>
                  <p>Can be recycled at end of life</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">📦</span>
                <div>
                  <h4>Free Take-Back</h4>
                  <p>We collect panels for recycling</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🏭</span>
                <div>
                  <h4>Made in Belgium</h4>
                  <p>Short supply chains, low emissions</p>
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
                  <td>600 / 1200 mm</td>
                </tr>
                <tr>
                  <td>Panel length</td>
                  <td>600 / 1200 / 2400 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>12 / 24 / 36 mm</td>
                </tr>
                <tr>
                  <td>Groove depth</td>
                  <td>6 / 12 / 18 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>2.5 - 7.5 kg/m²</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Acoustic Performance</h4>
            <table>
              <tbody>
                <tr>
                  <td>NRC (12mm)</td>
                  <td>0.55</td>
                </tr>
                <tr>
                  <td>NRC (24mm)</td>
                  <td>0.75</td>
                </tr>
                <tr>
                  <td>NRC (36mm)</td>
                  <td>0.90</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>ISO 354 / ASTM C423</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Material</h4>
            <table>
              <tbody>
                <tr>
                  <td>Composition</td>
                  <td>100% Recycled PET</td>
                </tr>
                <tr>
                  <td>Density</td>
                  <td>200-250 kg/m³</td>
                </tr>
                <tr>
                  <td>Colors</td>
                  <td>12 standard colors</td>
                </tr>
                <tr>
                  <td>Custom colors</td>
                  <td>Available (MOQ applies)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Fire Safety</h4>
            <table>
              <tbody>
                <tr>
                  <td>European</td>
                  <td>B-s1, d0</td>
                </tr>
                <tr>
                  <td>US (ASTM E-84)</td>
                  <td>Class A</td>
                </tr>
                <tr>
                  <td>UK (BS 476)</td>
                  <td>Class 0</td>
                </tr>
                <tr>
                  <td>Germany (DIN 4102)</td>
                  <td>B1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Certifications</h4>
            <table>
              <tbody>
                <tr>
                  <td>Health</td>
                  <td>OEKO-TEX® Standard 100</td>
                </tr>
                <tr>
                  <td>Environmental</td>
                  <td>EPD available</td>
                </tr>
                <tr>
                  <td>VOC emissions</td>
                  <td>Low emission / E1</td>
                </tr>
                <tr>
                  <td>Recycled content</td>
                  <td>GRS certified</td>
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
                  <td>Ideal for</td>
                  <td>Offices, Meeting rooms, Lobbies</td>
                </tr>
                <tr>
                  <td>Also suitable</td>
                  <td>Restaurants, Hotels, Schools</td>
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
                  src={`/images/products/rpet-groove/gallery-${i}.jpg`}
                  alt={`rPET - Groove installation example ${i}`}
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

      {/* Applications Section */}
      <section className="content-section applications-section dark">
        <div className="applications-header">
          <span className="section-tag">VERSATILE USE</span>
          <h2>Applications</h2>
          <p>rPET - Groove panels fit seamlessly into diverse environments</p>
        </div>

        <div className="applications-grid">
          <div className="application-card">
            <div className="application-icon">🏢</div>
            <h4>Offices</h4>
            <p>Open plan spaces, meeting rooms, focus pods</p>
          </div>
          <div className="application-card">
            <div className="application-icon">🏨</div>
            <h4>Hospitality</h4>
            <p>Hotels, restaurants, lobbies, reception areas</p>
          </div>
          <div className="application-card">
            <div className="application-icon">🏫</div>
            <h4>Education</h4>
            <p>Schools, universities, libraries, auditoriums</p>
          </div>
          <div className="application-card">
            <div className="application-icon">🏥</div>
            <h4>Healthcare</h4>
            <p>Waiting rooms, consultation rooms, corridors</p>
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
            choose the perfect color and pattern combination.
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
            Free samples available • Made in Belgium • 100% Recycled
          </p>
        </div>
      </section>

      <style jsx>{`
        .rpet-groove-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --pet-teal: #4F97A3;
          --pet-teal-light: #7BBDC7;
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
          background: var(--pet-teal);
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
          color: var(--pet-teal);
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

        .color-options { 
          display: flex; 
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 320px;
        }

        .color-option {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid transparent;
          background: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover { transform: scale(1.15); }

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
          font-size: 0.75rem;
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

        /* Recycling Section */
        .recycling-section {
          text-align: center;
        }

        .recycling-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        .recycling-content h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .recycling-content > p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
          margin-bottom: 3rem;
        }

        .recycling-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .recycling-step {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          width: 180px;
          text-align: center;
          position: relative;
        }

        .step-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .step-number {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 28px;
          height: 28px;
          background: var(--pet-teal);
          color: white;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recycling-step h4 {
          color: white;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .recycling-step p {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          line-height: 1.5;
        }

        .step-arrow {
          font-size: 1.5rem;
          color: var(--pet-teal);
        }

        .recycling-stat {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          background: rgba(79, 151, 163, 0.2);
          border: 2px solid var(--pet-teal);
          border-radius: 16px;
          padding: 1.5rem 3rem;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          color: var(--pet-teal-light);
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
        }

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

        .colors-header p {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.8;
        }

        .colors-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1.5rem;
          max-width: 900px;
          margin: 0 auto 4rem;
        }

        .color-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .color-card:hover { transform: translateY(-4px); }

        .color-preview {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid transparent;
          position: relative;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .color-card.active .color-preview {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px white, 0 0 0 6px var(--brand-blue);
        }

        .color-check-large {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .color-check-large.on-dark { color: white; }
        .color-check-large.on-light { color: var(--deep-blue); }

        .color-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--charcoal);
          text-align: center;
        }

        .color-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .color-feature {
          text-align: center;
          padding: 1.5rem;
          background: var(--cream);
          border-radius: 16px;
        }

        .feature-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .color-feature h4 {
          font-size: 1rem;
          color: var(--deep-blue);
          margin-bottom: 0.5rem;
        }

        .color-feature p {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        /* Patterns Section */
        .patterns-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .patterns-header h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .patterns-header p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
        }

        .patterns-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .pattern-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .pattern-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .pattern-card.active {
          background: rgba(25, 127, 199, 0.2);
          border-color: var(--brand-blue);
        }

        .pattern-visual {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .pattern-preview {
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.6);
        }

        .pattern-line .groove-line {
          height: 3px;
          background: currentColor;
          border-radius: 2px;
        }

        .wave-svg {
          width: 100%;
          height: 100%;
        }

        .pattern-chevron .chevron-line {
          width: 100%;
          height: 3px;
          background: currentColor;
          transform: skewY(-15deg);
          border-radius: 2px;
        }

        .grid-pattern {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .grid-h, .grid-v {
          position: absolute;
          background: currentColor;
          border-radius: 2px;
        }

        .grid-h {
          height: 3px;
          width: 100%;
          left: 0;
        }

        .grid-h:first-child { top: 25%; }
        .grid-h:nth-child(2) { top: 75%; }

        .grid-v {
          width: 3px;
          height: 100%;
          top: 0;
        }

        .grid-v:nth-child(3) { left: 25%; }
        .grid-v:nth-child(4) { left: 75%; }

        .pattern-info { text-align: center; }
        .pattern-info h4 { color: white; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .pattern-type { font-size: 0.85rem; color: #7ec8f5; }
        .pattern-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin: 0.5rem 0; }
        .pattern-spacing { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

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

        /* Exploded Diagram */
        .exploded-diagram {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          position: relative;
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

        .exploded-layers {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        .exploded-layer {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 400px;
        }

        .layer-visual {
          width: 180px;
          border-radius: 6px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        .layer-visual.pet-surface-layer {
          background: linear-gradient(135deg, #808080 0%, #6b6b6b 100%);
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .groove-cuts {
          display: flex;
          gap: 16px;
        }

        .groove-cuts .cut {
          width: 8px;
          height: 24px;
          background: #444;
          border-radius: 0 0 4px 4px;
        }

        .layer-visual.pet-core-layer {
          background: linear-gradient(135deg, #9b9b9b 0%, #7a7a7a 100%);
          height: 50px;
        }

        .layer-visual.pet-back-layer {
          background: #5a5a5a;
          height: 12px;
        }

        .layer-connector {
          height: 24px;
          display: flex;
          justify-content: center;
          padding-left: 90px;
        }

        .layer-connector svg {
          width: 24px;
          height: 24px;
        }

        .layer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .layer-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--deep-blue);
        }

        .layer-desc {
          font-size: 0.8rem;
          color: #888;
        }

        /* Sound Waves Animation */
        .sound-waves {
          position: absolute;
          left: 1.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .wave {
          width: 3px;
          background: var(--brand-blue);
          border-radius: 2px;
          opacity: 0.6;
          animation: wave-pulse 1.5s ease-in-out infinite;
        }

        .wave-1 { animation-delay: 0s; height: 16px; }
        .wave-2 { animation-delay: 0.2s; height: 24px; }
        .wave-3 { animation-delay: 0.4s; height: 20px; }

        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(0.6); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 0.8; }
        }

        .wave-label {
          font-size: 0.65rem;
          color: #888;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          margin-top: 0.5rem;
        }

        /* Performance Metrics */
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
          transform: rotate(0deg);
        }

        .rating-ring circle:last-child {
          transition: stroke-dashoffset 1s ease-out;
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
          background: linear-gradient(135deg, #197FC7 0%, #155d94 100%);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .badge-icon {
          font-size: 1rem;
        }

        .thickness-selector {
          width: 100%;
          text-align: center;
        }

        .thickness-selector h4 {
          font-size: 0.9rem;
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .thickness-options {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .thickness-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .thickness-option:hover {
          border-color: var(--brand-blue);
        }

        .thickness-option.active {
          border-color: var(--brand-blue);
          background: var(--brand-blue-pale);
        }

        .thickness-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--deep-blue);
        }

        .thickness-nrc {
          font-size: 0.75rem;
          color: #888;
        }

        .certification-note {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(25, 127, 199, 0.08);
          border-radius: 12px;
          font-size: 0.9rem;
          color: var(--deep-blue);
        }

        /* Benefits Grid */
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
          background: var(--brand-blue-pale);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brand-blue);
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

        .installation-section .step-number {
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
          position: static;
        }

        .step-content h4 { color: white; margin: 0 0 0.25rem; }
        .step-content p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin: 0; }

        .mounting-options {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mounting-options h4 {
          color: white;
          margin-bottom: 1rem;
        }

        .mounting-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .mounting-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .mounting-icon {
          font-size: 1.5rem;
        }

        .mounting-option span:last-child {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
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

        /* Applications Section */
        .applications-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .applications-header h2 { font-size: 2.5rem; color: white; margin-bottom: 0.5rem; }
        .applications-header p { color: rgba(255, 255, 255, 0.7); }

        .applications-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .application-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .application-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .application-card h4 { color: white; margin-bottom: 0.5rem; }
        .application-card p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.6); margin: 0; }

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
          .patterns-grid { grid-template-columns: repeat(2, 1fr); }
          .applications-grid { grid-template-columns: repeat(2, 1fr); }
          .colors-grid { grid-template-columns: repeat(4, 1fr); }
          .sustainability-features { grid-template-columns: 1fr; }
          .recycling-steps { gap: 0.5rem; }
          .step-arrow { display: none; }
          
          .acoustics-main-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .exploded-diagram {
            max-width: 500px;
            margin: 0 auto;
          }
          
          .acoustics-benefits {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
          
          .sound-waves {
            display: none;
          }
          
          .color-features {
            grid-template-columns: 1fr;
          }
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
          .patterns-grid { grid-template-columns: 1fr; }
          .applications-grid { grid-template-columns: 1fr; }
          .colors-grid { grid-template-columns: repeat(3, 1fr); }
          .cta-buttons { flex-direction: column; }
          .color-options { max-width: 280px; }
          .mounting-grid { grid-template-columns: repeat(2, 1fr); }
          .thickness-options { flex-direction: column; }
          
          .exploded-layer {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }
          
          .layer-visual {
            width: 100%;
            max-width: 200px;
          }
          
          .layer-connector {
            padding-left: 0;
          }
          
          .rating-ring {
            width: 140px;
            height: 140px;
          }
          
          .recycling-step {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
}
