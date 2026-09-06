'use client';

import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Color options for the Divide product
const colorOptions = [
  { id: 'denim', name: 'Denim', swatch: '/images/products/divide/swatches/denim.webp', image: '/images/products/divide/hero-denim.webp', isDark: true },
  { id: 'antracite', name: 'Antracite', swatch: '/images/products/divide/swatches/antracite.webp', image: '/images/products/divide/hero-antracite.webp', isDark: true },
  { id: 'silver', name: 'Silver', swatch: '/images/products/divide/swatches/silver.webp', image: '/images/products/divide/hero-silver.webp', isDark: false },
  { id: 'sky', name: 'Sky', swatch: '/images/products/divide/swatches/sky.webp', image: '/images/products/divide/hero-sky.webp', isDark: false },
  { id: 'mint', name: 'Mint', swatch: '/images/products/divide/swatches/mint.webp', image: '/images/products/divide/hero-mint.webp', isDark: false },
  { id: 'taupe', name: 'Taupe', swatch: '/images/products/divide/swatches/taupe.webp', image: '/images/products/divide/hero-taupe.webp', isDark: false },
];


/**
 * Server-rendered sections handed in by the route page
 * (src/app/[locale]/products/divide/page.tsx). Specifications, downloads,
 * gallery, FAQ and "other models" no longer live in this client component.
 */
export interface DivideProductPageSlots {
  /** Visible breadcrumb trail (Home › Products › range › model), floated over the hero */
  breadcrumbs?: React.ReactNode;
  specs: React.ReactNode;
  downloads: React.ReactNode;
  gallery?: React.ReactNode;
  faq: React.ReactNode;
  otherModels: React.ReactNode;
}

