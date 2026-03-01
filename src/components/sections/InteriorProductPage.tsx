'use client';

import { useTranslations } from 'next-intl';
import LeadGenModal, { LeadFormData } from '@/components/LeadGenModal';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Color options for the product
const colorOptions = [
  { id: 'denim', name: 'Denim', swatch: '/images/products/interior/swatches/denim.webp', image: '/images/products/interior/hero-denim.webp', isDark: true },
  { id: 'antracite', name: 'Antracite', swatch: '/images/products/interior/swatches/antracite.webp', image: '/images/products/interior/hero-antracite.webp', isDark: true },
  { id: 'silver', name: 'Silver', swatch: '/images/products/interior/swatches/silver.webp', image: '/images/products/interior/hero-silver.webp', isDark: false },
  { id: 'sky', name: 'Sky', swatch: '/images/products/interior/swatches/sky.webp', image: '/images/products/interior/hero-sky.webp', isDark: false },
  { id: 'mint', name: 'Mint', swatch: '/images/products/interior/swatches/mint.webp', image: '/images/products/interior/hero-mint.webp', isDark: false },
  { id: 'taupe', name: 'Taupe', swatch: '/images/products/interior/swatches/taupe.webp', image: '/images/products/interior/hero-taupe.webp', isDark: false },
];


