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

// Wood veneer options for rWood - Perf
const woodFinishOptions = [
  { id: 'oak-natural', name: 'Natural Oak', swatch: '/images/products/rwood-perf/swatches/natural-oak.jpg', image: '/images/products/rwood-perf/natural-oak.jpg', isDark: false },
  { id: 'oak-white', name: 'White Oak', swatch: '/images/products/rwood-perf/swatches/white-oak.jpg', image: '/images/products/rwood-perf/white-oak.jpg', isDark: false },
  { id: 'oak-smoked', name: 'Smoked Oak', swatch: '/images/products/rwood-perf/swatches/smoked-oak.jpg', image: '/images/products/rwood-perf/smoked-oak.jpg', isDark: true },
  { id: 'walnut', name: 'Walnut', swatch: '/images/products/rwood-perf/swatches/walnut.jpg', image: '/images/products/rwood-perf/walnut.jpg', isDark: true },
  { id: 'ash', name: 'Ash', swatch: '/images/products/rwood-perf/swatches/ash.jpg', image: '/images/products/rwood-perf/ash.jpg', isDark: false },
];

// Core colour options
const coreColourOptions = [
  { id: 'dark', name: 'Dark Core', color: '#1a1a1a', description: 'Perforations blend with dark veneers' },
  { id: 'light', name: 'Light Core', color: '#c8c0b0', description: 'Perforations blend with light veneers' },
];

// Perforation pattern options
const perforationOptions = [
  { id: 'pd8', name: 'PD8', holeSize: '8mm', spacing: '16mm', openArea: '19.6%', description: 'Classic round perforation, maximum absorption', acousticClass: 'A' },
  { id: 'pd6', name: 'PD6', holeSize: '6mm', spacing: '12mm', openArea: '16.4%', description: 'Balanced pattern for most applications', acousticClass: 'A' },
  { id: 'pd4', name: 'PD4', holeSize: '4mm', spacing: '8mm', openArea: '14.2%', description: 'Subtle perforations, refined look', acousticClass: 'B' },
  { id: 'pd3', name: 'PD3', holeSize: '3mm', spacing: '6mm', openArea: '11.8%', description: 'Discreet pattern, elegant surface', acousticClass: 'B' },
];

