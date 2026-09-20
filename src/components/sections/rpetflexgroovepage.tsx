'use client';

import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '@/data/products';
import { SHOWROOM } from '@/config/site';

/**
 * rPET Flex Groove — product page. The Flex Groove is cut from the 9 mm
 * rPET Panel (Michael, 20 September 2026), so material, surface weight,
 * colours, reaction to fire, processing and lead time follow the rPET Panel
 * datasheet (EN · 09/2026, v1.0). The 9 mm panel's absorption has not been
 * measured, so the acoustics copy stays qualitative. The minimum bending
 * radius (500 mm) is the earlier page figure — no datasheet source.
 *
 * Governed figures (recycled share, thickness, fire class, colour count,
 * plant) come from src/data/products.ts. 'unknown' selects the figure-less
 * ICU branch; a null spec hides the element that would show it.
 */
const FLEX = PRODUCTS['rpet-flex-groove'];
const flexSpecs = FLEX.specs.kind === 'panel' ? FLEX.specs : null;
const pct: string = FLEX.recycledContentPct === null ? 'unknown' : String(FLEX.recycledContentPct);
const thicknessFigure = flexSpecs?.thickness ? flexSpecs.thickness.replace(/\s*mm$/, '') : null;

// Earlier page figure, kept until Michael confirms its source (report).
const MIN_BENDING_RADIUS_MM = '500';
// rPET Panel datasheet page 1: 9 mm surface weight.
const SURFACE_WEIGHT_9MM = '1.8';

/**
 * The stored EN 13501-1 class is written by colour, e.g.
 * 'B-s1,d0 (white, grey, black) / B-s2,d0 (other colours)'. The classes are
 * read from it here so the colour labels can be translated on the page; a
 * single stored class is shown as one card.
 */
function fireClassesByColour(value: string | null | undefined): { light: string; other: string } | { single: string } | null {
  if (!value) return null;
  const parts = value
    .split(' / ')
    .map((p) => p.replace(/\s*\([^)]*\)\s*$/, '').trim())
    .filter(Boolean);
  if (parts.length >= 2) return { light: parts[0], other: parts[1] };
  if (parts.length === 1) return { single: parts[0] };
  return null;
}

const fireByColour = fireClassesByColour(flexSpecs?.fireClass);
const fireKpi = fireByColour === null ? null : 'single' in fireByColour ? fireByColour.single : `${fireByColour.light} · ${fireByColour.other}`;

// The ten stock colours of the rPET Panel datasheet (page 3), in its order.
interface StockColour {
  number: string;
  id: string;
  key: string;
  src: string;
}

const STOCK_COLOURS: StockColour[] = [
  { number: '01', id: 'light-grey', key: 'c01', src: '/images/products/rpet-panel/swatches/01-light-grey.webp' },
  { number: '02', id: 'off-white', key: 'c02', src: '/images/products/rpet-panel/swatches/02-off-white.webp' },
  { number: '03', id: 'sand', key: 'c03', src: '/images/products/rpet-panel/swatches/03-sand.webp' },
  { number: '04', id: 'dusty-rose', key: 'c04', src: '/images/products/rpet-panel/swatches/04-dusty-rose.webp' },
  { number: '05', id: 'deep-red', key: 'c05', src: '/images/products/rpet-panel/swatches/05-deep-red.webp' },
  { number: '06', id: 'olive-green', key: 'c06', src: '/images/products/rpet-panel/swatches/06-olive-green.webp' },
  { number: '07', id: 'forest-green', key: 'c07', src: '/images/products/rpet-panel/swatches/07-forest-green.webp' },
  { number: '08', id: 'slate-blue', key: 'c08', src: '/images/products/rpet-panel/swatches/08-slate-blue.webp' },
  { number: '09', id: 'silver-grey', key: 'c09', src: '/images/products/rpet-panel/swatches/09-silver-grey.webp' },
  { number: '10', id: 'charcoal', key: 'c10', src: '/images/products/rpet-panel/swatches/10-charcoal.webp' },
];

// Groove direction options
const directionOptions = [
  { id: 'length', nameKey: 'options.lengthName', descriptionKey: 'options.lengthDesc' },
  { id: 'width', nameKey: 'options.widthName', descriptionKey: 'options.widthDesc' },
];

// Hero image — fixed; the colour choice shows the datasheet swatch as an
// inset preview because no per-colour photography exists for this product.
const DEFAULT_HERO_IMAGE = '/images/products/rpet-flex-groove/rPET-Flex.jpg';
const PHONE_DISPLAY = '+32 3 284 68 18';

/**
 * Server-rendered sections are passed in as React nodes ("slots") so this
 * client component only ships the hero / configurators; specs, downloads,
 * FAQ and other models are plain HTML with no hydration cost.
 */
export interface RPETFlexGrooveProductPageSlots {
  /** Visible breadcrumb trail (Home › Products › range › model), floated over the hero */
  breadcrumbs?: React.ReactNode;
  specs: React.ReactNode;
  downloads: React.ReactNode;
  gallery?: React.ReactNode;
  faq: React.ReactNode;
  otherModels: React.ReactNode;
}

