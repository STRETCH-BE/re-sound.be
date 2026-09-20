'use client';

import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { PRODUCTS } from '@/data/products';
import { isoAbsorptionClass } from '@/components/product/resolveMsg';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Single source for every governed figure on this page (thickness, αw,
// absorption class, fire class, plant, certifications): src/data/products.ts.
// Nothing below may hard-code one of these values. Plank geometry, pattern
// dimensions and the like are datasheet literals (rWood Groove datasheet,
// EN · 09/2026, v1.0) that read the same in every language.
const PRODUCT = PRODUCTS['rwood-groove'];
const panelSpecs = PRODUCT.specs.kind === 'panel' ? PRODUCT.specs : null;
const alphaW = panelSpecs?.alphaW ?? null;
const fireClass = panelSpecs?.fireClass ?? null;
// ISO 11654 class derived from the stored αw ('0.90' → 'A'); null when not a plain number.
const absorptionClass = isoAbsorptionClass(alphaW);
// '10 / 19 mm' → '10 · 19' for the KPI band (the unit is in the label)
const thicknessFigure = panelSpecs?.thickness
  ? panelSpecs.thickness.replace(/\s*mm\s*$/, '').replace(/\s*\/\s*/g, ' · ')
  : null;

/**
 * Stock veneers — datasheet p.3 "Oak and walnut, any veneer to order".
 * Names are the product's own veneer names (identical in every language);
 * the one-line tone descriptions are message keys. Swatches are the
 * datasheet photographs (public/images/products/rwood/guide); the hero
 * photos are the existing product shots of a plank in that veneer.
 */
const veneers = [
  { id: 'silk-oak', name: 'Silk Oak', descKey: 'veneers.silkOak', swatch: '/images/products/rwood/guide/silk-oak.webp', image: '/images/products/rwood-groove/silk-oak.jpg', isDark: false },
  { id: 'straw-oak', name: 'Straw Oak', descKey: 'veneers.strawOak', swatch: '/images/products/rwood/guide/straw-oak.webp', image: '/images/products/rwood-groove/straw-oak.jpg', isDark: false },
  { id: 'umber-oak', name: 'Umber Oak', descKey: 'veneers.umberOak', swatch: '/images/products/rwood/guide/umber-oak.webp', image: '/images/products/rwood-groove/umber-oak.jpg', isDark: true },
  { id: 'walnut', name: 'Walnut', descKey: 'veneers.walnut', swatch: '/images/products/rwood/guide/walnut.webp', image: '/images/products/rwood-groove/walnut.jpg', isDark: true },
  { id: 'tobacco-walnut', name: 'Tobacco Walnut', descKey: 'veneers.tobaccoWalnut', swatch: '/images/products/rwood/guide/tobacco-walnut.webp', image: '/images/products/rwood-groove/tobacco-walnut.jpg', isDark: true },
];
type Veneer = (typeof veneers)[number];

/**
 * Lamella pattern — datasheet p.1. The Original pattern (six lamellas of
 * 34 mm) is the standard and the only one drawn, to scale: lamella widths and
 * the 15 mm grooves as percentages of the 300 mm plank. The datasheet's other
 * layouts are listed by name and dimensions only and made on request
 * (Michael, 20 September 2026) — no drawing, because the sheet gives the
 * Mixed pattern as "6 × 50 / 30 / 22 mm" without the lamella sequence.
 */
const PLANK_MM = 300;
const GROOVE_MM = 15;
const STANDARD_PATTERN = { id: 'original', name: 'Original', lamellas: [34, 34, 34, 34, 34, 34], dims: '6 × 34 mm', descKey: 'options.originalDesc' };
const OTHER_PATTERNS = [
  { id: 'mixed', name: 'Mixed', dims: '6 × 50 / 30 / 22 mm' },
  { id: '4-lamella', name: '4-Lamella', dims: '4 × 59 mm' },
  { id: '3-lamella', name: '3-Lamella', dims: '3 × 84 mm' },
];

// Felt colours — datasheet p.1/p.3 "3 mm, black or grey"
const feltColours = [
  { id: 'black', labelKey: 'feltBacking.black', color: '#1a1a1a' },
  { id: 'grey', labelKey: 'feltBacking.grey', color: '#6b6b6b' },
];

// Default hero image (shown before any veneer is selected)
const defaultHeroImage = '/images/products/rwood-groove/hero-rWood-Groove.webp';

/**
 * Server-rendered sections handed in by the route page
 * (src/app/[locale]/products/rwood-groove/page.tsx). Keeping them out of
 * this client component means specs / downloads / gallery / FAQ / related
 * models are plain HTML with no hydration cost.
 */
export interface RWoodGrooveProductPageSlots {
  /** Visible breadcrumb trail (Home › Products › range › model), floated over the hero */
  breadcrumbs?: React.ReactNode;
  specs: React.ReactNode;
  downloads: React.ReactNode;
  gallery?: React.ReactNode;
  faq: React.ReactNode;
  otherModels: React.ReactNode;
}

export default function RWoodGrooveProductPage({ breadcrumbs, specs, downloads, gallery, faq, otherModels }: RWoodGrooveProductPageSlots) {
  const t = useTranslations('rwoodGroovePage');
  const tPage = useTranslations('productPage');
  const tm = useTranslations('manufacturer');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedFinish, setSelectedFinish] = useState<Veneer | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Get the current hero image - default or selected veneer
  const currentHeroImage = selectedFinish ? selectedFinish.image : defaultHeroImage;

  // Fire a single view_item event on mount so GA4 / Meta see
  // the product impression. Empty deps array → fires once per page.
  useEffect(() => {
    analytics.viewItem('rwood-groove', 'rwood');
  }, []);

  const handleFinishSelect = (finish: Veneer) => {
    if (!selectedFinish || finish.id !== selectedFinish.id) {
      setIsImageLoading(true);
      setSelectedFinish(finish);
    }
  };

  // Sticky nav — labels are shared productPage.nav.* keys (translated in all locales)
  const navItems = [
    { id: 'overview', label: tPage('nav.overview') },
    { id: 'patterns', label: tPage('nav.patterns') },
    { id: 'veneers', label: tPage('nav.veneers') },
    { id: 'acoustics', label: tPage('nav.acoustics') },
    { id: 'installation', label: tPage('nav.installation') },
    { id: 'specs', label: tPage('nav.technicalData') },
    { id: 'ordering', label: tPage('nav.ordering') },
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

  // KPI band under the hero — the datasheet's four figures, governed values only
  const kpis = [
    { value: thicknessFigure, label: t('kpi.thickness') },
    {
      value: alphaW,
      label: absorptionClass ? t('kpi.alphaWClass', { cls: absorptionClass }) : t('kpi.alphaW'),
    },
    { value: fireClass, label: t('kpi.fire') },
    { value: STANDARD_PATTERN.dims, label: t('kpi.standardPattern') },
  ].filter((k): k is { value: string; label: string } => k.value !== null);

  const sizesValue = `300 × 2 400 · 2 780 mm${panelSpecs?.thickness ? ` · ${panelSpecs.thickness}` : ''}`;

  return (
    <div className="rwood-groove-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          {breadcrumbs}
          <span className="product-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">
            {t('hero.description')}
          </p>
          <p className="hero-manufacturer">{tm('statement')}</p>

          <div className="hero-usps">
            {PRODUCT.certifications.includes('FSC') && (
              <div className="usp">
                <span className="usp-text">{t('hero.usp1')}</span>
              </div>
            )}
            {/* "Class A absorption" — only while the data αw derives to class A */}
            {absorptionClass === 'A' && (
              <div className="usp">
                <span className="usp-text">{t('hero.usp2')}</span>
              </div>
            )}
            <div className="usp">
              <span className="usp-text">{t('hero.usp3')}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary" onClick={() => analytics.quoteClick('rwood-groove', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">
              {tPage('cta.viewSpecifications')}
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-container">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={selectedFinish ? t('alt.heroIn', { finish: selectedFinish.name }) : t('alt.hero')}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                style={{ objectFit: 'cover' }}
                priority
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  // A missing finish image would leave the spinner hanging
                  // forever — fall back to the default hero and stop loading.
                  setSelectedFinish(null);
                  setIsImageLoading(false);
                }}
              />
            </div>
            {isImageLoading && (
              <div className="image-loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>

          <div className="finish-selector">
            <span className="selector-label">{t('materials.colorSelector')}</span>
            <div className="finish-options">
              {veneers.map((finish) => (
                <button
                  key={finish.id}
                  className={`finish-option ${selectedFinish?.id === finish.id ? 'active' : ''}`}
                  onClick={() => handleFinishSelect(finish)}
                  title={finish.name}
                  aria-label={tPage('a11y.selectFinish', { name: finish.name })}
                  aria-pressed={selectedFinish?.id === finish.id}
                >
                  {/* Optimised 72px thumbnail of the datasheet swatch */}
                  <Image src={finish.swatch} alt="" width={72} height={72} sizes="72px" quality={60} className="finish-swatch" style={{ objectFit: 'cover' }} />
                  {selectedFinish?.id === finish.id && (
                    <span className={`finish-check ${finish.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-finish-name">{selectedFinish?.name ?? t('materials.selectPrompt')}</span>
          </div>
        </div>
      </section>

      {/* KPI band — the datasheet's four figures */}
      {kpis.length > 0 && (
        <section className="kpi-band" aria-label={t('kpi.ariaLabel')}>
          <dl className="kpi-list">
            {kpis.map((k) => (
              <div key={k.label} className="kpi">
                <dt className="kpi-label">{k.label}</dt>
                <dd className="kpi-value">{k.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

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

      {/* Overview + Build-up */}
      <section id="overview" className="content-section overview-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-groove/Where Nature Meets Design.webp"
                alt={t('alt.rwoodGrooveAcousticPanelInModernInterior')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('overview.tag')}</span>
            <h2>{t('overview.title')}</h2>
            <p>
              {t('overview.description2')}
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

        {/* Build-up — datasheet p.1: three numbered layers */}
        <div className="buildup" id="buildup">
          <div className="buildup-visual" aria-hidden="true">
            <div className="bu-layer bu-veneer"><div className="wood-grain"></div></div>
            <div className="bu-layer bu-mdf">
              <div className="groove-slots">
                <div className="slot"></div>
                <div className="slot"></div>
                <div className="slot"></div>
                <div className="slot"></div>
                <div className="slot"></div>
              </div>
            </div>
            <div className="bu-layer bu-felt"></div>
          </div>
          <div className="buildup-info">
            <span className="section-tag">{t('buildUp.tag')}</span>
            <h3>{t('buildUp.title')}</h3>
            <ol className="buildup-list">
              <li>
                <span className="bu-num">01</span>
                <div>
                  <strong>{t('buildUp.layer1')}</strong>
                  <span>{t('buildUp.layer1Desc')}</span>
                </div>
              </li>
              <li>
                <span className="bu-num">02</span>
                <div>
                  <strong>{t('buildUp.layer2')}</strong>
                  <span>{t('buildUp.layer2Desc')}</span>
                </div>
              </li>
              <li>
                <span className="bu-num">03</span>
                <div>
                  <strong>{t('buildUp.layer3')}</strong>
                  <span>{t('buildUp.layer3Desc')}</span>
                </div>
              </li>
            </ol>
            <p className="buildup-note">{t('buildUp.fixing')}</p>
          </div>
        </div>
      </section>

      {/* Pattern — the Original as standard (datasheet p.1, drawn to scale); other layouts on request */}
      <section id="patterns" className="content-section patterns-section dark">
        <div className="patterns-header">
          <span className="section-tag">{t('patterns.tag')}</span>
          <h2>{t('patterns.title')}</h2>
          <p>
            {t('patterns.description2')}
          </p>
        </div>

        <div className="patterns-layout">
          <div className="pattern-card standard">
            <span className="pattern-badge">{t('patterns.standardLabel')}</span>
            <div
              className="plank"
              role="img"
              aria-label={t('patterns.drawingAlt', { name: STANDARD_PATTERN.name, dims: STANDARD_PATTERN.dims })}
              style={{ gap: `${(GROOVE_MM / PLANK_MM) * 100}%` }}
            >
              {STANDARD_PATTERN.lamellas.map((w, i) => (
                <span key={i} className="lamella" style={{ width: `${(w / PLANK_MM) * 100}%` }} />
              ))}
            </div>
            <div className="pattern-info">
              <h3>{STANDARD_PATTERN.name}</h3>
              <span className="pattern-dims">{STANDARD_PATTERN.dims}</span>
              <p>{t(STANDARD_PATTERN.descKey)}</p>
              <span className="pattern-count">{t('patterns.lamellaCount', { count: STANDARD_PATTERN.lamellas.length })}</span>
            </div>
          </div>

          <div className="pattern-card on-request">
            <h3>{t('patterns.onRequestTitle')}</h3>
            <ul className="on-request-list">
              {OTHER_PATTERNS.map((pattern) => (
                <li key={pattern.id}>
                  <span className="on-request-name">{pattern.name}</span>
                  <span className="pattern-dims">{pattern.dims}</span>
                </li>
              ))}
            </ul>
            <p>{t('patterns.onRequestDesc')}</p>
            <Link href="/contact" className="btn-secondary on-dark" onClick={() => analytics.quoteClick('rwood-groove', 'patterns')}>
              {tPage('cta.requestQuote')}
            </Link>
          </div>
        </div>
        <p className="patterns-note">{t('patterns.note')}</p>
      </section>

      {/* Veneers and finishes — datasheet p.3 */}
      <section id="veneers" className="content-section veneers-section">
        <div className="veneers-header">
          <span className="section-tag">{t('veneers.tag')}</span>
          <h2>{t('veneers.title')}</h2>
          <p>{t('veneers.description')}</p>
        </div>

        <div className="veneer-grid">
          {veneers.map((veneer) => (
            <button
              key={veneer.id}
              type="button"
              className={`veneer-card ${selectedFinish?.id === veneer.id ? 'active' : ''}`}
              onClick={() => handleFinishSelect(veneer)}
              aria-pressed={selectedFinish?.id === veneer.id}
              aria-label={tPage('a11y.selectVeneer', { name: veneer.name })}
            >
              <span className="veneer-swatch-wrap">
                <Image
                  src={veneer.swatch}
                  alt={t('alt.veneerSwatch', { name: veneer.name })}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                  quality={70}
                  style={{ objectFit: 'cover' }}
                />
              </span>
              <span className="veneer-name">{veneer.name}</span>
              <span className="veneer-desc">{t(veneer.descKey)}</span>
            </button>
          ))}
        </div>

        <div className="finish-grid">
          <div className="finish-card">
            <h3>{t('materials.oilFinishesTitle')}</h3>
            <p>{t('materials.oilFinishesDesc')}</p>
          </div>
          <div className="finish-card">
            <h3>{t('materials.walnutTitle')}</h3>
            <p>{t('materials.walnutDesc')}</p>
          </div>
          <div className="finish-card">
            <h3>{t('feltBacking.title')}</h3>
            <p>{t('feltBacking.description')}</p>
            <ul className="felt-list">
              {feltColours.map((felt) => (
                <li key={felt.id} className="felt-item">
                  <span className="felt-swatch" style={{ backgroundColor: felt.color }} aria-hidden="true" />
                  <span className="felt-name">{t(felt.labelKey)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="veneers-note">{t('veneers.guideNote')}</p>
      </section>

      {/* Acoustics — datasheet p.2 */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="acoustics-header">
          <span className="section-tag">{t('acoustics.tag')}</span>
          <h2>{t('acoustics.title')}</h2>
          <p>
            {t('acoustics.description2')}
          </p>
        </div>

        <div className="acoustics-grid">
          <div className="table-wrap">
            <table className="data-table">
              <caption>{t('acoustics.tableTitle')}</caption>
              <tbody>
                {alphaW && (
                  <tr>
                    <th scope="row">{tPage('specs.absorptionCoeff')}</th>
                    <td>{alphaW}</td>
                  </tr>
                )}
                {absorptionClass && (
                  <tr>
                    <th scope="row">{tPage('specs.absorptionClass')}</th>
                    <td>{absorptionClass}</td>
                  </tr>
                )}
                <tr>
                  <th scope="row">{tPage('specs.testStandard')}</th>
                  <td>EN ISO 354 · EN ISO 11654</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="info-card">
            <h3>{t('acoustics.behindTitle')}</h3>
            <p>{t('acoustics.behindDesc')}</p>
          </div>
        </div>
        <p className="acoustics-note">{t('acoustics.note')}</p>
      </section>

      {/* Installation — datasheet p.2, four steps */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">{t('installation.tag')}</span>
            <h2>{t('installation.title')}</h2>
            <p>
              {t('installation.description2')}
            </p>

            <ol className="installation-steps">
              <li className="install-step">
                <div className="step-number">01</div>
                <div className="step-content">
                  <h3>{t('installation.step1Title')}</h3>
                  <p>{t('installation.step1Desc')}</p>
                </div>
              </li>
              <li className="install-step">
                <div className="step-number">02</div>
                <div className="step-content">
                  <h3>{t('installation.step2Title')}</h3>
                  <p>{t('installation.step2Desc')}</p>
                </div>
              </li>
              <li className="install-step">
                <div className="step-number">03</div>
                <div className="step-content">
                  <h3>{t('installation.step3Title')}</h3>
                  <p>{t('installation.step3Desc')}</p>
                </div>
              </li>
              <li className="install-step">
                <div className="step-number">04</div>
                <div className="step-content">
                  <h3>{t('installation.step4Title')}</h3>
                  <p>{t('installation.step4Desc')}</p>
                </div>
              </li>
            </ol>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-groove/seamless installation.jpg"
                alt={t('alt.panelInstallationProcess')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability */}
      <section className="content-section sustainability-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-groove/FSC_CERT.webp"
                alt={t('alt.sustainableForestry')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('sustainability.tag')}</span>
            <h2>{t('sustainability.title')}</h2>
            <p>
              {t('sustainability.description2')}
            </p>
            <div className="sustainability-features">
              {PRODUCT.certifications.includes('FSC') && (
                <div className="sustain-item">
                  <div>
                    <h3>{t('sustainability.badge1')}</h3>
                    <p>{t('sustainability.badge1Desc')}</p>
                  </div>
                </div>
              )}
              <div className="sustain-item">
                <div>
                  <h3>{t('sustainability.badge2')}</h3>
                  {/* OEKO-TEX only while the felt certification is in product data */}
                  <p>{PRODUCT.certifications.includes('OEKO-TEX') ? t('sustainability.badge2DescCert') : t('sustainability.badge2Desc')}</p>
                </div>
              </div>
              {/* Origin badge: only when the plant is confirmed in product data (PL → Częstochowa) */}
              {PRODUCT.madeIn === 'PL' && (
                <div className="sustain-item">
                  <div>
                    <h3>{t('sustainability.badge3')}</h3>
                    <p>{t('sustainability.badge3Desc')}</p>
                  </div>
                </div>
              )}
              {/* EPD badge only while the certification is in product data */}
              {PRODUCT.certifications.includes('EPD') && (
                <div className="sustain-item">
                  <div>
                    <h3>{t('sustainability.badge5')}</h3>
                    <p>{t('sustainability.badge5Desc')}</p>
                  </div>
                </div>
              )}
              <div className="sustain-item">
                <div>
                  <h3>{t('sustainability.badge4')}</h3>
                  <p>{t('sustainability.badge4Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical data — server-rendered (ProductSpecs) */}
      {specs}

      {/* Ordering — datasheet p.3 */}
      <section id="ordering" className="content-section ordering-section">
        <div className="ordering-inner">
          <div className="ordering-header">
            <span className="section-tag">{tPage('ordering.tag')}</span>
            <h2>{t('ordering.title')}</h2>
          </div>

          <div className="ordering-tables">
            <div className="table-wrap">
              <table className="data-table">
                <caption>{t('ordering.orderCaption')}</caption>
                <tbody>
                  <tr>
                    <th scope="row">{tPage('ordering.leadTime')}</th>
                    <td>{t('ordering.leadTimeVal')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.minimumOrder')}</th>
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.sizes')}</th>
                    <td>{sizesValue}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <caption>{t('ordering.supplyCaption')}</caption>
                <tbody>
                  <tr>
                    <th scope="row">{tPage('ordering.samples')}</th>
                    <td>{t('ordering.samplesVal')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.prices')}</th>
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  {PRODUCT.madeIn && (
                    <tr>
                      <th scope="row">{tPage('ordering.madeIn')}</th>
                      <td>{tm(`plant.${PRODUCT.madeIn}`)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="ordering-band">
            <div className="ordering-band-col">
              <h3>{tPage('ordering.endOfLife')}</h3>
              <p>{tPage('ordering.takeBack')}</p>
            </div>
            <div className="ordering-band-col">
              <h3>{tPage('ordering.samplesQuotes')}</h3>
              <p>{t('ordering.samplesQuotesDesc')}</p>
              <div className="ordering-ctas">
                <Link href="/samples" className="btn-primary" onClick={() => analytics.quoteClick('rwood-groove', 'ordering_samples')}>
                  {tPage('ordering.requestSamples')}
                </Link>
                <Link href="/contact" className="btn-secondary on-dark" onClick={() => analytics.quoteClick('rwood-groove', 'ordering_quote')}>
                  {tPage('ordering.requestQuote')}
                </Link>
              </div>
            </div>
          </div>
          <p className="data-note">{tPage('ordering.dataNote')}</p>
        </div>
      </section>

      {/* Projects & Installations — server-rendered (ProductGallery) */}
      {gallery}

      {/* Downloads — server-rendered (ProductDownloads) */}
      {downloads}

      {/* Accessories Section — datasheet p.3 "Accessories" */}
      <section className="content-section accessories-section dark">
        <div className="accessories-header">
          <span className="section-tag">{t('accessories.tag')}</span>
          <h2>{t('accessories.title')}</h2>
          <p>{t('accessories.description')}</p>
        </div>

        <div className="accessories-grid">
          <div className="accessory-card">
            <h3>{t('accessories.item1Title')}</h3>
            <p>{t('accessories.item1Desc')}</p>
          </div>
          <div className="accessory-card">
            <h3>{t('accessories.item2Title')}</h3>
            <p>{t('accessories.item2Desc')}</p>
          </div>
          <div className="accessory-card">
            <h3>{t('accessories.item3Title')}</h3>
            <p>{t('accessories.item3Desc')}</p>
          </div>
          <div className="accessory-card">
            <h3>{t('accessories.item4Title')}</h3>
            <p>{t('accessories.item4Desc')}</p>
          </div>
        </div>
      </section>

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
            <Link href="/contact" className="btn-primary large" onClick={() => analytics.quoteClick('rwood-groove', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="tel:+3232846818" className="btn-secondary large" onClick={() => analytics.phoneClick('product_cta_rwood-groove')}>
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">
            {t('cta2.freeNote')}
          </p>
        </div>
      </section>

      <style jsx>{`
        .rwood-groove-product-page {
          /* Brand tokens come from :root (globals.css): --brand-blue #197FC7,
             --deep-blue #0d3a5c, --cream, --font-heading. Page-local extras: */
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --line: #e6ecf1;
          --table-head: #f2f6fa;
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
          font-size: 4rem;
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
          margin-bottom: 1.25rem;
          max-width: 520px;
        }

        /* .hero-manufacturer is styled in src/styles/product-shared.css */

        .hero-usps {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem 2rem;
          margin-bottom: 2rem;
        }

        .usp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }

        .hero-ctas {
          display: flex;
          flex-wrap: wrap;
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

        .btn-secondary.on-dark { color: white; border-color: rgba(255, 255, 255, 0.7); }
        .btn-secondary.on-dark:hover { background: white; color: var(--deep-blue); }

        .btn-secondary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

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
          color: #767676;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .finish-options { display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }

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

        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* KPI band — the datasheet's dark strip with four big figures */
        .kpi-band {
          padding: 0 4rem;
          margin-top: -1rem;
          margin-bottom: 1.5rem;
        }

        .kpi-list {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 2.5rem;
          background: var(--deep-blue);
          color: white;
          border-radius: 20px;
        }

        .kpi { display: flex; flex-direction: column-reverse; gap: 0.35rem; margin: 0; }

        .kpi-value {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 600;
          line-height: 1;
          color: #7ec8f5;
          margin: 0;
        }

        .kpi-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.8); line-height: 1.4; }

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
          overflow-x: auto;
          scrollbar-width: none;
        }

        .nav-inner::-webkit-scrollbar { display: none; }

        .nav-item {
          padding: 1.25rem 1.1rem;
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          white-space: nowrap;
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

        .check { color: var(--brand-blue); font-weight: bold; }

        /* Shared two-column data table (datasheet style: light header row) */
        .table-wrap { width: 100%; overflow-x: auto; }

        .data-table {
          width: 100%;
          min-width: 280px;
          border-collapse: collapse;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
        }

        .data-table caption {
          caption-side: top;
          text-align: left;
          padding: 0.75rem 1.25rem;
          background: var(--table-head);
          color: var(--deep-blue);
          font-size: 0.85rem;
          font-weight: 600;
          border: 1px solid var(--line);
          border-bottom: none;
          border-radius: 12px 12px 0 0;
        }

        .data-table th,
        .data-table td {
          padding: 0.7rem 1.25rem;
          border-top: 1px solid var(--line);
          font-size: 0.9rem;
          text-align: left;
          vertical-align: top;
        }

        .data-table th { font-weight: 500; color: #666; width: 42%; }
        .data-table td { color: var(--deep-blue); font-weight: 600; }

        .info-card {
          background: var(--cream);
          border-radius: 16px;
          padding: 1.5rem 1.75rem;
        }

        .info-card h3 { font-size: 1.1rem; color: var(--deep-blue); margin: 0 0 0.5rem; }
        .info-card p { font-size: 0.95rem; color: #555; line-height: 1.6; margin: 0; }

        .data-note,
        .patterns-note,
        .veneers-note,
        .acoustics-note {
          max-width: 1200px;
          margin: 1.5rem auto 0;
          font-size: 0.85rem;
          color: #767676;
          line-height: 1.6;
        }

        .patterns-note { color: rgba(255, 255, 255, 0.65); }

        /* Build-up */
        .buildup {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          max-width: 1200px;
          margin: 4rem auto 0;
          padding: 2.5rem;
          background: var(--cream);
          border-radius: 20px;
        }

        .buildup-visual {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 360px;
          margin: 0 auto;
          width: 100%;
        }

        .bu-layer { border-radius: 6px; position: relative; overflow: hidden; }

        .bu-veneer {
          height: 22px;
          background: linear-gradient(90deg, #c4a77d 0%, #d4a954 30%, #c4a77d 60%, #b89860 100%);
        }

        .wood-grain {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(90deg, transparent 0 8px, rgba(139, 105, 20, 0.15) 8px 10px);
        }

        .bu-mdf {
          height: 56px;
          background: #d4c4a0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .groove-slots { display: flex; gap: 34px; }

        .groove-slots .slot {
          width: 15px;
          height: 40px;
          background: var(--deep-blue);
          border-radius: 0 0 3px 3px;
        }

        .bu-felt { height: 12px; background: #2d2d2d; }

        .buildup-info h3 { font-size: 1.5rem; color: var(--deep-blue); margin: 0 0 1.25rem; }

        .buildup-list { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.9rem; }

        .buildup-list li { display: flex; gap: 0.9rem; align-items: flex-start; }

        .buildup-list li div { display: flex; flex-direction: column; }
        .buildup-list strong { color: var(--deep-blue); font-size: 1rem; }
        .buildup-list span:not(.bu-num) { color: #666; font-size: 0.9rem; }

        .bu-num {
          font-family: var(--font-heading);
          font-weight: 600;
          color: var(--brand-blue);
          font-size: 0.95rem;
          min-width: 1.8rem;
          padding-top: 0.1rem;
        }

        .buildup-note { font-size: 0.9rem; color: #767676; margin: 0; }

        /* Patterns (dark section) */
        .patterns-header,
        .acoustics-header,
        .veneers-header,
        .accessories-header,
        .ordering-header {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3rem;
        }

        .patterns-header h2,
        .accessories-header h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .patterns-header p,
        .accessories-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .patterns-layout {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 1.5rem;
          max-width: 1040px;
          margin: 0 auto;
          align-items: start;
        }

        .pattern-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 1.5rem;
          position: relative;
        }

        .pattern-card.standard { border-color: rgba(126, 200, 245, 0.6); }

        .pattern-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--deep-blue);
          background: #7ec8f5;
          border-radius: 999px;
          padding: 0.3rem 0.7rem;
        }

        .pattern-card.on-request { display: flex; flex-direction: column; gap: 1rem; }
        .pattern-card.on-request h3 { color: white; font-size: 1.1rem; margin: 0; }
        .pattern-card.on-request p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.75); line-height: 1.6; margin: 0; }
        .pattern-card.on-request .btn-secondary { align-self: flex-start; padding: 0.75rem 1.5rem; font-size: 0.9rem; }

        .on-request-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .on-request-list li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        .on-request-name { color: white; font-weight: 600; }

        .plank {
          display: flex;
          justify-content: center;
          align-items: stretch;
          aspect-ratio: 16 / 10;
          width: 100%;
          padding: 8% 0;
          background: #e8f2fa;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 8px;
          box-sizing: border-box;
        }

        .lamella {
          display: block;
          flex: 0 0 auto;
          background: var(--deep-blue);
          border-radius: 1px;
        }

        .pattern-info { margin-top: 1rem; }
        .pattern-info h3 { color: white; font-size: 1.1rem; margin: 0 0 0.2rem; }
        .pattern-dims { display: block; font-size: 0.95rem; font-weight: 600; color: #7ec8f5; }
        .pattern-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin: 0.4rem 0 0.2rem; }
        .pattern-count { font-size: 0.8rem; color: rgba(255, 255, 255, 0.5); }

        /* Veneers and finishes */
        .veneers-header h2,
        .acoustics-header h2,
        .ordering-header h2 { font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1rem; letter-spacing: -1px; }
        .veneers-header p,
        .acoustics-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }

        .veneer-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.25rem;
          max-width: 1200px;
          margin: 0 auto 2.5rem;
        }

        .veneer-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.2rem;
          padding: 0;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font: inherit;
        }

        .veneer-swatch-wrap {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 872 / 640;
          border-radius: 12px;
          overflow: hidden;
          border: 3px solid transparent;
          transition: border-color 0.2s ease, transform 0.2s ease;
          margin-bottom: 0.5rem;
          background: var(--cream);
        }

        .veneer-card:hover .veneer-swatch-wrap { transform: translateY(-2px); }
        .veneer-card.active .veneer-swatch-wrap { border-color: var(--brand-blue); }
        .veneer-card:focus-visible { outline: 2px solid var(--brand-blue); outline-offset: 4px; border-radius: 12px; }

        .veneer-name { font-family: var(--font-heading); font-weight: 600; color: var(--deep-blue); font-size: 1rem; }
        .veneer-desc { font-size: 0.85rem; color: #666; }

        .finish-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .finish-card {
          padding: 1.5rem;
          background: var(--cream);
          border-radius: 12px;
        }

        .finish-card h3 { color: var(--deep-blue); font-size: 1.05rem; margin: 0 0 0.5rem; }
        .finish-card p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.6; }

        .felt-list { list-style: none; padding: 0; margin: 0.9rem 0 0; display: flex; gap: 1rem; flex-wrap: wrap; }
        .felt-item { display: flex; align-items: center; gap: 0.5rem; }

        .felt-swatch {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .felt-name { font-size: 0.9rem; font-weight: 500; color: var(--charcoal); }

        /* Acoustics */
        .acoustics-section { background: var(--cream); }

        .acoustics-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          align-items: start;
        }

        .acoustics-section .info-card { background: white; }
        .acoustics-note { max-width: 1000px; }

        /* Installation Section */
        .installation-steps {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 2rem 0 0;
        }

        .install-step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .step-number {
          font-family: var(--font-heading);
          font-weight: 600;
          color: #7ec8f5;
          min-width: 2.2rem;
          padding-top: 0.15rem;
        }

        .step-content h3 { color: white; font-size: 1.05rem; margin: 0 0 0.25rem; }
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

        .sustain-item h3 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: #666; margin: 0; }

        /* Ordering */
        .ordering-section { background: white; }
        .ordering-inner { max-width: 1200px; margin: 0 auto; }

        .ordering-tables {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .ordering-band {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 2.5rem;
          background: var(--deep-blue);
          color: white;
          border-radius: 20px;
        }

        .ordering-band h3 { font-size: 1.25rem; color: white; margin: 0 0 0.75rem; }
        .ordering-band p { font-size: 0.95rem; color: rgba(255, 255, 255, 0.8); line-height: 1.7; margin: 0 0 1.25rem; }
        .ordering-ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; }

        /* Accessories Section */
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

        .accessory-card h3 { color: white; font-size: 1.05rem; margin-bottom: 0.5rem; }
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
          .kpi-band { padding: 0 2rem; }
          .kpi-list { grid-template-columns: repeat(2, 1fr); }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .section-grid.reverse { direction: ltr; }
          .buildup { grid-template-columns: 1fr; }
          .patterns-layout { grid-template-columns: 1fr; }
          .veneer-grid { grid-template-columns: repeat(3, 1fr); }
          .finish-grid { grid-template-columns: 1fr; }
          .acoustics-grid { grid-template-columns: 1fr; }
          .accessories-grid { grid-template-columns: repeat(2, 1fr); }
          .sustainability-features { grid-template-columns: 1fr; }
          .ordering-tables { grid-template-columns: 1fr; }
          .ordering-band { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .content-section { padding: 4rem 1.5rem; }
          .product-nav { padding: 0 1rem; }
          .nav-item { padding: 1rem 0.9rem; font-size: 0.85rem; }
          .hero-ctas { flex-direction: column; }
          .section-content h2,
          .patterns-header h2,
          .veneers-header h2,
          .acoustics-header h2,
          .ordering-header h2,
          .accessories-header h2 { font-size: 2rem; }
          .patterns-layout { grid-template-columns: 1fr; }
          .veneer-grid { grid-template-columns: repeat(2, 1fr); }
          .accessories-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
          .buildup { padding: 1.5rem; }
          .ordering-band { padding: 1.75rem; }
        }

        @media (max-width: 480px) {
          .content-section { padding: 3rem 1rem; }
          .product-hero { padding: 5rem 1rem 2rem; }
          .hero-content h1 { font-size: 2.4rem; letter-spacing: -1px; }
          .kpi-band { padding: 0 1rem; }
          .kpi-list { grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1.5rem 1.25rem; }
          .kpi-value { font-size: 2rem; }
          .veneer-grid { grid-template-columns: 1fr 1fr; gap: 0.9rem; }
          .finish-selector { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