// Default hero image
const defaultHeroImage = '/images/products/rwood-perf/rWood-Perf_hero.jpg';

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
    companyName: '', firstName: '', lastName: '', email: '', phone: '', position: '', companyType: '',
  });
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ companyName: '', firstName: '', lastName: '', email: '', phone: '', position: '', companyType: '' });
      setConsentChecked(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consentChecked) { onSubmit(formData); }
  };

  if (!isOpen) return null;

  const displayName = downloadFile?.split('/').pop()?.replace('.pdf', '').replace(/-/g, ' ') || 'Document';

  const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 22, 40, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 99999 };
  const modalStyle: React.CSSProperties = { backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '540px', width: '100%', maxHeight: '90vh', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', display: 'flex', flexDirection: 'column' };
  const headerStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)', padding: '2rem 2.5rem', position: 'relative', overflow: 'hidden', flexShrink: 0 };
  const closeButtonStyle: React.CSSProperties = { position: 'absolute', top: '1rem', right: '1rem', width: '36px', height: '36px', background: 'rgba(255, 255, 255, 0.15)', border: 'none', borderRadius: '50%', color: 'white', fontSize: '1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 };
  const bodyStyle: React.CSSProperties = { padding: '1.5rem 2.5rem', overflowY: 'auto', flex: 1 };
  const footerStyle: React.CSSProperties = { padding: '1rem 2.5rem 2rem', borderTop: '1px solid #e8ecf0', backgroundColor: '#ffffff', flexShrink: 0 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.9rem 1rem', border: '2px solid #e8ecf0', borderRadius: '10px', fontSize: '0.95rem', background: '#fafbfc', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { fontSize: '0.85rem', fontWeight: 600, color: '#0a1628', display: 'block', marginBottom: '0.4rem' };
  const submitButtonStyle: React.CSSProperties = { width: '100%', padding: '1rem 2rem', background: 'linear-gradient(135deg, #197FC7 0%, #125a8c 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: isSubmitting || !consentChecked ? 'not-allowed' : 'pointer', opacity: isSubmitting || !consentChecked ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '200px', height: '200px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '50%' }} />
          <button style={closeButtonStyle} onClick={onClose}>✕</button>
          <div style={{ width: '52px', height: '52px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem', position: 'relative', zIndex: 1 }}>Download Technical Documentation</h3>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, position: 'relative', zIndex: 1 }}>Fill in your details to access our product specifications</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.2)', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', color: 'white', marginTop: '0.75rem', position: 'relative', zIndex: 1, textTransform: 'capitalize' }}>📄 {displayName}</div>
        </div>

        <div style={bodyStyle}>
          <form id="lead-form" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Company Name <span style={{ color: '#e53935' }}>*</span></label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter your company name" required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={labelStyle}>First Name <span style={{ color: '#e53935' }}>*</span></label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required style={inputStyle} /></div>
              <div><label style={labelStyle}>Last Name <span style={{ color: '#e53935' }}>*</span></label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><label style={labelStyle}>Email Address <span style={{ color: '#e53935' }}>*</span></label><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required style={inputStyle} /></div>
              <div><label style={labelStyle}>Phone Number <span style={{ color: '#e53935' }}>*</span></label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+32 XXX XX XX XX" required style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Position / Role <span style={{ color: '#e53935' }}>*</span></label>
                <select name="position" value={formData.position} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select...</option><option value="owner">Owner / CEO</option><option value="director">Director / Manager</option><option value="architect">Architect</option><option value="designer">Designer</option><option value="engineer">Engineer</option><option value="project-manager">Project Manager</option><option value="procurement">Procurement / Purchasing</option><option value="consultant">Consultant</option><option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Type of Company <span style={{ color: '#e53935' }}>*</span></label>
                <select name="companyType" value={formData.companyType} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select...</option><option value="architecture">Architecture Firm</option><option value="interior-design">Interior Design</option><option value="construction">Construction Company</option><option value="acoustic-consultant">Acoustic Consultant</option><option value="real-estate">Real Estate / Property</option><option value="corporate">Corporate / Office</option><option value="hospitality">Hospitality / Hotels</option><option value="education">Education / Schools</option><option value="healthcare">Healthcare</option><option value="retail">Retail</option><option value="other">Other</option>
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
            {isSubmitting ? (<><span style={{ width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Processing...</>) : (<><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download Now</>)}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

export default function RWoodPerfProductPage() {
  const t = useTranslations('products.rwood-perf');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFinish, setSelectedFinish] = useState<typeof woodFinishOptions[0] | null>(null);
  const [selectedCore, setSelectedCore] = useState(coreColourOptions[0]);
  const [selectedPerforation, setSelectedPerforation] = useState(perforationOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const currentHeroImage = selectedFinish ? selectedFinish.image : defaultHeroImage;

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rwood-perf/product-data-sheet.pdf' },
    { id: 'installation-guide', name: 'Installation Guide', icon: '🔧', file: '/documents/rwood-perf/installation-guide.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/rwood-perf/acoustic-test-report.pdf' },
    { id: 'perforation-patterns', name: 'Perforation Patterns', icon: '🔘', file: '/documents/rwood-perf/perforation-patterns.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/rwood-perf/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rwood-perf/sustainability-declaration.pdf' },
  ];

  const handleDownloadClick = (fileUrl: string) => { setSelectedDownload(fileUrl); setIsModalOpen(true); };
  const handleFinishSelect = (finish: typeof woodFinishOptions[0]) => { if (!selectedFinish || finish.id !== selectedFinish.id) { setIsImageLoading(true); setSelectedFinish(finish); } };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, downloadedFile: selectedDownload.split('/').pop(), source: 'rWood - Perf Product Page' }) });
      if (response.ok) { setIsModalOpen(false); const link = document.createElement('a'); link.href = selectedDownload; link.download = selectedDownload.split('/').pop() || 'download.pdf'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } else { alert('Something went wrong. Please try again.'); }
    } catch (error) { console.error('Error submitting lead:', error); alert('Something went wrong. Please try again.'); } finally { setIsSubmitting(false); }
  };

  const navItems = [
    { id: 'overview', label: 'Overview' }, { id: 'perforations', label: 'Perforations' }, { id: 'finishes', label: 'Finishes' }, { id: 'acoustics', label: 'Acoustics' }, { id: 'installation', label: 'Installation' }, { id: 'specs', label: 'Specifications' }, { id: 'gallery', label: 'Gallery' }, { id: 'downloads', label: 'Downloads' },
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
    <div className="rwood-perf-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">PERFORATED ACOUSTIC WOOD PANELS</span>
          <h1>rWood - Perf</h1>
          <p className="hero-tagline">Precision Perforations, Maximum Absorption</p>
          <p className="hero-description">
            High-performance drilled acoustic panels combining natural wood beauty with
            outstanding sound absorption. A large open area and non-combustible core
            deliver the highest levels of acoustic control and fire safety for demanding
            public spaces.
          </p>
          <div className="hero-usps">
            <div className="usp"><span className="usp-icon">🔘</span><span className="usp-text">Round Perforations</span></div>
            <div className="usp"><span className="usp-icon">🔇</span><span className="usp-text">Up to Class A</span></div>
            <div className="usp"><span className="usp-icon">🔥</span><span className="usp-text">A2-s1, d0 Fire Rated</span></div>
          </div>
          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary">Request a Quote</Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">View Specifications</a>
          </div>
          <p className="hero-price">Starting from <strong>€139</strong> per panel excl. VAT</p>
        </div>
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image src={currentHeroImage} alt={`rWood - Perf acoustic panel${selectedFinish ? ` in ${selectedFinish.name}` : ''}`} fill style={{ objectFit: 'cover' }} priority onLoad={() => setIsImageLoading(false)} />
            </div>
            {isImageLoading && (<div className="image-loading-overlay"><div className="loading-spinner"></div></div>)}
          </div>
          <div className="finish-selector">
            <span className="selector-label">Select Wood Veneer</span>
            <div className="finish-options">
              {woodFinishOptions.map((finish) => (
                <button key={finish.id} className={`finish-option ${selectedFinish?.id === finish.id ? 'active' : ''}`} onClick={() => handleFinishSelect(finish)} title={finish.name} aria-label={`Select ${finish.name} finish`}>
                  <span className="finish-swatch" style={{ backgroundImage: `url(${finish.swatch})` }} />
                  {selectedFinish?.id === finish.id && (<span className={`finish-check ${finish.isDark ? 'on-dark' : 'on-light'}`}>✓</span>)}
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
          {navItems.map((item) => (<button key={item.id} className={`nav-item ${activeSection === item.id ? 'active' : ''}`} onClick={() => scrollToSection(item.id)}>{item.label}</button>))}
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview" className="content-section overview-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image src="/images/products/rwood-perf/overview-detail.webp" alt="rWood - Perf panel close-up showing round perforations" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">PROVEN PERFORMANCE</span>
            <h2>The Classic Acoustic Solution</h2>
            <p>rWood - Perf panels are one of the most effective and popular solutions for acoustic walls and ceilings. The precisely drilled round perforations create a large open area that guarantees high levels of sound absorption, while premium wood veneer ensures a natural, warm appearance.</p>
            <p>Combined with a non-combustible fibre gypsum core and over-veneered edges for seamless joints, these panels are engineered for the highest demands in large public spaces—from atriums and concert halls to offices and schools.</p>
            <ul className="feature-list">
              <li><span className="check">✓</span>Up to 19.6% open area for maximum absorption</li>
              <li><span className="check">✓</span>Non-combustible fibre gypsum core (A2-s1, d0)</li>
              <li><span className="check">✓</span>Over-veneered edges for seamless joints</li>
              <li><span className="check">✓</span>Light or dark core for pattern discretion</li>
              <li><span className="check">✓</span>Custom formats up to 3000 × 1200 mm</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Perforations Section */}
      <section id="perforations" className="content-section perforations-section dark">
        <div className="perforations-header">
          <span className="section-tag">PERFORATION PATTERNS</span>
          <h2>Choose Your Pattern</h2>
          <p>Four drilled perforation patterns with calibrated acoustic properties. From maximum open area for demanding acoustic spaces to more discreet patterns that prioritize visual refinement.</p>
        </div>
        <div className="perforations-grid">
          {perforationOptions.map((perf) => (
            <div key={perf.id} className={`perforation-card ${selectedPerforation.id === perf.id ? 'active' : ''}`} onClick={() => setSelectedPerforation(perf)}>
              <div className="perforation-visual">
                <div className="perf-preview">
                  <div className="perf-surface">
                    <div className={`perf-dots ${perf.id}`}>
                      {[...Array(perf.id === 'pd8' ? 16 : perf.id === 'pd6' ? 25 : perf.id === 'pd4' ? 36 : 49)].map((_, i) => (<span key={i} className="dot" />))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="perforation-info">
                <h4>{perf.name}</h4>
                <span className="perf-hole-size">⌀ {perf.holeSize}</span>
                <p>{perf.description}</p>
                <div className="perf-meta">
                  <span className="perf-open-area">{perf.openArea} open</span>
                  <span className="perf-class">Class {perf.acousticClass}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected perforation detail */}
        <div className="perforation-detail">
          <div className="detail-visual">
            <div className="magnify-circle">
              <div className={`magnified-perf ${selectedPerforation.id}`}>
                {[...Array(selectedPerforation.id === 'pd8' ? 4 : selectedPerforation.id === 'pd6' ? 9 : selectedPerforation.id === 'pd4' ? 9 : 16)].map((_, i) => (<span key={i} className="dot" />))}
              </div>
              <span className="magnify-label">Actual scale</span>
            </div>
          </div>
          <div className="detail-info">
            <h3>{selectedPerforation.name} Perforation Pattern</h3>
            <div className="detail-stats">
              <div className="detail-stat"><span className="stat-value">⌀ {selectedPerforation.holeSize}</span><span className="stat-label">Hole diameter</span></div>
              <div className="detail-stat"><span className="stat-value">{selectedPerforation.spacing}</span><span className="stat-label">Centre spacing</span></div>
              <div className="detail-stat"><span className="stat-value">{selectedPerforation.openArea}</span><span className="stat-label">Open area</span></div>
              <div className="detail-stat"><span className="stat-value">Class {selectedPerforation.acousticClass}</span><span className="stat-label">Absorption</span></div>
            </div>
            <p className="detail-desc">
              {selectedPerforation.description}. {selectedPerforation.id === 'pd8' ? 'The largest open area for maximum sound absorption. Ideal for atriums, auditoriums, and spaces requiring the highest acoustic control.' : selectedPerforation.id === 'pd6' ? 'An excellent balance between acoustic performance and visual subtlety. The most versatile pattern for offices, education, and healthcare.' : selectedPerforation.id === 'pd4' ? 'A more refined appearance with excellent absorption. Well-suited for meeting rooms, hotels, and spaces where aesthetics are paramount.' : 'The most discreet drilled pattern. Perforations are barely noticeable while still delivering meaningful acoustic improvement.'}
            </p>
          </div>
        </div>

        {/* Core colour selection */}
        <div className="core-colour-section">
          <h3>Core Colour</h3>
          <p>Match the core colour to your veneer to make perforations less noticeable, or choose a contrasting core for a decorative effect.</p>
          <div className="core-selector">
            {coreColourOptions.map((core) => (
              <button key={core.id} className={`core-option ${selectedCore.id === core.id ? 'active' : ''}`} onClick={() => setSelectedCore(core)}>
                <span className="core-swatch" style={{ backgroundColor: core.color }} />
                <div className="core-text"><span className="core-name">{core.name}</span><span className="core-desc">{core.description}</span></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Finishes Section */}
      <section id="finishes" className="content-section finishes-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">SURFACES</span>
            <h2>Premium Wood Surfaces</h2>
            <p>Our veneer masters handpick the finest sheets for each panel surface. Every rWood - Perf panel is produced with over-veneered edges—a traditional manufacturing technique ensuring seamless joints and a continuous, homogeneous surface across multiple panels.</p>
            <div className="finish-categories">
              <div className="finish-category"><h4>Nature Veneers</h4><p>Lively variations and characteristic expression associated with each wood species. Natural beauty with authentic grain patterns.</p></div>
              <div className="finish-category"><h4>Gemini Veneers</h4><p>Even colour tone and structure for a more harmonious, uniform appearance across large surfaces.</p></div>
            </div>
            <div className="finish-extras">
              <h4>Surface Finishes</h4>
              <div className="extras-grid">
                <div className="extra-item"><span className="extra-icon">🎨</span><div><strong>Pigmented Lacquer</strong><p>Custom colour tones from transparent to solid in any colour</p></div></div>
                <div className="extra-item"><span className="extra-icon">✨</span><div><strong>Gloss Levels</strong><p>Multi-layer UV-cured lacquer from super matte to high gloss</p></div></div>
                <div className="extra-item"><span className="extra-icon">🖨️</span><div><strong>Printed Surfaces</strong><p>Custom graphics spread over multiple panels for large-format designs</p></div></div>
                <div className="extra-item"><span className="extra-icon">◻️</span><div><strong>HPL Laminate</strong><p>High-pressure laminate for extra durability in demanding areas</p></div></div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image src="/images/products/rwood-perf/surface-detail.jpg" alt="Perforated wood panel veneer surface detail" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Acoustic Performance Section */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="acoustics-header">
          <span className="section-tag">PERFORMANCE</span>
          <h2>Engineered for Sound</h2>
          <p>The large open area created by precision-drilled perforations allows sound waves to enter the panel where they are absorbed by the cavity behind. Combined with mineral wool insulation, rWood - Perf delivers outstanding broadband absorption across the full frequency spectrum.</p>
        </div>
        <div className="acoustics-main-grid">
          <div className="exploded-diagram">
            <div className="diagram-title">Panel Cross-Section</div>
            <div className="exploded-layers">
              <div className="exploded-layer">
                <div className="layer-visual veneer-layer"><div className="wood-grain"></div><div className="drill-holes">{[...Array(8)].map((_, i) => <span key={i} className="drill-hole" />)}</div></div>
                <div className="layer-info"><span className="layer-name">Wood Veneer + Drilled Perforations</span><span className="layer-desc">Over-veneered, precision-drilled surface</span></div>
              </div>
              <div className="layer-connector"><svg viewBox="0 0 24 40" fill="none"><path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/></svg></div>
              <div className="exploded-layer">
                <div className="layer-visual core-layer"><div className="core-texture"></div></div>
                <div className="layer-info"><span className="layer-name">Fibre Gypsum Core</span><span className="layer-desc">Non-combustible, high-density (A2 rated)</span></div>
              </div>
              <div className="layer-connector"><svg viewBox="0 0 24 40" fill="none"><path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/></svg></div>
              <div className="exploded-layer">
                <div className="layer-visual fleece-layer"></div>
                <div className="layer-info"><span className="layer-name">Acoustic Fleece</span><span className="layer-desc">Prevents mineral wool fibres passing through</span></div>
              </div>
              <div className="layer-connector"><svg viewBox="0 0 24 40" fill="none"><path d="M12 0 L12 40" stroke="#197FC7" strokeWidth="2" strokeDasharray="4 4"/></svg></div>
              <div className="exploded-layer">
                <div className="layer-visual insulation-layer"><div className="insulation-fibers"></div></div>
                <div className="layer-info"><span className="layer-name">Mineral Wool Insulation</span><span className="layer-desc">50mm for optimal broadband absorption</span></div>
              </div>
            </div>
            <div className="sound-waves">
              <div className="wave wave-1"></div><div className="wave wave-2"></div><div className="wave wave-3"></div>
              <span className="wave-label">Sound waves absorbed</span>
            </div>
          </div>
          <div className="performance-metrics">
            <div className="main-rating">
              <div className="rating-ring">
                <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="#e8f4fc" strokeWidth="8"/><circle cx="60" cy="60" r="54" fill="none" stroke="#197FC7" strokeWidth="8" strokeLinecap="round" strokeDasharray="305" strokeDashoffset="60" transform="rotate(-90 60 60)"/></svg>
                <div className="rating-content"><span className="rating-value">αw 0.80</span><span className="rating-label">Absorption</span></div>
              </div>
              <div className="rating-badge"><span className="badge-icon">★</span><span className="badge-text">Up to Class A</span></div>
            </div>
            <div className="metric-cards">
              <div className="metric-card"><div className="metric-value">A2-s1, d0</div><div className="metric-label">Fire Rating</div></div>
              <div className="metric-card"><div className="metric-value">19.6%</div><div className="metric-label">Max Open Area</div></div>
            </div>
            <div className="metric-cards">
              <div className="metric-card"><div className="metric-value">ISO 354</div><div className="metric-label">Test Standard</div></div>
              <div className="metric-card"><div className="metric-value">Broadband</div><div className="metric-label">Frequency Range</div></div>
            </div>
            <div className="certification-note">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#197FC7" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>Independently tested &amp; certified to ISO 11654</span>
            </div>
          </div>
        </div>
        <div className="acoustics-benefits">
          <div className="benefit"><div className="benefit-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg></div><h4>Broadband Absorption</h4><p>Effective across the full frequency spectrum, from low to high</p></div>
          <div className="benefit"><div className="benefit-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><h4>Tunable Performance</h4><p>Four perforation patterns for tailored acoustic solutions</p></div>
          <div className="benefit"><div className="benefit-icon-wrap"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><h4>Highest Fire Safety</h4><p>A2-s1, d0—the highest achievable fire class for perforated wood</p></div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">INSTALLATION SYSTEM</span>
            <h2>Concealed Mounting</h2>
            <p>rWood - Perf panels are installed with a concealed clip system designed for precision, speed, and a flawless end result. The system ensures zero-spaced joints and perfectly aligned perforation patterns across multiple panels.</p>
            <div className="installation-steps">
              <div className="install-step"><div className="step-number">1</div><div className="step-content"><h4>Mount Subframe</h4><p>Install aluminium rails to wall or ceiling structure</p></div></div>
              <div className="install-step"><div className="step-number">2</div><div className="step-content"><h4>Place Insulation</h4><p>Add mineral wool for optimal acoustic performance</p></div></div>
              <div className="install-step"><div className="step-number">3</div><div className="step-content"><h4>Clip Panels</h4><p>Concealed clip system for tool-free, zero-gap mounting</p></div></div>
              <div className="install-step"><div className="step-number">4</div><div className="step-content"><h4>Perfect Alignment</h4><p>In-line perforation patterns with seamless over-veneered joints</p></div></div>
            </div>
          </div>
          <div className="section-image"><div className="image-container"><Image src="/images/products/rwood-perf/installation-detail.jpg" alt="rWood - Perf panel concealed mounting system" fill style={{ objectFit: 'cover' }} /></div></div>
        </div>
      </section>

      {/* Bespoke Section */}
      <section className="content-section bespoke-section">
        <div className="section-grid">
          <div className="section-image"><div className="image-container"><Image src="/images/products/rwood-perf/bespoke-atrium.jpg" alt="Custom perforated panels in large atrium installation" fill style={{ objectFit: 'cover' }} /></div></div>
          <div className="section-content">
            <span className="section-tag">DESIGN FREEDOM</span>
            <h2>Panels to Your Specification</h2>
            <p>rWood - Perf panels can be produced according to your drawings. Custom formats, mixed perforation zones, and bespoke finishes allow you to create unique acoustic solutions for any architectural vision.</p>
            <div className="bespoke-features">
              <div className="bespoke-item"><span className="bespoke-icon">📐</span><div><h4>Custom Formats</h4><p>Wall panels up to 3000 × 1200 mm. Ceiling panels up to 3000 × 600 mm. Non-standard shapes available on request.</p></div></div>
              <div className="bespoke-item"><span className="bespoke-icon">🔘</span><div><h4>Mixed Perforation Zones</h4><p>Combine perforated and non-perforated zones within a single panel for integrated design features.</p></div></div>
              <div className="bespoke-item"><span className="bespoke-icon">🖨️</span><div><h4>Printed Surfaces</h4><p>Spread custom graphics across multiple panels for large-format wall and ceiling art.</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="content-section sustainability-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Built to Last, Built Responsibly</h2>
            <p>rWood - Perf combines durable, natural materials with responsible sourcing. The non-combustible mineral core, sustainably harvested veneers, and European production create panels designed for long life and low environmental impact.</p>
            <div className="sustainability-features">
              <div className="sustain-item"><span className="sustain-icon">🌲</span><div><h4>FSC® Certified Veneer</h4><p>Wood from responsibly managed forests</p></div></div>
              <div className="sustain-item"><span className="sustain-icon">🏗️</span><div><h4>Mineral Core</h4><p>Natural fibre gypsum—durable and non-combustible</p></div></div>
              <div className="sustain-item"><span className="sustain-icon">🇪🇺</span><div><h4>European Production</h4><p>Short supply chains, lower transport emissions</p></div></div>
              <div className="sustain-item"><span className="sustain-icon">📋</span><div><h4>Low Emissions</h4><p>E1-rated VOC, contributing to healthier interiors</p></div></div>
            </div>
          </div>
          <div className="section-image"><div className="image-container"><Image src="/images/products/rwood-perf/sustainability.webp" alt="Sustainable wood sourcing" fill style={{ objectFit: 'cover' }} /></div></div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specs" className="content-section specs-section">
        <div className="specs-header"><span className="section-tag">TECHNICAL</span><h2>Specifications</h2></div>
        <div className="specs-grid">
          <div className="spec-card"><h4>Dimensions — Walls</h4><table><tbody>
            <tr><td>Max panel size</td><td>3000 × 1200 mm</td></tr>
            <tr><td>Panels &gt; 2400mm length</td><td>Max 600 mm wide</td></tr>
            <tr><td>Thickness (veneer)</td><td>13.2 mm</td></tr>
            <tr><td>Thickness (HPL)</td><td>18 mm</td></tr>
            <tr><td>Weight</td><td>~12 kg/m²</td></tr>
          </tbody></table></div>
          <div className="spec-card"><h4>Dimensions — Ceilings</h4><table><tbody>
            <tr><td>Recommended max</td><td>1800 × 600 mm</td></tr>
            <tr><td>Bespoke max</td><td>3000 × 600 mm</td></tr>
            <tr><td>Thickness</td><td>13.2 mm</td></tr>
            <tr><td>Custom sizes</td><td>Available on request</td></tr>
          </tbody></table></div>
          <div className="spec-card"><h4>Perforation Options</h4><table><tbody>
            <tr><td>PD8 (⌀ 8mm)</td><td>19.6% open — Class A</td></tr>
            <tr><td>PD6 (⌀ 6mm)</td><td>16.4% open — Class A</td></tr>
            <tr><td>PD4 (⌀ 4mm)</td><td>14.2% open — Class B</td></tr>
            <tr><td>PD3 (⌀ 3mm)</td><td>11.8% open — Class B</td></tr>
          </tbody></table></div>
          <div className="spec-card"><h4>Fire Safety</h4><table><tbody>
            <tr><td>Panel (Euroclass)</td><td>A2-s1, d0</td></tr>
            <tr><td>ASTM rating</td><td>Class A</td></tr>
            <tr><td>Core material</td><td>Non-combustible</td></tr>
            <tr><td>Test standard</td><td>EN 13501</td></tr>
          </tbody></table></div>
          <div className="spec-card"><h4>Materials</h4><table><tbody>
            <tr><td>Surface</td><td>A-grade Veneer / HPL</td></tr>
            <tr><td>Core</td><td>Fibre gypsum (light / dark)</td></tr>
            <tr><td>Backing</td><td>Acoustic fleece</td></tr>
            <tr><td>Edges</td><td>Over-veneered</td></tr>
          </tbody></table></div>
          <div className="spec-card"><h4>Acoustic Performance</h4><table><tbody>
            <tr><td>PD8 + 50mm wool</td><td>αw 0.80 (Class A)</td></tr>
            <tr><td>PD6 + 50mm wool</td><td>αw 0.75 (Class A)</td></tr>
            <tr><td>Absorption class range</td><td>A, B, D</td></tr>
            <tr><td>Test standard</td><td>ISO 354 / ISO 11654</td></tr>
          </tbody></table></div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="content-section gallery-section">
        <div className="gallery-header"><span className="section-tag">INSPIRATION</span><h2>Projects &amp; Installations</h2></div>
        <div className="gallery-grid">
          {[1, 2, 3, 4, 5].map((i) => (<div key={i} className="gallery-item"><div className="image-container gallery"><Image src={`/images/products/rwood-perf/gallery-${i}.webp`} alt={`rWood - Perf installation example ${i}`} fill style={{ objectFit: 'cover' }} /></div></div>))}
        </div>
      </section>

      {/* Downloads Section */}
      <section id="downloads" className="content-section downloads-section">
        <div className="downloads-header"><span className="section-tag">RESOURCES</span><h2>Downloads</h2></div>
        <div className="downloads-grid">
          {downloads.map((download) => (<button key={download.id} onClick={() => handleDownloadClick(download.file)} className="download-card"><div className="download-icon">{download.icon}</div><div className="download-info"><h4>{download.name}</h4><span>PDF</span></div><span className="download-arrow">↓</span></button>))}
        </div>
      </section>

      {/* Accessories Section */}
      <section className="content-section accessories-section dark">
        <div className="accessories-header"><span className="section-tag">COMPLETE THE LOOK</span><h2>Accessories</h2><p>Professional finishing elements for a flawless result</p></div>
        <div className="accessories-grid">
          <div className="accessory-card"><div className="accessory-icon">📏</div><h4>Edge Profiles</h4><p>Matching profiles for clean panel terminations</p></div>
          <div className="accessory-card"><div className="accessory-icon">🔲</div><h4>Corner Solutions</h4><p>Seamless internal and external corner transitions</p></div>
          <div className="accessory-card"><div className="accessory-icon">⚙️</div><h4>Mounting Rails</h4><p>Concealed aluminium subframe system</p></div>
          <div className="accessory-card"><div className="accessory-icon">🧱</div><h4>Mineral Wool</h4><p>50mm insulation for optimal acoustic performance</p></div>
        </div>
      </section>

      {/* Lead Generation Modal */}
      <LeadGenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleLeadSubmit} downloadFile={selectedDownload} isSubmitting={isSubmitting} />

      {/* CTA Section */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Space?</h2>
          <p>Get a personalized quote for your project. Our team will help you select the perfect perforation, veneer, and finish combination.</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large">Request a Quote</Link>
            <a href="tel:+3232846818" className="btn-secondary large">Call Us: +32 3 284 68 18</a>
          </div>
          <p className="cta-note">Free samples available • Made in Europe • FSC® Certified • A2-s1, d0 Fire Rated</p>
        </div>
      </section>

      <style jsx>{`
        .rwood-perf-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --wood-warm: #8B6914;
          --wood-light: #D4A954;
        }

        /* HERO */
        .product-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; padding: 8rem 4rem 4rem; background: linear-gradient(135deg, var(--cream) 0%, white 100%); min-height: 80vh; align-items: center; }
        .product-tag { display: inline-block; background: var(--brand-blue); color: white; font-size: 0.75rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
        .hero-content h1 { font-size: 4.5rem; color: var(--deep-blue); margin-bottom: 0.5rem; letter-spacing: -2px; }
        .hero-tagline { font-size: 1.5rem; color: var(--wood-warm); font-weight: 500; margin-bottom: 1.5rem; }
        .hero-description { font-size: 1.1rem; color: #555; line-height: 1.8; margin-bottom: 2rem; max-width: 500px; }
        .hero-usps { display: flex; gap: 2rem; margin-bottom: 2rem; }
        .usp { display: flex; align-items: center; gap: 0.5rem; }
        .usp-icon { font-size: 1.5rem; }
        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }
        .hero-ctas { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .btn-primary { display: inline-flex; align-items: center; padding: 1rem 2rem; background: var(--brand-blue); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; transition: all 0.3s ease; border: none; cursor: pointer; }
        .btn-primary:hover { background: var(--brand-blue-dark); transform: translateY(-2px); }
        .btn-primary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }
        .btn-secondary { display: inline-flex; align-items: center; padding: 1rem 2rem; background: transparent; color: var(--deep-blue); text-decoration: none; border-radius: 50px; font-weight: 600; border: 2px solid var(--deep-blue); transition: all 0.3s ease; cursor: pointer; }
        .btn-secondary:hover { background: var(--deep-blue); color: white; }
        .btn-secondary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }
        .hero-price { font-size: 0.95rem; color: #666; }
        .hero-price strong { color: var(--deep-blue); font-size: 1.2rem; }
        .hero-image { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }
        .image-container { position: relative; width: 100%; max-width: 600px; aspect-ratio: 4/5; border-radius: 24px; overflow: hidden; background: var(--cream); }
        .image-wrapper { position: absolute; inset: 0; transition: opacity 0.3s ease; }
        .image-wrapper.loading { opacity: 0.7; }
        .image-loading-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.5); }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--brand-blue-pale); border-top-color: var(--brand-blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* FINISH SELECTOR */
        .finish-selector { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 1.25rem 2rem; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
        .selector-label { font-size: 0.8rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .finish-options { display: flex; gap: 0.6rem; }
        .finish-option { position: relative; width: 40px; height: 40px; border-radius: 8px; border: 3px solid transparent; background: none; padding: 0; cursor: pointer; transition: all 0.2s ease; }
        .finish-option:hover { transform: scale(1.1); }
        .finish-option.active { border-color: var(--brand-blue); box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue); }
        .finish-swatch { display: block; width: 100%; height: 100%; border-radius: 5px; border: 1px solid rgba(0,0,0,0.1); background-size: cover; background-position: center; }
        .finish-check { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold; }
        .finish-check.on-dark { color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
        .finish-check.on-light { color: var(--deep-blue); text-shadow: 0 1px 2px rgba(255,255,255,0.5); }
        .selected-finish-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }
        .image-container.gallery { aspect-ratio: 1; }
        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* STICKY NAV */
        .product-nav { position: sticky; top: 80px; z-index: 90; background: white; border-bottom: 1px solid #eee; padding: 0 4rem; }
        .nav-inner { display: flex; gap: 0; max-width: 1200px; margin: 0 auto; }
        .nav-item { padding: 1.25rem; background: none; border: none; font-size: 0.9rem; font-weight: 500; color: #666; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s ease; }
        .nav-item:hover { color: var(--brand-blue); }
        .nav-item.active { color: var(--brand-blue); border-bottom-color: var(--brand-blue); }

        /* CONTENT SECTIONS */
        .content-section { padding: 6rem 4rem; }
        .content-section.dark { background: var(--deep-blue); color: white; }
        .content-section.dark .section-content h2 { color: white; }
        .content-section.dark .section-content p { color: rgba(255,255,255,0.8); }
        .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; max-width: 1200px; margin: 0 auto; align-items: center; }
        .section-grid.reverse { direction: rtl; }
        .section-grid.reverse > * { direction: ltr; }
        .section-tag { display: inline-block; background: var(--brand-blue-pale); color: var(--brand-blue); font-size: 0.75rem; font-weight: 600; padding: 0.4rem 0.8rem; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }
        .content-section.dark .section-tag { background: rgba(25,127,199,0.3); color: #7ec8f5; }
        .section-content h2 { font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1.5rem; letter-spacing: -1px; }
        .section-content p { font-size: 1.1rem; color: #555; line-height: 1.8; margin-bottom: 1.5rem; }
        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; font-size: 1rem; color: var(--charcoal); }
        .content-section.dark .feature-list li { color: rgba(255,255,255,0.9); }
        .check { color: var(--brand-blue); font-weight: bold; }

        /* PERFORATIONS */
        .perforations-header { text-align: center; max-width: 700px; margin: 0 auto 4rem; }
        .perforations-header h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .perforations-header p { font-size: 1.1rem; color: rgba(255,255,255,0.8); line-height: 1.8; }
        .perforations-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto 3rem; }
        .perforation-card { background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; cursor: pointer; transition: all 0.3s ease; }
        .perforation-card:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
        .perforation-card.active { background: rgba(25,127,199,0.2); border-color: var(--brand-blue); }
        .perforation-visual { height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .perf-preview { width: 80px; height: 80px; border-radius: 12px; overflow: hidden; }
        .perf-surface { width: 100%; height: 100%; background: linear-gradient(135deg, #c4a77d 0%, #b89860 100%); display: flex; align-items: center; justify-content: center; }
        .perf-dots { display: grid; gap: 2px; justify-items: center; align-items: center; padding: 6px; }
        .perf-dots.pd8 { grid-template-columns: repeat(4, 1fr); }
        .perf-dots.pd8 .dot { width: 10px; height: 10px; border-radius: 50%; background: rgba(0,0,0,0.5); }
        .perf-dots.pd6 { grid-template-columns: repeat(5, 1fr); }
        .perf-dots.pd6 .dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(0,0,0,0.5); }
        .perf-dots.pd4 { grid-template-columns: repeat(6, 1fr); }
        .perf-dots.pd4 .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(0,0,0,0.45); }
        .perf-dots.pd3 { grid-template-columns: repeat(7, 1fr); }
        .perf-dots.pd3 .dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(0,0,0,0.4); }
        .perforation-info { text-align: center; }
        .perforation-info h4 { color: white; font-size: 1.1rem; margin-bottom: 0.25rem; }
        .perf-hole-size { font-size: 0.85rem; color: #7ec8f5; font-weight: 600; }
        .perforation-info p { font-size: 0.85rem; color: rgba(255,255,255,0.6); margin: 0.5rem 0; }
        .perf-meta { display: flex; justify-content: center; gap: 1rem; margin-top: 0.5rem; }
        .perf-open-area { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
        .perf-class { font-size: 0.8rem; color: #7ec8f5; font-weight: 600; background: rgba(25,127,199,0.2); padding: 0.15rem 0.5rem; border-radius: 10px; }

        /* PERFORATION DETAIL */
        .perforation-detail { display: grid; grid-template-columns: auto 1fr; gap: 3rem; max-width: 900px; margin: 0 auto 3rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 2.5rem; align-items: center; }
        .magnify-circle { width: 160px; height: 160px; border-radius: 50%; border: 3px solid var(--brand-blue); overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #c4a77d 0%, #b89860 100%); }
        .magnified-perf { display: grid; gap: 6px; justify-items: center; align-items: center; padding: 20px; }
        .magnified-perf.pd8 { grid-template-columns: repeat(2, 1fr); }
        .magnified-perf.pd8 .dot { width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.5); }
        .magnified-perf.pd6 { grid-template-columns: repeat(3, 1fr); }
        .magnified-perf.pd6 .dot { width: 20px; height: 20px; border-radius: 50%; background: rgba(0,0,0,0.5); }
        .magnified-perf.pd4 { grid-template-columns: repeat(3, 1fr); }
        .magnified-perf.pd4 .dot { width: 16px; height: 16px; border-radius: 50%; background: rgba(0,0,0,0.5); }
        .magnified-perf.pd3 { grid-template-columns: repeat(4, 1fr); }
        .magnified-perf.pd3 .dot { width: 12px; height: 12px; border-radius: 50%; background: rgba(0,0,0,0.45); }
        .magnify-label { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: 0.65rem; color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
        .detail-info h3 { color: white; font-size: 1.5rem; margin-bottom: 1.5rem; }
        .detail-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .detail-stat { text-align: center; padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 12px; }
        .stat-value { display: block; font-size: 1rem; font-weight: 700; color: #7ec8f5; margin-bottom: 0.25rem; }
        .stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-desc { font-size: 0.95rem; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0; }

        /* CORE COLOUR */
        .core-colour-section { max-width: 700px; margin: 0 auto; text-align: center; }
        .core-colour-section h3 { color: white; font-size: 1.25rem; margin-bottom: 0.5rem; }
        .core-colour-section > p { color: rgba(255,255,255,0.7); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6; }
        .core-selector { display: flex; gap: 1rem; justify-content: center; }
        .core-option { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.15); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; text-align: left; }
        .core-option:hover { border-color: rgba(255,255,255,0.3); }
        .core-option.active { border-color: var(--brand-blue); background: rgba(25,127,199,0.15); }
        .core-swatch { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); flex-shrink: 0; }
        .core-text { display: flex; flex-direction: column; }
        .core-name { font-size: 0.95rem; font-weight: 600; color: white; }
        .core-desc { font-size: 0.8rem; color: rgba(255,255,255,0.5); }

        /* FINISHES */
        .finish-categories { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .finish-category { padding: 1.5rem; background: var(--cream); border-radius: 12px; }
        .finish-category h4 { color: var(--deep-blue); margin-bottom: 0.5rem; }
        .finish-category p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.6; }
        .finish-extras h4 { color: var(--deep-blue); margin-bottom: 1rem; }
        .extras-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .extra-item { display: flex; align-items: flex-start; gap: 0.75rem; }
        .extra-icon { font-size: 1.25rem; flex-shrink: 0; margin-top: 2px; }
        .extra-item strong { color: var(--deep-blue); font-size: 0.95rem; }
        .extra-item p { font-size: 0.85rem; color: #666; margin: 0.25rem 0 0; }

        /* ACOUSTICS */
        .acoustics-section { background: var(--cream); }
        .acoustics-header { text-align: center; max-width: 700px; margin: 0 auto 4rem; }
        .acoustics-header h2 { font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1rem; }
        .acoustics-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }
        .acoustics-main-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; max-width: 1100px; margin: 0 auto 4rem; align-items: center; }
        .exploded-diagram { background: white; border-radius: 24px; padding: 2.5rem; box-shadow: 0 4px 24px rgba(0,0,0,0.06); position: relative; }
        .diagram-title { font-size: 0.85rem; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2rem; text-align: center; }
        .exploded-layers { display: flex; flex-direction: column; align-items: center; gap: 0; }
        .exploded-layer { display: flex; align-items: center; gap: 1.5rem; width: 100%; max-width: 400px; }
        .layer-visual { width: 180px; border-radius: 6px; flex-shrink: 0; position: relative; overflow: hidden; }
        .layer-visual.veneer-layer { background: linear-gradient(90deg, #c4a77d 0%, #d4a954 30%, #c4a77d 60%, #b89860 100%); height: 24px; }
        .layer-visual.veneer-layer .wood-grain { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(139,105,20,0.15) 8px, rgba(139,105,20,0.15) 10px); }
        .layer-visual.veneer-layer .drill-holes { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 14px; }
        .drill-hole { width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.4); }
        .layer-visual.core-layer { background: #d4d0c8; height: 40px; position: relative; }
        .core-texture { position: absolute; inset: 0; background: repeating-linear-gradient(45deg, transparent 0px, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 6px); }
        .layer-visual.fleece-layer { background: #888; height: 8px; }
        .layer-visual.insulation-layer { background: #e8d44d; height: 30px; position: relative; border-radius: 4px; }
        .insulation-fibers { position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(180,140,20,0.3) 3px, rgba(180,140,20,0.3) 4px); }
        .layer-connector { height: 20px; display: flex; justify-content: center; padding-left: 90px; }
        .layer-connector svg { width: 24px; height: 20px; }
        .layer-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .layer-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }
        .layer-desc { font-size: 0.75rem; color: #888; }
        .sound-waves { position: absolute; left: 1.5rem; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
        .wave { width: 3px; background: var(--brand-blue); border-radius: 2px; opacity: 0.6; animation: wave-pulse 1.5s ease-in-out infinite; }
        .wave-1 { animation-delay: 0s; height: 16px; }
        .wave-2 { animation-delay: 0.2s; height: 24px; }
        .wave-3 { animation-delay: 0.4s; height: 20px; }
        @keyframes wave-pulse { 0%, 100% { transform: scaleY(0.6); opacity: 0.4; } 50% { transform: scaleY(1); opacity: 0.8; } }
        .wave-label { font-size: 0.65rem; color: #888; writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); margin-top: 0.5rem; }
        .performance-metrics { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
        .main-rating { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .rating-ring { position: relative; width: 160px; height: 160px; }
        .rating-ring svg { width: 100%; height: 100%; }
        .rating-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .rating-content .rating-value { font-size: 1.75rem; font-weight: 700; color: var(--deep-blue); }
        .rating-content .rating-label { font-size: 0.85rem; color: #888; }
        .rating-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #197FC7 0%, #155d94 100%); color: white; padding: 0.5rem 1.25rem; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
        .badge-icon { font-size: 1rem; }
        .metric-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%; }
        .metric-card { background: white; padding: 1.25rem; border-radius: 12px; text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .metric-value { font-size: 1.5rem; font-weight: 700; color: var(--brand-blue); margin-bottom: 0.25rem; }
        .metric-label { font-size: 0.8rem; color: #888; }
        .certification-note { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.5rem; background: rgba(25,127,199,0.08); border-radius: 12px; font-size: 0.9rem; color: var(--deep-blue); }
        .acoustics-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1000px; margin: 0 auto; }
        .benefit { text-align: center; padding: 2.5rem 2rem; background: white; border-radius: 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.04); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .benefit:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0,0,0,0.08); }
        .benefit-icon-wrap { width: 64px; height: 64px; margin: 0 auto 1.25rem; background: var(--brand-blue-pale); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: var(--brand-blue); }
        .benefit h4 { font-size: 1.1rem; color: var(--deep-blue); margin-bottom: 0.5rem; }
        .benefit p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.6; }

        /* INSTALLATION */
        .installation-steps { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem; }
        .install-step { display: flex; align-items: flex-start; gap: 1rem; }
        .step-number { width: 40px; height: 40px; background: var(--brand-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .step-content h4 { color: white; margin: 0 0 0.25rem; }
        .step-content p { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin: 0; }

        /* BESPOKE */
        .bespoke-features { display: flex; flex-direction: column; gap: 1.5rem; }
        .bespoke-item { display: flex; align-items: flex-start; gap: 1rem; }
        .bespoke-icon { font-size: 1.5rem; flex-shrink: 0; }
        .bespoke-item h4 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .bespoke-item p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.6; }

        /* SUSTAINABILITY */
        .sustainability-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .sustain-item { display: flex; align-items: flex-start; gap: 1rem; }
        .sustain-icon { font-size: 1.5rem; flex-shrink: 0; }
        .sustain-item h4 { font-size: 1rem; color: white; margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: rgba(255,255,255,0.7); margin: 0; }

        /* SPECS */
        .specs-header { text-align: center; margin-bottom: 3rem; }
        .specs-header h2 { font-size: 2.5rem; color: var(--deep-blue); }
        .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .spec-card { background: var(--cream); padding: 1.5rem; border-radius: 16px; }
        .spec-card h4 { font-size: 1rem; color: var(--brand-blue); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .spec-card table { width: 100%; }
        .spec-card td { padding: 0.5rem 0; font-size: 0.9rem; border-bottom: 1px solid #e0e0e0; }
        .spec-card tr:last-child td { border-bottom: none; }
        .spec-card td:first-child { color: #666; }
        .spec-card td:last-child { text-align: right; font-weight: 600; color: var(--deep-blue); }

        /* GALLERY */
        .gallery-header { text-align: center; margin-bottom: 3rem; }
        .gallery-header h2 { font-size: 2.5rem; color: var(--deep-blue); }
        .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .gallery-item { border-radius: 16px; overflow: hidden; }

        /* DOWNLOADS */
        .downloads-header { text-align: center; margin-bottom: 3rem; }
        .downloads-header h2 { font-size: 2.5rem; color: var(--deep-blue); }
        .downloads-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1000px; margin: 0 auto; }
        .download-card { display: flex; align-items: center; gap: 1rem; padding: 1.5rem; background: var(--cream); border-radius: 12px; text-decoration: none; transition: all 0.3s ease; border: none; cursor: pointer; text-align: left; }
        .download-card:hover { background: var(--brand-blue-pale); transform: translateY(-2px); }
        .download-icon { font-size: 2rem; }
        .download-info h4 { font-size: 0.95rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .download-info span { font-size: 0.8rem; color: #888; }
        .download-arrow { margin-left: auto; font-size: 1.2rem; color: var(--brand-blue); }

        /* ACCESSORIES */
        .accessories-header { text-align: center; margin-bottom: 3rem; }
        .accessories-header h2 { font-size: 2.5rem; color: white; margin-bottom: 0.5rem; }
        .accessories-header p { color: rgba(255,255,255,0.7); }
        .accessories-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .accessory-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; text-align: center; }
        .accessory-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .accessory-card h4 { color: white; margin-bottom: 0.5rem; }
        .accessory-card p { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin: 0; }

        /* CTA */
        .cta-section { background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%); text-align: center; }
        .cta-content { max-width: 700px; margin: 0 auto; }
        .cta-content h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .cta-content > p { font-size: 1.1rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
        .cta-section .btn-primary { background: white; color: var(--brand-blue); }
        .cta-section .btn-primary:hover { background: var(--cream); }
        .cta-section .btn-secondary { border-color: white; color: white; }
        .cta-section .btn-secondary:hover { background: white; color: var(--brand-blue); }
        .cta-note { font-size: 0.9rem; color: rgba(255,255,255,0.7); }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .product-hero { grid-template-columns: 1fr; padding: 6rem 2rem 3rem; min-height: auto; }
          .hero-content h1 { font-size: 3rem; }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .section-grid.reverse { direction: ltr; }
          .specs-grid, .downloads-grid, .gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .perforations-grid { grid-template-columns: repeat(2, 1fr); }
          .accessories-grid { grid-template-columns: repeat(2, 1fr); }
          .finish-categories { grid-template-columns: 1fr; }
          .sustainability-features { grid-template-columns: 1fr; }
          .extras-grid { grid-template-columns: 1fr; }
          .acoustics-main-grid { grid-template-columns: 1fr; gap: 3rem; }
          .exploded-diagram { max-width: 500px; margin: 0 auto; }
          .acoustics-benefits { grid-template-columns: 1fr; max-width: 400px; }
          .sound-waves { display: none; }
          .perforation-detail { grid-template-columns: 1fr; text-align: center; }
          .magnify-circle { margin: 0 auto; }
          .detail-stats { grid-template-columns: repeat(2, 1fr); }
          .core-selector { flex-direction: column; align-items: center; }
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
          .finish-options { flex-wrap: wrap; justify-content: center; }
          .exploded-layer { flex-direction: column; gap: 0.75rem; text-align: center; }
          .layer-visual { width: 100%; max-width: 200px; }
          .layer-connector { padding-left: 0; }
          .metric-cards { grid-template-columns: 1fr; }
          .rating-ring { width: 140px; height: 140px; }
          .detail-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
