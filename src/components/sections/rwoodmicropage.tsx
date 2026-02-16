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

// Wood veneer options for rWood - Micro
const woodFinishOptions = [
  { id: 'oak-natural', name: 'Natural Oak', swatch: '/images/products/rwood-micro/swatches/natural-oak.jpg', image: '/images/products/rwood-micro/natural-oak.jpg', isDark: false },
  { id: 'oak-white', name: 'White Oak', swatch: '/images/products/rwood-micro/swatches/white-oak.jpg', image: '/images/products/rwood-micro/white-oak.jpg', isDark: false },
  { id: 'oak-smoked', name: 'Smoked Oak', swatch: '/images/products/rwood-micro/swatches/smoked-oak.jpg', image: '/images/products/rwood-micro/smoked-oak.jpg', isDark: true },
  { id: 'walnut', name: 'Walnut', swatch: '/images/products/rwood-micro/swatches/walnut.jpg', image: '/images/products/rwood-micro/walnut.jpg', isDark: true },
  { id: 'birch', name: 'Birch', swatch: '/images/products/rwood-micro/swatches/birch.jpg', image: '/images/products/rwood-micro/birch.jpg', isDark: false },
];

// Surface finish options
const surfaceFinishOptions = [
  { id: 'veneer', name: 'Wood Veneer', description: 'Natural A-grade veneer' },
  { id: 'hpl', name: 'HPL Laminate', description: 'High-pressure laminate' },
];

// Perforation pattern options
const perforationOptions = [
  { id: 'nano', name: 'Nano', holeSize: '0.5mm', openArea: '2.5%', description: 'Virtually invisible perforations', visual: 'nano' },
  { id: 'micro-s', name: 'Micro S', holeSize: '1.0mm', openArea: '5.2%', description: 'Subtle micro-perforations', visual: 'micro-s' },
  { id: 'micro-m', name: 'Micro M', holeSize: '1.5mm', openArea: '8.4%', description: 'Balanced perforation pattern', visual: 'micro-m' },
  { id: 'micro-l', name: 'Micro L', holeSize: '2.0mm', openArea: '10.6%', description: 'Maximum absorption pattern', visual: 'micro-l' },
];

// Default hero image
const defaultHeroImage = '/images/products/rwood-micro/rWood-Micro_hero.jpg';

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