export default function RPETFlexGrooveProductPage({ breadcrumbs, specs, downloads, faq, otherModels }: RPETFlexGrooveProductPageSlots) {
  const t = useTranslations('rpetFlexGroovePage');
  // Renders description2 below description only when distinct (handles the
  // pre-existing data state where some locales have the same content in both
  // fields — those render as a single paragraph; locales with genuine
  // second paragraphs render two).
  const desc2IfDistinct = (basePath: string, values?: Record<string, string>): string | null => {
    const a = t(`${basePath}.description`, values);
    let b: string;
    try { b = t(`${basePath}.description2`, values); } catch { return null; }
    // next-intl returns "namespace.key" as fallback for missing keys (per
    // getMessageFallback in i18n/request.ts). Detect that and treat as absent.
    if (!b || b === a || b.endsWith('.description2')) return null;
    return b;
  };

  const tPage = useTranslations('productPage');
  const tm = useTranslations('manufacturer');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedColour, setSelectedColour] = useState<StockColour | 'custom' | null>(null);
  const [selectedDirection, setSelectedDirection] = useState(directionOptions[0]);

  // Fire a single view_item event on mount so GA4 / Meta see
  // the product impression. Empty deps array → fires once per page.
  useEffect(() => {
    analytics.viewItem('rpet-flex-groove', 'rpet');
  }, []);

  const colourName = (c: StockColour) => tPage(`rpet.colours.${c.key}`);
  const selectedLabel =
    selectedColour === null
      ? tPage('rpet.colours.choose')
      : selectedColour === 'custom'
        ? tPage('rpet.colours.custom')
        : tPage('rpet.colours.selected', { number: selectedColour.number, name: colourName(selectedColour) });

  const navItems = [
    { id: 'overview', label: tPage('nav.overview') },
    { id: 'flexibility', label: tPage('nav.flexibility') },
    { id: 'colors', label: tPage('nav.colors') },
    { id: 'acoustics', label: tPage('nav.acoustics') },
    { id: 'installation', label: tPage('nav.installation') },
    { id: 'specs', label: tPage('nav.technicalData') },
    { id: 'ordering', label: tPage('nav.ordering') },
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
    <div className="rpet-flex-groove-product-page">
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
            <div className="usp">
              <span className="usp-text">{t('hero.usp1')}</span>
            </div>
            <div className="usp">
              <span className="usp-text">{t('hero.usp2')}</span>
            </div>
            <div className="usp">
              <span className="usp-text">{t('hero.usp3', { pct })}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary" onClick={() => analytics.quoteClick('rpet-flex-groove', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="#specs" onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }} className="btn-secondary">
              {tPage('cta.viewSpecifications')}
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-container">
            <Image
              src={DEFAULT_HERO_IMAGE}
              alt={t('alt.rpetFlexGrooveAcousticPanel')}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              style={{ objectFit: 'cover' }}
              priority
            />
            {selectedColour !== null && selectedColour !== 'custom' && (
              <figure className="swatch-preview">
                <div className="swatch-preview-image">
                  <Image
                    src={selectedColour.src}
                    alt={tPage('rpet.colours.swatchAlt', { number: selectedColour.number, name: colourName(selectedColour) })}
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <figcaption>
                  <span className="swatch-number">{selectedColour.number}</span>
                  {colourName(selectedColour)}
                </figcaption>
              </figure>
            )}
          </div>

          <div className="color-selector">
            <span className="selector-label">{tPage('rpet.colours.stockLabel')}</span>
            <div className="color-options">
              {STOCK_COLOURS.map((colour) => (
                <button
                  key={colour.id}
                  type="button"
                  className={`color-option ${selectedColour !== null && selectedColour !== 'custom' && selectedColour.id === colour.id ? 'active' : ''}`}
                  onClick={() => setSelectedColour(colour)}
                  title={`${colour.number} ${colourName(colour)}`}
                  aria-label={tPage('a11y.selectColour', { name: `${colour.number} ${colourName(colour)}` })}
                  aria-pressed={selectedColour !== null && selectedColour !== 'custom' && selectedColour.id === colour.id}
                >
                  <Image src={colour.src} alt="" fill sizes="48px" style={{ objectFit: 'cover' }} />
                </button>
              ))}
              <button
                type="button"
                className={`color-option custom ${selectedColour === 'custom' ? 'active' : ''}`}
                onClick={() => setSelectedColour('custom')}
                title={tPage('rpet.colours.custom')}
                aria-label={tPage('a11y.selectColour', { name: tPage('rpet.colours.custom') })}
                aria-pressed={selectedColour === 'custom'}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
            <span className="selected-color-name">{selectedLabel}</span>
          </div>
        </div>
      </section>

      {/* KPI band — the four figures */}
      <div className="kpi-band">
        <div className="kpi-inner">
          {thicknessFigure && (
            <div className="kpi">
              <span className="kpi-value">{thicknessFigure}</span>
              <span className="kpi-label">{tPage('rpet.kpi.thickness')}</span>
            </div>
          )}
          <div className="kpi">
            <span className="kpi-value">{SURFACE_WEIGHT_9MM}</span>
            <span className="kpi-label">{tPage('rpet.kpi.surfaceWeight')}</span>
          </div>
          {fireKpi && (
            <div className="kpi">
              <span className="kpi-value">{fireKpi}</span>
              <span className="kpi-label">{tPage('rpet.kpi.fire')}</span>
            </div>
          )}
          {flexSpecs?.finishCount !== null && flexSpecs?.finishCount !== undefined && (
            <div className="kpi">
              <span className="kpi-value">{flexSpecs.finishCount}</span>
              <span className="kpi-label">{tPage('rpet.kpi.stockColours')}</span>
            </div>
          )}
        </div>
      </div>

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
                alt={t('alt.rpetFlexGrooveAcousticPanelOnCurvedSurface')}
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

      {/* Flexibility Section */}
      <section id="flexibility" className="content-section flexibility-section dark">
        <div className="flexibility-header">
          <span className="section-tag">{t('technology.tag')}</span>
          <h2>{t('technology.title')}</h2>
          <p>{t('technology.description')}</p>
        </div>

        <div className="flexibility-visual">
          <div className="flex-demo" aria-hidden="true">
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
              <span className="radius-value">R{MIN_BENDING_RADIUS_MM}</span>
              <span className="radius-unit">mm</span>
            </div>
            <p>{t('technology.minRadius')}</p>
          </div>
        </div>

        {/* Build-up — numbered layers */}
        <div className="buildup-grid">
          <div className="buildup-item">
            <span className="buildup-number">01</span>
            <h4>{t('buildUp.layer1Title')}</h4>
            <p>{t('buildUp.layer1Desc', { pct })}</p>
          </div>
          <div className="buildup-item">
            <span className="buildup-number">02</span>
            <h4>{t('buildUp.layer2Title')}</h4>
            <p>{t('buildUp.layer2Desc')}</p>
          </div>
          <div className="buildup-item">
            <span className="buildup-number">03</span>
            <h4>{t('buildUp.layer3Title')}</h4>
            <p>{t('buildUp.layer3Desc')}</p>
          </div>
        </div>
        <p className="material-link">
          <Link href="/products/rpet-panel">{tPage('rpet.material.panelLink')}</Link>
        </p>
      </section>

      {/* Colours Section — ten stock colours, any colour to order */}
      <section id="colors" className="content-section colors-section">
        <div className="ds-wrap">
          <div className="colors-header">
            <span className="section-tag">{t('colors.tag')}</span>
            <h2>{t('colors.title')}</h2>
            <p>{t('colors.description')}</p>
          </div>

          <div className="swatch-grid">
            {STOCK_COLOURS.map((colour) => {
              const active = selectedColour !== null && selectedColour !== 'custom' && selectedColour.id === colour.id;
              return (
                <button
                  key={colour.id}
                  type="button"
                  className={`swatch-card ${active ? 'active' : ''}`}
                  onClick={() => setSelectedColour(colour)}
                  aria-pressed={active}
                  aria-label={tPage('a11y.selectColour', { name: `${colour.number} ${colourName(colour)}` })}
                >
                  <span className="swatch-image">
                    <Image
                      src={colour.src}
                      alt={tPage('rpet.colours.swatchAlt', { number: colour.number, name: colourName(colour) })}
                      fill
                      sizes="(max-width: 480px) 20vw, (max-width: 1024px) 18vw, 110px"
                      style={{ objectFit: 'cover' }}
                    />
                  </span>
                  <span className="swatch-number">{colour.number}</span>
                  <span className="swatch-name">{colourName(colour)}</span>
                </button>
              );
            })}
            <button
              type="button"
              className={`swatch-card custom ${selectedColour === 'custom' ? 'active' : ''}`}
              onClick={() => setSelectedColour('custom')}
              aria-pressed={selectedColour === 'custom'}
              aria-label={tPage('a11y.selectColour', { name: tPage('rpet.colours.custom') })}
            >
              <span className="swatch-image custom-face">
                <span aria-hidden="true">RAL · NCS</span>
              </span>
              <span className="swatch-number">+</span>
              <span className="swatch-name">{tPage('rpet.colours.custom')}</span>
            </button>
          </div>

          <div className="colour-notes">
            <div className="colour-note">
              <h3>{tPage('rpet.colours.madeToOrderTitle')}</h3>
              <p>{tPage('rpet.colours.madeToOrderText')}</p>
            </div>
            <div className="colour-note">
              <h3>{tPage('rpet.colours.batchTitle')}</h3>
              <p>{tPage('rpet.colours.batchText')}</p>
            </div>
          </div>

          <div className="direction-row">
            <div className="direction-options">
              <h4>{t('colors.grooveDir')}</h4>
              <div className="direction-selector">
                {directionOptions.map((direction) => (
                  <button
                    key={direction.id}
                    type="button"
                    className={`direction-option ${selectedDirection.id === direction.id ? 'active' : ''}`}
                    onClick={() => setSelectedDirection(direction)}
                    aria-pressed={selectedDirection.id === direction.id}
                    title={t(direction.descriptionKey)}
                  >
                    <span className={`direction-icon ${direction.id}`} aria-hidden="true">
                      {direction.id === 'length' ? '|||' : '≡'}
                    </span>
                    <span className="direction-name">{t(direction.nameKey)}</span>
                  </button>
                ))}
              </div>
              <p className="direction-desc">{t(selectedDirection.descriptionKey)}</p>
            </div>
            <div className="direction-image">
              <div className="image-container">
                <Image
                  src="/images/products/rpet-flex-groove/rPET-Flex-hero_1.jpg"
                  alt={t('alt.rpetFlexGrooveColorOptions')}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Acoustics — qualitative: the 9 mm panel is not yet measured */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="ds-wrap">
          <span className="section-tag">{t('acoustics.tag')}</span>
          <h2>{tPage('rpet.acoustics.title')}</h2>
          <p className="ds-lead">{tPage('rpet.acoustics.intro')}</p>
          <p className="ds-lead">{t('acoustics.description')}</p>

          <div className="acoustics-benefits">
            <div className="benefit">
              <h4>{t('acoustics.feature1Title')}</h4>
              <p>{t('acoustics.feature1Desc')}</p>
            </div>
            <div className="benefit">
              <h4>{tPage('rpet.acoustics.notMeasuredTitle')}</h4>
              <p>{tPage('rpet.acoustics.notMeasured9')}</p>
            </div>
            <div className="benefit">
              <h4>{t('acoustics.feature3Title', { pct })}</h4>
              <p>{t('acoustics.feature3Desc')}</p>
            </div>
          </div>
          <p className="ds-footnote">
            <Link href="/products/rpet-panel">{tPage('rpet.acoustics.panelTableLink')}</Link>
          </p>
        </div>
      </section>

      {/* Fire safety — by colour (rPET Panel datasheet page 2) */}
      {fireByColour && (
        <section id="fire" className="content-section fire-section">
          <div className="ds-wrap">
            <div className="fire-grid">
              <div className="fire-text">
                <span className="section-tag">{tPage('rpet.fire.tag')}</span>
                <h2>{tPage('rpet.fire.title')}</h2>
                {'single' in fireByColour ? (
                  <p className="ds-lead">{tPage('rpet.fire.textSingle', { cls: fireByColour.single })}</p>
                ) : (
                  <p className="ds-lead">{tPage('rpet.fire.text', { light: fireByColour.light, other: fireByColour.other })}</p>
                )}
                <p className="ds-footnote">{tPage('rpet.fire.reports')}</p>
              </div>
              <div className="fire-cards">
                {'single' in fireByColour ? (
                  <div className="fire-card">
                    <h3>{tPage('rpet.fire.allColours')}</h3>
                    <span className="fire-standard">{tPage('rpet.fire.classTo')}</span>
                    <span className="fire-class">{fireByColour.single}</span>
                  </div>
                ) : (
                  <>
                    <div className="fire-card">
                      <h3>{tPage('rpet.fire.whiteGreyBlack')}</h3>
                      <span className="fire-standard">{tPage('rpet.fire.classTo')}</span>
                      <span className="fire-class">{fireByColour.light}</span>
                    </div>
                    <div className="fire-card">
                      <h3>{tPage('rpet.fire.otherColours')}</h3>
                      <span className="fire-standard">{tPage('rpet.fire.classTo')}</span>
                      <span className="fire-class">{fireByColour.other}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Installation Section */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-grid reverse">
          <div className="section-content">
            <span className="section-tag">{t('installation.tag')}</span>
            <h2>{t('installation.title')}</h2>
            <p>{t('installation.description')}</p>
            {desc2IfDistinct('installation') && (
              <p>{desc2IfDistinct('installation')}</p>
            )}

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
                alt={t('alt.flexGroovePanelInstallation')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
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
                alt={t('alt.rpetFlexGrooveCurvedWalls')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('sustainability.tag')}</span>
            <h2>{t('sustainability.title')}</h2>
            <p>{t('sustainability.description', { pct })}</p>
            <div className="sustainability-features">
              <div className="sustain-item">
                <div>
                  <h4>{t('sustainability.badge1', { pct })}</h4>
                  <p>{t('sustainability.badge1Desc')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <div>
                  <h4>{t('sustainability.badge2')}</h4>
                  <p>{tPage('rpet.ordering.endOfLifeText')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <div>
                  <h4>{t('sustainability.badge3')}</h4>
                  <p>{t('sustainability.badge3Desc')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <div>
                  <h4>{t('sustainability.badge4')}</h4>
                  <p>{tPage('ordering.takeBack')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical data — server-rendered (ProductSpecs, src/data/specs/rpet-flex-groove.ts) */}
      {specs}

      {/* Ordering — lead time as the rPET Panel; the rest on request */}
      <section id="ordering" className="content-section ordering-section">
        <div className="ds-wrap">
          <span className="section-tag">{tPage('ordering.tag')}</span>
          <h2>{tPage('rpet.ordering.title')}</h2>
          <p className="ds-lead">{t('ordering.description')}</p>

          <div className="ordering-grid">
            <div className="table-scroll">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th scope="col" colSpan={2}>{tPage('rpet.ordering.orderHead')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{tPage('ordering.minimumOrder')}</th>
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.sizes')}</th>
                    <td>{t('ordering.sizesValue')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.prices')}</th>
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.samples')}</th>
                    <td>{tPage('rpet.ordering.samplesValue')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="table-scroll">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th scope="col" colSpan={2}>{tPage('rpet.ordering.supplyHead')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">{tPage('ordering.leadTime')}</th>
                    <td>{tPage('rpet.ordering.leadTimeValue')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{tPage('ordering.delivery')}</th>
                    <td>{tPage('ordering.onRequest')}</td>
                  </tr>
                  {FLEX.madeIn && (
                    <tr>
                      <th scope="row">{tPage('ordering.madeIn')}</th>
                      <td>{tm(`plant.${FLEX.madeIn}`)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dark-band">
            <div className="band-col">
              <h3>{tPage('ordering.endOfLife')}</h3>
              <p>
                {tPage('rpet.ordering.endOfLifeText')} {tPage('ordering.takeBack')}
              </p>
            </div>
            <div className="band-col">
              <h3>{tPage('ordering.samplesQuotes')}</h3>
              <p>
                <a href={`mailto:${SHOWROOM.email}`}>{SHOWROOM.email}</a>
                {' · '}
                <a href={SHOWROOM.telephoneHref} onClick={() => analytics.phoneClick('product_ordering_rpet-flex-groove')}>{PHONE_DISPLAY}</a>
              </p>
              <p>
                {tPage('rpet.ordering.showroom')}: {SHOWROOM.streetAddress}, {SHOWROOM.postalCode} {tm('plant.BE')}
              </p>
              <div className="band-ctas">
                <Link href="/samples" className="btn-band-primary" prefetch={false}>{tPage('ordering.requestSamples')}</Link>
                <Link href="/contact" className="btn-band-secondary" onClick={() => analytics.quoteClick('rpet-flex-groove', 'product_ordering')}>{tPage('ordering.requestQuote')}</Link>
              </div>
            </div>
          </div>
          <p className="ds-footnote">
            {tPage('ordering.dataNote')} {tPage('ordering.calculatedNote')}
          </p>
        </div>
      </section>

      {/* Downloads — server-rendered (ProductDownloads) */}
      {downloads}

      {/* Applications Section */}
      <section className="content-section applications-section dark">
        <div className="applications-header">
          <span className="section-tag">{t('applications.tag')}</span>
          <h2>{t('applications.title')}</h2>
          <p>{t('applications.sectionDesc')}</p>
        </div>

        <div className="applications-grid">
          <div className="application-card">
            <h4>{t('applications.app1')}</h4>
            <p>{t('applications.app1Desc')}</p>
          </div>
          <div className="application-card">
            <h4>{t('applications.app2')}</h4>
            <p>{t('applications.app2Desc')}</p>
          </div>
          <div className="application-card">
            <h4>{t('applications.app3')}</h4>
            <p>{t('applications.app3Desc')}</p>
          </div>
          <div className="application-card">
            <h4>{t('applications.app4')}</h4>
            <p>{t('applications.app4Desc')}</p>
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
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.description')}</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large" onClick={() => analytics.quoteClick('rpet-flex-groove', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href={SHOWROOM.telephoneHref} className="btn-secondary large" onClick={() => analytics.phoneClick('product_cta_rpet-flex-groove')}>
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">
            {t('cta2.freeNote', { pct })}
          </p>
        </div>
      </section>

      <style jsx>{`
        .rpet-flex-groove-product-page {
          --brand-blue: #197FC7;
          --brand-blue-dark: #155d94;
          --brand-blue-pale: #e8f4fc;
          --brand-blue-soft: #9fd0f5;
          --deep-blue: #0d3a5c;
          --cream: #f7f9fb;
          --charcoal: #333;
          --line: #e6ecf1;
          --table-head: #f3f6f9;
        }

        /* ── Shared datasheet-style primitives ─────────────────── */
        .ds-wrap { max-width: 1200px; margin: 0 auto; }
        .ds-lead { font-size: 1.05rem; color: #444; line-height: 1.75; max-width: 820px; margin: 0 0 1.5rem; }
        .ds-footnote { font-size: 0.8rem; color: #767676; line-height: 1.5; margin: 1rem 0 0; }
        .ds-footnote a { color: var(--brand-blue); }

        .section-tag {
          display: inline-block;
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--brand-blue);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 0.75rem;
        }
        .content-section.dark .section-tag { color: var(--brand-blue-soft); }

        .rpet-flex-groove-product-page h2 {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          color: var(--deep-blue);
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin: 0 0 1.25rem;
        }
        .content-section.dark h2 { color: white; }

        .table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }

        .ds-table { width: 100%; min-width: 320px; border-collapse: collapse; font-size: 0.95rem; }
        .ds-table thead th {
          background: var(--table-head);
          color: #555;
          font-weight: 500;
          font-size: 0.85rem;
          text-align: left;
          padding: 0.7rem 0.9rem;
          border-bottom: 2px solid var(--brand-blue);
          white-space: nowrap;
        }
        .ds-table tbody th,
        .ds-table tbody td {
          padding: 0.75rem 0.9rem;
          border-bottom: 1px solid var(--line);
          text-align: left;
          vertical-align: top;
        }
        .ds-table tbody th { font-weight: 400; color: #444; width: 40%; }
        .ds-table tbody td { color: var(--deep-blue); font-weight: 600; }

        /* ── Hero ───────────────────────────────────────────────── */
        .product-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 8rem 4rem 3rem;
          background: white;
          align-items: center;
        }

        .product-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--brand-blue);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          margin-bottom: 1rem;
        }

        .hero-content h1 {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          color: var(--deep-blue);
          margin-bottom: 0.75rem;
          letter-spacing: -1.5px;
          line-height: 1.05;
        }

        .hero-tagline {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          color: var(--brand-blue);
          font-weight: 500;
          margin-bottom: 1.25rem;
          line-height: 1.35;
        }

        .hero-description { font-size: 1.05rem; color: #444; line-height: 1.75; margin-bottom: 1rem; max-width: 540px; }
        .hero-manufacturer { font-size: 0.9rem; color: #767676; margin-bottom: 1.5rem; }

        .hero-usps { display: flex; flex-wrap: wrap; gap: 0.75rem 1.75rem; margin-bottom: 2rem; }
        .usp { display: flex; align-items: center; gap: 0.5rem; }
        .usp::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--brand-blue); }
        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }

        .hero-ctas { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }

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
        .btn-primary:hover { background: var(--brand-blue-dark); transform: translateY(-2px); }
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
        .btn-secondary:hover { background: var(--deep-blue); color: white; }
        .btn-secondary.large { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        .hero-image { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem; }

        .image-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          aspect-ratio: 4/5;
          border-radius: 20px;
          overflow: hidden;
          background: var(--cream);
        }

        .swatch-preview {
          position: absolute;
          left: 1rem;
          bottom: 1rem;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.9rem 0.5rem 0.5rem;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .swatch-preview-image { position: relative; width: 56px; height: 84px; border-radius: 6px; overflow: hidden; flex: none; }
        .swatch-preview figcaption { display: flex; flex-direction: column; font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }
        .swatch-preview .swatch-number { font-size: 0.75rem; color: var(--brand-blue); letter-spacing: 0.08em; }

        .color-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1.5rem;
          background: white;
          border: 1px solid var(--line);
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
        }
        .selector-label { font-size: 0.75rem; font-weight: 600; color: #767676; text-transform: uppercase; letter-spacing: 0.1em; }
        .color-options { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; }
        .color-option {
          position: relative;
          width: 34px;
          height: 52px;
          border-radius: 6px;
          border: 2px solid transparent;
          background: var(--cream);
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .color-option:hover { transform: translateY(-2px); }
        .color-option.active { border-color: var(--brand-blue); box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue); }
        .color-option.custom {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #b9c6d2;
          color: var(--brand-blue);
          font-size: 1.25rem;
          font-weight: 600;
        }
        .color-option.custom.active { border-style: solid; }
        .selected-color-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); text-align: center; }

        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* ── KPI band ───────────────────────────────────────────── */
        .kpi-band { padding: 0 4rem 2.5rem; background: white; }
        .kpi-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          padding: 2rem 2.5rem;
          background: var(--deep-blue);
          border-radius: 16px;
          color: white;
        }
        .kpi { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
        .kpi-value { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--brand-blue-soft); letter-spacing: -0.5px; line-height: 1.1; }
        .kpi-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.85); line-height: 1.4; }

        /* ── Sticky nav ─────────────────────────────────────────── */
        .product-nav {
          position: sticky;
          top: 80px;
          z-index: 90;
          background: white;
          border-bottom: 1px solid var(--line);
          border-top: 1px solid var(--line);
          padding: 0 4rem;
        }
        .nav-inner { display: flex; gap: 0; max-width: 1200px; margin: 0 auto; }
        .nav-item {
          padding: 1.1rem 1.1rem;
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

        /* ── Sections ───────────────────────────────────────────── */
        .content-section { padding: 5rem 4rem; }
        .content-section.dark { background: var(--deep-blue); color: white; }
        .content-section.dark .section-content p { color: rgba(255, 255, 255, 0.82); }

        .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; max-width: 1200px; margin: 0 auto; align-items: center; }
        .section-grid.reverse { direction: rtl; }
        .section-grid.reverse > * { direction: ltr; }

        .section-content p { font-size: 1.05rem; color: #444; line-height: 1.75; margin-bottom: 1.5rem; }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.6rem 0;
          font-size: 1rem;
          color: var(--charcoal);
          border-top: 1px solid var(--line);
        }
        .feature-list li:first-child { border-top: none; }
        .content-section.dark .feature-list li { color: rgba(255, 255, 255, 0.9); }
        .check { color: var(--brand-blue); font-weight: bold; }

        /* ── Flexibility ────────────────────────────────────────── */
        .flexibility-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .flexibility-header p { font-size: 1.05rem; color: rgba(255, 255, 255, 0.82); line-height: 1.75; }

        .flexibility-visual { display: flex; justify-content: center; align-items: center; gap: 4rem; margin-bottom: 3.5rem; }
        .flex-demo { display: flex; align-items: center; gap: 2rem; }
        .panel-flat, .panel-curved { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .groove-lines { display: flex; gap: 4px; padding: 1rem; background: linear-gradient(135deg, #c9bfae 0%, #a89a83 100%); border-radius: 8px; }
        .groove-line { width: 4px; height: 80px; background: rgba(0, 0, 0, 0.3); border-radius: 2px; }
        .curved-surface {
          display: flex;
          gap: 4px;
          padding: 1rem;
          background: linear-gradient(135deg, #c9bfae 0%, #a89a83 100%);
          border-radius: 8px 40px 40px 8px;
          transform: perspective(200px) rotateY(-15deg);
        }
        .arrow { font-size: 2rem; color: var(--brand-blue-soft); }
        .demo-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); }

        .radius-indicator { text-align: center; }
        .radius-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--brand-blue);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .radius-value { font-family: var(--font-heading); font-size: 1.8rem; font-weight: 700; color: white; }
        .radius-unit { font-size: 0.9rem; color: rgba(255, 255, 255, 0.85); }
        .radius-indicator > p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.7); }

        .buildup-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .buildup-item { border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 1.25rem; }
        .buildup-number { display: block; font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; color: var(--brand-blue-soft); margin-bottom: 0.5rem; }
        .buildup-item h4 { color: white; font-size: 1.05rem; margin: 0 0 0.4rem; font-family: var(--font-heading); }
        .buildup-item p { font-size: 0.92rem; color: rgba(255, 255, 255, 0.78); margin: 0; line-height: 1.6; }
        .material-link { max-width: 1200px; margin: 2rem auto 0; font-size: 0.95rem; }
        .material-link a { color: var(--brand-blue-soft); text-decoration: underline; text-underline-offset: 3px; }

        /* ── Colours ────────────────────────────────────────────── */
        .colors-header { max-width: 820px; margin: 0 0 2.5rem; }
        .colors-header p { font-size: 1.05rem; color: #444; line-height: 1.75; margin: 0; }

        .swatch-grid { display: grid; grid-template-columns: repeat(11, minmax(0, 1fr)); gap: 0.9rem; margin-bottom: 3rem; }
        .swatch-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.2rem;
          padding: 0;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          font: inherit;
          color: inherit;
        }
        .swatch-image {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 260 / 675;
          max-height: 200px;
          border-radius: 4px;
          overflow: hidden;
          background: var(--cream);
          box-shadow: 0 0 0 1px rgba(13, 58, 92, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-bottom: 0.35rem;
        }
        .swatch-card:hover .swatch-image { transform: translateY(-3px); }
        .swatch-card.active .swatch-image { box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue); }
        .swatch-card .swatch-number { font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; color: var(--brand-blue); letter-spacing: 0.06em; }
        .swatch-card .swatch-name { font-size: 0.85rem; color: var(--deep-blue); line-height: 1.25; }
        .custom-face {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #b9c6d2;
          background: white;
          color: #767676;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-align: center;
          padding: 0.25rem;
        }
        .swatch-card.custom.active .custom-face { border-color: var(--brand-blue); box-shadow: none; }

        .colour-notes { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; max-width: 1000px; margin-bottom: 3rem; }
        .colour-note h3 { font-family: var(--font-heading); font-size: 1.15rem; color: var(--brand-blue); margin: 0 0 0.5rem; }
        .colour-note p { font-size: 0.98rem; color: #444; line-height: 1.7; margin: 0; }

        .direction-row { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
        .direction-options h4 { color: var(--deep-blue); margin-bottom: 1rem; font-family: var(--font-heading); }
        .direction-selector { display: flex; flex-wrap: wrap; gap: 1rem; }
        .direction-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1.4rem;
          background: white;
          border: 2px solid var(--line);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font: inherit;
        }
        .direction-option:hover { border-color: var(--brand-blue); }
        .direction-option.active { border-color: var(--brand-blue); background: var(--brand-blue-pale); }
        .direction-icon { font-size: 1.2rem; font-weight: bold; color: var(--brand-blue); }
        .direction-icon.length { letter-spacing: 2px; }
        .direction-name { font-size: 0.9rem; font-weight: 500; color: var(--charcoal); }
        .direction-desc { font-size: 0.9rem; color: #666; margin: 1rem 0 0; }
        .direction-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* ── Acoustics / fire ───────────────────────────────────── */
        .acoustics-section { background: white; }
        .acoustics-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; max-width: 1000px; margin: 1rem 0 0; }
        .benefit { padding: 1.5rem; background: var(--brand-blue-pale); border-radius: 12px; }
        .benefit h4 { font-family: var(--font-heading); font-size: 1.05rem; color: var(--deep-blue); margin: 0 0 0.5rem; }
        .benefit p { font-size: 0.9rem; color: #555; margin: 0; line-height: 1.6; }

        .fire-section { background: var(--cream); }
        .fire-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 3rem; align-items: center; }
        .fire-text .ds-lead { margin-bottom: 1rem; }
        .fire-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .fire-card { background: white; border: 1px solid var(--line); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.35rem; }
        .fire-card h3 { font-family: var(--font-heading); font-size: 1.1rem; color: var(--brand-blue); margin: 0; }
        .fire-standard { font-size: 0.8rem; color: #666; }
        .fire-class { font-family: var(--font-heading); font-size: 1.9rem; font-weight: 700; color: var(--deep-blue); margin-top: 0.5rem; white-space: nowrap; }

        /* ── Installation ───────────────────────────────────────── */
        .installation-steps { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1.5rem; }
        .install-step { display: flex; align-items: flex-start; gap: 1rem; }
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
        .step-content p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.72); margin: 0; }

        /* ── Sustainability ─────────────────────────────────────── */
        .sustainability-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .sustain-item { display: flex; align-items: flex-start; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--line); }
        .sustain-item h4 { font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .sustain-item p { font-size: 0.9rem; color: #666; margin: 0; line-height: 1.55; }

        /* ── Ordering ───────────────────────────────────────────── */
        .ordering-section { background: white; }
        .ordering-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; }

        .dark-band {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          background: var(--deep-blue);
          color: white;
          border-radius: 16px;
          padding: 2.25rem 2.5rem;
        }
        .band-col h3 { font-family: var(--font-heading); font-size: 1.2rem; color: white; margin: 0 0 0.75rem; }
        .band-col p { font-size: 0.95rem; color: rgba(255, 255, 255, 0.85); line-height: 1.65; margin: 0 0 0.5rem; }
        .band-col a { color: white; text-decoration: underline; text-underline-offset: 3px; }
        .band-ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
        .btn-band-primary,
        .btn-band-secondary {
          display: inline-flex;
          align-items: center;
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none !important;
          transition: all 0.3s ease;
        }
        .btn-band-primary { background: white; color: var(--deep-blue) !important; }
        .btn-band-primary:hover { background: var(--brand-blue-pale); }
        .btn-band-secondary { border: 2px solid rgba(255, 255, 255, 0.7); color: white !important; }
        .btn-band-secondary:hover { background: rgba(255, 255, 255, 0.12); }

        /* ── Applications ───────────────────────────────────────── */
        .applications-header { text-align: center; margin-bottom: 3rem; }
        .applications-header p { color: rgba(255, 255, 255, 0.75); }
        .applications-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; max-width: 1200px; margin: 0 auto; }
        .application-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 1.75rem; text-align: center; }
        .application-card h4 { color: white; margin-bottom: 0.5rem; }
        .application-card p { font-size: 0.9rem; color: rgba(255, 255, 255, 0.65); margin: 0; }

        /* ── CTA ────────────────────────────────────────────────── */
        .cta-section { background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%); text-align: center; }
        .cta-content { max-width: 700px; margin: 0 auto; }
        .cta-content h2 { color: white; margin-bottom: 1rem; }
        .cta-content > p { font-size: 1.05rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
        .cta-section .btn-primary { background: white; color: var(--brand-blue); }
        .cta-section .btn-primary:hover { background: var(--cream); }
        .cta-section .btn-secondary { border-color: white; color: white; }
        .cta-section .btn-secondary:hover { background: white; color: var(--brand-blue); }
        .cta-note { font-size: 0.9rem; color: rgba(255, 255, 255, 0.75); }

        /* ── Responsive ─────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .product-hero { grid-template-columns: 1fr; padding: 6rem 2rem 2rem; gap: 2.5rem; }
          .hero-content h1 { font-size: 2.75rem; }
          .kpi-band { padding: 0 2rem 2rem; }
          .kpi-inner { grid-template-columns: repeat(2, 1fr); padding: 1.5rem; }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .section-grid.reverse { direction: ltr; }
          .flexibility-visual { flex-direction: column; gap: 2rem; }
          .flex-demo { flex-direction: column; }
          .arrow { transform: rotate(90deg); }
          .buildup-grid { grid-template-columns: 1fr; }
          .swatch-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .direction-row { grid-template-columns: 1fr; }
          .acoustics-benefits { grid-template-columns: 1fr; }
          .fire-grid { grid-template-columns: 1fr; }
          .sustainability-features { grid-template-columns: 1fr; }
          .ordering-grid { grid-template-columns: 1fr; }
          .dark-band { grid-template-columns: 1fr; }
          .applications-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .content-section { padding: 4rem 1.5rem; }
          .kpi-band { padding: 0 1.5rem 2rem; }
          .product-nav { padding: 0 1rem; overflow-x: auto; }
          .nav-inner { min-width: max-content; }
          .nav-item { padding: 1rem 0.9rem; font-size: 0.85rem; }
          .hero-ctas { flex-direction: column; }
          .hero-ctas .btn-primary, .hero-ctas .btn-secondary { justify-content: center; }
          .rpet-flex-groove-product-page h2 { font-size: 1.85rem; }
          .swatch-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .colour-notes { grid-template-columns: 1fr; gap: 1.5rem; }
          .fire-cards { grid-template-columns: 1fr; }
          .applications-grid { grid-template-columns: 1fr; }
          .cta-buttons { flex-direction: column; }
        }

        @media (max-width: 480px) {
          .product-hero { padding: 5.5rem 1rem 1.5rem; }
          .hero-content h1 { font-size: 2.2rem; letter-spacing: -1px; }
          .content-section { padding: 3rem 1rem; }
          .kpi-band { padding: 0 1rem 1.5rem; }
          .kpi-inner { grid-template-columns: 1fr 1fr; gap: 1.25rem; padding: 1.25rem; }
          .kpi-value { font-size: 1.5rem; }
          .swatch-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem; }
          .swatch-image { max-height: 150px; }
          .groove-lines, .curved-surface { padding: 0.75rem; }
          .groove-line { height: 60px; }
          .color-selector { padding: 1rem; }
          .dark-band { padding: 1.5rem 1.25rem; }
          .band-ctas a { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