export default function DivideProductPage({ breadcrumbs, specs, downloads, gallery, faq, otherModels }: DivideProductPageSlots) {
  const t = useTranslations('dividePage');
  const tPage = useTranslations('productPage');
  const tm = useTranslations('manufacturer');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Fire a single view_item event on mount so GA4 / Meta see
  // the product impression. Empty deps array → fires once per page.
  useEffect(() => {
    analytics.viewItem('divide', 'textile');
  }, []);


  const handleColorSelect = (color: typeof colorOptions[0]) => {
    if (color.id !== selectedColor.id) {
      setIsImageLoading(true);
      setSelectedColor(color);
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
    <div className="divide-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        {breadcrumbs}
        <div className="hero-content">
          <span className="product-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <p className="hero-manufacturer">{tm('statement')}</p>
          
          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon">🧲</span>
              <span className="usp-text">{t('hero.usp1')}</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🔄</span>
              <span className="usp-text">{t('hero.usp2')}</span>
            </div>
            <div className="usp">
              <span className="usp-icon">🦶</span>
              <span className="usp-text">{t('hero.usp3')}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary" onClick={() => analytics.quoteClick('divide', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">
              {tPage('cta.viewSpecifications')}
            </a>
          </div>

          <p className="hero-price">{t('hero.priceFrom')} <strong>{t('hero.priceValue')}</strong> {t('hero.priceUnit')}</p>
        </div>
        
        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={selectedColor.image}
                alt={t('alt.heroInColour', { colour: selectedColor.name })}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                style={{ objectFit: 'cover' }}
                priority
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
              />
            </div>
            {isImageLoading && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
          
          <div className="color-selector">
            <span className="color-selector-label">{t('hero.colorSelector')}</span>
            <div className="color-options">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`color-option ${selectedColor.id === color.id ? 'active' : ''}`}
                  onClick={() => handleColorSelect(color)}
                  title={color.name}
                  aria-label={tPage('a11y.selectColour', { name: color.name })}
                >
                  {/* Optimised 72px thumbnail instead of a 150–300 KB CSS background */}
                  <Image src={color.swatch} alt="" width={72} height={72} sizes="72px" quality={60} className="color-swatch" style={{ objectFit: 'cover' }} />
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
                alt={t('alt.divideAcousticRoomDivider')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('overview.tag')}</span>
            <h2>{t('overview.title')}</h2>
            <p>{t('overview.description')}</p>
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

      {/* Integrated Base Section */}
      <section id="features" className="content-section features-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">{t('base.tag')}</span>
            <h2>{t('base.title')}</h2>
            <p>{t('base.description')}</p>
            <div className="feature-highlights">
              <div className="highlight">
                <span className="highlight-icon">⚖️</span>
                <div>
                  <h4>{t('base.item1Title')}</h4>
                  <p>{t('base.feature1')}</p>
                </div>
              </div>
              <div className="highlight">
                <span className="highlight-icon">🪶</span>
                <div>
                  <h4>{t('base.item2Title')}</h4>
                  <p>{t('base.feature2')}</p>
                </div>
              </div>
              <div className="highlight">
                <span className="highlight-icon">🛡️</span>
                <div>
                  <h4>{t('base.item3Title')}</h4>
                  <p>{t('base.feature3')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/divide/integrated-base.webp"
                alt={t('alt.divideIntegratedBaseDetail')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
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
                alt={t('alt.magneticConnectionDetail')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('magnetic.tag')}</span>
            <h2>{t('magnetic.title')}</h2>
            <p>
              {t('magnetic.description')}
            </p>
            <div className="connect-demo">
              <div className="connect-step">
                <div className="step-visual snap">
                  <span>🧲</span>
                </div>
                <span className="step-label">{t('magnetic.snapLabel')}</span>
              </div>
              <div className="connect-arrow">→</div>
              <div className="connect-step">
                <div className="step-visual align">
                  <span>✨</span>
                </div>
                <span className="step-label">{t('magnetic.autoAlign')}</span>
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
            <span className="section-tag">{t('modular.tag')}</span>
            <h2>{t('modular.title')}</h2>
            <p>
              {t('modular.description')}
            </p>
            <div className="config-options">
              <div className="config">
                <div className="config-visual">
                  <div className="module"></div>
                </div>
                <span>{t('modular.config1')}</span>
              </div>
              <div className="config">
                <div className="config-visual">
                  <div className="module"></div>
                  <div className="module"></div>
                </div>
                <span>{t('modular.config2')}</span>
              </div>
              <div className="config">
                <div className="config-visual">
                  <div className="module"></div>
                  <div className="module"></div>
                  <div className="module"></div>
                </div>
                <span>{t('modular.config3')}</span>
              </div>
              <div className="config">
                <div className="config-visual corner">
                  <div className="module"></div>
                  <div className="module rotated"></div>
                </div>
                <span>{t('modular.config4')}</span>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/divide/modular.webp"
                alt={t('alt.modularConfigurations')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
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
              {/* circular.webp never shipped — divide_card.webp is the
                  closest existing product shot for this section. */}
              <Image
                src="/images/products/divide/divide_card.webp"
                alt={t('alt.divideRoomDividerMadeFromRecycledTextileFibres')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('features.tag')}</span>
            <h2>{t('features.title')}</h2>
            <p>
              {t('features.description')}
            </p>
            <div className="circular-stats">
              <div className="stat">
                <span className="stat-number">80%</span>
                <span className="stat-label">{t('features.recycledLabel')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">0</span>
                <span className="stat-label">{t('features.wasteLabel')}</span>
              </div>
              <div className="stat">
                <span className="stat-number">∞</span>
                <span className="stat-label">{t('features.recycleLabel')}</span>
              </div>
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
          <div className="dual-absorption">
            <div className="absorption-side left">
              <div className="wave-lines">
                <span></span><span></span><span></span>
              </div>
              <span className="side-label">{t('acoustics.soundAbsorbed')}</span>
            </div>
            <div className="divider-panel">
              <Image
                src="/images/products/divide/panel-section.png"
                alt={t('alt.dividePanelCrossSection')}
                width={80}
                height={200}
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div className="absorption-side right">
              <div className="wave-lines">
                <span></span><span></span><span></span>
              </div>
              <span className="side-label">{t('acoustics.soundAbsorbed')}</span>
            </div>
          </div>

          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">αw 0.85</span>
              <span className="rating-label">Per side</span>
            </div>
            <p>{t('acoustics.extraBenefit')}</p>
          </div>
        </div>

        <div className="acoustics-benefits">
          <div className="benefit">
            <span className="benefit-icon">🔇</span>
            <h4>{t('acoustics.benefit1Title')}</h4>
            <p>{t('acoustics.benefit1')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🔒</span>
            <h4>{t('acoustics.benefit2Title')}</h4>
            <p>{t('acoustics.benefit2')}</p>
          </div>
          <div className="benefit">
            <span className="benefit-icon">🎯</span>
            <h4>{t('acoustics.benefit3Title')}</h4>
            <p>{t('acoustics.benefit3')}</p>
          </div>
        </div>
      </section>

      {/* Specifications — server-rendered (ProductSpecs) */}
      {specs}

      {/* Gallery — server-rendered (ProductGallery) */}
      {gallery}

      {/* Downloads — server-rendered (ProductDownloads) */}
      {downloads}

      {/* FAQ — server-rendered (ProductFaq) */}
      {faq}

      {/* Other models in this range — server-rendered (OtherModels) */}
      {otherModels}

      {/* CTA Section */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>{tPage('cta.ctaTitle')}</h2>
          <p>
            {tPage('cta.ctaSubtitle')}</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large" onClick={() => analytics.quoteClick('divide', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="tel:+3232846818" className="btn-secondary large" onClick={() => analytics.phoneClick('product_cta_divide')}>
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">
            {tPage('cta.freeShippingNote')}
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
          color: #767676;
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
          color: #767676;
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