export default function RWoodMicroProductPage() {
  const t = useTranslations('products.rwood-micro');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState<typeof woodFinishOptions[0] | null>(null);
  const [selectedSurface, setSelectedSurface] = useState(surfaceFinishOptions[0]);
  const [selectedPerforation, setSelectedPerforation] = useState(perforationOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get the current hero image
  const currentHeroImage = selectedFinish ? selectedFinish.image : defaultHeroImage;

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rwood-micro/product-data-sheet.pdf' },
    { id: 'installation-guide', name: 'Installation Guide', icon: '🔧', file: '/documents/rwood-micro/installation-guide.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/rwood-micro/acoustic-test-report.pdf' },
    { id: 'perforation-guide', name: 'Perforation Pattern Guide', icon: '🔘', file: '/documents/rwood-micro/perforation-guide.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/rwood-micro/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rwood-micro/sustainability-declaration.pdf' },
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
          source: 'rWood - Micro Product Page',
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
    { id: 'perforations', label: 'Perforations' },
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
    <div className="rwood-micro-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">MICRO-PERFORATED ACOUSTIC PANELS</span>
          <h1>rWood - Micro</h1>
          <p className="hero-tagline">Invisible Perforation, Exceptional Acoustics</p>
          <p className="hero-description">
            Experience the beauty of natural wood with the acoustic performance of 
            advanced micro-perforation technology. Virtually invisible holes deliver 
            Class A sound absorption while preserving the pure, homogeneous look 
            of premium wood veneer.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="12" r="5" strokeDasharray="2 2"/>
                  <circle cx="12" cy="12" r="9" strokeDasharray="1 2"/>
                </svg>
              </span>
              <span className="usp-text">Invisible Perforations</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔇</span>
              <span className="usp-text">Class A Absorption</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔥</span>
              <span className="usp-text">B-s1, d0 Fire Rated</span>
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

          <p className="hero-price">Starting from <strong>€119</strong> per panel excl. VAT</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={`rWood - Micro acoustic panel${selectedFinish ? ` in ${selectedFinish.name}` : ''}`}
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
            <span className="selector-label">Select Wood Veneer</span>
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
            <span className="selected-finish-name">{selectedFinish?.name || 'Select a veneer'}</span>
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
                src="/images/products/rwood-micro/overview-detail.webp"
                alt="rWood - Micro panel close-up showing invisible perforations"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">THE INVISIBLE SOLUTION</span>
            <h2>Designed for Eyes and Ears</h2>
            <p>
              rWood - Micro panels combine advanced micro-perforation technology with 
              premium wood veneers. From a normal viewing distance, the perforations 
              are completely invisible—what you see is a beautiful, homogeneous wood 
              surface. What you hear is exceptional acoustic comfort.
            </p>
            <p>
              The secret lies in the combination of two acoustic mechanisms: thousands 
              of precisely engineered micro-holes in the surface and sound-absorbing 
              chambers within the core material.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Perforations invisible from normal viewing distance
              </li>
              <li>
                <span className="check">✓</span>
                Non-combustible fibre gypsum core
              </li>
              <li>
                <span className="check">✓</span>
                Over-veneered edges for seamless joints
              </li>
              <li>
                <span className="check">✓</span>
                Suitable for walls and ceilings
              </li>
              <li>
                <span className="check">✓</span>
                Available as backlit panels
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Perforations Section */}
      <section id="perforations" className="content-section perforations-section dark">
        <div className="perforations-header">
          <span className="section-tag">PERFORATION PATTERNS</span>
          <h2>Choose Your Perforation</h2>
          <p>
            Four perforation densities to match your acoustic requirements. From virtually 
            invisible Nano perforations to maximum-absorption Micro L patterns—select the 
            perfect balance between aesthetics and acoustic performance.
          </p>
        </div>

        <div className="perforations-grid">
          {perforationOptions.map((perf) => (
            <div 
              key={perf.id} 
              className={`perforation-card ${selectedPerforation.id === perf.id ? 'active' : ''}`}
              onClick={() => setSelectedPerforation(perf)}
            >
              <div className="perforation-visual">
                <div className={`perf-preview perf-${perf.visual}`}>
                  <div className="perf-surface">
                    {/* Generate perforation dots */}
                    {perf.visual === 'nano' && (
                      <div className="perf-dots nano">
                        {[...Array(80)].map((_, i) => <span key={i} className="dot" />)}
                      </div>
                    )}
                    {perf.visual === 'micro-s' && (
                      <div className="perf-dots micro-s">
                        {[...Array(48)].map((_, i) => <span key={i} className="dot" />)}
                      </div>
                    )}
                    {perf.visual === 'micro-m' && (
                      <div className="perf-dots micro-m">
                        {[...Array(35)].map((_, i) => <span key={i} className="dot" />)}
                      </div>
                    )}
                    {perf.visual === 'micro-l' && (
                      <div className="perf-dots micro-l">
                        {[...Array(24)].map((_, i) => <span key={i} className="dot" />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="perforation-info">
                <h4>{perf.name}</h4>
                <span className="perf-hole-size">⌀ {perf.holeSize}</span>
                <p>{perf.description}</p>
                <span className="perf-open-area">Open area: {perf.openArea}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected perforation detail */}
        <div className="perforation-detail">
          <div className="detail-visual">
            <div className="magnify-circle">
              <div className={`magnified-perf perf-${selectedPerforation.visual}`}>
                {selectedPerforation.visual === 'nano' && (
                  <div className="perf-dots-magnified nano">
                    {[...Array(25)].map((_, i) => <span key={i} className="dot" />)}
                  </div>
                )}
                {selectedPerforation.visual === 'micro-s' && (
                  <div className="perf-dots-magnified micro-s">
                    {[...Array(16)].map((_, i) => <span key={i} className="dot" />)}
                  </div>
                )}
                {selectedPerforation.visual === 'micro-m' && (
                  <div className="perf-dots-magnified micro-m">
                    {[...Array(9)].map((_, i) => <span key={i} className="dot" />)}
                  </div>
                )}
                {selectedPerforation.visual === 'micro-l' && (
                  <div className="perf-dots-magnified micro-l">
                    {[...Array(9)].map((_, i) => <span key={i} className="dot" />)}
                  </div>
                )}
              </div>
              <span className="magnify-label">10× magnified</span>
            </div>
          </div>
          <div className="detail-info">
            <h3>{selectedPerforation.name} Perforation</h3>
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="stat-value">⌀ {selectedPerforation.holeSize}</span>
                <span className="stat-label">Hole diameter</span>
              </div>
              <div className="detail-stat">
                <span className="stat-value">{selectedPerforation.openArea}</span>
                <span className="stat-label">Open area</span>
              </div>
              <div className="detail-stat">
                <span className="stat-value">Class A</span>
                <span className="stat-label">Absorption</span>
              </div>
            </div>
            <p className="detail-desc">{selectedPerforation.description}. {selectedPerforation.id === 'nano' ? 'The smallest perforation available—completely invisible to the naked eye, creating a flawless wood surface.' : selectedPerforation.id === 'micro-s' ? 'Barely visible micro-holes that maintain a clean, uninterrupted surface appearance.' : selectedPerforation.id === 'micro-m' ? 'An optimal balance between visual discretion and acoustic efficiency for most applications.' : 'The highest open area for maximum sound absorption in acoustically demanding spaces.'}</p>
          </div>
        </div>
      </section>

      {/* Finishes Section */}
      <section id="finishes" className="content-section finishes-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">SURFACES</span>
            <h2>Premium Surfaces</h2>
            <p>
              Every rWood - Micro panel features over-veneered edges—a manufacturing 
              technique from traditional carpentry heritage. The result: stronger panels, 
              seamless joints, and a continuous pattern regardless of panel format.
            </p>
            
            <div className="finish-categories">
              <div className="finish-category">
                <h4>Wood Veneer</h4>
                <p>Premium A-grade veneers in oak, walnut, birch, and more. Nature and Gemini cuts available for lively or harmonious grain expressions.</p>
              </div>
              <div className="finish-category">
                <h4>HPL Laminate</h4>
                <p>High-pressure laminate surfaces for extra durability. Available in a wide range of colors and finishes.</p>
              </div>
            </div>

            <div className="surface-options">
              <h4>Surface Type</h4>
              <div className="surface-selector">
                {surfaceFinishOptions.map((surface) => (
                  <button
                    key={surface.id}
                    className={`surface-option ${selectedSurface.id === surface.id ? 'active' : ''}`}
                    onClick={() => setSelectedSurface(surface)}
                  >
                    <span className="surface-icon">{surface.id === 'veneer' ? '🪵' : '◻️'}</span>
                    <div className="surface-text">
                      <span className="surface-name">{surface.name}</span>
                      <span className="surface-desc">{surface.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="finish-extras">
              <h4>Finish Treatments</h4>
              <div className="extras-grid">
                <div className="extra-item">
                  <span className="extra-icon">🎨</span>
                  <div>
                    <strong>Pigmented Lacquer</strong>
                    <p>Custom color tones with transparent or solid pigmentation</p>
                  </div>
                </div>
                <div className="extra-item">
                  <span className="extra-icon">✨</span>
                  <div>
                    <strong>Gloss Levels</strong>
                    <p>From super matte to high gloss UV-cured lacquer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/surface-detail.jpg"
                alt="Micro-perforated wood panel surface detail"
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
            The combination of micro-perforations in the surface and thousands of larger 
            sound chambers in the core creates a dual acoustic mechanism. Less dependent 
            on insulation and air gaps—meaning thinner walls and ceilings that save valuable space.
          </p>
        </div>

        <div className="acoustics-main-grid">
          {/* Left: Panel cross-section diagram */}
          <div className="exploded-diagram">
            <div className="diagram-title">Panel Cross-Section</div>
            <div className="exploded-layers">
              <div className="exploded-layer">
                <div className="layer-visual veneer-layer">
                  <div className="wood-grain"></div>
                  <div className="micro-holes">
                    {[...Array(12)].map((_, i) => <span key={i} className="micro-hole" />)}
                  </div>
                </div>
                <div className="layer-info">
                  <span className="layer-name">Wood Veneer + Micro-Perforations</span>
                  <span className="layer-desc">A-grade veneer with precision-drilled holes</span>
                </div>
              </div>
              
              <div className="layer-connector">
                <svg viewBox="0 0 24 40" fill="none">
                  <path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/>
                </svg>
              </div>
              
              <div className="exploded-layer">
                <div className="layer-visual core-layer">
                  <div className="sound-chambers">
                    {[...Array(8)].map((_, i) => <span key={i} className="chamber" />)}
                  </div>
                </div>
                <div className="layer-info">
                  <span className="layer-name">High-Density Fibre Gypsum Core</span>
                  <span className="layer-desc">Non-combustible with sound chambers</span>
                </div>
              </div>
              
              <div className="layer-connector">
                <svg viewBox="0 0 24 40" fill="none">
                  <path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/>
                </svg>
              </div>
              
              <div className="exploded-layer">
                <div className="layer-visual backing-layer"></div>
                <div className="layer-info">
                  <span className="layer-name">Acoustic Fleece Backing</span>
                  <span className="layer-desc">Additional sound absorption layer</span>
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
                  <span className="rating-value">αw 0.90</span>
                  <span className="rating-label">Absorption</span>
                </div>
              </div>
              <div className="rating-badge">
                <span className="badge-icon">★</span>
                <span className="badge-text">Class A</span>
              </div>
            </div>

            <div className="metric-cards">
              <div className="metric-card">
                <div className="metric-value">90%</div>
                <div className="metric-label">Sound Absorbed</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">B-s1, d0</div>
                <div className="metric-label">Fire Rating</div>
              </div>
            </div>

            <div className="metric-cards">
              <div className="metric-card">
                <div className="metric-value">ISO 354</div>
                <div className="metric-label">Test Standard</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">Thinner</div>
                <div className="metric-label">Wall Build-up</div>
              </div>
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
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="12" r="5" strokeDasharray="2 2"/>
                <circle cx="12" cy="12" r="9" strokeDasharray="1 2"/>
              </svg>
            </div>
            <h4>Dual Acoustic Mechanism</h4>
            <p>Micro-holes and sound chambers work together for superior absorption</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <path d="M12 3v18"/>
              </svg>
            </div>
            <h4>Space-Saving Design</h4>
            <p>Less dependent on air gaps—thinner wall and ceiling build-ups</p>
          </div>
          <div className="benefit">
            <div className="benefit-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h4>Highest Fire Safety</h4>
            <p>B-s1, d0 rating—the highest achievable for micro-perforated wood</p>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">INSTALLATION SYSTEM</span>
            <h2>Precision Installation</h2>
            <p>
              rWood - Micro panels are installed with our concealed mounting system, 
              ensuring invisible fixings and a flawless finish. The system allows for 
              both wall and ceiling applications, with seamless panel-to-panel transitions 
              through over-veneered edges.
            </p>
            
            <div className="installation-steps">
              <div className="install-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Install Subframe</h4>
                  <p>Mount aluminium rails to wall or ceiling structure</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Add Insulation</h4>
                  <p>Optional mineral wool for enhanced absorption</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Click &amp; Fix Panels</h4>
                  <p>Concealed clip system for tool-free panel mounting</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Seamless Result</h4>
                  <p>Over-veneered edges create continuous wood surface</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/installation-detail.jpg"
                alt="rWood - Micro panel installation system"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bespoke / Design Possibilities Section */}
      <section className="content-section bespoke-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/bespoke-backlit.jpg"
                alt="Backlit micro-perforated panel creating light effect"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">DESIGN FREEDOM</span>
            <h2>Bespoke Possibilities</h2>
            <p>
              rWood - Micro panels can be customized and pre-fabricated according to 
              your drawings. The micro-perforations open up unique design possibilities 
              that go beyond standard acoustic panels.
            </p>
            <div className="bespoke-features">
              <div className="bespoke-item">
                <span className="bespoke-icon">💡</span>
                <div>
                  <h4>Backlit Panels</h4>
                  <p>Create stunning backlit sections where light shines through the micro-perforations. Logos and patterns glow beautifully when lit, yet remain invisible when the light is off.</p>
                </div>
              </div>
              <div className="bespoke-item">
                <span className="bespoke-icon">📐</span>
                <div>
                  <h4>Custom Dimensions</h4>
                  <p>Panels produced to your exact specifications. Non-standard sizes and shapes for unique architectural requirements.</p>
                </div>
              </div>
              <div className="bespoke-item">
                <span className="bespoke-icon">🔄</span>
                <div>
                  <h4>Continuous Pattern</h4>
                  <p>Over-veneered panels create seamless transitions regardless of format, for a homogeneous impression on any surface.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="content-section sustainability-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Responsibly Made</h2>
            <p>
              rWood - Micro combines natural materials with responsible production. 
              The non-combustible fibre gypsum core and sustainably sourced veneers 
              contribute to healthier interiors and a lower environmental footprint.
            </p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <span className="sustain-icon">🌲</span>
                <div>
                  <h4>FSC® Certified Veneer</h4>
                  <p>Wood from responsibly managed forests</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🏗️</span>
                <div>
                  <h4>Natural Core Material</h4>
                  <p>Fibre gypsum—a mineral-based, non-combustible core</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🇪🇺</span>
                <div>
                  <h4>European Production</h4>
                  <p>Manufactured in Europe, reducing transport emissions</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">📋</span>
                <div>
                  <h4>Low VOC Emissions</h4>
                  <p>E1-rated for healthier indoor air quality</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/sustainability.webp"
                alt="Sustainable production"
                fill
                style={{ objectFit: 'cover' }}
              />
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
                  <td>Panel length</td>
                  <td>Up to 3000 mm</td>
                </tr>
                <tr>
                  <td>Panel width</td>
                  <td>Up to 630 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>14 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>~4.5 kg/m²</td>
                </tr>
                <tr>
                  <td>Custom sizes</td>
                  <td>Available on request</td>
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
                  <td>With 50mm mineral wool</td>
                  <td>Up to 1.00</td>
                </tr>
                <tr>
                  <td>Absorption class</td>
                  <td>Class A / C</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>ISO 354 / ISO 11654</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Perforation Options</h4>
            <table>
              <tbody>
                <tr>
                  <td>Nano (⌀ 0.5mm)</td>
                  <td>2.5% open area</td>
                </tr>
                <tr>
                  <td>Micro S (⌀ 1.0mm)</td>
                  <td>5.2% open area</td>
                </tr>
                <tr>
                  <td>Micro M (⌀ 1.5mm)</td>
                  <td>8.4% open area</td>
                </tr>
                <tr>
                  <td>Micro L (⌀ 2.0mm)</td>
                  <td>10.6% open area</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Fire Safety</h4>
            <table>
              <tbody>
                <tr>
                  <td>Panel (Euroclass)</td>
                  <td>B-s1, d0</td>
                </tr>
                <tr>
                  <td>ASTM rating</td>
                  <td>Class A</td>
                </tr>
                <tr>
                  <td>Core material</td>
                  <td>Non-combustible</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>EN 13501</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Materials</h4>
            <table>
              <tbody>
                <tr>
                  <td>Surface</td>
                  <td>A-grade Veneer / HPL</td>
                </tr>
                <tr>
                  <td>Core</td>
                  <td>High-density fibre gypsum</td>
                </tr>
                <tr>
                  <td>Backing</td>
                  <td>Acoustic fleece</td>
                </tr>
                <tr>
                  <td>Edges</td>
                  <td>Over-veneered</td>
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
                  <td>Walls &amp; Ceilings</td>
                </tr>
                <tr>
                  <td>Environment</td>
                  <td>Interior (dry areas)</td>
                </tr>
                <tr>
                  <td>Backlit option</td>
                  <td>Available</td>
                </tr>
                <tr>
                  <td>Mounting system</td>
                  <td>Concealed clip system</td>
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
          <h2>Projects &amp; Installations</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="gallery-item">
              <div className="image-container gallery">
                <Image
                  src={`/images/products/rwood-micro/gallery-${i}.webp`}
                  alt={`rWood - Micro installation example ${i}`}
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
          <p>Professional finishing elements for a flawless result</p>
        </div>

        <div className="accessories-grid">
          <div className="accessory-card">
            <div className="accessory-icon">📏</div>
            <h4>Edge Profiles</h4>
            <p>Matching profiles for clean panel terminations</p>
          </div>
          <div className="accessory-card">
            <div className="accessory-icon">🔲</div>
            <h4>Corner Solutions</h4>
            <p>Seamless internal and external corner transitions</p>
          </div>
          <div className="accessory-card">
            <div className="accessory-icon">⚙️</div>
            <h4>Mounting Rails</h4>
            <p>Concealed aluminium subframe system</p>
          </div>
          <div className="accessory-card">
            <div className="accessory-icon">💡</div>
            <h4>LED Backlighting</h4>
            <p>Integrated lighting for backlit panel effects</p>
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
            select the perfect perforation, veneer, and finish combination.
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
            Free samples available • Made in Europe • FSC® Certified • B-s1, d0 Fire Rated
          </p>
        </div>
      </section>

      <style jsx>{`
        .rwood-micro-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --wood-warm: #8B6914;
          --wood-light: #D4A954;
        }

        /* ========================================
           HERO SECTION
           ======================================== */
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

        .usp-icon { font-size: 1.5rem; display: flex; align-items: center; color: var(--brand-blue); }
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

        /* ========================================
           STICKY NAVIGATION
           ======================================== */
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

        /* ========================================
           CONTENT SECTIONS
           ======================================== */
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

        /* ========================================
           PERFORATIONS SECTION
           ======================================== */
        .perforations-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .perforations-header h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .perforations-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .perforations-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto 3rem;
        }

        .perforation-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .perforation-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .perforation-card.active {
          background: rgba(25, 127, 199, 0.2);
          border-color: var(--brand-blue);
        }

        .perforation-visual {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .perf-preview {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
        }

        .perf-surface {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #c4a77d 0%, #b89860 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .perf-dots {
          display: grid;
          gap: 2px;
          justify-items: center;
          align-items: center;
        }

        .perf-dots.nano {
          grid-template-columns: repeat(8, 1fr);
          padding: 8px;
        }

        .perf-dots.nano .dot {
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
        }

        .perf-dots.micro-s {
          grid-template-columns: repeat(6, 1fr);
          padding: 8px;
        }

        .perf-dots.micro-s .dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
        }

        .perf-dots.micro-m {
          grid-template-columns: repeat(5, 1fr);
          padding: 8px;
        }

        .perf-dots.micro-m .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
        }

        .perf-dots.micro-l {
          grid-template-columns: repeat(4, 1fr);
          padding: 10px;
        }

        .perf-dots.micro-l .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
        }

        .perforation-info { text-align: center; }
        .perforation-info h4 { color: white; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .perf-hole-size { font-size: 0.85rem; color: #7ec8f5; font-weight: 600; }
        .perforation-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin: 0.5rem 0; }
        .perf-open-area { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* Perforation Detail Panel */
        .perforation-detail {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 3rem;
          max-width: 900px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2.5rem;
          align-items: center;
        }

        .magnify-circle {
          width: 160px;
          height: 160px;
          border-radius: 50%;
          border: 3px solid var(--brand-blue);
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #c4a77d 0%, #b89860 100%);
        }

        .magnified-perf {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .perf-dots-magnified {
          display: grid;
          gap: 4px;
          justify-items: center;
          align-items: center;
        }

        .perf-dots-magnified.nano {
          grid-template-columns: repeat(5, 1fr);
          padding: 20px;
        }

        .perf-dots-magnified.nano .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
        }

        .perf-dots-magnified.micro-s {
          grid-template-columns: repeat(4, 1fr);
          padding: 20px;
        }

        .perf-dots-magnified.micro-s .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
        }

        .perf-dots-magnified.micro-m {
          grid-template-columns: repeat(3, 1fr);
          padding: 20px;
        }

        .perf-dots-magnified.micro-m .dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
        }

        .perf-dots-magnified.micro-l {
          grid-template-columns: repeat(3, 1fr);
          padding: 20px;
        }

        .perf-dots-magnified.micro-l .dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
        }

        .magnify-label {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 8px;
          border-radius: 10px;
          white-space: nowrap;
        }

        .detail-info h3 {
          color: white;
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .detail-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .detail-stat {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: #7ec8f5;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-desc {
          font-size: 0.95rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin: 0;
        }

        /* ========================================
           FINISHES SECTION
           ======================================== */
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

        .surface-options h4 {
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .surface-selector {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .surface-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .surface-option:hover { border-color: var(--brand-blue); }

        .surface-option.active {
          border-color: var(--brand-blue);
          background: var(--brand-blue-pale);
        }

        .surface-icon { font-size: 1.5rem; flex-shrink: 0; }

        .surface-text {
          display: flex;
          flex-direction: column;
        }

        .surface-name { font-size: 0.95rem; font-weight: 600; color: var(--deep-blue); }
        .surface-desc { font-size: 0.8rem; color: #888; }

        .finish-extras h4 {
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .extras-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .extra-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .extra-icon { font-size: 1.25rem; flex-shrink: 0; margin-top: 2px; }
        .extra-item strong { color: var(--deep-blue); font-size: 0.95rem; }
        .extra-item p { font-size: 0.85rem; color: #666; margin: 0.25rem 0 0; }

        /* ========================================
           ACOUSTICS SECTION
           ======================================== */
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

        .layer-visual.veneer-layer {
          background: linear-gradient(90deg, #c4a77d 0%, #d4a954 30%, #c4a77d 60%, #b89860 100%);
          height: 24px;
        }

        .layer-visual.veneer-layer .wood-grain {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 8px,
            rgba(139, 105, 20, 0.15) 8px,
            rgba(139, 105, 20, 0.15) 10px
          );
        }

        .layer-visual.veneer-layer .micro-holes {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .micro-hole {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.3);
        }

        .layer-visual.core-layer {
          background: #d4d0c8;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
        }

        .sound-chambers {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 4px;
          width: 100%;
          height: 100%;
        }

        .sound-chambers .chamber {
          background: rgba(10, 22, 40, 0.15);
          border-radius: 3px;
        }

        .layer-visual.backing-layer {
          background: #4a4a4a;
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

        /* ========================================
           INSTALLATION SECTION
           ======================================== */
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

        /* ========================================
           BESPOKE SECTION
           ======================================== */
        .bespoke-features {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .bespoke-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .bespoke-icon { font-size: 1.5rem; flex-shrink: 0; }
        .bespoke-item h4 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .bespoke-item p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.6; }

        /* ========================================
           SUSTAINABILITY SECTION
           ======================================== */
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
        .sustain-item h4 { font-size: 1rem; color: white; margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin: 0; }

        /* ========================================
           SPECS SECTION
           ======================================== */
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

        /* ========================================
           GALLERY SECTION
           ======================================== */
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

        /* ========================================
           DOWNLOADS SECTION
           ======================================== */
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

        /* ========================================
           ACCESSORIES SECTION
           ======================================== */
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

        /* ========================================
           CTA SECTION
           ======================================== */
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

        /* ========================================
           RESPONSIVE STYLES
           ======================================== */
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
          .perforations-grid { grid-template-columns: repeat(2, 1fr); }
          .accessories-grid { grid-template-columns: repeat(2, 1fr); }
          .finish-categories { grid-template-columns: 1fr; }
          .sustainability-features { grid-template-columns: 1fr; }
          
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
          
          .sound-waves { display: none; }
          
          .perforation-detail {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .magnify-circle {
            margin: 0 auto;
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
          .perforations-grid { grid-template-columns: 1fr; }
          .accessories-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
          .surface-selector { flex-direction: column; }
          .finish-options { flex-wrap: wrap; justify-content: center; }
          
          .exploded-layer {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }
          
          .layer-visual {
            width: 100%;
            max-width: 200px;
          }
          
          .layer-connector { padding-left: 0; }
          
          .metric-cards { grid-template-columns: 1fr; }
          
          .rating-ring {
            width: 140px;
            height: 140px;
          }
          
          .detail-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
