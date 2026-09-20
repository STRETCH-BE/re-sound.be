'use client';

import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PRODUCTS } from '@/data/products';
import { SHOWROOM } from '@/config/site';

/**
 * rPET Groove — product page. rPET Groove is machined from the rPET Panel
 * (Michael, 20 September 2026), so material, colours, reaction to fire,
 * processing and ordering follow the rPET Panel datasheet (EN · 09/2026,
 * v1.0); thickness and NRC per thickness are the earlier product data.
 *
 * Governed figures (recycled share, thickness, NRC per thickness, fire class,
 * colour count, plant) come from src/data/products.ts. 'unknown' selects the
 * figure-less ICU branch; a null spec hides the element that would show it.
 */
const GROOVE = PRODUCTS['rpet-groove'];
const grooveSpecs = GROOVE.specs.kind === 'panel' ? GROOVE.specs : null;
const pct: string = GROOVE.recycledContentPct === null ? 'unknown' : String(GROOVE.recycledContentPct);
const colourCount: string = grooveSpecs?.finishCount === null || grooveSpecs?.finishCount === undefined ? 'unknown' : String(grooveSpecs.finishCount);
// specs.nrc is written '0.55 / 0.75 / 0.90' — one value per thickness ('12 / 24 / 36 mm').
const nrcByThickness: string[] = grooveSpecs?.nrc ? grooveSpecs.nrc.split(' / ').map((v) => v.trim()) : [];
const thicknessList: string[] = grooveSpecs?.thickness
  ? grooveSpecs.thickness.replace(/\s*mm$/, '').split(' / ').map((v) => `${v.trim()} mm`)
  : [];
const nrcCards = thicknessList.map((thickness, i) => ({ thickness, nrc: nrcByThickness[i] ?? null }));
const thicknessFigure = grooveSpecs?.thickness ? grooveSpecs.thickness.replace(/\s*mm$/, '').replace(/ \/ /g, ' · ') : null;
const nrcFigure = grooveSpecs?.nrc ? grooveSpecs.nrc.replace(/ \/ /g, ' · ') : null;

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

const fireByColour = fireClassesByColour(grooveSpecs?.fireClass);
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

// Product photography (hero views). The photos predate the datasheet's colour
// range and are shown as views, not as named colours.
const PRODUCT_PHOTOS = [
  '/images/products/rpet-groove/gallery-1.jpg',
  '/images/products/rpet-groove/rPET-Groove-Beige.jpg',
  '/images/products/rpet-groove/rPET-Groove-grey.jpg',
  '/images/products/rpet-groove/rPET-Groove-Anthracit.jpg',
  '/images/products/rpet-groove/rPET-Groove-Black.jpg',
];

// Groove pattern options (earlier product data — no datasheet of their own)
const patternOptions = [
  { id: 'line', nameKey: 'options.lineName', groovesKey: 'options.lineGrooves', spacing: '25 mm', descriptionKey: 'options.lineDesc' },
  { id: 'wave', nameKey: 'options.waveName', groovesKey: 'options.waveGrooves', spacing: '30 mm', descriptionKey: 'options.waveDesc' },
  { id: 'chevron', nameKey: 'options.chevronName', groovesKey: 'options.chevronGrooves', spacing: '25 mm', descriptionKey: 'options.chevronDesc' },
  { id: 'grid', nameKey: 'options.gridName', groovesKey: 'options.gridGrooves', spacing: '40 mm', descriptionKey: 'options.gridDesc' },
];

const PHONE_DISPLAY = '+32 3 284 68 18';

/**
 * Server-rendered sections handed in by the route page
 * (src/app/[locale]/products/rpet-groove/page.tsx). Keeping them out of
 * this client component means specs / downloads / gallery / FAQ / related
 * models are plain HTML with no hydration cost.
 */
export interface RPetGrooveProductPageSlots {
  /** Visible breadcrumb trail (Home › Products › range › model), floated over the hero */
  breadcrumbs?: React.ReactNode;
  specs: React.ReactNode;
  downloads: React.ReactNode;
  gallery?: React.ReactNode;
  faq: React.ReactNode;
  otherModels: React.ReactNode;
}

