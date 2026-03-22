'use client';

import { useTranslations } from 'next-intl';
import LeadGenModal, { LeadFormData } from '@/components/LeadGenModal';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Color options for rPET Flex-Groove (12 colors from Refined Collection)
const colorOptions = [
  { id: 'ash', name: 'Ash', swatch: '/images/products/rpet-flex-groove/swatches/ash.jpg', image: '/images/products/rpet-flex-groove/ash.jpg', colorHex: '#B8B5AC' },
  { id: 'basalt', name: 'Basalt', swatch: '/images/products/rpet-flex-groove/swatches/basalt.jpg', image: '/images/products/rpet-flex-groove/basalt.jpg', colorHex: '#4A4A4A' },
  { id: 'brown', name: 'Brown', swatch: '/images/products/rpet-flex-groove/swatches/brown.jpg', image: '/images/products/rpet-flex-groove/brown.jpg', colorHex: '#6B4423' },
  { id: 'fog', name: 'Fog', swatch: '/images/products/rpet-flex-groove/swatches/fog.jpg', image: '/images/products/rpet-flex-groove/fog.jpg', colorHex: '#D3D3D3' },
  { id: 'gravel', name: 'Gravel', swatch: '/images/products/rpet-flex-groove/swatches/gravel.jpg', image: '/images/products/rpet-flex-groove/gravel.jpg', colorHex: '#7A7A7A' },
  { id: 'moss', name: 'Moss', swatch: '/images/products/rpet-flex-groove/swatches/moss.jpg', image: '/images/products/rpet-flex-groove/moss.jpg', colorHex: '#4A5D23' },
  { id: 'navy', name: 'Navy', swatch: '/images/products/rpet-flex-groove/swatches/navy.jpg', image: '/images/products/rpet-flex-groove/navy.jpg', colorHex: '#1B2838' },
  { id: 'pine', name: 'Pine', swatch: '/images/products/rpet-flex-groove/swatches/pine.jpg', image: '/images/products/rpet-flex-groove/pine.jpg', colorHex: '#2D5A3D' },
  { id: 'polar', name: 'Polar', swatch: '/images/products/rpet-flex-groove/swatches/polar.jpg', image: '/images/products/rpet-flex-groove/polar.jpg', colorHex: '#F5F5F5' },
  { id: 'steel-blue', name: 'Steel Blue', swatch: '/images/products/rpet-flex-groove/swatches/steel-blue.jpg', image: '/images/products/rpet-flex-groove/steel-blue.jpg', colorHex: '#4682B4' },
  { id: 'tan', name: 'Tan', swatch: '/images/products/rpet-flex-groove/swatches/tan.jpg', image: '/images/products/rpet-flex-groove/tan.jpg', colorHex: '#C4A77D' },
  { id: 'teal', name: 'Teal', swatch: '/images/products/rpet-flex-groove/swatches/teal.jpg', image: '/images/products/rpet-flex-groove/teal.jpg', colorHex: '#367588' },
];

// Groove direction options
const directionOptions = [
  { id: 'length', name: 'Lengthwise', description: 'Grooves run along the length of the panel' },
  { id: 'width', name: 'Widthwise', description: 'Grooves run across the width of the panel' },
];

// Default hero image (shown before any color is selected)
const defaultHeroImage = '/images/products/rpet-flex-groove/rPET-Flex.jpg';

// Lead Generation Form Modal

