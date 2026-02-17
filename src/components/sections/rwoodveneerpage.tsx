'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState, useEffect, useRef } from 'react';
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

// Veneer collection with categories
const veneerCollections = [
  {
    category: 'Light Naturals',
    description: 'Serene, luminous tones that open up any space',
    veneers: [
      { id: 'white-ash', name: 'White Ash', swatch: '/images/products/rwood-panel/swatches/white-ash.jpg', image: '/images/products/rwood-panel/white-ash.jpg', isDark: false, origin: 'Europe', grain: 'Straight to interlocked' },
      { id: 'silk-oak', name: 'Silk Oak', swatch: '/images/products/rwood-panel/swatches/silk-oak.jpg', image: '/images/products/rwood-panel/silk-oak.jpg', isDark: false, origin: 'Europe', grain: 'Fine straight grain' },
      { id: 'nordic-birch', name: 'Nordic Birch', swatch: '/images/products/rwood-panel/swatches/nordic-birch.jpg', image: '/images/products/rwood-panel/nordic-birch.jpg', isDark: false, origin: 'Scandinavia', grain: 'Subtle fine grain' },
    ],
  },
  {
    category: 'Warm Naturals',
    description: 'Rich, inviting mid-tones with timeless appeal',
    veneers: [
      { id: 'straw-oak', name: 'Straw Oak', swatch: '/images/products/rwood-panel/swatches/straw-oak.jpg', image: '/images/products/rwood-panel/straw-oak.jpg', isDark: false, origin: 'Europe', grain: 'Cathedral grain' },
      { id: 'honey-oak', name: 'Honey Oak', swatch: '/images/products/rwood-panel/swatches/honey-oak.jpg', image: '/images/products/rwood-panel/honey-oak.jpg', isDark: false, origin: 'Europe', grain: 'Prominent grain' },
      { id: 'natural-cherry', name: 'Natural Cherry', swatch: '/images/products/rwood-panel/swatches/natural-cherry.jpg', image: '/images/products/rwood-panel/natural-cherry.jpg', isDark: false, origin: 'North America', grain: 'Fine straight grain' },
    ],
  },
  {
    category: 'Deep Tones',
    description: 'Bold, sophisticated finishes with dramatic presence',
    veneers: [
      { id: 'umber-oak', name: 'Umber Oak', swatch: '/images/products/rwood-panel/swatches/umber-oak.jpg', image: '/images/products/rwood-panel/umber-oak.jpg', isDark: true, origin: 'Europe', grain: 'Pronounced grain' },
      { id: 'american-walnut', name: 'American Walnut', swatch: '/images/products/rwood-panel/swatches/american-walnut.jpg', image: '/images/products/rwood-panel/american-walnut.jpg', isDark: true, origin: 'North America', grain: 'Straight to wavy' },
      { id: 'smoked-oak', name: 'Smoked Oak', swatch: '/images/products/rwood-panel/swatches/smoked-oak.jpg', image: '/images/products/rwood-panel/smoked-oak.jpg', isDark: true, origin: 'Europe', grain: 'Deep cathedral grain' },
      { id: 'tobacco-walnut', name: 'Tobacco Walnut', swatch: '/images/products/rwood-panel/swatches/tobacco-walnut.jpg', image: '/images/products/rwood-panel/tobacco-walnut.jpg', isDark: true, origin: 'North America', grain: 'Rich flowing grain' },
    ],
  },
];

// All veneers flat for the selector
const allVeneers = veneerCollections.flatMap(c => c.veneers);

// Panel format options
const formatOptions = [
  { id: 'standard', name: 'Standard', width: '1220 mm', length: '2800 mm', thickness: '19 mm', description: 'Most versatile format' },
  { id: 'large', name: 'Large Format', width: '1220 mm', length: '3050 mm', thickness: '19 mm', description: 'Fewer joints, grander look' },
  { id: 'slim', name: 'Slim', width: '1220 mm', length: '2800 mm', thickness: '12 mm', description: 'Lightweight wall cladding' },
];

// Finish type options
const finishTypes = [
  { id: 'matt-lacquer', name: 'Super Matt Lacquer', description: 'Anti-fingerprint, silky touch. 6-layer UV-cured protection.', icon: '✦' },
  { id: 'natural-oil', name: 'Natural Oil', description: 'Deep, authentic wood feel with penetrating protection.', icon: '◉' },
  { id: 'raw', name: 'Unfinished', description: 'Ready for custom on-site finishing by the installer.', icon: '◇' },
];

// Default hero image
const defaultHeroImage = '/images/products/rwood-panel/rWood-Panel_hero.jpg';

