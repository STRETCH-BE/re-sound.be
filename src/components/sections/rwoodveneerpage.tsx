'use client';

import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { PRODUCTS } from '@/data/products';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Single source for every governed figure on this page (thickness, format,
// fire class, number of veneers, plant, certifications): src/data/products.ts.
// Nothing below may hard-code one of these values. rWood Panel has no
// datasheet of its own: the veneers, ranges and finishes come from the rWood
// colour and finish guide (EN · 09/2026, v1.0, "For rWood Panel, Micro, Perf
// and Groove").
const PRODUCT = PRODUCTS['rwood-veneer'];
const panelSpecs = PRODUCT.specs.kind === 'panel' ? PRODUCT.specs : null;
// thickness is stored as '12 / 19 mm' → ['12 mm', '19 mm'] (slim first, standard last)
const thicknessOptions = panelSpecs?.thickness
  ? panelSpecs.thickness.replace(/\s*mm\s*$/, '').split('/').map((s) => `${s.trim()} mm`)
  : [];
const slimThickness = thicknessOptions[0] ?? '';
const standardThickness = thicknessOptions[thicknessOptions.length - 1] ?? '';
// '1220 × 2800 / 3050 mm' → '1 220 × 2 800 / 3 050 mm' (thin spaces, as the datasheets write numbers)
const thinSpaced = (s: string) => s.replace(/\b(\d)(\d{3})\b/g, '$1 $2');
const formatValue = panelSpecs?.format ? thinSpaced(panelSpecs.format) : null;
const veneerCount = panelSpecs?.finishCount ?? null;

/**
 * The twelve stock veneers of the rWood colour and finish guide, in the
 * guide's order and groups (six oaks, six premium species). Names are the
 * product's own veneer names (identical in every language); the one-line
 * tone descriptions are message keys. Swatches are the guide photographs
 * (public/images/products/rwood/guide). Where an existing product photo of a
 * panel in that veneer exists it is the hero preview; otherwise the swatch is.
 */
const GUIDE = '/images/products/rwood/guide';
const PHOTOS = '/images/products/rwood-veneer';
const veneerCollections = [
  {
    id: 'oak',
    veneers: [
      { id: 'straw-oak', name: 'Straw Oak', descKey: 'collection.items.strawOak', swatch: `${GUIDE}/straw-oak.webp`, image: `${PHOTOS}/straw-oak.jpg`, isDark: false },
      { id: 'silk-oak', name: 'Silk Oak', descKey: 'collection.items.silkOak', swatch: `${GUIDE}/silk-oak.webp`, image: `${PHOTOS}/silk-oak.jpg`, isDark: false },
      { id: 'honey-oak', name: 'Honey Oak', descKey: 'collection.items.honeyOak', swatch: `${GUIDE}/honey-oak.webp`, image: `${GUIDE}/honey-oak.webp`, isDark: false },
      { id: 'umber-oak', name: 'Umber Oak', descKey: 'collection.items.umberOak', swatch: `${GUIDE}/umber-oak.webp`, image: `${PHOTOS}/umber-oak.jpg`, isDark: true },
      { id: 'smoked-oak', name: 'Smoked Oak', descKey: 'collection.items.smokedOak', swatch: `${GUIDE}/smoked-oak.webp`, image: `${PHOTOS}/smoked-oak.jpg`, isDark: true },
      { id: 'cocoa-oak', name: 'Cocoa Oak', descKey: 'collection.items.cocoaOak', swatch: `${GUIDE}/cocoa-oak.webp`, image: `${GUIDE}/cocoa-oak.webp`, isDark: true },
    ],
  },
  {
    id: 'premium',
    veneers: [
      { id: 'walnut', name: 'Walnut', descKey: 'collection.items.walnut', swatch: `${GUIDE}/walnut.webp`, image: `${PHOTOS}/walnut.jpg`, isDark: true },
      { id: 'tobacco-walnut', name: 'Tobacco Walnut', descKey: 'collection.items.tobaccoWalnut', swatch: `${GUIDE}/tobacco-walnut.webp`, image: `${PHOTOS}/tobacco-walnut.jpg`, isDark: true },
      { id: 'white-ash', name: 'White Ash', descKey: 'collection.items.whiteAsh', swatch: `${GUIDE}/white-ash.webp`, image: `${GUIDE}/white-ash.webp`, isDark: false },
      { id: 'white-beech', name: 'White Beech', descKey: 'collection.items.whiteBeech', swatch: `${GUIDE}/white-beech.webp`, image: `${GUIDE}/white-beech.webp`, isDark: false },
      { id: 'birch-sliced', name: 'Birch (Sliced)', descKey: 'collection.items.birchSliced', swatch: `${GUIDE}/birch-sliced.webp`, image: `${PHOTOS}/Birch-Sliced.jpg`, isDark: false },
      { id: 'birch-rotary', name: 'Birch (Rotary)', descKey: 'collection.items.birchRotary', swatch: `${GUIDE}/birch-rotary.webp`, image: `${PHOTOS}/Birch-Rotary.jpg`, isDark: false },
    ],
  },
];

// All veneers flat for the selector
const allVeneers = veneerCollections.flatMap((c) => c.veneers);
type Veneer = (typeof allVeneers)[number];

// Guide p.2 "Surface treatments": natural lacquer · pigmented · HPL laminate · foil · paint
const surfaceTreatments = ['naturalLacquer', 'pigmented', 'hpl', 'foil', 'paint'] as const;

// Default hero image
const defaultHeroImage = '/images/products/rwood-veneer/hero-rwood-veneer.webp';

/**
 * Server-rendered sections passed in as React nodes ("slots") by the route
 * page — specs, downloads, gallery, FAQ and "other models" no longer live in
 * this client component, so they are excluded from the hydration bundle.
 */
export interface RWoodPanelProductPageSlots {
  /** Visible breadcrumb trail (Home › Products › range › model), floated over the hero */
  breadcrumbs?: React.ReactNode;
  specs: React.ReactNode;
  downloads: React.ReactNode;
  gallery?: React.ReactNode;
  faq: React.ReactNode;
  otherModels: React.ReactNode;
}

export default function RWoodPanelProductPage({ breadcrumbs, specs, downloads, gallery, faq, otherModels }: RWoodPanelProductPageSlots) {
  const t = useTranslations('rwoodVeneerPage');
  const tPage = useTranslations('productPage');
  const tm = useTranslations('manufacturer');

  // Panel format options (inside component so t() is available)
  const formatOptions = [
    { id: 'standard', name: t('dimensions.standardName'), width: '1 220 mm', length: '2 800 mm', thickness: standardThickness, description: t('dimensions.standardDesc') },
    { id: 'large', name: t('dimensions.largeName'), width: '1 220 mm', length: '3 050 mm', thickness: standardThickness, description: t('dimensions.largeDesc') },
    { id: 'slim', name: t('dimensions.slimName'), width: '1 220 mm', length: '2 800 mm', thickness: slimThickness, description: t('dimensions.slimDesc') },
  ];

  const [activeSection, setActiveSection] = useState('overview');
  const [selectedVeneer, setSelectedVeneer] = useState<Veneer | null>(null);
  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState(formatOptions[0]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const currentHeroImage = selectedVeneer ? selectedVeneer.image : defaultHeroImage;

  const displayedVeneers = activeCollection === 'all'
    ? allVeneers
    : veneerCollections.find((c) => c.id === activeCollection)?.veneers ?? [];

  // Fire a single view_item event on mount so GA4 / Meta see
  // the product impression. Empty deps array → fires once per page.
  useEffect(() => {
    analytics.viewItem('rwood-veneer', 'rwood');
  }, []);

  const handleVeneerSelect = (veneer: Veneer) => {
    if (!selectedVeneer || veneer.id !== selectedVeneer.id) {
      setIsImageLoading(true);
      setSelectedVeneer(veneer);
    }
  };

  // Sticky nav — labels are shared productPage.nav.* keys (translated in all locales)
  const navItems = [
    { id: 'overview', label: tPage('nav.overview') },
    { id: 'collection', label: tPage('nav.veneers') },
    { id: 'finishes', label: tPage('nav.finishes') },
    { id: 'formats', label: tPage('nav.formats') },
    { id: 'applications', label: tPage('nav.applications') },
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
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // KPI band under the hero — the guide's four figures
  const kpis = [
    { value: veneerCount === null ? null : String(veneerCount), label: t('kpi.veneers') },
    { value: '2', label: t('kpi.ranges') },
    { value: PRODUCT.certifications.includes('FSC') ? 'FSC®' : null, label: t('kpi.fsc') },
    { value: t('kpi.anyValue'), label: t('kpi.anyLabel') },
  ].filter((k): k is { value: string; label: string } => k.value !== null);

  const sizesValue = [formatValue, panelSpecs?.thickness].filter(Boolean).join(' · ');

  return (
    <div className="rwood-panel-page">

      {/* ═══════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════ */}
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
            <div className="usp">
              <span className="usp-text">{t('hero.usp2')}</span>
            </div>
            <div className="usp">
              <span className="usp-text">{t('hero.usp3')}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary" onClick={() => analytics.quoteClick('rwood-veneer', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="#collection" onClick={(e) => { e.preventDefault(); scrollToSection('collection'); }} className="btn-secondary">
              {t('hero.ctaSecondary')}
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-container hero-img">
            <div className={`image-wrapper ${isImageLoading ? 'loading' : ''}`}>
              <Image
                src={currentHeroImage}
                alt={selectedVeneer ? t('alt.heroIn', { veneer: selectedVeneer.name }) : t('alt.hero')}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                style={{ objectFit: 'cover' }}
                priority
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  // A missing veneer image would leave the spinner hanging
                  // forever — fall back to the default hero and stop loading.
                  setSelectedVeneer(null);
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

          {/* Veneer quick-selector — all twelve stock veneers */}
          <div className="veneer-quick-selector">
            <span className="selector-label">{t('hero.colorSelector')}</span>
            <div className="veneer-options">
              {allVeneers.map((veneer) => (
                <button
                  key={veneer.id}
                  className={`veneer-option ${selectedVeneer?.id === veneer.id ? 'active' : ''}`}
                  onClick={() => handleVeneerSelect(veneer)}
                  title={veneer.name}
                  aria-label={tPage('a11y.selectVeneer', { name: veneer.name })}
                  aria-pressed={selectedVeneer?.id === veneer.id}
                >
                  <Image src={veneer.swatch} alt="" width={72} height={72} sizes="72px" quality={60} className="veneer-swatch" style={{ objectFit: 'cover' }} />
                  {selectedVeneer?.id === veneer.id && (
                    <span className={`veneer-check ${veneer.isDark ? 'on-dark' : 'on-light'}`}>✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-veneer-name">{selectedVeneer?.name ?? t('hero.selectPrompt')}</span>
          </div>
        </div>
      </section>

      {/* KPI band — the guide's four figures */}
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
                src="/images/products/rwood-veneer/overview-craftsmanship.webp"
                alt={t('alt.rwoodPanelVeneeredMdfPanelCloseUpShowing')}
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
              {t('overview.description')}
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
              <li>
                <span className="check">✓</span>
                {t('overview.feature5')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BUILD-UP
          ═══════════════════════════════════ */}
      <section id="buildup" className="content-section composition-section">
        <div className="composition-header">
          <span className="section-tag">{t('anatomy.tag')}</span>
          <h2>{t('anatomy.title')}</h2>
          <p>{t('anatomy.description')}</p>
        </div>

        <div className="composition-diagram">
          <div className="comp-visual" aria-hidden="true">
            <div className="comp-layer-visual veneer-top"><div className="grain-texture"></div></div>
            <div className="comp-layer-visual mdf-core"><span className="core-label">MDF</span></div>
            <div className="comp-layer-visual veneer-back"><div className="grain-texture"></div></div>
          </div>
          <ol className="comp-list">
            <li className="comp-layer-info">
              <span className="comp-layer-number">01</span>
              <div>
                <h3>{t('anatomy.layer1')}</h3>
                <p>{t('anatomy.layer1Desc')}</p>
              </div>
            </li>
            <li className="comp-layer-info">
              <span className="comp-layer-number">02</span>
              <div>
                <h3>{t('anatomy.layer2')}</h3>
                <p>{t('anatomy.layer2Desc')}</p>
              </div>
            </li>
            <li className="comp-layer-info">
              <span className="comp-layer-number">03</span>
              <div>
                <h3>{t('anatomy.layer3')}</h3>
                <p>{t('anatomy.layer3Desc')}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ═══════════════════════════════════
          VENEER COLLECTION — colour and finish guide, twelve veneers
          ═══════════════════════════════════ */}
      <section id="collection" className="content-section collection-section dark">
        <div className="collection-header">
          <span className="section-tag">{t('collection.tag')}</span>
          <h2>{t('collection.title')}</h2>
          <p>
            {t('collection.description')}
          </p>
        </div>

        {/* Category filter */}
        <div className="collection-filter" role="group" aria-label={t('collection.filterLabel')}>
          <button
            className={`filter-btn ${activeCollection === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCollection('all')}
            aria-pressed={activeCollection === 'all'}
          >
            {t('collection.filterAll')}
          </button>
          {veneerCollections.map((col) => (
            <button
              key={col.id}
              className={`filter-btn ${activeCollection === col.id ? 'active' : ''}`}
              onClick={() => setActiveCollection(col.id)}
              aria-pressed={activeCollection === col.id}
            >
              {t(`collection.categories.${col.id}`)}
            </button>
          ))}
        </div>

        {/* Veneer cards grid */}
        <div className="veneer-grid">
          {displayedVeneers.map((veneer) => (
            <button
              key={veneer.id}
              type="button"
              className={`veneer-card ${selectedVeneer?.id === veneer.id ? 'active' : ''}`}
              onClick={() => handleVeneerSelect(veneer)}
              aria-pressed={selectedVeneer?.id === veneer.id}
              aria-label={tPage('a11y.selectVeneer', { name: veneer.name })}
            >
              <span className="veneer-card-image">
                <Image
                  src={veneer.swatch}
                  alt={t('alt.veneerSwatch', { name: veneer.name })}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                  quality={70}
                  className="veneer-card-swatch"
                  style={{ objectFit: 'cover' }}
                />
              </span>
              <span className="veneer-card-info">
                <span className="veneer-card-name">{veneer.name}</span>
                <span className="veneer-card-desc">{t(veneer.descKey)}</span>
              </span>
              {selectedVeneer?.id === veneer.id && (
                <span className="veneer-card-selected" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="collection-note">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7ec8f5" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>{t('collection.customNote')}</span>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FINISHES — guide p.2 "Surface finishes and options"
          ═══════════════════════════════════ */}
      <section id="finishes" className="content-section finishes-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">{t('finishes.tag')}</span>
            <h2>{t('finishes.title')}</h2>
            <p>
              {t('finishes.description')}
            </p>

            <div className="range-grid">
              <div className="range-card">
                <h3>{t('finishes.nature')}</h3>
                <p>{t('finishes.natureDesc')}</p>
              </div>
              <div className="range-card">
                <h3>{t('finishes.gemini')}</h3>
                <p>{t('finishes.geminiDesc')}</p>
              </div>
            </div>

            <h3 className="treatments-title">{t('finishes.treatmentsTitle')}</h3>
            <ul className="treatment-list">
              {surfaceTreatments.map((id) => (
                <li key={id} className="treatment-chip">{t(`finishes.treatments.${id}`)}</li>
              ))}
            </ul>
            <p className="finishes-note">{t('finishes.madeToOrder')}</p>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-veneer/finish-detail.webp"
                alt={t('alt.closeUpOfLacqueredVeneerSurface')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
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
          <span className="section-tag">{t('dimensions.tag')}</span>
          <h2>{t('dimensions.title')}</h2>
          <p>{t('dimensions.description')}</p>
        </div>

        <div className="formats-grid">
          {formatOptions.map((format) => (
            <div
              key={format.id}
              className={`format-card ${selectedFormat.id === format.id ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedFormat(format)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (e.key === ' ') e.preventDefault();
                  setSelectedFormat(format);
                }
              }}
            >
              <div className="format-visual">
                <div className={`format-panel format-${format.id}`}>
                  <span className="format-dim-w">{format.width}</span>
                  <span className="format-dim-l">{format.length}</span>
                </div>
              </div>
              <div className="format-info">
                <h3>{format.name}</h3>
                <p>{format.description}</p>
                <div className="format-specs">
                  <span>{format.width} × {format.length}</span>
                  {format.thickness && <span>{t('dimensions.thicknessLabel')} {format.thickness}</span>}
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
          <span className="section-tag">{t('applications.tag')}</span>
          <h2>{t('applications.title')}</h2>
          <p>
            {t('applications.description')}
          </p>
        </div>

        <div className="applications-grid">
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="2" y="6" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
                <path d="M6 6V4"/>
                <path d="M18 6V4"/>
              </svg>
            </div>
            <h3>{t('applications.app1Title')}</h3>
            <p>{t('applications.app1Desc')} {t('applications.app1Extra')}</p>
          </div>
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 3v18"/>
              </svg>
            </div>
            <h3>{t('applications.app2Title')}</h3>
            <p>{t('applications.app2Desc')} {t('applications.app2Extra')}</p>
          </div>
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 21h18"/>
                <path d="M5 21V7l7-4 7 4v14"/>
                <path d="M9 21v-6h6v6"/>
              </svg>
            </div>
            <h3>{t('applications.app3Title')}</h3>
            <p>{t('applications.app3Desc')} {t('applications.app3Extra')}</p>
          </div>
          <div className="application-card">
            <div className="application-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h3>{t('applications.app4Title')}</h3>
            <p>{t('applications.app4Desc')}</p>
          </div>
        </div>

        {/* Sector badges */}
        <div className="sector-badges">
          <span className="sector-badge">{t('applications.sector1')}</span>
          <span className="sector-badge">{t('applications.sector2')}</span>
          <span className="sector-badge">{t('applications.sector3')}</span>
          <span className="sector-badge">{t('applications.sector4')}</span>
          <span className="sector-badge">{t('applications.sector5')}</span>
          <span className="sector-badge">{t('applications.sector6')}</span>
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
                src="/images/products/rwood-veneer/FSC_sustainability.webp"
                alt={t('alt.sustainablyManagedForest')}
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
              {t('sustainability.description')}
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
                  <p>{t('sustainability.badge2Desc')}</p>
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
                    <h3>{t('sustainability.badge4')}</h3>
                    <p>{t('sustainability.badge4Desc')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Technical data — server-rendered (see route page) */}
      {specs}

      {/* ═══════════════════════════════════
          ORDERING
          ═══════════════════════════════════ */}
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
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.minimumOrder')}</th>
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  {sizesValue && (
                    <tr>
                      <th scope="row">{tPage('ordering.sizes')}</th>
                      <td>{sizesValue}</td>
                    </tr>
                  )}
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
                <Link href="/samples" className="btn-primary" onClick={() => analytics.quoteClick('rwood-veneer', 'ordering_samples')}>
                  {tPage('ordering.requestSamples')}
                </Link>
                <Link href="/contact" className="btn-secondary on-dark" onClick={() => analytics.quoteClick('rwood-veneer', 'ordering_quote')}>
                  {tPage('ordering.requestQuote')}
                </Link>
              </div>
            </div>
          </div>
          <p className="data-note">{tPage('ordering.dataNote')}</p>
        </div>
      </section>

      {/* Gallery — server-rendered (see route page) */}
      {gallery}

      {/* Downloads — server-rendered (see route page) */}
      {downloads}

      {/* ═══════════════════════════════════
          MATCHING PRODUCTS
          ═══════════════════════════════════ */}
      <section className="content-section matching-section dark">
        <div className="matching-header">
          <span className="section-tag">{t('accessories.tag')}</span>
          <h2>{t('related.title')}</h2>
          <p>{t('related.description')}</p>
        </div>

        <div className="matching-grid">
          <div className="matching-card">
            <div className="matching-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="7" height="18" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
                <path d="M10 8h4" opacity="0.5"/>
                <path d="M10 12h4" opacity="0.5"/>
                <path d="M10 16h4" opacity="0.5"/>
              </svg>
            </div>
            <h3>{t('accessories.item1Title')}</h3>
            <p>{t('accessories.item1Desc')}</p>
            <Link href="/products/rwood-groove" className="matching-link">{t('related.explore')}</Link>
          </div>
          <div className="matching-card">
            <div className="matching-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4 4h16v16H4z"/>
                <path d="M4 8h16"/>
                <path d="M8 4v16"/>
              </svg>
            </div>
            <h3>{t('accessories.item2Title')}</h3>
            <p>{t('accessories.item2Desc')}</p>
          </div>
          <div className="matching-card">
            <div className="matching-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <h3>{t('accessories.item3Title')}</h3>
            <p>{t('related.item3Desc')}</p>
            <Link href="/samples" prefetch={false} className="matching-link">
              {t('related.orderSamples')}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — server-rendered (see route page) */}
      {faq}

      {/* Other models in this range — server-rendered (see route page) */}
      {otherModels}

      {/* ═══════════════════════════════════
          CTA
          ═══════════════════════════════════ */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>{t('cta.title')}</h2>
          <p>
            {t('cta.description')}
          </p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large" onClick={() => analytics.quoteClick('rwood-veneer', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="tel:+3232846818" className="btn-secondary large" onClick={() => analytics.phoneClick('product_cta_rwood-veneer')}>
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">
            {t('cta.circularNote')}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STYLES
          ═══════════════════════════════════════════════════════ */}
      <style jsx>{`
        .rwood-panel-page {
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

        .hero-usps { display: flex; flex-wrap: wrap; gap: 1rem 2rem; margin-bottom: 2rem; }
        .usp { display: flex; align-items: center; gap: 0.5rem; }
        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }
        .hero-ctas { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; }

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
        .btn-secondary.on-dark { color: white; border-color: rgba(255, 255, 255, 0.7); }
        .btn-secondary.on-dark:hover { background: white; color: var(--deep-blue); }

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
          padding: 1.25rem 2rem; background: white; width: 100%; max-width: 600px;
          border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .selector-label {
          font-size: 0.8rem; font-weight: 600; color: #767676;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .veneer-options { display: flex; gap: 0.6rem; flex-wrap: wrap; justify-content: center; }

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
        }

        .veneer-check {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; font-weight: bold;
        }
        .veneer-check.on-dark { color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3); }
        .veneer-check.on-light { color: var(--deep-blue); text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5); }

        .selected-veneer-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }
        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* ─── KPI BAND ─── */
        .kpi-band { padding: 0 4rem; margin-top: -1rem; margin-bottom: 1.5rem; }

        .kpi-list {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem;
          max-width: 1200px; margin: 0 auto; padding: 2rem 2.5rem;
          background: var(--deep-blue); color: white; border-radius: 20px;
        }

        .kpi { display: flex; flex-direction: column-reverse; gap: 0.35rem; margin: 0; }

        .kpi-value {
          font-family: var(--font-heading); font-size: 2.5rem; font-weight: 600;
          line-height: 1; color: #7ec8f5; margin: 0;
        }

        .kpi-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.8); line-height: 1.4; }

        /* ─── STICKY NAV ─── */
        .product-nav {
          position: sticky; top: 80px; z-index: 90;
          background: white; border-bottom: 1px solid #eee; padding: 0 4rem;
        }
        .nav-inner {
          display: flex; gap: 0; max-width: 1200px; margin: 0 auto;
          overflow-x: auto; scrollbar-width: none;
        }
        .nav-inner::-webkit-scrollbar { display: none; }
        .nav-item {
          padding: 1.25rem 1.1rem; background: none; border: none;
          font-size: 0.9rem; font-weight: 500; color: #666; white-space: nowrap;
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

        /* Shared two-column data table (datasheet style: light header row) */
        .table-wrap { width: 100%; overflow-x: auto; }

        .data-table {
          width: 100%; min-width: 280px; border-collapse: collapse;
          background: white; border: 1px solid var(--line);
          border-radius: 12px; overflow: hidden;
        }

        .data-table caption {
          caption-side: top; text-align: left; padding: 0.75rem 1.25rem;
          background: var(--table-head); color: var(--deep-blue);
          font-size: 0.85rem; font-weight: 600;
          border: 1px solid var(--line); border-bottom: none;
          border-radius: 12px 12px 0 0;
        }

        .data-table th,
        .data-table td {
          padding: 0.7rem 1.25rem; border-top: 1px solid var(--line);
          font-size: 0.9rem; text-align: left; vertical-align: top;
        }

        .data-table th { font-weight: 500; color: #666; width: 42%; }
        .data-table td { color: var(--deep-blue); font-weight: 600; }

        .data-note {
          max-width: 1200px; margin: 1.5rem auto 0;
          font-size: 0.85rem; color: #767676; line-height: 1.6;
        }

        /* ─── BUILD-UP ─── */
        .composition-section { background: var(--cream); }

        .composition-header,
        .ordering-header {
          text-align: center; max-width: 720px; margin: 0 auto 3rem;
        }
        .composition-header h2,
        .ordering-header h2 {
          font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1rem; letter-spacing: -1px;
        }
        .composition-header p { font-size: 1.1rem; color: #555; line-height: 1.8; }

        .composition-diagram {
          display: grid; grid-template-columns: 1fr 1.2fr; gap: 3rem; align-items: center;
          max-width: 1000px; margin: 0 auto; padding: 2.5rem;
          background: white; border-radius: 20px; box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
        }

        .comp-visual { display: flex; flex-direction: column; gap: 8px; max-width: 320px; margin: 0 auto; width: 100%; }

        .comp-layer-visual { border-radius: 8px; overflow: hidden; position: relative; }

        .comp-layer-visual.veneer-top,
        .comp-layer-visual.veneer-back {
          height: 28px;
          background: linear-gradient(90deg, #c4a77d 0%, #d4a954 30%, #c4a77d 60%, #b89860 100%);
        }

        .grain-texture {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(90deg, transparent 0 8px, rgba(139, 105, 20, 0.12) 8px 10px);
        }

        .comp-layer-visual.mdf-core {
          height: 64px; background: #e8dcc8;
          display: flex; align-items: center; justify-content: center;
        }

        .core-label {
          font-size: 0.8rem; font-weight: 700; color: #8a7a5e;
          letter-spacing: 2px; text-transform: uppercase;
        }

        .comp-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 1.25rem; }

        .comp-layer-info { display: flex; gap: 1rem; align-items: flex-start; }

        .comp-layer-number {
          font-family: var(--font-heading); font-weight: 600; color: var(--brand-blue);
          font-size: 0.95rem; min-width: 1.8rem; padding-top: 0.1rem;
        }

        .comp-layer-info h3 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .comp-layer-info p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.5; }

        /* ─── COLLECTION SECTION ─── */
        .collection-header {
          text-align: center; max-width: 720px; margin: 0 auto 2.5rem;
        }
        .collection-header h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .collection-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

        .collection-filter {
          display: flex; gap: 0.75rem; justify-content: center;
          margin-bottom: 2.5rem; flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.6rem 1.25rem; background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 50px;
          color: rgba(255, 255, 255, 0.7); font-size: 0.9rem; font-weight: 500;
          cursor: pointer; transition: all 0.3s ease;
        }
        .filter-btn:hover { background: rgba(255, 255, 255, 0.15); color: white; }
        .filter-btn.active { background: var(--brand-blue); border-color: var(--brand-blue); color: white; }

        .veneer-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem; max-width: 1200px; margin: 0 auto;
        }

        .veneer-card {
          display: flex; flex-direction: column; align-items: stretch;
          background: rgba(255, 255, 255, 0.06);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          transition: all 0.3s ease; position: relative; padding: 0;
          text-align: left; font: inherit; color: inherit;
        }
        .veneer-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
        }
        .veneer-card.active { border-color: var(--brand-blue); background: rgba(25, 127, 199, 0.15); }
        .veneer-card:focus-visible { outline: 2px solid #7ec8f5; outline-offset: 3px; }

        .veneer-card-image { position: relative; display: block; width: 100%; aspect-ratio: 872 / 640; overflow: hidden; }

        .veneer-card :global(.veneer-card-swatch) { transition: transform 0.3s ease; }
        .veneer-card:hover :global(.veneer-card-swatch) { transform: scale(1.05); }

        .veneer-card-info { display: flex; flex-direction: column; gap: 0.2rem; padding: 1rem 1.1rem; }
        .veneer-card-name { font-family: var(--font-heading); color: white; font-size: 1rem; font-weight: 600; }
        .veneer-card-desc { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); }

        .veneer-card-selected {
          position: absolute; top: 0.75rem; right: 0.75rem;
          width: 32px; height: 32px; background: var(--brand-blue);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: white;
        }

        .collection-note {
          display: flex; align-items: flex-start; gap: 0.75rem;
          max-width: 720px; margin: 2.5rem auto 0;
          padding: 1rem 1.5rem; background: rgba(25, 127, 199, 0.15);
          border-radius: 12px; font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); line-height: 1.6;
        }
        .collection-note svg { flex: none; margin-top: 0.15rem; }

        /* ─── FINISHES ─── */
        .range-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }

        .range-card { padding: 1.25rem 1.5rem; background: var(--cream); border-radius: 12px; }
        .range-card h3 { font-size: 1.05rem; color: var(--deep-blue); margin: 0 0 0.35rem; }
        .range-card p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.5; }

        .treatments-title { font-size: 1.05rem; color: var(--deep-blue); margin: 0 0 0.75rem; }

        .treatment-list { list-style: none; padding: 0; margin: 0 0 1.25rem; display: flex; flex-wrap: wrap; gap: 0.6rem; }

        .treatment-chip {
          padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 50px;
          font-size: 0.9rem; font-weight: 500; color: var(--deep-blue); background: white;
        }

        .section-content .finishes-note { font-size: 0.9rem; color: #767676; margin: 0; }

        /* ─── FORMATS ─── */
        .formats-header {
          text-align: center; max-width: 720px; margin: 0 auto 4rem;
        }
        .formats-header h2 { font-size: 2.5rem; color: var(--deep-blue); margin-bottom: 1rem; }
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
        .format-card.active { border-color: var(--brand-blue); background: var(--brand-blue-pale); }

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
          color: #767676; white-space: nowrap;
        }
        .format-dim-l {
          position: absolute; right: -50px; top: 50%;
          transform: translateY(-50%) rotate(90deg);
          font-size: 0.65rem; color: #767676; white-space: nowrap;
        }

        .format-info h3 { font-size: 1.1rem; color: var(--deep-blue); margin-bottom: 0.25rem; }
        .format-info p { font-size: 0.85rem; color: #666; margin: 0 0 1rem; }

        .format-specs {
          display: flex; flex-direction: column; gap: 0.25rem;
          font-size: 0.8rem; color: #767676;
        }

        /* ─── APPLICATIONS ─── */
        .applications-header {
          text-align: center; max-width: 720px; margin: 0 auto 4rem;
        }
        .applications-header h2 { font-size: 2.5rem; color: white; margin-bottom: 1rem; }
        .applications-header p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.8); line-height: 1.8; }

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
        .application-card:hover { background: rgba(255, 255, 255, 0.1); transform: translateY(-4px); }

        .application-icon {
          width: 56px; height: 56px;
          background: rgba(25, 127, 199, 0.2); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #7ec8f5; margin-bottom: 1.25rem;
        }

        .application-card h3 { color: white; margin-bottom: 0.5rem; font-size: 1.05rem; }
        .application-card p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin: 0; line-height: 1.5; }

        .sector-badges { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }

        .sector-badge {
          padding: 0.5rem 1.25rem; background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px;
          color: rgba(255, 255, 255, 0.7); font-size: 0.85rem; font-weight: 500;
        }

        /* ─── SUSTAINABILITY ─── */
        .sustainability-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .sustain-item { display: flex; align-items: flex-start; gap: 1rem; }
        .sustain-item h3 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: #666; margin: 0; }

        /* ─── ORDERING ─── */
        .ordering-section { background: white; }
        .ordering-inner { max-width: 1200px; margin: 0 auto; }

        .ordering-tables { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }

        .ordering-band {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
          padding: 2.5rem; background: var(--deep-blue); color: white; border-radius: 20px;
        }

        .ordering-band h3 { font-size: 1.25rem; color: white; margin: 0 0 0.75rem; }
        .ordering-band p { font-size: 0.95rem; color: rgba(255, 255, 255, 0.8); line-height: 1.7; margin: 0 0 1.25rem; }
        .ordering-ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; }

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
        .matching-card:hover { background: rgba(255, 255, 255, 0.1); }

        .matching-icon {
          width: 56px; height: 56px;
          background: rgba(25, 127, 199, 0.2); border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #7ec8f5; margin-bottom: 1.25rem;
        }

        .matching-card h3 { color: white; margin-bottom: 0.5rem; }
        .matching-card p {
          font-size: 0.9rem; color: rgba(255, 255, 255, 0.6);
          margin: 0 0 1rem; line-height: 1.5;
        }

        /* Links render outside this component's styled-jsx scope */
        .matching-card :global(.matching-link) {
          font-size: 0.9rem; color: #7ec8f5; text-decoration: none;
          font-weight: 600; transition: color 0.2s;
        }
        .matching-card :global(.matching-link:hover) { color: white; }

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
          .product-hero { grid-template-columns: 1fr; padding: 6rem 2rem 3rem; min-height: auto; }
          .hero-content h1 { font-size: 3rem; }
          .kpi-band { padding: 0 2rem; }
          .kpi-list { grid-template-columns: repeat(2, 1fr); }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .composition-diagram { grid-template-columns: 1fr; }
          .applications-grid { grid-template-columns: repeat(2, 1fr); }
          .formats-grid { grid-template-columns: repeat(2, 1fr); }
          .matching-grid { grid-template-columns: 1fr; max-width: 500px; }
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
          .composition-header h2,
          .collection-header h2,
          .formats-header h2,
          .applications-header h2,
          .ordering-header h2,
          .matching-header h2 { font-size: 2rem; }
          .applications-grid { grid-template-columns: 1fr; }
          .formats-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
          .veneer-grid { grid-template-columns: repeat(2, 1fr); }
          .range-grid { grid-template-columns: 1fr; }
          .composition-diagram { padding: 1.5rem; }
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
          .veneer-quick-selector { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}
