'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import Image from 'next/image';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h3>Download Document</h3>
          <p>Please fill in your details to access the download.</p>
        </div>

        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="companyName">Company Name *</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position / Role *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="e.g. Architect, Designer, Manager"
              />
            </div>
            <div className="form-group">
              <label htmlFor="companyType">Type of Company *</label>
              <select
                id="companyType"
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="architecture">Architecture Firm</option>
                <option value="interior-design">Interior Design</option>
                <option value="construction">Construction Company</option>
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

          <div className="form-consent">
            <label>
              <input type="checkbox" required />
              <span>I agree to receive communications from Re-Sound and accept the privacy policy.</span>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Download Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

interface LeadFormData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyType: string;
}

export default function InteriorProductPage() {
  const t = useTranslations('products.interior');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/interior/product-data-sheet.pdf' },
    { id: 'installation-manual', name: 'Installation Manual', icon: '📋', file: '/documents/interior/installation-manual.pdf' },
    { id: 'acoustic-test-report', name: 'Acoustic Test Report', icon: '📊', file: '/documents/interior/acoustic-test-report.pdf' },
    { id: 'color-fabric-guide', name: 'Color & Fabric Guide', icon: '🎨', file: '/documents/interior/color-fabric-guide.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/interior/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/interior/sustainability-declaration.pdf' },
  ];

  const handleDownloadClick = (fileUrl: string) => {
    setSelectedDownload(fileUrl);
    setIsModalOpen(true);
  };

  const handleLeadSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          downloadedFile: selectedDownload,
          source: 'Interior Product Page',
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
    <div className="interior-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">ACOUSTIC WALL PANELS</span>
          <h1>Interior</h1>
          <p className="hero-tagline">Modular Acoustics, Circular by Design</p>
          <p className="hero-description">
            Transform your space with Re-Sound Interior—a complete acoustic wall system 
            crafted from recycled materials. Fully customizable, easy to install, and 
            designed to be recycled at end of life.
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🔊</span>
              <span className="usp-text">αw 1.0 Absorption</span>
            </div>
            <div className="usp">
              <span className="usp-icon">♻️</span>
              <span className="usp-text">100% Recyclable</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🇧🇪</span>
              <span className="usp-text">Made in Belgium</span>
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

          <p className="hero-price">Starting from <strong>€387</strong> excl. VAT per set of 3 modules</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <Image
              src="/images/products/interior/hero.jpg"
              alt="Re-Sound Interior acoustic wall panels"
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
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
                src="/images/products/interior/overview.jpg"
                alt="Interior panel complete package"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">COMPLETE SOLUTION</span>
            <h2>Everything You Need, In One Package</h2>
            <p>
              Re-Sound Interior is a complete acoustic enhancement solution. Each starter 
              package includes the acoustic core material, a removable fabric cover, and 
              the complete mounting system—everything you need for professional installation.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Acoustic core from recycled textiles
              </li>
              <li>
                <span className="check">✓</span>
                Removable & washable cover
              </li>
              <li>
                <span className="check">✓</span>
                Complete mounting hardware included
              </li>
              <li>
                <span className="check">✓</span>
                No specialist tools required
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Circular Design Section */}
      <section id="features" className="content-section features-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">SUSTAINABILITY</span>
            <h2>Circular Inside, Beautiful Outside</h2>
            <p>
              Every Interior panel begins its life as discarded textiles—clothing, 
              upholstery, and industrial fabric waste. We transform these materials 
              into high-performance acoustic cores using bio-based binders, creating 
              panels that perform beautifully and can be fully recycled at end of life.
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
                src="/images/products/interior/circular.jpg"
                alt="Circular design - recycled materials"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modular Design Section */}
      <section className="content-section modular-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/interior/modular.jpg"
                alt="Modular wall panel configurations"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">DESIGN FREEDOM</span>
            <h2>Modular Versatility</h2>
            <p>
              With its modular design, Interior offers limitless creative possibilities. 
              Create feature walls, cover entire surfaces, or design custom patterns 
              that reflect your brand. The system adapts to spaces of any size.
            </p>
            <div className="dimension-box">
              <div className="dimension">
                <span className="dim-value">900 × 600</span>
                <span className="dim-unit">mm per module</span>
              </div>
              <div className="dimension">
                <span className="dim-value">Set of 3</span>
                <span className="dim-unit">modules per package</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Maintenance Section */}
      <section className="content-section maintenance-section">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">PRACTICAL</span>
            <h2>Easy Maintenance</h2>
            <p>
              The removable fabric cover makes cleaning effortless. Simply unzip, 
              wash, and reattach—your panels will look as good as new. This extends 
              the product lifespan and ensures your space always looks professional.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                Removable cover with zipper
              </li>
              <li>
                <span className="check">✓</span>
                Machine washable at 30°C
              </li>
              <li>
                <span className="check">✓</span>
                Stain-resistant fabric options
              </li>
              <li>
                <span className="check">✓</span>
                Replacement covers available
              </li>
            </ul>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/interior/maintenance.jpg"
                alt="Easy maintenance with removable cover"
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
            With a weighted sound absorption coefficient (αw) of 1.0, Re-Sound Interior 
            delivers maximum acoustic performance. Both high and low frequency sounds 
            are effectively absorbed, creating comfortable, productive spaces.
          </p>
        </div>

        <div className="acoustics-visual">
          <div className="frequency-bars">
            <div className="freq-group">
              <div className="freq-bar low">
                <div className="bar-fill" style={{ height: '85%' }}></div>
              </div>
              <span className="freq-label">Low</span>
              <span className="freq-range">125-500 Hz</span>
            </div>
            <div className="freq-group">
              <div className="freq-bar mid">
                <div className="bar-fill" style={{ height: '95%' }}></div>
              </div>
              <span className="freq-label">Mid</span>
              <span className="freq-range">500-2000 Hz</span>
            </div>
            <div className="freq-group">
              <div className="freq-bar high">
                <div className="bar-fill" style={{ height: '100%' }}></div>
              </div>
              <span className="freq-label">High</span>
              <span className="freq-range">2000-4000 Hz</span>
            </div>
          </div>

          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">αw 1.0</span>
              <span className="rating-label">Class A</span>
            </div>
            <p>Highest absorption rating achievable</p>
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
            <span className="benefit-icon">😌</span>
            <h4>Reduced Stress</h4>
            <p>Create calmer, more comfortable environments</p>
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
                  <td>Module size</td>
                  <td>900 × 600 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>50 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>~3.5 kg per module</td>
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
                  <td>1.0</td>
                </tr>
                <tr>
                  <td>Absorption class</td>
                  <td>Class A</td>
                </tr>
                <tr>
                  <td>NRC</td>
                  <td>0.95</td>
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
                  <td>Recycled textile fibers</td>
                </tr>
                <tr>
                  <td>Binder</td>
                  <td>Bio-based adhesive</td>
                </tr>
                <tr>
                  <td>Cover</td>
                  <td>Recycled polyester fabric</td>
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
                  <td>Wall rail system</td>
                </tr>
                <tr>
                  <td>Installation time</td>
                  <td>~5 min per module</td>
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
          <h2>Interior in Action</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gallery-item">
              <div className="image-container gallery">
                <Image
                  src={`/images/products/interior/gallery-${i}.jpg`}
                  alt={`Interior panel installation example ${i}`}
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
            <a href="tel:+3232970980" className="btn-secondary large">
              Call Us: +32 3 297 09 80
            </a>
          </div>
          <p className="cta-note">
            Free shipping in Belgium • Return for recycling included
          </p>
        </div>
      </section>

      <style jsx>{`
        .interior-product-page {
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
          align-items: center;
          justify-content: center;
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

        .image-container.gallery {
          aspect-ratio: 1;
        }

        .section-image .image-container {
          width: 100%;
          max-width: none;
        }

        .image-placeholder {
          background: var(--brand-blue-pale);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          aspect-ratio: 4/3;
          width: 100%;
          max-width: 600px;
        }

        .image-placeholder span {
          font-size: 5rem;
        }

        .image-placeholder p {
          color: var(--brand-blue);
          font-weight: 500;
          margin-top: 1rem;
        }

        .image-placeholder.large {
          aspect-ratio: 4/3;
          width: 100%;
        }

        .image-placeholder.gallery {
          aspect-ratio: 1;
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

        .content-section.dark .stat-number {
          color: #7ec8f5;
        }

        .stat-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        /* Dimension Box */
        .dimension-box {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
          padding: 1.5rem;
          background: var(--brand-blue-pale);
          border-radius: 16px;
        }

        .dimension {
          text-align: center;
        }

        .dim-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--deep-blue);
        }

        .dim-unit {
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

        .gallery-item .image-placeholder {
          background: rgba(255, 255, 255, 0.1);
          aspect-ratio: 1;
        }

        .gallery-item .image-placeholder span {
          font-size: 3rem;
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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #999;
          line-height: 1;
        }

        .modal-close:hover {
          color: #333;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .modal-header h3 {
          font-size: 1.75rem;
          color: var(--deep-blue);
          margin-bottom: 0.5rem;
        }

        .modal-header p {
          color: #666;
          font-size: 1rem;
        }

        .lead-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
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

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--deep-blue);
        }

        .form-group input,
        .form-group select {
          padding: 0.85rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--brand-blue);
        }

        .form-group input::placeholder {
          color: #aaa;
        }

        .form-consent {
          margin-top: 0.5rem;
        }

        .form-consent label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #666;
          cursor: pointer;
        }

        .form-consent input[type="checkbox"] {
          margin-top: 0.2rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .submit-btn {
          margin-top: 1rem;
          padding: 1.1rem 2rem;
          background: var(--brand-blue);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--brand-blue-dark);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* Download card as button */
        button.download-card {
          text-align: left;
          cursor: pointer;
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

          .dimension-box {
            flex-direction: column;
            gap: 1rem;
          }

          /* Modal responsive */
          .modal-content {
            padding: 1.5rem;
            margin: 1rem;
            max-height: 85vh;
          }

          .modal-header h3 {
            font-size: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