// ──────────────────────────────────────
// Lead Generation Form Modal
// ──────────────────────────────────────
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
    return () => { document.body.style.overflow = ''; };
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
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10, 22, 40, 0.85)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', zIndex: 99999,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#ffffff', borderRadius: '20px',
    maxWidth: '540px', width: '100%', maxHeight: '90vh',
    overflow: 'hidden', position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    display: 'flex', flexDirection: 'column',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
    padding: '2rem 2.5rem', position: 'relative', overflow: 'hidden', flexShrink: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute', top: '1rem', right: '1rem',
    width: '36px', height: '36px', background: 'rgba(255, 255, 255, 0.15)',
    border: 'none', borderRadius: '50%', color: 'white',
    fontSize: '1.25rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
  };

  const bodyStyle: React.CSSProperties = {
    padding: '1.5rem 2.5rem', overflowY: 'auto', flex: 1,
  };

  const footerStyle: React.CSSProperties = {
    padding: '1rem 2.5rem 2rem',
    borderTop: '1px solid #e8ecf0', backgroundColor: '#ffffff', flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.9rem 1rem', border: '2px solid #e8ecf0',
    borderRadius: '10px', fontSize: '0.95rem', background: '#fafbfc', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem', fontWeight: 600, color: '#0a1628',
    display: 'block', marginBottom: '0.4rem',
  };

  const submitButtonStyle: React.CSSProperties = {
    width: '100%', padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '1rem', fontWeight: 600,
    cursor: isSubmitting || !consentChecked ? 'not-allowed' : 'pointer',
    opacity: isSubmitting || !consentChecked ? 0.7 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%' }} />
          <button style={closeButtonStyle} onClick={onClose}>✕</button>
          <div style={{ width: '52px', height: '52px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem', position: 'relative', zIndex: 1 }}>
            Download Technical Documentation
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, position: 'relative', zIndex: 1 }}>
            Fill in your details to access our product specifications
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', color: 'white', marginTop: '0.75rem', position: 'relative', zIndex: 1, textTransform: 'capitalize' }}>
            📄 {displayName}
          </div>
        </div>

        <div style={bodyStyle}>
          <form id="lead-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Company Name <span style={{ color: '#e53935' }}>*</span></label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter your company name" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>First Name <span style={{ color: '#e53935' }}>*</span></label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name <span style={{ color: '#e53935' }}>*</span></label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Email Address <span style={{ color: '#e53935' }}>*</span></label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number <span style={{ color: '#e53935' }}>*</span></label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+32 XXX XX XX XX" required style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Position / Role <span style={{ color: '#e53935' }}>*</span></label>
                <select name="position" value={formData.position} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
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
                <label style={labelStyle}>Type of Company <span style={{ color: '#e53935' }}>*</span></label>
                <select name="companyType" value={formData.companyType} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select...</option>
                  <option value="architecture">Architecture Firm</option>
                  <option value="interior-design">Interior Design</option>
                  <option value="construction">Construction Company</option>
                  <option value="cabinetry">Cabinetry / Millwork</option>
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
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5 }}>
                <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} required style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#197FC7', cursor: 'pointer', flexShrink: 0 }} />
                <span>I agree to receive communications from Re-Sound and accept the privacy policy.</span>
              </label>
            </div>
          </form>
        </div>

        <div style={footerStyle}>
          <button type="submit" form="lead-form" disabled={isSubmitting || !consentChecked} style={submitButtonStyle}>
            {isSubmitting ? (
              <>
                <span style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Main Product Page Component
// ──────────────────────────────────────
export default function RWoodPanelProductPage() {
  const t = useTranslations('products.rwood-panel');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVeneer, setSelectedVeneer] = useState<typeof allVeneers[0] | null>(null);
  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState(formatOptions[0]);
  const [selectedFinish, setSelectedFinish] = useState(finishTypes[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const currentHeroImage = selectedVeneer ? selectedVeneer.image : defaultHeroImage;

  const displayedVeneers = activeCollection === 'all'
    ? allVeneers
    : veneerCollections.find(c => c.category === activeCollection)?.veneers || [];

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rwood-panel/product-data-sheet.pdf' },
    { id: 'veneer-collection-guide', name: 'Veneer Collection Guide', icon: '🎨', file: '/documents/rwood-panel/veneer-collection-guide.pdf' },
    { id: 'processing-instructions', name: 'Processing Instructions', icon: '🔧', file: '/documents/rwood-panel/processing-instructions.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/rwood-panel/acoustic-test-report.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/rwood-panel/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rwood-panel/sustainability-declaration.pdf' },
  ];

  const handleDownloadClick = (fileUrl: string) => {
    setSelectedDownload(fileUrl);
    setIsModalOpen(true);
  };

  const handleVeneerSelect = (veneer: typeof allVeneers[0]) => {
    if (!selectedVeneer || veneer.id !== selectedVeneer.id) {
      setIsImageLoading(true);
      setSelectedVeneer(veneer);
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
          source: 'rWood - Panel Product Page',
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
    { id: 'collection', label: 'Collection' },
    { id: 'finishes', label: 'Finishes' },
    { id: 'formats', label: 'Formats' },
    { id: 'applications', label: 'Applications' },
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
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="rwood-panel-page">

      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">PREFINISHED VENEER PANELS</span>
          <h1>rWood - Panel</h1>
          <p className="hero-tagline">The Elegance of Real Wood. Ready to Use.</p>
          <p className="hero-description">
            Premium veneered MDF panels, brushed, stained and lacquered — requiring 
            no additional finishing. The authentic beauty of solid wood without compromise, 
            designed for architects, designers and cabinetmakers who demand perfection.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🌳</span>
              <span className="usp-text">FSC® Certified</span>
            </div>
            <div className="usp">
              <span className="usp-icon">✦</span>
              <span className="usp-text">Prefinished &amp; Ready to Use</span>
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
            <a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection('collection'); }} className="btn-secondary">
              Explore the Collection
            </a>
          </div>

          <p className="hero-price">Starting from <strong>€72</strong> per panel excl. VAT</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container hero-img">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={`rWood - Panel${selectedVeneer ? ` in ${selectedVeneer.name}` : ' prefinished veneer panel'}`}
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
          
          {/* Veneer quick-selector */}
          <div className="veneer-quick-selector">
            <span className="selector-label">Select Veneer</span>
            <div className="veneer-options">
              {allVeneers.slice(0, 6).map((veneer) => (
                <button
                  key={veneer.id}
                  className={`veneer-option ${selectedVeneer?.id === veneer.id ? 'active' : ''}`}
                  onClick={() => handleVeneerSelect(veneer)}
                  title={veneer.name}
                  aria-label={`Select ${veneer.name} veneer`}
                >
                  <span className="veneer-swatch" style={{ backgroundImage: `url(${veneer.swatch})` }} />
                  {selectedVeneer?.id === veneer.id && (
                    <span className={`veneer-check ${veneer.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                  )}
                </button>
              ))}
              <a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection('collection'); }} className="veneer-option more" title="View all veneers">
                <span className="more-label">+{allVeneers.length - 6}</span>
              </a>
            </div>
            <span className="selected-veneer-name">{selectedVeneer?.name || 'Select a veneer'}</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          STICKY NAVIGATION
          ═══════════════════════════════════ */}
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

      {/* ═══════════════════════════════════
          OVERVIEW
          ═══════════════════════════════════ */}
      <section id="overview" className="content-section overview-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-panel/overview-craftsmanship.webp"
                alt="rWood - Panel veneered MDF panel close-up showing grain detail"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">CRAFTSMANSHIP</span>
            <h2>Nature, Refined</h2>
            <p>
              rWood - Panel brings the warmth and character of solid timber into a prefinished, 
              ready-to-use format. Each panel is crafted from premium A-grade veneer, bonded 
              to a high-density MDF core using advanced pressing technology — delivering 
              the beauty of natural wood with outstanding dimensional stability.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Premium A-grade veneers — oak, walnut, ash, cherry and birch
              </li>
              <li>
                <span className="check">✓</span>
                6-layer UV-cured lacquer for scratch and spill resistance
              </li>
              <li>
                <span className="check">✓</span>
                High-density MDF core (700 kg/m³) for structural integrity
              </li>
              <li>
                <span className="check">✓</span>
                Balanced construction — veneer on both faces for stability
              </li>
              <li>
                <span className="check">✓</span>
                No additional finishing required — ready from the box
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          COMPOSITION DETAIL
          ═══════════════════════════════════ */}
      <section className="content-section composition-section">
        <div className="composition-header">
          <span className="section-tag">ANATOMY</span>
          <h2>Built to Perform</h2>
          <p>Every layer serves a purpose — from the authentic wood surface to the engineered core.</p>
        </div>

        <div className="composition-diagram">
          <div className="comp-layer">
            <div className="comp-layer-visual veneer-top">
              <div className="grain-texture"></div>
            </div>
            <div className="comp-layer-info">
              <span className="comp-layer-number">01</span>
              <div>
                <h4>Top Veneer Layer</h4>
                <p>A-grade real wood veneer, brushed, stained and protected with 6 layers of UV-cured acrylate urethane lacquer. Soft-touch super matt finish.</p>
              </div>
            </div>
          </div>

          <div className="comp-connector">
            <div className="connector-line"></div>
          </div>

          <div className="comp-layer">
            <div className="comp-layer-visual mdf-core">
              <span className="core-label">MDF</span>
            </div>
            <div className="comp-layer-info">
              <span className="comp-layer-number">02</span>
              <div>
                <h4>High-Density MDF Core</h4>
                <p>700 kg/m³ FSC® certified MDF. Available in standard, moisture-resistant (MR) and fire-retardant (FR) grades.</p>
              </div>
            </div>
          </div>

          <div className="comp-connector">
            <div className="connector-line"></div>
          </div>

          <div className="comp-layer">
            <div className="comp-layer-visual veneer-back">
              <div className="grain-texture"></div>
            </div>
            <div className="comp-layer-info">
              <span className="comp-layer-number">03</span>
              <div>
                <h4>Balance Veneer Layer</h4>
                <p>Matching veneer backing ensures dimensional stability and prevents warping. Finished or unfinished options.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          VENEER COLLECTION
          ═══════════════════════════════════ */}
      <section id="collection" className="content-section collection-section dark">
        <div className="collection-header">
          <span className="section-tag">THE COLLECTION</span>
          <h2>10 Curated Wood Veneers</h2>
          <p>
            From serene Scandinavian birch to dramatic American walnut — every veneer 
            is carefully selected, brushed and finished to showcase the character of the wood.
          </p>
        </div>

        {/* Category filter */}
        <div className="collection-filter">
          <button
            className={`filter-btn ${activeCollection === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCollection('all')}
          >
            All Veneers
          </button>
          {veneerCollections.map((col) => (
            <button
              key={col.category}
              className={`filter-btn ${activeCollection === col.category ? 'active' : ''}`}
              onClick={() => setActiveCollection(col.category)}
            >
              {col.category}
            </button>
          ))}
        </div>

        {/* Veneer cards grid */}
        <div className="veneer-grid">
          {displayedVeneers.map((veneer) => (
            <div 
              key={veneer.id} 
              className={`veneer-card ${selectedVeneer?.id === veneer.id ? 'active' : ''}`}
              onClick={() => handleVeneerSelect(veneer)}
            >
              <div className="veneer-card-image">
                <div className="veneer-card-swatch" style={{ backgroundImage: `url(${veneer.swatch})` }} />
              </div>
              <div className="veneer-card-info">
                <h4>{veneer.name}</h4>
                <span className="veneer-origin">{veneer.origin}</span>
                <p className="veneer-grain">{veneer.grain}</p>
              </div>
              {selectedVeneer?.id === veneer.id && (
                <div className="veneer-card-selected">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="collection-note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7ec8f5" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Custom veneer species and stain colours available on project orders of 50+ panels.</span>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FINISHES
          ═══════════════════════════════════ */}
      <section id="finishes" className="content-section finishes-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">SURFACE FINISHES</span>
            <h2>Touch &amp; Protection</h2>
            <p>
              The right finish brings out the best in every wood species. Our multi-layer 
              finishing process delivers a surface that is as pleasing to touch as it is 
              durable — protected against scratches, moisture and daily wear.
            </p>

            <div className="finish-type-selector">
              {finishTypes.map((finish) => (
                <button
                  key={finish.id}
                  className={`finish-type-btn ${selectedFinish.id === finish.id ? 'active' : ''}`}
                  onClick={() => setSelectedFinish(finish)}
                >
                  <span className="finish-type-icon">{finish.icon}</span>
                  <div className="finish-type-info">
                    <h4>{finish.name}</h4>
                    <p>{finish.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="finish-advantages">
              <h4>Key Advantages</h4>
              <div className="advantages-grid">
                <div className="advantage">
                  <span className="adv-icon">🛡️</span>
                  <span>Scratch resistant</span>
                </div>
                <div className="advantage">
                  <span className="adv-icon">💧</span>
                  <span>Spill resistant</span>
                </div>
                <div className="advantage">
                  <span className="adv-icon">👆</span>
                  <span>Anti-fingerprint</span>
                </div>
                <div className="advantage">
                  <span className="adv-icon">🧹</span>
                  <span>Easy maintenance</span>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-panel/finish-detail.webp"
                alt="Close-up of lacquered veneer surface"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FORMATS & SIZES
          ═══════════════════════════════════ */}
      <section id="formats" className="content-section formats-section">
        <div className="formats-header">
          <span className="section-tag">DIMENSIONS</span>
          <h2>Panel Formats</h2>
          <p>Three formats to cover every application — from full-height wall cladding to compact furniture elements.</p>
        </div>

        <div className="formats-grid">
          {formatOptions.map((format) => (
            <div
              key={format.id}
              className={`format-card ${selectedFormat.id === format.id ? 'active' : ''}`}
              onClick={() => setSelectedFormat(format)}
            >
              <div className="format-visual">
                <div className={`format-panel format-${format.id}`}>
                  <span className="format-dim-w">{format.width}</span>
                  <span className="format-dim-l">{format.length}</span>
                </div>
              </div>
              <div className="format-info">
                <h4>{format.name}</h4>
                <p>{format.description}</p>
                <div className="format-specs">
                  <span>{format.width} × {format.length}</span>
                  <span>Thickness: {format.thickness}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          APPLICATIONS
          ═══════════════════════════════════ */}
      <section id="applications" className="content-section applications-section dark">
        <div className="applications-header">
          <span className="section-tag">APPLICATIONS</span>
          <h2>Limitless Possibilities</h2>
          <p>
            From bespoke cabinetry to full-height feature walls — rWood - Panel delivers 
            the look and feel of solid timber for every interior application.
          </p>
        </div>

        <div className="applications-grid">
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="6" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 6V4"/>
                <path d="M18 6V4"/>
              </svg>
            </div>
            <h4>Furniture &amp; Cabinetry</h4>
            <p>Kitchen fronts, wardrobes, reception desks, shelving and bespoke furniture. Easy to machine with standard woodworking tools.</p>
          </div>
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 3v18"/>
              </svg>
            </div>
            <h4>Wall Cladding</h4>
            <p>Full-height feature walls, wainscoting and accent panels. Creates stunning visual impact with the warmth of natural wood.</p>
          </div>
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 21h18"/>
                <path d="M5 21V7l7-4 7 4v14"/>
                <path d="M9 21v-6h6v6"/>
              </svg>
            </div>
            <h4>Ceilings</h4>
            <p>Suspended ceiling panels and integrated ceiling systems. Lightweight slim format available for reduced structural load.</p>
          </div>
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h4>Retail &amp; Hospitality</h4>
            <p>Shop fittings, bar counters, hotel lobbies and restaurant interiors. Consistent quality across large-scale projects.</p>
          </div>
        </div>

        {/* Sector badges */}
        <div className="sector-badges">
          <span className="sector-badge">Office</span>
          <span className="sector-badge">Hospitality</span>
          <span className="sector-badge">Residential</span>
          <span className="sector-badge">Retail</span>
          <span className="sector-badge">Healthcare</span>
          <span className="sector-badge">Education</span>
        </div>
      </section>

      {/* ═══════════════════════════════════
          SUSTAINABILITY
          ═══════════════════════════════════ */}
      <section className="content-section sustainability-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-panel/FSC_sustainability.webp"
                alt="Sustainably managed forest"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Responsibly Made</h2>
            <p>
              Every rWood - Panel starts with responsibly sourced timber. As part of 
              Re-Sound&apos;s circular economy commitment, we maximise the use of each 
              log by processing it as veneer — yielding up to 40× more surface area 
              than solid lumber from the same tree.
            </p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <span className="sustain-icon">🌲</span>
                <div>
                  <h4>FSC® Certified</h4>
                  <p>All wood from responsibly managed forests</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">♻️</span>
                <div>
                  <h4>Circular Take-Back</h4>
                  <p>Free end-of-life panel return and recycling</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🏭</span>
                <div>
                  <h4>European Production</h4>
                  <p>Short supply chains, reduced transport emissions</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">📋</span>
                <div>
                  <h4>EPD Available</h4>
                  <p>Full environmental product declaration</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🌿</span>
                <div>
                  <h4>Low VOC</h4>
                  <p>E1 classified, meets strictest emission standards</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">⚡</span>
                <div>
                  <h4>Green Energy</h4>
                  <p>Production powered by renewable energy sources</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          SPECIFICATIONS
          ═══════════════════════════════════ */}
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
                <tr><td>Panel width</td><td>1220 mm</td></tr>
                <tr><td>Panel length</td><td>2800 / 3050 mm</td></tr>
                <tr><td>Thickness (standard)</td><td>19 mm</td></tr>
                <tr><td>Thickness (slim)</td><td>12 mm</td></tr>
                <tr><td>Weight (19 mm)</td><td>± 14.5 kg/m²</td></tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Composition</h4>
            <table>
              <tbody>
                <tr><td>Top layer</td><td>A-grade veneer, stained &amp; lacquered</td></tr>
                <tr><td>Core</td><td>MDF 700 kg/m³ (std / MR / FR)</td></tr>
                <tr><td>Back layer</td><td>Balancing veneer</td></tr>
                <tr><td>Bonding</td><td>HPLT press technology</td></tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Finish</h4>
            <table>
              <tbody>
                <tr><td>Lacquer type</td><td>Acrylate urethane UV-cured</td></tr>
                <tr><td>Number of layers</td><td>6</td></tr>
                <tr><td>Gloss level</td><td>Super matt (3-5 GU)</td></tr>
                <tr><td>Anti-fingerprint</td><td>Yes</td></tr>
                <tr><td>Scratch resistance</td><td>≥ 2N (ISO 1518)</td></tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Fire Safety</h4>
            <table>
              <tbody>
                <tr><td>Standard MDF</td><td>D-s2, d0</td></tr>
                <tr><td>Fire-retardant MDF</td><td>B-s1, d0</td></tr>
                <tr><td>Test standard</td><td>EN 13501-1</td></tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Certifications</h4>
            <table>
              <tbody>
                <tr><td>Wood sourcing</td><td>FSC® certified</td></tr>
                <tr><td>VOC emissions</td><td>E1 / CARB 2 compliant</td></tr>
                <tr><td>Environmental</td><td>EPD available</td></tr>
                <tr><td>Felt (if acoustic)</td><td>OEKO-TEX® Standard 100</td></tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>Processing</h4>
            <table>
              <tbody>
                <tr><td>Sawing</td><td>Standard woodworking tools</td></tr>
                <tr><td>Edge banding</td><td>Matching veneer edgebanding available</td></tr>
                <tr><td>CNC machining</td><td>Suitable</td></tr>
                <tr><td>Environment</td><td>Interior use (dry areas)</td></tr>
                <tr><td>Moisture-resistant</td><td>MR core available</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          GALLERY
          ═══════════════════════════════════ */}
      <section id="gallery" className="content-section gallery-section">
        <div className="gallery-header">
          <span className="section-tag">INSPIRATION</span>
          <h2>Projects &amp; Interiors</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`gallery-item ${i <= 2 ? 'wide' : ''}`}>
              <div className="image-container gallery">
                <Image
                  src={`/images/products/rwood-panel/gallery-${i}.webp`}
                  alt={`rWood - Panel interior project ${i}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════
          DOWNLOADS
          ═══════════════════════════════════ */}
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

      {/* ═══════════════════════════════════
          MATCHING PRODUCTS
          ═══════════════════════════════════ */}
      <section className="content-section matching-section dark">
        <div className="matching-header">
          <span className="section-tag">COMPLETE THE LOOK</span>
          <h2>Matching Products &amp; Accessories</h2>
          <p>Achieve design continuity with coordinated Re-Sound products</p>
        </div>

        <div className="matching-grid">
          <div className="matching-card">
            <div className="matching-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="18" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
                <path d="M10 8h4" opacity="0.5"/>
                <path d="M10 12h4" opacity="0.5"/>
                <path d="M10 16h4" opacity="0.5"/>
              </svg>
            </div>
            <h4>rWood - Groove</h4>
            <p>Slatted acoustic panels in matching wood veneers for wall and ceiling feature zones</p>
            <Link href="/products/rwood-groove" className="matching-link">Explore →</Link>
          </div>
          <div className="matching-card">
            <div className="matching-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16v16H4z"/>
                <path d="M4 8h16"/>
                <path d="M8 4v16"/>
              </svg>
            </div>
            <h4>Matching Edgebanding</h4>
            <p>Pre-finished veneer edgebanding in every colour for seamless furniture edges</p>
          </div>
          <div className="matching-card">
            <div className="matching-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h4>Free Samples</h4>
            <p>Order physical veneer samples to compare finishes, colours and textures in your space</p>
            <Link href="/contact" className="matching-link">Order Samples →</Link>
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

      {/* ═══════════════════════════════════
          CTA
          ═══════════════════════════════════ */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>Ready to Elevate Your Project?</h2>
          <p>
            Get a personalised quote, request physical samples, or speak with our 
            specification team about your next project.
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
            Free samples available • Made in Europe • FSC® Certified • Circular Take-Back
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STYLES
          ═══════════════════════════════════════════════════════ */}
      <style jsx>{`
        .rwood-panel-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --wood-warm: #8B6914;
          --wood-light: #D4A954;
        }

        /* ─── HERO ─── */
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
          max-width: 520px;
        }

        .hero-usps { display: flex; gap: 2rem; margin-bottom: 2rem; }
        .usp { display: flex; align-items: center; gap: 0.5rem; }
        .usp-icon { font-size: 1.5rem; }
        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }
        .hero-ctas { display: flex; gap: 1rem; margin-bottom: 1.5rem; }

        .btn-primary {
          display: inline-flex; align-items: center;
          padding: 1rem 2rem; background: var(--brand-blue);
          color: white; text-decoration: none; border-radius: 50px;
          font-weight: 600; transition: all 0.3s ease; border: none; cursor: pointer;
        }
        .btn-primary:hover { background: var(--brand-blue-dark); transform: translateY(-2px); }
        .btn-primary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        .btn-secondary {
          display: inline-flex; align-items: center;
          padding: 1rem 2rem; background: transparent;
          color: var(--deep-blue); text-decoration: none; border-radius: 50px;
          font-weight: 600; border: 2px solid var(--deep-blue);
          transition: all 0.3s ease; cursor: pointer;
        }
        .btn-secondary:hover { background: var(--deep-blue); color: white; }
        .btn-secondary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        .hero-price { font-size: 0.95rem; color: #666; }
        .hero-price strong { color: var(--deep-blue); font-size: 1.2rem; }

        .hero-image {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1.5rem;
        }

        .image-container {
          position: relative; width: 100%; max-width: 600px;
          aspect-ratio: 4/5; border-radius: 24px; overflow: hidden; background: var(--cream);
        }

        .image-container.hero-img { aspect-ratio: 3/4; }

        .image-wrapper {
          position: absolute; inset: 0; transition: opacity 0.3s ease;
        }
        .image-wrapper.loading { opacity: 0.7; }

        .image-loading-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255, 255, 255, 0.5);
        }

        .loading-spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--brand-blue-pale);
          border-top-color: var(--brand-blue);
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── VENEER QUICK SELECTOR ─── */
        .veneer-quick-selector {
          display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
          padding: 1.25rem 2rem; background: white;
          border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .selector-label {
          font-size: 0.8rem; font-weight: 600; color: #888;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .veneer-options { display: flex; gap: 0.6rem; }

        .veneer-option {
          position: relative; width: 40px; height: 40px; border-radius: 8px;
          border: 3px solid transparent; background: none; padding: 0;
          cursor: pointer; transition: all 0.2s ease; text-decoration: none;
        }
        .veneer-option:hover { transform: scale(1.1); }
        .veneer-option.active {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue);
        }

        .veneer-swatch {
          display: block; width: 100%; height: 100%;
          border-radius: 5px; border: 1px solid rgba(0, 0, 0, 0.1);
          background-size: cover; background-position: center;
        }

        .veneer-check {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: bold;
        }
        .veneer-check.on-dark { color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
        .veneer-check.on-light { color: var(--deep-blue); text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); }

        .veneer-option.more {
          display: flex; align-items: center; justify-content: center;
          background: var(--brand-blue-pale); border-radius: 8px;
        }
        .more-label {
          font-size: 0.75rem; font-weight: 700; color: var(--brand-blue);
        }

        .selected-veneer-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }
        .image-container.gallery { aspect-ratio: 1; }
        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* ─── STICKY NAV ─── */
        .product-nav {
          position: sticky; top: 80px; z-index: 90;
          background: white; border-bottom: 1px solid #eee; padding: 0 4rem;
        }
        .nav-inner {
          display: flex; gap: 0; max-width: 1200px; margin: 0 auto;
        }
        .nav-item {
          padding: 1.25rem; background: none; border: none;
          font-size: 0.9rem; font-weight: 500; color: #666;
          cursor: pointer; border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }
        .nav-item:hover { color: var(--brand-blue); }
        .nav-item.active { color: var(--brand-blue); border-bottom-color: var(--brand-blue); }

        /* ─── CONTENT SECTIONS ─── */
        .content-section { padding: 6rem 4rem; }
        .content-section.dark { background: var(--deep-blue); color: white; }
        .content-section.dark .section-content h2 { color: white; }
        .content-section.dark .section-content p { color: rgba(255, 255, 255, 0.8); }

        .section-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;
          max-width: 1200px; margin: 0 auto; align-items: center;
        }
        .section-grid.reverse { direction: rtl; }
        .section-grid.reverse > * { direction: ltr; }

        .section-tag {
          display: inline-block; background: var(--brand-blue-pale);
          color: var(--brand-blue); font-size: 0.75rem; font-weight: 600;
          padding: 0.4rem 0.8rem; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem;
        }
        .content-section.dark .section-tag {
          background: rgba(25, 127, 199, 0.3); color: #7ec8f5;
        }

        .section-content h2 {
          font-size: 2.5rem; color: var(--deep-blue);
          margin-bottom: 1.5rem; letter-spacing: -1px;
        }
        .section-content p {
          font-size: 1.1rem; color: #555; line-height: 1.8; margin-bottom: 1.5rem;
        }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 0; font-size: 1rem; color: var(--charcoal);
        }
        .check { color: var(--brand-blue); font-weight: bold; }

        /* ─── COMPOSITION SECTION ─── */
        .composition-header {
          text-align: center; max-width: 700px; margin: 0 auto 4rem;
        }
        .composition-header h2 {
          font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1rem;
        }
        .composition-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }

        .composition-diagram {
          max-width: 700px; margin: 0 auto;
        }

        .comp-layer {
          display: flex; align-items: center; gap: 2rem;
          padding: 1.5rem 2rem; background: white;
          border-radius: 16px; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
        }

        .comp-layer-visual {
          width: 200px; flex-shrink: 0; border-radius: 8px;
          overflow: hidden; position: relative;
        }

        .comp-layer-visual.veneer-top,
        .comp-layer-visual.veneer-back {
          height: 32px;
          background: linear-gradient(90deg, #c4a77d 0%, #d4a954 30%, #c4a77d 60%, #b89860 100%);
        }

        .grain-texture {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(
            90deg, transparent 0px, transparent 8px,
            rgba(139, 105, 20, 0.12) 8px, rgba(139, 105, 20, 0.12) 10px
          );
        }

        .comp-layer-visual.mdf-core {
          height: 64px; background: #e8dcc8;
          display: flex; align-items: center; justify-content: center;
        }

        .core-label {
          font-size: 0.8rem; font-weight: 700; color: #8a7a5e;
          letter-spacing: 2px; text-transform: uppercase;
        }

        .comp-connector {
          display: flex; justify-content: center; padding: 0.5rem 0; padding-left: 100px;
        }

        .connector-line {
          width: 2px; height: 20px;
          background: repeating-linear-gradient(
            to bottom, var(--brand-blue) 0px, var(--brand-blue) 4px,
            transparent 4px, transparent 8px
          );
        }

        .comp-layer-info {
          display: flex; gap: 1rem; align-items: flex-start;
        }

        .comp-layer-number {
          font-size: 0.8rem; font-weight: 700; color: var(--brand-blue);
          background: var(--brand-blue-pale); width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
        }

        .comp-layer-info h4 {
          font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem;
        }
        .comp-layer-info p {
          font-size: 0.85rem; color: #666; margin: 0; line-height: 1.5;
        }

        /* ─── COLLECTION SECTION ─── */
        .collection-header {
          text-align: center; max-width: 700px; margin: 0 auto 3rem;
        }
        .collection-header h2 {
          font-size: 2.5rem; color: white; margin-bottom: 1rem;
        }
        .collection-header p {
          font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8;
        }

        .collection-filter {
          display: flex; gap: 0.75rem; justify-content: center;
          margin-bottom: 3rem; flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.6rem 1.25rem; background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 50px;
          color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.3s ease;
        }
        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.15); color: white;
        }
        .filter-btn.active {
          background: var(--brand-blue); border-color: var(--brand-blue); color: white;
        }

        .veneer-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.5rem; max-width: 1200px; margin: 0 auto;
        }

        .veneer-card {
          background: rgba(255, 255, 255, 0.06);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          transition: all 0.3s ease; position: relative;
        }
        .veneer-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
        }
        .veneer-card.active {
          border-color: var(--brand-blue);
          background: rgba(25, 127, 199, 0.15);
        }

        .veneer-card-image { height: 160px; overflow: hidden; }

        .veneer-card-swatch {
          width: 100%; height: 100%;
          background-size: cover; background-position: center;
          transition: transform 0.3s ease;
        }
        .veneer-card:hover .veneer-card-swatch { transform: scale(1.05); }

        .veneer-card-info { padding: 1.25rem; }
        .veneer-card-info h4 { color: white; font-size: 1rem; margin: 0 0 0.25rem; }
        .veneer-origin { font-size: 0.8rem; color: #7ec8f5; }
        .veneer-grain { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); margin: 0.5rem 0 0; }

        .veneer-card-selected {
          position: absolute; top: 0.75rem; right: 0.75rem;
          width: 32px; height: 32px; background: var(--brand-blue);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: white;
        }

        .collection-note {
          display: flex; align-items: center; gap: 0.75rem;
          max-width: 600px; margin: 3rem auto 0;
          padding: 1rem 1.5rem; background: rgba(25, 127, 199, 0.15);
          border-radius: 12px; font-size: 0.9rem; color: rgba(255, 255, 255, 0.8);
        }

        /* ─── FINISHES ─── */
        .finish-type-selector {
          display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;
        }

        .finish-type-btn {
          display: flex; align-items: flex-start; gap: 1rem;
          padding: 1.25rem; background: var(--cream);
          border: 2px solid transparent; border-radius: 12px;
          cursor: pointer; transition: all 0.2s ease; text-align: left;
        }
        .finish-type-btn:hover { border-color: #ddd; }
        .finish-type-btn.active {
          border-color: var(--brand-blue); background: var(--brand-blue-pale);
        }

        .finish-type-icon {
          font-size: 1.5rem; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          background: white; border-radius: 10px; flex-shrink: 0;
        }

        .finish-type-info h4 {
          font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem;
        }
        .finish-type-info p {
          font-size: 0.85rem; color: #666; margin: 0; line-height: 1.5;
        }

        .finish-advantages h4 {
          color: var(--deep-blue); margin-bottom: 1rem;
        }

        .advantages-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
        }

        .advantage {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.9rem; color: var(--charcoal);
        }
        .adv-icon { font-size: 1.2rem; }

        /* ─── FORMATS ─── */
        .formats-header {
          text-align: center; max-width: 700px; margin: 0 auto 4rem;
        }
        .formats-header h2 {
          font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1rem;
        }
        .formats-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }

        .formats-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
          max-width: 1000px; margin: 0 auto;
        }

        .format-card {
          background: var(--cream); border: 2px solid transparent;
          border-radius: 16px; padding: 2rem; cursor: pointer;
          transition: all 0.3s ease; text-align: center;
        }
        .format-card:hover { border-color: #ddd; transform: translateY(-2px); }
        .format-card.active {
          border-color: var(--brand-blue); background: var(--brand-blue-pale);
        }

        .format-visual {
          height: 160px; display: flex; align-items: center;
          justify-content: center; margin-bottom: 1.5rem;
        }

        .format-panel {
          background: linear-gradient(135deg, #c4a77d 0%, #b89860 100%);
          border-radius: 4px; position: relative;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .format-standard { width: 70px; height: 140px; }
        .format-large { width: 70px; height: 150px; }
        .format-slim { width: 68px; height: 140px; opacity: 0.85; }

        .format-dim-w {
          position: absolute; bottom: -20px; left: 50%;
          transform: translateX(-50%); font-size: 0.65rem;
          color: #888; white-space: nowrap;
        }
        .format-dim-l {
          position: absolute; right: -50px; top: 50%;
          transform: translateY(-50%) rotate(90deg);
          font-size: 0.65rem; color: #888; white-space: nowrap;
        }

        .format-info h4 {
          font-size: 1.1rem; color: var(--deep-blue); margin-bottom: 0.25rem;
        }
        .format-info p { font-size: 0.85rem; color: #666; margin: 0 0 1rem; }

        .format-specs {
          display: flex; flex-direction: column; gap: 0.25rem;
          font-size: 0.8rem; color: #888;
        }

        /* ─── APPLICATIONS ─── */
        .applications-header {
          text-align: center; max-width: 700px; margin: 0 auto 4rem;
        }
        .applications-header h2 {
          font-size: 2.5rem; color: white; margin-bottom: 1rem;
        }
        .applications-header p {
          font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8;
        }

        .applications-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;
          max-width: 1200px; margin: 0 auto 3rem;
        }

        .application-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px; padding: 2rem;
          transition: all 0.3s ease;
        }
        .application-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
        }

        .application-icon {
          width: 56px; height: 56px;
          background: rgba(25, 127, 199, 0.2); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #7ec8f5; margin-bottom: 1.25rem;
        }

        .application-card h4 { color: white; margin-bottom: 0.5rem; font-size: 1.05rem; }
        .application-card p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin: 0; line-height: 1.5; }

        .sector-badges {
          display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;
        }

        .sector-badge {
          padding: 0.5rem 1.25rem; background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px;
          color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; font-weight: 500;
        }

        /* ─── SUSTAINABILITY ─── */
        .sustainability-features {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
        }
        .sustain-item { display: flex; align-items: flex-start; gap: 1rem; }
        .sustain-icon { font-size: 1.5rem; flex-shrink: 0; }
        .sustain-item h4 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: #666; margin: 0; }

        /* ─── SPECS ─── */
        .specs-header { text-align: center; margin-bottom: 3rem; }
        .specs-header h2 { font-size: 2.5rem; color: var(--deep-blue); }

        .specs-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
          max-width: 1200px; margin: 0 auto;
        }

        .spec-card { background: var(--cream); padding: 1.5rem; border-radius: 16px; }
        .spec-card h4 {
          font-size: 1rem; color: var(--brand-blue); margin-bottom: 1rem;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .spec-card table { width: 100%; }
        .spec-card td {
          padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid #e0e0e0;
        }
        .spec-card tr:last-child td { border-bottom: none; }
        .spec-card td:first-child { color: #666; }
        .spec-card td:last-child { text-align: right; font-weight: 600; color: var(--deep-blue); }

        /* ─── GALLERY ─── */
        .gallery-header { text-align: center; margin-bottom: 3rem; }
        .gallery-header h2 { font-size: 2.5rem; color: var(--deep-blue); }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 280px;
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-item { border-radius: 16px; overflow: hidden; }
        .gallery-item.wide { grid-column: span 2; }
        .gallery-item .image-container.gallery { aspect-ratio: unset; height: 100%; max-width: none; }

        /* ─── DOWNLOADS ─── */
        .downloads-header { text-align: center; margin-bottom: 3rem; }
        .downloads-header h2 { font-size: 2.5rem; color: var(--deep-blue); }

        .downloads-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
          max-width: 1000px; margin: 0 auto;
        }

        .download-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.5rem; background: var(--cream); border-radius: 12px;
          text-decoration: none; transition: all 0.3s ease;
          border: none; cursor: pointer; text-align: left;
        }
        .download-card:hover { background: var(--brand-blue-pale); transform: translateY(-2px); }
        .download-icon { font-size: 2rem; }
        .download-info h4 { font-size: 0.95rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .download-info span { font-size: 0.8rem; color: #888; }
        .download-arrow { margin-left: auto; font-size: 1.2rem; color: var(--brand-blue); }

        /* ─── MATCHING PRODUCTS ─── */
        .matching-header { text-align: center; margin-bottom: 3rem; }
        .matching-header h2 { font-size: 2.5rem; color: white; margin-bottom: 0.5rem; }
        .matching-header p { color: rgba(255, 255, 255, 0.7); }

        .matching-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
          max-width: 1000px; margin: 0 auto;
        }

        .matching-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px; padding: 2rem;
          transition: all 0.3s ease;
        }
        .matching-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .matching-icon {
          width: 56px; height: 56px;
          background: rgba(25, 127, 199, 0.2); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #7ec8f5; margin-bottom: 1.25rem;
        }

        .matching-card h4 { color: white; margin-bottom: 0.5rem; }
        .matching-card p {
          font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);
          margin: 0 0 1rem; line-height: 1.5;
        }

        .matching-link {
          font-size: 0.9rem; color: #7ec8f5; text-decoration: none;
          font-weight: 600; transition: color 0.2s;
        }
        .matching-link:hover { color: white; }

        /* ─── CTA ─── */
        .cta-section {
          background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
          text-align: center;
        }
        .cta-content { max-width: 700px; margin: 0 auto; }
        .cta-content h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .cta-content > p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
        .cta-section .btn-primary { background: white; color: var(--brand-blue); }
        .cta-section .btn-primary:hover { background: var(--cream); }
        .cta-section .btn-secondary { border-color: white; color: white; }
        .cta-section .btn-secondary:hover { background: white; color: var(--brand-blue); }
        .cta-note { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }

        /* ═══════════════════════════════════
           RESPONSIVE
           ═══════════════════════════════════ */
        @media (max-width: 1024px) {
          .product-hero {
            grid-template-columns: 1fr; padding: 6rem 2rem 3rem; min-height: auto;
          }
          .hero-content h1 { font-size: 3rem; }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .section-grid.reverse { direction: ltr; }
          .specs-grid, .downloads-grid { grid-template-columns: repeat(2, 1fr); }
          .applications-grid { grid-template-columns: repeat(2, 1fr); }
          .formats-grid { grid-template-columns: repeat(2, 1fr); }
          .matching-grid { grid-template-columns: 1fr; max-width: 500px; }
          .sustainability-features { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 240px; }
          .gallery-item.wide { grid-column: span 2; }

          .comp-layer { flex-direction: column; text-align: center; }
          .comp-layer-visual { width: 100%; max-width: 280px; }
          .comp-layer-info { justify-content: center; }
          .comp-connector { padding-left: 0; }
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
          .applications-grid { grid-template-columns: 1fr; }
          .formats-grid { grid-template-columns: 1fr; }
          .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 200px; }
          .gallery-item.wide { grid-column: span 1; }
          .cta-buttons { flex-direction: column; }
          .veneer-options { flex-wrap: wrap; justify-content: center; }
          .veneer-grid { grid-template-columns: repeat(2, 1fr); }
          .advantages-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