export default function InteriorProductPage() {
  const t = useTranslations('interiorPage');
  const tPage = useTranslations('productPage');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const downloads = [
    { id: 'product-data-sheet', name: tPage('downloads.productDataSheet'), icon: '📄', file: '/documents/interior/product-data-sheet.pdf' },
    { id: 'installation-manual', name: tPage('downloads.installationManual'), icon: '📋', file: '/documents/interior/installation-manual.pdf' },
    { id: 'acoustic-test-report', name: tPage('downloads.acousticTestReport'), icon: '📊', file: '/documents/interior/acoustic-test-report.pdf' },
    { id: 'color-fabric-guide', name: tPage('downloads.colorFabricGuide'), icon: '🎨', file: '/documents/interior/color-fabric-guide.pdf' },
    { id: 'fire-certificate', name: tPage('downloads.fireCertificate'), icon: '🔥', file: '/documents/interior/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: tPage('downloads.sustainabilityDeclaration'), icon: '♻️', file: '/documents/interior/sustainability-declaration.pdf' },
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
    { id: 'overview', label: tPage('nav.overview') },
    { id: 'features', label: tPage('nav.features') },
    { id: 'acoustics', label: tPage('nav.acoustics') },
    { id: 'specs', label: tPage('nav.specs') },
    { id: 'gallery', label: tPage('nav.gallery') },
    { id: 'downloads', label: tPage('nav.downloads') },
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
          <span className="product-tag">{tPage('tags.acousticWallPanels')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🔊</span>
              <span className="usp-text">{t('hero.uspAbsorption')}</span>
            </div>
            <div className="usp">
              <span className="usp-icon">♻️</span>
              <span className="usp-text">{t('hero.uspRecyclable')}</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🇪🇺</span>
              <span className="usp-text">{t('hero.uspOrigin')}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary">
              {tPage('cta.requestQuote')}
            </Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">
              View Specifications
            </a>
          </div>

          <p className="hero-price">{t('hero.priceFrom')} <strong>€387</strong> {t('hero.priceUnit')}</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={selectedColor.image}
                alt={`Re-Sound Interior acoustic wall panels in ${selectedColor.name}`}
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
            <span className="color-selector-label">{t('hero.colorSelector')}</span>
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
                src="/images/products/interior/overview.jpg"
                alt="Interior panel complete package"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('overview.tag')}</span>
            <h2>{t('overview.title')}</h2>
            <p>
              {t('overview.description')}
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                {t('overview.feature1')}
              </li>
              <li>
                <span className="check">✓</span>
                Removable & washable cover
              </li>
              <li>
                <span className="check">✓</span>
                {t('overview.feature3')}
              </li>
              <li>
                <span className="check">✓</span>
                {t('overview.feature4')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Circular Design Section */}
      <section id="features" className="content-section features-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">{t('features.tag')}</span>
            <h2>{t('features.title')}</h2>
            <p>
              {t('features.description')}
            </p>
            <div className="circular-stats">
              <div className="stat">
                <span className="stat-number">{t('features.stat1Value')}</span>
                <span className="stat-label">{t('features.stat1Label')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">{t('features.stat2Value')}</span>
                <span className="stat-label">{t('features.stat2Label')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">{t('features.stat3Value')}</span>
                <span className="stat-label">{t('features.stat3Label')}</span>
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
            <span className="section-tag">{t('modular.tag')}</span>
            <h2>{t('modular.title')}</h2>
            <p>
              {t('modular.description')}
            </p>
            <div className="dimension-box">
              <div className="dimension">
                <span className="dim-value">{t('modular.dimSize')}</span>
                <span className="dim-unit">{t('modular.dimSizeUnit')}</span>
              </div>
              <div className="dimension">
                <span className="dim-value">{t('modular.dimSet')}</span>
                <span className="dim-unit">{t('modular.dimSetUnit')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Maintenance Section */}
      <section className="content-section maintenance-section">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">{t('maintenance.tag')}</span>
            <h2>{t('maintenance.title')}</h2>
            <p>
              {t('maintenance.description')}
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                {t('maintenance.feature1')}
              </li>
              <li>
                <span className="check">✓</span>
                {t('maintenance.feature2')}
              </li>
              <li>
                <span className="check">✓</span>
                {t('maintenance.feature3')}
              </li>
              <li>
                <span className="check">✓</span>
                {t('maintenance.feature4')}
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
          <span className="section-tag">{t('acoustics.tag')}</span>
          <h2>{t('acoustics.title')}</h2>
          <p>
            {t('acoustics.description')}
          </p>
        </div>

        <div className="acoustics-visual">
          <div className="frequency-bars">
            <div className="freq-group">
              <div className="freq-bar low">
                <div className="bar-fill" style={{ height: '85%' }}></div>
              </div>
              <span className="freq-label">{tPage('acoustics.low')}</span>
              <span className="freq-range">125-500 Hz</span>
            </div>
            <div className="freq-group">
              <div className="freq-bar mid">
                <div className="bar-fill" style={{ height: '95%' }}></div>
              </div>
              <span className="freq-label">{tPage('acoustics.mid')}</span>
              <span className="freq-range">500-2000 Hz</span>
            </div>
            <div className="freq-group">
              <div className="freq-bar high">
                <div className="bar-fill" style={{ height: '100%' }}></div>
              </div>
              <span className="freq-label">{tPage('acoustics.high')}</span>
              <span className="freq-range">2000-4000 Hz</span>
            </div>
          </div>

          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">{t('specs.alphaValue')}</span>
              <span className="rating-label">{t('specs.classValue')}</span>
            </div>
            <p>{tPage('acoustics.highestRating')}</p>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <span className="benefit-icon">🗣️</span>
            <h4>{tPage('acoustics.benefitSpeech.title')}</h4>
            <p>{tPage('acoustics.benefitSpeech.desc')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🧠</span>
            <h4>{tPage('acoustics.benefitFocus.title')}</h4>
            <p>{tPage('acoustics.benefitFocus.desc')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">😌</span>
            <h4>{tPage('acoustics.benefitStress.title')}</h4>
            <p>{tPage('acoustics.benefitStress.desc')}</p>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section id="specs" className="content-section specs-section">
        <div className="specs-header">
          <span className="section-tag">{t('specs.tag')}</span>
          <h2>{t('specs.title')}</h2>
        </div>

        <div className="specs-grid">
          <div className="spec-card">
            <h4>{tPage('specs.dimensions')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.moduleSize')}</td>
                  <td>{t('specs.moduleSizeValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.thickness')}</td>
                  <td>{t('specs.thicknessValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.weight')}</td>
                  <td>{t('specs.weightValue')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.acousticsTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.absorptionCoeff')}</td>
                  <td>{t('specs.alphaValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.absorptionClass')}</td>
                  <td>{t('specs.classValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.nrc')}</td>
                  <td>{t('specs.nrcValue')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.materialsTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.core')}</td>
                  <td>{t('specs.coreValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.absorber')}</td>
                  <td>{t('specs.absorberValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.cover')}</td>
                  <td>{t('specs.coverValue')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.fireTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.fireRating')}</td>
                  <td>{t('specs.fireRatingValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.standard')}</td>
                  <td>{t('specs.fireStandardValue')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.sustainTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.recycledContent')}</td>
                  <td>{t('specs.recycledValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.endOfLife')}</td>
                  <td>{t('specs.endOfLifeValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.vocEmissions')}</td>
                  <td>{t('specs.vocValue')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.installTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.mounting')}</td>
                  <td>{t('specs.mountingValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.installationTime')}</td>
                  <td>{t('specs.installTimeValue')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.toolsRequired')}</td>
                  <td>{t('specs.toolsValue')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="content-section gallery-section">
        <div className="gallery-header">
          <span className="section-tag">{tPage('gallery.tag')}</span>
          <h2>{t('gallery.title')}</h2>
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
          <span className="section-tag">{tPage('downloads.tag')}</span>
          <h2>{tPage('downloads.title')}</h2>
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
          <h2>{tPage('cta.ctaTitle')}</h2>
          <p>
            {tPage('cta.ctaSubtitle')}
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
            {tPage('cta.freeShippingNote')}
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