export default function RPetGrooveProductPage({ breadcrumbs, specs, downloads, gallery, faq, otherModels }: RPetGrooveProductPageSlots) {
  const t = useTranslations('rpetGroovePage');
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
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(patternOptions[0]);
  const [selectedColour, setSelectedColour] = useState<StockColour | 'custom' | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Fire a single view_item event on mount so GA4 / Meta see
  // the product impression. Empty deps array → fires once per page.
  useEffect(() => {
    analytics.viewItem('rpet-groove', 'rpet');
  }, []);

  const selectPhoto = (i: number) => {
    if (i !== photoIndex) {
      setIsImageLoading(true);
      setPhotoIndex(i);
    }
  };

  const colourName = (c: StockColour) => tPage(`rpet.colours.${c.key}`);
  const selectedLabel =
    selectedColour === null
      ? tPage('rpet.colours.choose')
      : selectedColour === 'custom'
        ? tPage('rpet.colours.custom')
        : tPage('rpet.colours.selected', { number: selectedColour.number, name: colourName(selectedColour) });

  const navItems = [
    { id: 'overview', label: tPage('nav.overview') },
    { id: 'colors', label: tPage('nav.colors') },
    { id: 'patterns', label: tPage('nav.patterns') },
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

  return (
    <div className="rpet-groove-product-page">
      {/* Hero Section */}
      <section className="product-hero">
        <div className="hero-content">
          {breadcrumbs}
          <span className="product-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">
            {t('hero.description', { pct })}
          </p>
          <p className="hero-manufacturer">{tm('statement')}</p>

          <div className="hero-usps">
            <div className="usp">
              <span className="usp-text">{t('hero.usp1', { pct })}</span>
            </div>
            <div className="usp">
              <span className="usp-text">{t('hero.usp2')}</span>
            </div>
            <div className="usp">
              <span className="usp-text">{t('hero.usp3', { count: colourCount })}</span>
            </div>
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary" onClick={() => analytics.quoteClick('rpet-groove', 'product_cta')}>
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
                src={PRODUCT_PHOTOS[photoIndex]}
                alt={t('alt.productPhoto', { n: photoIndex + 1 })}
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

          <div className="photo-strip" role="group" aria-label={t('hero.photoStrip')}>
            {PRODUCT_PHOTOS.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`photo-thumb ${photoIndex === i ? 'active' : ''}`}
                onClick={() => selectPhoto(i)}
                aria-label={t('alt.productPhoto', { n: i + 1 })}
                aria-pressed={photoIndex === i}
              >
                <Image src={src} alt="" fill sizes="72px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
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
          {nrcFigure && (
            <div className="kpi">
              <span className="kpi-value">{nrcFigure}</span>
              <span className="kpi-label">{tPage('rpet.kpi.nrcByThickness')}</span>
            </div>
          )}
          {fireKpi && (
            <div className="kpi">
              <span className="kpi-value">{fireKpi}</span>
              <span className="kpi-label">{tPage('rpet.kpi.fire')}</span>
            </div>
          )}
          {grooveSpecs?.finishCount !== null && grooveSpecs?.finishCount !== undefined && (
            <div className="kpi">
              <span className="kpi-value">{grooveSpecs.finishCount}</span>
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
                src="/images/products/rpet-groove/rPET - Groove - Grey2.jpg"
                alt={t('alt.rpetGrooveAcousticPanelInModernOffice')}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
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
                {t('overview.feature1', { pct })}
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

      {/* Made from the rPET Panel — numbered build-up */}
      <section className="content-section material-section dark">
        <div className="ds-wrap">
          <div className="material-header">
            <span className="section-tag">{t('material.tag')}</span>
            <h2>{tPage('rpet.material.fromPanelTitle')}</h2>
            <p>{t('material.description')}</p>
          </div>
          <div className="buildup-grid">
            <div className="buildup-item">
              <span className="buildup-number">01</span>
              <h4>{t('material.layer1Title')}</h4>
              <p>{t('material.layer1Desc', { pct })}</p>
            </div>
            <div className="buildup-item">
              <span className="buildup-number">02</span>
              <h4>{t('material.layer2Title')}</h4>
              <p>{t('material.layer2Desc')}</p>
            </div>
            <div className="buildup-item">
              <span className="buildup-number">03</span>
              <h4>{t('material.layer3Title')}</h4>
              <p>{t('material.layer3Desc')}</p>
            </div>
          </div>
          <p className="material-link">
            <Link href="/products/rpet-panel">{tPage('rpet.material.panelLink')}</Link>
          </p>
        </div>
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
          <p className="selected-colour">{selectedLabel}</p>

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
        </div>
      </section>

      {/* Patterns Section */}
      <section id="patterns" className="content-section patterns-section dark">
        <div className="patterns-header">
          <span className="section-tag">{t('patterns.tag')}</span>
          <h2>{t('patterns.title')}</h2>
          <p>{t('patterns.description')}</p>
          {desc2IfDistinct('patterns') && (
            <p>{desc2IfDistinct('patterns')}</p>
          )}
        </div>

        <div className="patterns-grid">
          {patternOptions.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              className={`pattern-card ${selectedPattern.id === pattern.id ? 'active' : ''}`}
              onClick={() => setSelectedPattern(pattern)}
              aria-pressed={selectedPattern.id === pattern.id}
            >
              <div className="pattern-visual">
                <div className={`pattern-preview pattern-${pattern.id}`}>
                  {pattern.id === 'line' && (
                    <>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                      <div className="groove-line"></div>
                    </>
                  )}
                  {pattern.id === 'wave' && (
                    <svg viewBox="0 0 100 80" className="wave-svg" aria-hidden="true">
                      <path d="M0 20 Q25 10 50 20 T100 20" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <path d="M0 40 Q25 30 50 40 T100 40" fill="none" stroke="currentColor" strokeWidth="3"/>
                      <path d="M0 60 Q25 50 50 60 T100 60" fill="none" stroke="currentColor" strokeWidth="3"/>
                    </svg>
                  )}
                  {pattern.id === 'chevron' && (
                    <>
                      <div className="chevron-line"></div>
                      <div className="chevron-line"></div>
                      <div className="chevron-line"></div>
                    </>
                  )}
                  {pattern.id === 'grid' && (
                    <div className="grid-pattern">
                      <div className="grid-h"></div>
                      <div className="grid-h"></div>
                      <div className="grid-v"></div>
                      <div className="grid-v"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="pattern-info">
                <h4>{t(pattern.nameKey)}</h4>
                <span className="pattern-type">{t(pattern.groovesKey)} {t('patterns.groovesLabel')}</span>
                <p>{t(pattern.descriptionKey)}</p>
                <span className="pattern-spacing">{t('patterns.spacingLabel')} {pattern.spacing}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Acoustics — NRC per thickness (product data) and the material's behaviour */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="ds-wrap">
          <span className="section-tag">{t('acoustics.tag')}</span>
          <h2>{tPage('rpet.acoustics.title')}</h2>
          <p className="ds-lead">{t('acoustics.description')}</p>

          {nrcCards.length > 0 && (
            <div className="nrc-grid">
              {nrcCards.map((card) => (
                <div key={card.thickness} className="nrc-card">
                  <span className="nrc-thickness">{card.thickness}</span>
                  {card.nrc ? (
                    <>
                      <span className="nrc-value">{card.nrc}</span>
                      <span className="nrc-label">NRC</span>
                    </>
                  ) : (
                    <span className="nrc-label">{tPage('ordering.onRequest')}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="ds-lead mounting-note">{tPage('rpet.acoustics.intro')}</p>
          <p className="ds-footnote">
            {t('acoustics.certNote')} <Link href="/products/rpet-panel">{tPage('rpet.acoustics.panelTableLink')}</Link>
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

            <div className="mounting-options">
              <h4>{t('installation.mountingOptions')}</h4>
              <div className="mounting-grid">
                <div className="mounting-option">
                  <span>{t('installation.mounting1')}</span>
                </div>
                <div className="mounting-option">
                  <span>{t('installation.mounting2')}</span>
                </div>
                <div className="mounting-option">
                  <span>{t('installation.mounting3')}</span>
                </div>
                <div className="mounting-option">
                  <span>{t('installation.mounting4')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rpet-groove/processing-cnc.jpg"
                alt={t('alt.panelInstallationProcess')}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
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
                src="/images/products/rpet-groove/overview-recycled.jpg"
                alt={t('alt.recycledMaterials')}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
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
                  <p>{tPage('ordering.takeBack')}</p>
                </div>
              </div>
              <div className="sustain-item">
                <div>
                  <h4>{t('sustainability.badge4')}</h4>
                  <p>{t('sustainability.badge4Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical data — server-rendered (ProductSpecs, src/data/specs/rpet-groove.ts) */}
      {specs}

      {/* Ordering — minimum order and lead time (as the rPET Panel) */}
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
                    <td>{tPage('rpet.ordering.minimumOrderPanel')}</td>
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
                    <td>{tPage('rpet.ordering.deliveryValue')}</td>
                  </tr>
                  {GROOVE.madeIn && (
                    <tr>
                      <th scope="row">{tPage('ordering.madeIn')}</th>
                      <td>{tm(`plant.${GROOVE.madeIn}`)}</td>
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
                <a href={SHOWROOM.telephoneHref} onClick={() => analytics.phoneClick('product_ordering_rpet-groove')}>{PHONE_DISPLAY}</a>
              </p>
              <p>
                {tPage('rpet.ordering.showroom')}: {SHOWROOM.streetAddress}, {SHOWROOM.postalCode} {tm('plant.BE')}
              </p>
              <div className="band-ctas">
                <Link href="/samples" className="btn-band-primary" prefetch={false}>{tPage('ordering.requestSamples')}</Link>
                <Link href="/contact" className="btn-band-secondary" onClick={() => analytics.quoteClick('rpet-groove', 'product_ordering')}>{tPage('ordering.requestQuote')}</Link>
              </div>
            </div>
          </div>
          <p className="ds-footnote">
            {tPage('ordering.dataNote')} {tPage('ordering.calculatedNote')}
          </p>
        </div>
      </section>

      {gallery}

      {downloads}

      {/* Applications Section */}
      <section className="content-section applications-section dark">
        <div className="applications-header">
          <span className="section-tag">{t('applications.tag')}</span>
          <h2>{t('applications.title')}</h2>
          <p>{t('applications.description')}</p>
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

      {faq}
      {otherModels}

      {/* CTA Section */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>{tPage('cta.ctaTitle')}</h2>
          <p>
            {tPage('cta.ctaSubtitle')}</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large" onClick={() => analytics.quoteClick('rpet-groove', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href={SHOWROOM.telephoneHref} className="btn-secondary large" onClick={() => analytics.phoneClick('product_cta_rpet-groove')}>
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">
            {t('cta2.freeNote', { pct })}
          </p>
        </div>
      </section>

      <style jsx>{`
        .rpet-groove-product-page {
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
        .ds-lead { font-size: 1.05rem; color: #444; line-height: 1.75; max-width: 820px; margin: 0 0 2rem; }
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

        .rpet-groove-product-page h2 {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          color: var(--deep-blue);
          letter-spacing: -0.5px;
          line-height: 1.15;
          margin: 0 0 1.25rem;
        }
        .content-section.dark h2 { color: white; }

        .table-scroll { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }

        .ds-table {
          width: 100%;
          min-width: 320px;
          border-collapse: collapse;
          font-size: 0.95rem;
        }
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

        .hero-description {
          font-size: 1.05rem;
          color: #444;
          line-height: 1.75;
          margin-bottom: 1rem;
          max-width: 540px;
        }

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

        .hero-image { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }

        .image-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          aspect-ratio: 4/5;
          border-radius: 20px;
          overflow: hidden;
          background: var(--cream);
        }
        .image-wrapper { position: absolute; inset: 0; transition: opacity 0.3s ease; }
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

        .photo-strip { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem; }
        .photo-thumb {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          background: var(--cream);
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .photo-thumb:hover { transform: translateY(-2px); }
        .photo-thumb.active { border-color: var(--brand-blue); box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue); }

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
        .kpi-value {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          color: var(--brand-blue-soft);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
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

        /* ── Material / build-up ────────────────────────────────── */
        .material-header { max-width: 820px; margin: 0 0 2.5rem; }
        .material-header p { font-size: 1.05rem; color: rgba(255, 255, 255, 0.82); line-height: 1.75; margin: 0; }
        .buildup-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .buildup-item {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 1.25rem;
        }
        .buildup-number {
          display: block;
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--brand-blue-soft);
          margin-bottom: 0.5rem;
        }
        .buildup-item h4 { color: white; font-size: 1.05rem; margin: 0 0 0.4rem; font-family: var(--font-heading); }
        .buildup-item p { font-size: 0.92rem; color: rgba(255, 255, 255, 0.78); margin: 0; line-height: 1.6; }
        .material-link { margin: 2rem 0 0; font-size: 0.95rem; }
        .material-link a { color: var(--brand-blue-soft); text-decoration: underline; text-underline-offset: 3px; }

        /* ── Colours ────────────────────────────────────────────── */
        .colors-header { max-width: 820px; margin: 0 0 2.5rem; }
        .colors-header p { font-size: 1.05rem; color: #444; line-height: 1.75; margin: 0; }

        .swatch-grid {
          display: grid;
          grid-template-columns: repeat(11, minmax(0, 1fr));
          gap: 0.9rem;
          margin-bottom: 1rem;
        }
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
        .swatch-card .swatch-number {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--brand-blue);
          letter-spacing: 0.06em;
        }
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
        .selected-colour { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); margin: 0 0 2.5rem; }

        .colour-notes { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; max-width: 1000px; }
        .colour-note h3 { font-family: var(--font-heading); font-size: 1.15rem; color: var(--brand-blue); margin: 0 0 0.5rem; }
        .colour-note p { font-size: 0.98rem; color: #444; line-height: 1.7; margin: 0; }

        /* ── Patterns ───────────────────────────────────────────── */
        .patterns-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .patterns-header p { font-size: 1.05rem; color: rgba(255, 255, 255, 0.82); line-height: 1.75; }

        .patterns-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; max-width: 1200px; margin: 0 auto; }
        .pattern-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.12);
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          color: inherit;
          font: inherit;
          text-align: left;
        }
        .pattern-card:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.25); }
        .pattern-card.active { background: rgba(25, 127, 199, 0.2); border-color: var(--brand-blue); }

        .pattern-visual { height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
        .pattern-preview {
          width: 80px;
          height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.65);
        }
        .pattern-line .groove-line { height: 3px; background: currentColor; border-radius: 2px; }
        .wave-svg { width: 100%; height: 100%; }
        .pattern-chevron .chevron-line { width: 100%; height: 3px; background: currentColor; transform: skewY(-15deg); border-radius: 2px; }
        .grid-pattern { position: relative; width: 100%; height: 100%; }
        .grid-h, .grid-v { position: absolute; background: currentColor; border-radius: 2px; }
        .grid-h { height: 3px; width: 100%; left: 0; }
        .grid-h:first-child { top: 25%; }
        .grid-h:nth-child(2) { top: 75%; }
        .grid-v { width: 3px; height: 100%; top: 0; }
        .grid-v:nth-child(3) { left: 25%; }
        .grid-v:nth-child(4) { left: 75%; }

        .pattern-info { text-align: center; }
        .pattern-info h4 { color: white; font-size: 1.05rem; margin-bottom: 0.25rem; font-family: var(--font-heading); }
        .pattern-type { font-size: 0.85rem; color: var(--brand-blue-soft); }
        .pattern-info p { font-size: 0.85rem; color: rgba(255, 255, 255, 0.65); margin: 0.5rem 0; }
        .pattern-spacing { font-size: 0.8rem; color: rgba(255, 255, 255, 0.55); }

        /* ── Acoustics / fire ───────────────────────────────────── */
        .acoustics-section { background: white; }
        .nrc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; max-width: 820px; margin: 0 0 2.5rem; }
        .nrc-card {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 1.5rem;
          border-radius: 12px;
          background: var(--brand-blue-pale);
        }
        .nrc-thickness { font-size: 0.85rem; color: #555; }
        .nrc-value { font-family: var(--font-heading); font-size: 2rem; font-weight: 700; color: var(--deep-blue); line-height: 1.1; }
        .nrc-label { font-size: 0.8rem; color: var(--brand-blue); font-weight: 600; letter-spacing: 0.08em; }
        .mounting-note { margin-bottom: 0.5rem; }

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
        .installation-section .step-number {
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

        .mounting-options { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.15); }
        .mounting-options h4 { color: white; margin-bottom: 1rem; }
        .mounting-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .mounting-option { display: flex; align-items: center; justify-content: center; padding: 0.9rem; background: rgba(255, 255, 255, 0.06); border-radius: 10px; }
        .mounting-option span { font-size: 0.85rem; color: rgba(255, 255, 255, 0.85); }

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
          .buildup-grid { grid-template-columns: 1fr; }
          .swatch-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .patterns-grid { grid-template-columns: repeat(2, 1fr); }
          .nrc-grid { grid-template-columns: 1fr; max-width: 420px; }
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
          .rpet-groove-product-page h2 { font-size: 1.85rem; }
          .swatch-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
          .colour-notes { grid-template-columns: 1fr; gap: 1.5rem; }
          .patterns-grid { grid-template-columns: 1fr; }
          .fire-cards { grid-template-columns: 1fr; }
          .mounting-grid { grid-template-columns: repeat(2, 1fr); }
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
          .photo-thumb { width: 52px; height: 52px; }
          .dark-band { padding: 1.5rem 1.25rem; }
          .band-ctas a { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