export default function RPETFlexGrooveProductPage() {
  const t = useTranslations('rpetFlexGroovePage');
  const tPage = useTranslations('productPage');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState<typeof colorOptions[0] | null>(null);
  const [selectedDirection, setSelectedDirection] = useState(directionOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get the current hero image - default or selected color
  const currentHeroImage = selectedColor ? selectedColor.image : defaultHeroImage;

  const downloads = [
    { id: 'product-data-sheet', name: 'Product Data Sheet', icon: '📄', file: '/documents/rpet-flex-groove/product-data-sheet.pdf' },
    { id: 'installation-guide', name: 'Installation Guide', icon: '🔧', file: '/documents/rpet-flex-groove/installation-guide.pdf' },
    { id: 'technical-drawing', name: 'Technical Drawing', icon: '📐', file: '/documents/rpet-flex-groove/technical-drawing.pdf' },
    { id: 'care-maintenance', name: 'Care & Maintenance', icon: '🧹', file: '/documents/rpet-flex-groove/care-maintenance.pdf' },
    { id: 'fire-certificate', name: 'Fire Certificate', icon: '🔥', file: '/documents/rpet-flex-groove/fire-certificate.pdf' },
    { id: 'sustainability-declaration', name: 'Sustainability Declaration', icon: '♻️', file: '/documents/rpet-flex-groove/sustainability-declaration.pdf' },
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
          source: 'rPET Flex-Groove Product Page',
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
    { id: 'flexibility', label: 'Flexibility' },
    { id: 'colors', label: 'Colors' },
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
    <div className="rpet-flex-groove-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🔄</span>
              <span className="usp-text">{t('hero.usp1')}</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔥</span>
              <span className="usp-text">{t('hero.usp2')}</span>
            </div>
            <div className="usp">
              <span className="usp-icon">♻️</span>
              <span className="usp-text">{t('hero.usp3')}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary">
              {tPage('cta.requestQuote')}
            </Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">
              {tPage('cta.viewSpecifications')}
            </a>
          </div>

          <p className="hero-price">  <strong> </strong>  </p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={`rPET Flex-Groove acoustic panel${selectedColor ? ` in ${selectedColor.name}` : ''}`}
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
            <span className="selector-label">{t('hero.colorSelector')}</span>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`color-option ${selectedColor?.id === color.id ? 'active' : ''}`}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                  aria-label={`Select ${color.name} color`}
                  style={{ backgroundColor: color.colorHex }}
                >
                  {selectedColor?.id === color.id && (
                    <span className="color-check">✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-color-name">{selectedColor?.name || t('hero.colorPlaceholder')}</span>
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
                src="/images/products/rpet-flex-groove/rPET-Flex-hero.png"
                alt="rPET Flex-Groove acoustic panel on curved surface"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('overview.tag')}</span>
            <h2>{t('overview.title')}</h2>
            <p>
              Flex-Groove panels provide a versatile acoustic solution for curved surfaces, 
              effortlessly adapting to any shape. Suitable for inner and outer radii, their 
              flexible structure allows for seamless transitions along walls, columns, and 
              other rounded architectural elements.
            </p>
            <ul className="feature-list">
              <li>
                <span className="check">✓</span>
                {t('overview.feature1')}
              </li>
              <li>
                <span className="check">✓</span>
                {t('overview.feature2')}
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

      {/* Flexibility Section */}
      <section id="flexibility" className="content-section flexibility-section dark">
        <div className="flexibility-header">
          <span className="section-tag">{t('technology.tag')}</span>
          <h2>{t('technology.title')}</h2>
          <p>
            Each panel is incised with precision V-cuts, allowing it to bend without breaking. 
            This smart cut creates the signature ribbed texture — a series of linear grooves 
            that enable flexibility while giving the surface a sculptural relief.
          </p>
        </div>

        <div className="flexibility-visual">
          <div className="flex-demo">
            <div className="panel-flat">
              <div className="groove-lines">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="groove-line" />
                ))}
              </div>
              <span className="demo-label">{t('technology.flatPanel')}</span>
            </div>
            <div className="arrow">→</div>
            <div className="panel-curved">
              <div className="curved-surface">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="groove-line curved" />
                ))}
              </div>
              <span className="demo-label">{t('technology.curvedApp')}</span>
            </div>
          </div>

          <div className="radius-indicator">
            <div className="radius-circle">
              <span className="radius-value">R500</span>
              <span className="radius-unit">mm</span>
            </div>
            <p>{t('technology.minRadius')}</p>
          </div>
        </div>

        <div className="flexibility-benefits">
          <div className="benefit">
            <span className="benefit-icon">📐</span>
            <h4>{t('technology.feature1Title')}</h4>
            <p>{t('technology.feature1Desc')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔄</span>
            <h4>{t('technology.feature2Title')}</h4>
            <p>{t('technology.feature2Desc')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">✂️</span>
            <h4>{t('technology.feature3Title')}</h4>
            <p>{t('technology.feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section id="colors" className="content-section colors-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">{t('colors.tag')}</span>
            <h2>{t('colors.title')}</h2>
            <p>
              Our carefully curated color palette offers versatile options for any interior. 
              From soft neutrals to bold statement colors, each shade is designed to complement 
              modern architectural spaces while providing excellent acoustic performance.
            </p>
            
            <div className="color-grid">
              {colorOptions.map((color) => (
                <div key={color.id} className="color-item">
                  <span 
                    className="color-swatch-large" 
                    style={{ backgroundColor: color.colorHex }}
                  />
                  <span className="color-name">{color.name}</span>
                </div>
              ))}
            </div>

            <div className="direction-options">
              <h4>{t('colors.grooveDir')}</h4>
              <div className="direction-selector">
                {directionOptions.map((direction) => (
                  <button
                    key={direction.id}
                    className={`direction-option ${selectedDirection.id === direction.id ? 'active' : ''}`}
                    onClick={() => setSelectedDirection(direction)}
                  >
                    <span className={`direction-icon ${direction.id}`}>
                      {direction.id === 'length' ? '|||' : '≡'}
                    </span>
                    <span className="direction-name">{direction.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-flex-groove/rPET-Flex-hero_1.jpg"
                alt="rPET Flex-Groove color options"
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
            Made from fire-retardant recycled PET felt, Flex-Groove panels provide 
            effective sound absorption while maintaining visual continuity across 
            curved surfaces. The grooved texture enhances acoustic performance.
          </p>
        </div>

        <div className="acoustics-visual">
          <div className="panel-cross-section">
            <div className="cross-section-diagram flex">
              <div className="diagram-layer pet-felt">
                <span className="layer-label">{t('acoustics.layer1Label')}</span>
              </div>
              <div className="diagram-layer v-cuts">
                <div className="v-cut"></div>
                <div className="v-cut"></div>
                <div className="v-cut"></div>
                <div className="v-cut"></div>
                <span className="layer-label">{t('acoustics.layer2Label')}</span>
              </div>
            </div>
          </div>

          <div className="material-info">
            <div className="material-circle">
              <span className="material-value">9mm</span>
              <span className="material-label">{t('acoustics.thicknessLabel')}</span>
            </div>
            <p>{t('acoustics.materialLabel')}</p>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <span className="benefit-icon">🔇</span>
            <h4>{t('acoustics.feature1Title')}</h4>
            <p>{t('acoustics.feature1Desc')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔥</span>
            <h4>{t('acoustics.feature2Title')}</h4>
            <p>{t('acoustics.feature2Desc')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">♻️</span>
            <h4>{t('sustainability.badge1')}</h4>
            <p>{t('acoustics.feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">{t('installation.tag')}</span>
            <h2>{t('installation.title')}</h2>
            <p>
              Designed to span standard floor-to-ceiling heights, the panels simplify 
              alignment and reduce installation time. The adaptable form makes them 
              a practical solution for interiors requiring both sound absorption and 
              design flexibility.
            </p>
            
            <div className="installation-steps">
              <div className="install-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>{t('installation.step1Title')}</h4>
                  <p>{t('installation.step1Desc')}</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>{t('installation.step2Title')}</h4>
                  <p>{t('installation.step2Desc')}</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>{t('installation.step3Title')}</h4>
                  <p>{t('installation.step3Desc')}</p>
                </div>
              </div>
              <div className="install-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>{t('installation.step4Title')}</h4>
                  <p>{t('installation.step4Desc')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-flex-groove/rPET-Flex-hero_2.jpg"
                alt="Flex-Groove panel installation"
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
                src="/images/products/rpet-flex-groove/rPET-Flex-hero_3.jpg"
                alt="Recycled PET bottles"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('sustainability.tag')}</span>
            <h2>{t('sustainability.title')}</h2>
            <p>
              Every Flex-Groove panel is crafted from 100% recycled PET plastic bottles, 
              giving new life to waste materials. Our circular approach ensures that 
              these panels can be recycled again at the end of their lifecycle.
            </p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <span className="sustain-icon">🍾</span>
                <div>
                  <h4>{t('sustainability.badge1')}</h4>
                  <p>{t('acoustics.feature3Desc')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">♻️</span>
                <div>
                  <h4>{t('sustainability.badge2')}</h4>
                  <p>{t('sustainability.badge2Desc')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🏭</span>
                <div>
                  <h4>{t('sustainability.badge3')}</h4>
                  <p>{t('sustainability.badge3Desc')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <span className="sustain-icon">🌱</span>
                <div>
                  <h4>{t('sustainability.badge4')}</h4>
                  <p>{t('sustainability.badge4Desc')}</p>
                </div>
              </div>
            </div>
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
            <h4>{t('specs.dimensionsTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{t('specs.dimPanelLength')}</td>
                  <td>2880 mm</td>
                </tr>
                <tr>
                  <td>{t('specs.dimPanelWidth')}</td>
                  <td>1130 mm</td>
                </tr>
                <tr>
                  <td>Thickness</td>
                  <td>9 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>4.4 kg</td>
                </tr>
                <tr>
                  <td>{t('specs.dimDensity')}</td>
                  <td>1.35 kg/m²</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.flexibilityTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{t('specs.flexMinRadius')}</td>
                  <td>500 mm</td>
                </tr>
                <tr>
                  <td>{t('specs.flexBendDir')}</td>
                  <td>{t('specs.flexBendDirVal')}</td>
                </tr>
                <tr>
                  <td>{t('specs.flexCutType')}</td>
                  <td>{t('specs.flexCutTypeVal')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.materialTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{t('specs.matComposition')}</td>
                  <td>{t('specs.matCompositionVal')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.recycledContent')}</td>
                  <td>100%</td>
                </tr>
                <tr>
                  <td>{t('specs.matFireRetardant')}</td>
                  <td>{t('specs.matFireRetardantVal')}</td>
                </tr>
                <tr>
                  <td>{t('specs.matColorVar')}</td>
                  <td>{t('specs.matColorVarVal')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.fireTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{tPage('specs.fireRating') || t('specs.fireRating')}</td>
                  <td>B-s1, d0</td>
                </tr>
                <tr>
                  <td>Test standard</td>
                  <td>EN 13501-1</td>
                </tr>
                <tr>
                  <td>{t('specs.fireSmokeProduction')}</td>
                  <td>s1 (low)</td>
                </tr>
                <tr>
                  <td>{t('specs.fireFlamingDroplets')}</td>
                  <td>{t('specs.fireFlamingDropletsVal')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.certsTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{t('specs.certMaterial')}</td>
                  <td>OEKO-TEX® Standard 100</td>
                </tr>
                <tr>
                  <td>{t('specs.certVOC')}</td>
                  <td>{t('specs.certVOCVal')}</td>
                </tr>
                <tr>
                  <td>{tPage('specs.recycledContent')}</td>
                  <td>{t('specs.certRecycledVal')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="spec-card">
            <h4>{t('specs.applicationsTitle')}</h4>
            <table>
              <tbody>
                <tr>
                  <td>{t('specs.appSurfaces')}</td>
                  <td>{t('specs.appSurfacesVal')}</td>
                </tr>
                <tr>
                  <td>{t('specs.appEnvironment')}</td>
                  <td>{t('specs.appEnvironmentVal')}</td>
                </tr>
                <tr>
                  <td>{t('specs.appInstallation')}</td>
                  <td>{t('specs.appInstallationVal')}</td>
                </tr>
                <tr>
                  <td>{t('specs.appOrientation')}</td>
                  <td>{t('specs.appOrientationVal')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="content-section gallery-section">
        <div className="gallery-header">
          <span className="section-tag">{t('gallery.tag')}</span>
          <h2>{t('gallery.title')}</h2>
        </div>

        <div className="gallery-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="gallery-item">
              <div className="image-container gallery">
                <Image
                  src={`/images/products/rpet-flex-groove/gallery-${i}.webp`}
                  alt={`rPET Flex-Groove installation example ${i}`}
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
          <span className="section-tag">{t('downloads.tag')}</span>
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

      {/* Applications Section */}
      <section className="content-section applications-section dark">
        <div className="applications-header">
          <span className="section-tag">{t('applications.tag')}</span>
          <h2>{t('applications.title')}</h2>
          <p>{t('applications.sectionDesc')}</p>
        </div>

        <div className="applications-grid">
          <div className="application-card">
            <div className="application-icon">🏛️</div>
            <h4>{t('applications.app1')}</h4>
            <p>{t('applications.app1')}</p>
          </div>
          <div className="application-card">
            <div className="application-icon">🌀</div>
            <h4>{t('applications.app2')}</h4>
            <p>{t('applications.app2')}</p>
          </div>
          <div className="application-card">
            <div className="application-icon">🚪</div>
            <h4>{t('applications.app3')}</h4>
            <p>{t('applications.app3Desc')}</p>
          </div>
          <div className="application-card">
            <div className="application-icon">🎯</div>
            <h4>{t('applications.app4')}</h4>
            <p>{t('applications.app4Desc')}</p>
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
          <h2>{t('cta.title')}</h2>
          <p>
            Get a personalized quote for your project. Our team will help you 
            choose the perfect color and calculate your requirements.
          </p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large">
              {tPage('cta.requestQuote')}
            </Link>
            <a href="tel:+3232846818" className="btn-secondary large">
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">
            Free samples available • Made in Europe • 100% Recycled
          </p>
        </div>
      </section>

      <style jsx>{`
        .rpet-flex-groove-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --deep-blue: #0a1628;
          --cream: #f8f6f3;
          --charcoal: #333;
          --pet-teal: #367588;
          --pet-light: #5BA3B5;
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
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid transparent;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-option:hover { transform: scale(1.15); }

        .color-option.active {
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue);
        }

        .color-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: bold;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

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
          background: rgba(54, 117, 136, 0.3);
          color: #7ec8d8;
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
        .check { color: var(--pet-teal); font-weight: bold; }

        /* Flexibility Section */
        .flexibility-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 4rem;
        }

        .flexibility-header h2 {
          font-size: 2.5rem;
          color: white;
          margin-bottom: 1rem;
        }

        .flexibility-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .flexibility-visual {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .flex-demo {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .panel-flat, .panel-curved {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .groove-lines {
          display: flex;
          gap: 4px;
          padding: 1rem;
          background: linear-gradient(135deg, #C4A77D 0%, #8B6914 100%);
          border-radius: 8px;
        }

        .groove-line {
          width: 4px;
          height: 80px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 2px;
        }

        .curved-surface {
          display: flex;
          gap: 4px;
          padding: 1rem;
          background: linear-gradient(135deg, #C4A77D 0%, #8B6914 100%);
          border-radius: 8px 40px 40px 8px;
          transform: perspective(200px) rotateY(-15deg);
        }

        .arrow {
          font-size: 2rem;
          color: var(--pet-teal);
        }

        .demo-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .radius-indicator { text-align: center; }

        .radius-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--pet-teal);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .radius-value { font-size: 1.8rem; font-weight: 700; color: white; }
        .radius-unit { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); }
        .radius-indicator > p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }

        .flexibility-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .benefit {
          text-align: center;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .content-section:not(.dark) .benefit {
          background: white;
          border: none;
        }

        .benefit-icon { font-size: 2.5rem; margin-bottom: 1rem; display: block; }
        .benefit h4 { font-size: 1.1rem; color: white; margin-bottom: 0.5rem; }
        .content-section:not(.dark) .benefit h4 { color: var(--deep-blue); }
        .benefit p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); margin: 0; }
        .content-section:not(.dark) .benefit p { color: #666; }

        /* Colors Section */
        .color-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .color-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .color-swatch-large {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.1);
        }

        .color-name {
          font-size: 0.8rem;
          color: #666;
        }

        .direction-options h4 {
          color: var(--deep-blue);
          margin-bottom: 1rem;
        }

        .direction-selector {
          display: flex;
          gap: 1rem;
        }

        .direction-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .direction-option:hover { border-color: var(--brand-blue); }

        .direction-option.active {
          border-color: var(--brand-blue);
          background: var(--brand-blue-pale);
        }

        .direction-icon {
          font-size: 1.2rem;
          font-weight: bold;
          color: var(--pet-teal);
        }

        .direction-icon.length { letter-spacing: 2px; }

        .direction-name { font-size: 0.9rem; font-weight: 500; color: var(--charcoal); }

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

        .cross-section-diagram.flex {
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 250px;
        }

        .diagram-layer {
          position: relative;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .diagram-layer.pet-felt {
          background: var(--pet-teal);
          border-radius: 8px 8px 0 0;
          height: 60px;
        }

        .diagram-layer.v-cuts {
          background: var(--pet-teal);
          height: 30px;
          display: flex;
          gap: 15px;
          padding: 0 20px;
          border-radius: 0 0 8px 8px;
        }

        .v-cut {
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 20px solid white;
        }

        .layer-label {
          position: absolute;
          right: -160px;
          font-size: 0.8rem;
          color: #666;
          white-space: nowrap;
        }

        .material-info { text-align: center; }

        .material-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--brand-blue);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .material-value { font-size: 1.8rem; font-weight: 700; color: white; }
        .material-label { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); }
        .material-info > p { font-size: 0.9rem; color: #666; }

        .acoustics-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
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

        .step-number {
          width: 40px;
          height: 40px;
          background: var(--pet-teal);
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
          color: var(--pet-teal);
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
          background: linear-gradient(135deg, var(--pet-teal) 0%, #2a5a6a 100%);
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

        .cta-section .btn-primary { background: white; color: var(--pet-teal); }
        .cta-section .btn-primary:hover { background: var(--cream); }
        .cta-section .btn-secondary { border-color: white; color: white; }
        .cta-section .btn-secondary:hover { background: white; color: var(--pet-teal); }
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
          .flexibility-benefits { grid-template-columns: 1fr; }
          .applications-grid { grid-template-columns: repeat(2, 1fr); }
          .acoustics-visual { flex-direction: column; gap: 3rem; }
          .acoustics-benefits { grid-template-columns: 1fr; }
          .color-grid { grid-template-columns: repeat(3, 1fr); }
          .sustainability-features { grid-template-columns: 1fr; }
          .layer-label { display: none; }
          .flexibility-visual { flex-direction: column; gap: 2rem; }
          .flex-demo { flex-direction: column; }
          .arrow { transform: rotate(90deg); }
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
          .applications-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
          .direction-selector { flex-wrap: wrap; }
          .color-options { max-width: 100%; }
          .color-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </div>
  );
}
