'use client';

import { useTranslations } from 'next-intl';
import { analytics } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { PRODUCTS } from '@/data/products';
import { isoAbsorptionClass } from '@/components/product/resolveMsg';
import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * rWood Micro — product page.
 *
 * Content model: the rWood Micro datasheet (EN · 09/2026, v1.0) and the rWood
 * colour and finish guide. Every governed figure (thickness, αw, absorption
 * class, fire class, plant, certifications, veneer count) is read from
 * src/data/products.ts; the locale-independent literals below (hole sizes,
 * open areas, panel sizes) are the datasheet's own figures.
 */
const PRODUCT = PRODUCTS['rwood-micro'];
const panelSpecs = PRODUCT.specs.kind === 'panel' ? PRODUCT.specs : null;
const alphaW = panelSpecs?.alphaW ?? null;
const absorptionClass = isoAbsorptionClass(alphaW);
const fireClass = panelSpecs?.fireClass ?? null;
const thickness = panelSpecs?.thickness ?? null;
const hasFsc = PRODUCT.certifications.includes('FSC');

// Narrow no-break space, the datasheet's thousands separator ("3 050 × 1 220 mm").
const NNBSP = ' ';
const MAX_SIZE = `3${NNBSP}050 × 1${NNBSP}220 mm`;

// The eight stock veneers of the datasheet (page 3), in its order. Names are
// proper names, identical in every language; origin and grain are message keys.
// The first veneer is printed "Beech White Ash" on the datasheet — kept as is.
const VENEERS = [
  { id: 'beech-white-ash', name: 'Beech White Ash', origin: 'europe', grain: 'straightInterlocked', isDark: false },
  { id: 'birch-rotary', name: 'Birch Rotary', origin: 'scandinavia', grain: 'subtleFine', isDark: false },
  { id: 'silk-oak', name: 'Silk Oak', origin: 'europe', grain: 'fineStraight', isDark: false },
  { id: 'straw-oak', name: 'Straw Oak', origin: 'europe', grain: 'cathedral', isDark: false },
  { id: 'umber-oak', name: 'Umber Oak', origin: 'europe', grain: 'pronounced', isDark: true },
  { id: 'american-walnut', name: 'American Walnut', origin: 'northAmerica', grain: 'straightWavy', isDark: true },
  { id: 'smoked-oak', name: 'Smoked Oak', origin: 'europe', grain: 'deepCathedral', isDark: true },
  { id: 'tobacco-walnut', name: 'Tobacco Walnut', origin: 'northAmerica', grain: 'richFlowing', isDark: true },
] as const;
type Veneer = (typeof VENEERS)[number];
const veneerImage = (v: Veneer) => `/images/products/rwood/veneers/${v.id}.webp`;

// The four perforation densities (datasheet page 1): hole diameter and open area.
// Micro M is the standard density; the others are made on request (Michael, 20 September 2026).
const DENSITIES = [
  { id: 'nano', name: 'Nano', holeMm: 0.5, openPct: 2.5, descKey: 'options.nanoDesc', standard: false },
  { id: 'micro-s', name: 'Micro S', holeMm: 1.0, openPct: 5.2, descKey: 'options.microsDesc', standard: false },
  { id: 'micro-m', name: 'Micro M', holeMm: 1.5, openPct: 8.4, descKey: 'options.micromDesc', standard: true },
  { id: 'micro-l', name: 'Micro L', holeMm: 2.0, openPct: 10.6, descKey: 'options.microlDesc', standard: false },
] as const;
const STANDARD_DENSITY = DENSITIES.find((d) => d.standard) ?? DENSITIES[0];

/** Square-grid pitch (mm) that gives the stated open area for a hole of diameter d. */
const pitchMm = (d: number, openPct: number) => d * Math.sqrt(Math.PI / (4 * (openPct / 100)));

/**
 * To-scale drawing of one perforation density: a 40 × 25 mm patch, holes and
 * pitch in millimetres (the datasheet draws them "about 2:1"; the CSS caps the
 * width at 80 mm on a 96 dpi screen).
 */
function DensityDrawing({ id, holeMm, openPct, label }: { id: string; holeMm: number; openPct: number; label: string }) {
  const pitch = pitchMm(holeMm, openPct);
  const patternId = `rwm-${id}`;
  return (
    <svg className="perf-drawing" viewBox="0 0 40 25" role="img" aria-label={label}>
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width={pitch} height={pitch} x={pitch / 2} y={pitch / 2}>
          <circle cx={pitch / 2} cy={pitch / 2} r={holeMm / 2} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="40" height="25" fill={`url(#${patternId})`} />
    </svg>
  );
}

/** Exploded build-up: 01 micro-perforated veneer · 02 FR MDF core with sound chambers · 03 acoustic fleece. */
function BuildUpDrawing({ label }: { label: string }) {
  const face = 'M60 0 L120 30 L60 60 L0 30 Z';
  return (
    <svg className="buildup-drawing" viewBox="0 0 150 150" role="img" aria-label={label}>
      <defs>
        <clipPath id="rwm-face"><path d={face} /></clipPath>
      </defs>
      {/* 03 fleece */}
      <g transform="translate(15 78)">
        <path d="M60 60 L0 30 L0 36 L60 66 L120 36 L120 30 Z" fill="#0a2d47" />
        <path d={face} fill="#0d3a5c" />
      </g>
      {/* 02 core with sound chambers */}
      <g transform="translate(15 44)">
        <path d="M60 60 L0 30 L0 38 L60 68 L120 38 L120 30 Z" fill="#cfd8df" />
        <path d={face} fill="#e6ecf1" />
        <g clipPath="url(#rwm-face)" fill="#9fb3c2">
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2, 3, 4, 5, 6].map((col) => (
              <ellipse key={`${row}-${col}`} cx={18 + col * 14 + (row % 2) * 7} cy={12 + row * 9} rx="3.6" ry="2" />
            )),
          )}
        </g>
      </g>
      {/* 01 micro-perforated veneer */}
      <g transform="translate(15 10)">
        <path d="M60 60 L0 30 L0 34 L60 64 L120 34 L120 30 Z" fill="#1466a3" />
        <path d={face} fill="#dbeaf5" stroke="#197FC7" strokeWidth="1" />
        <g clipPath="url(#rwm-face)" fill="#0d3a5c">
          {Array.from({ length: 11 }, (_, row) =>
            Array.from({ length: 17 }, (_, col) => (
              <circle key={`${row}-${col}`} cx={6 + col * 7 + (row % 2) * 3.5} cy={6 + row * 5} r="0.9" />
            )),
          )}
        </g>
      </g>
      {/* callout lines */}
      <g stroke="#197FC7" strokeWidth="1" fill="none">
        <path d="M120 22 L142 22" />
        <path d="M120 60 L142 60" />
        <path d="M120 100 L142 100" />
      </g>
    </svg>
  );
}

/**
 * Server-rendered sections handed in by the route page
 * (src/app/[locale]/products/rwood-micro/page.tsx). Keeping them out of
 * this client component means specs / downloads / gallery / FAQ / related
 * models are plain HTML with no hydration cost.
 */
export interface RWoodMicroProductPageSlots {
  /** Visible breadcrumb trail (Home › Products › range › model), floated over the hero */
  breadcrumbs?: React.ReactNode;
  specs: React.ReactNode;
  downloads: React.ReactNode;
  gallery?: React.ReactNode;
  faq: React.ReactNode;
  otherModels: React.ReactNode;
}

const NAV_IDS = ['overview', 'perforations', 'veneers', 'acoustics', 'installation', 'specs', 'gallery', 'downloads', 'ordering'] as const;

const defaultHeroImage = PRODUCT.heroImage;

export default function RWoodMicroProductPage({ breadcrumbs, specs, downloads, gallery, faq, otherModels }: RWoodMicroProductPageSlots) {
  const t = useTranslations('rwoodMicroPage');
  const tPage = useTranslations('productPage');
  const tm = useTranslations('manufacturer');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedVeneer, setSelectedVeneer] = useState<Veneer | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const currentHeroImage = selectedVeneer ? veneerImage(selectedVeneer) : defaultHeroImage;

  // Fire a single view_item event on mount so GA4 / Meta see the product impression.
  useEffect(() => {
    analytics.viewItem('rwood-micro', 'rwood');
  }, []);

  // Scroll-spy for the sticky navigation: the topmost visible section is active.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleVeneerSelect = (veneer: Veneer) => {
    if (!selectedVeneer || veneer.id !== selectedVeneer.id) {
      setIsImageLoading(true);
      setSelectedVeneer(veneer);
    }
  };

  const navItems = NAV_IDS.map((id) => ({ id, label: tPage(`nav.${id}`) }));

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="rwood-micro-product-page">
      {/* Hero */}
      <section className="product-hero">
        <div className="hero-content">
          {breadcrumbs}
          <span className="product-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">{t('hero.description')}</p>
          <p className="hero-description">{t('hero.description2')}</p>
          <p className="hero-manufacturer">{tm('statement')}</p>

          <div className="hero-usps">
            <div className="usp">
              <span className="usp-icon" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
                  <circle cx="12" cy="12" r="9" strokeDasharray="1 2" />
                </svg>
              </span>
              <span className="usp-text">{t('hero.usp1')}</span>
            </div>
            {/* "Class A absorption" only while the data αw yields class A (ISO 11654) */}
            {absorptionClass === 'A' && (
              <div className="usp">
                <span className="usp-text">{t('hero.usp2')}</span>
              </div>
            )}
            {fireClass && (
              <div className="usp">
                <span className="usp-text">{t('hero.usp3', { fireClass })}</span>
              </div>
            )}
          </div>

          <div className="hero-ctas">
            <Link href="/contact" className="btn-primary" onClick={() => analytics.quoteClick('rwood-micro', 'product_cta')}>
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
                alt={selectedVeneer ? t('alt.heroVeneer', { name: selectedVeneer.name }) : t('alt.hero')}
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                style={{ objectFit: 'cover' }}
                priority
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  // A missing veneer image would leave the spinner hanging — fall back to the hero.
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

          <div className="finish-selector">
            <span className="selector-label">{t('hero.colorSelector')}</span>
            <div className="finish-options">
              {VENEERS.map((veneer) => (
                <button
                  key={veneer.id}
                  type="button"
                  className={`finish-option ${selectedVeneer?.id === veneer.id ? 'active' : ''}`}
                  onClick={() => handleVeneerSelect(veneer)}
                  title={veneer.name}
                  aria-label={tPage('a11y.selectVeneer', { name: veneer.name })}
                  aria-pressed={selectedVeneer?.id === veneer.id}
                >
                  <Image src={veneerImage(veneer)} alt="" width={72} height={72} sizes="72px" quality={60} className="finish-swatch" style={{ objectFit: 'cover' }} />
                  {selectedVeneer?.id === veneer.id && (
                    <span className={`finish-check ${veneer.isDark ? 'on-dark' : 'on-light'}`} aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
            <span className="selected-finish-name">{selectedVeneer?.name || t('hero.selectVeneer')}</span>
          </div>
        </div>
      </section>

      {/* KPI band — the datasheet's four figures, governed values from product data */}
      <section className="kpi-band" aria-label={t('kpi.ariaLabel')}>
        <div className="kpi-inner">
          {thickness && (
            <div className="kpi">
              <span className="kpi-value">{thickness}</span>
              <span className="kpi-label">{t('kpi.thickness')}</span>
            </div>
          )}
          {alphaW && (
            <div className="kpi">
              <span className="kpi-value">{alphaW}</span>
              <span className="kpi-label">
                {absorptionClass ? t('kpi.alphaWClass', { cls: absorptionClass }) : t('kpi.alphaW')}
              </span>
            </div>
          )}
          {fireClass && (
            <div className="kpi">
              <span className="kpi-value">{fireClass}</span>
              <span className="kpi-label">{t('kpi.fire')}</span>
            </div>
          )}
          <div className="kpi">
            <span className="kpi-value">{STANDARD_DENSITY.name}</span>
            <span className="kpi-label">{t('kpi.standardDensity')}</span>
          </div>
        </div>
      </section>

      {/* Sticky navigation */}
      <nav className="product-nav">
        <div className="nav-inner">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => scrollToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Overview + build-up */}
      <section id="overview" className="content-section overview-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">{t('overview.tag')}</span>
            <h2>{t('overview.title')}</h2>
            <p>{t('overview.description1')}</p>
            <p>{t('overview.description2')}</p>
            <ul className="feature-list">
              {[1, 2, 3, 4].map((n) => (
                <li key={n}>
                  <span className="check" aria-hidden="true">✓</span>
                  {t(`overview.feature${n}`)}
                </li>
              ))}
            </ul>
          </div>

          <div className="buildup-card">
            <span className="section-tag">{tPage('nav.buildUp')}</span>
            <BuildUpDrawing label={t('buildUp.alt')} />
            <ol className="buildup-layers">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <span className="layer-no">0{n}</span>
                  <div>
                    <strong>{t(`buildUp.layer${n}`)}</strong>
                    <span>{t(`buildUp.layer${n}Desc`)}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="buildup-note">{t('buildUp.behind')}</p>
          </div>
        </div>

        <div className="section-image overview-image">
          <div className="image-container">
            <Image
              src="/images/products/rwood-micro/overview-detail.webp"
              alt={t('alt.overview')}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* Perforation densities */}
      <section id="perforations" className="content-section perforations-section">
        <div className="section-header">
          <span className="section-tag">{t('perforation.tag')}</span>
          <h2>{t('perforation.title')}</h2>
          <p>{t('perforation.description')}</p>
        </div>

        <div className="perforations-grid">
          {DENSITIES.map((d) => {
            const spec = t('perforation.spec', { d: d.holeMm.toFixed(1), pct: String(d.openPct) });
            return (
              <div key={d.id} className={`perforation-card${d.standard ? ' standard' : ''}`}>
                <DensityDrawing id={d.id} holeMm={d.holeMm} openPct={d.openPct} label={`${d.name} — ${spec}`} />
                {d.standard && <span className="standard-badge">{t('perforation.standardLabel')}</span>}
                <h3>{d.name}</h3>
                <span className="perf-spec">{spec}</span>
                <p>{t(d.descKey)}</p>
              </div>
            );
          })}
        </div>
        <p className="drawing-note">{t('perforation.drawingNote')}</p>
        {/* Other densities and patterns on request — Michael, 20 September 2026 */}
        <p className="on-request-note">{t('perforation.onRequest')}</p>
      </section>

      {/* Veneers and finish */}
      <section id="veneers" className="content-section veneers-section">
        <div className="section-header">
          <span className="section-tag">{tPage('nav.veneers')}</span>
          <h2>{t('veneers.title')}</h2>
          <p>{t('veneers.description')}</p>
        </div>

        <div className="veneers-grid">
          {VENEERS.map((v) => (
            <figure key={v.id} className="veneer-card">
              <div className="veneer-image">
                <Image src={veneerImage(v)} alt={t('veneers.alt', { name: v.name })} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px" style={{ objectFit: 'cover' }} />
              </div>
              <figcaption>
                <strong>{v.name}</strong>
                <span>{t(`veneers.origin.${v.origin}`)}</span>
                <span className="veneer-grain">{t(`veneers.grain.${v.grain}`)}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="veneer-notes">
          <div>
            <h3>{t('veneers.madeToOrderTitle')}</h3>
            <p>{t('veneers.madeToOrderDesc')}</p>
          </div>
          <div>
            <h3>{t('veneers.finishTitle')}</h3>
            <p>{t('veneers.finishDesc')}</p>
          </div>
          <div>
            <h3>{t('veneers.naturalTitle')}</h3>
            <p>{t('veneers.naturalDesc')}</p>
          </div>
        </div>
      </section>

      {/* Acoustics */}
      <section id="acoustics" className="content-section acoustics-section">
        <div className="section-header">
          <span className="section-tag">{t('acoustics.tag')}</span>
          <h2>{t('acoustics.title')}</h2>
          <p>{t('acoustics.description')}</p>
        </div>

        <div className="acoustics-grid">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th colSpan={2}>{t('acoustics.tableTitle')}</th></tr>
              </thead>
              <tbody>
                {alphaW && (
                  <tr>
                    <th scope="row">αw</th>
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
                  <th scope="row">{t('acoustics.withWool')}</th>
                  <td>{t('acoustics.withWoolVal')}</td>
                </tr>
                <tr>
                  <th scope="row">{tPage('specLabels.testStandard')}</th>
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
        <p className="drawing-note">{t('acoustics.footnote')}</p>
      </section>

      {/* Installation */}
      <section id="installation" className="content-section installation-section dark">
        <div className="section-header">
          <span className="section-tag">{t('installation.tag')}</span>
          <h2>{t('installation.title')}</h2>
          <p>{t('installation.description')}</p>
        </div>

        <div className="section-grid">
          <ol className="installation-steps">
            {[1, 2, 3, 4].map((n) => (
              <li key={n} className="install-step">
                <span className="step-number">0{n}</span>
                <div className="step-content">
                  <h3>{t(`installation.step${n}Title`)}</h3>
                  <p>{t(`installation.step${n}Desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/installation-detail.jpg"
                alt={t('alt.installation')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Made to measure */}
      <section className="content-section bespoke-section">
        <div className="section-grid">
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/bespoke.jpg"
                alt={t('alt.madeToMeasure')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
          <div className="section-content">
            <span className="section-tag">{t('bespoke.tag')}</span>
            <h2>{t('bespoke.title')}</h2>
            <p>{t('bespoke.description')}</p>
            <div className="bespoke-features">
              <div className="bespoke-item">
                <h3>{t('bespoke.customDimTitle')}</h3>
                <p>{t('bespoke.customDimDesc')}</p>
              </div>
              <div className="bespoke-item">
                <h3>{t('bespoke.finishTitle')}</h3>
                <p>{t('bespoke.finishDesc')}</p>
              </div>
              <div className="bespoke-item">
                <h3>{t('bespoke.samplesTitle')}</h3>
                <p>{t('bespoke.samplesDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability — only facts on the datasheet or in product data */}
      <section className="content-section sustainability-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">{t('sustainability.tag')}</span>
            <h2>{t('sustainability.title')}</h2>
            <p>{t('sustainability.description')}</p>
            <div className="sustainability-features">
              {hasFsc && (
                <div className="sustain-item">
                  <h3>{t('sustainability.badge1')}</h3>
                  <p>{t('sustainability.badge1Desc')}</p>
                </div>
              )}
              <div className="sustain-item">
                <h3>{t('sustainability.badge2')}</h3>
                <p>{t('sustainability.badge2Desc')}</p>
              </div>
              {PRODUCT.madeIn === 'PL' && (
                <div className="sustain-item">
                  <h3>{t('sustainability.badge3')}</h3>
                  <p>{t('sustainability.badge3Desc')}</p>
                </div>
              )}
              <div className="sustain-item">
                <h3>{t('sustainability.badge4')}</h3>
                <p>{tPage('ordering.takeBack')}</p>
              </div>
            </div>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src="/images/products/rwood-micro/FSC_sustainability.webp"
                alt={t('alt.sustainableProduction')}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Specifications — server-rendered (ProductSpecs, src/data/specs/rwood-micro.ts) */}
      {specs}

      {/* Projects & installations — server-rendered (ProductGallery) */}
      {gallery}

      {/* Downloads — server-rendered (ProductDownloads) */}
      {downloads}

      {/* Ordering — lead times, samples, end of life */}
      <section id="ordering" className="content-section ordering-section">
        <div className="section-header">
          <span className="section-tag">{tPage('ordering.tag')}</span>
          <h2>{t('ordering.title')}</h2>
        </div>

        <div className="ordering-grid">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th colSpan={2}>{tPage('ordering.leadTime')}</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">{t('ordering.stockVeneers')}</th><td>{t('ordering.stockVeneersVal')}</td></tr>
                <tr><th scope="row">{t('ordering.nonStock')}</th><td>{t('ordering.nonStockVal')}</td></tr>
                <tr><th scope="row">{t('ordering.madeToMeasure')}</th><td>{t('ordering.madeToMeasureVal')}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th colSpan={2}>{t('ordering.supply')}</th></tr>
              </thead>
              <tbody>
                <tr><th scope="row">{tPage('ordering.samples')}</th><td>{t('ordering.samplesVal')}</td></tr>
                <tr><th scope="row">{tPage('ordering.sizes')}</th><td>{t('ordering.sizesVal', { size: MAX_SIZE })}</td></tr>
                <tr><th scope="row">{tPage('ordering.minimumOrder')}</th><td>{tPage('ordering.onRequest')}</td></tr>
                <tr><th scope="row">{tPage('ordering.prices')}</th><td>{tPage('ordering.onRequest')}</td></tr>
                <tr><th scope="row">{tPage('ordering.delivery')}</th><td>{tPage('ordering.onRequest')}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="dark-band">
          <div>
            <h3>{tPage('ordering.endOfLife')}</h3>
            <p>{tPage('ordering.takeBack')}</p>
          </div>
          <div>
            <h3>{tPage('ordering.samplesQuotes')}</h3>
            <p>
              <a href="mailto:info@re-sound.be">info@re-sound.be</a> · <a href="tel:+3232846818" onClick={() => analytics.phoneClick('product_ordering_rwood-micro')}>+32 3 284 68 18</a>
              <br />
              {t('ordering.showroom')}
            </p>
            <div className="band-ctas">
              <Link href="/samples" className="btn-primary" prefetch={false}>{tPage('ordering.requestSamples')}</Link>
              <Link href="/contact" className="btn-secondary" onClick={() => analytics.quoteClick('rwood-micro', 'product_ordering')}>{tPage('ordering.requestQuote')}</Link>
            </div>
          </div>
        </div>
        <p className="drawing-note">{tPage('ordering.dataNote')}</p>
      </section>

      {/* FAQ — server-rendered (ProductFaq) */}
      {faq}

      {/* Other models in this range — server-rendered (OtherModels) */}
      {otherModels}

      {/* CTA */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>{tPage('cta.ctaTitle')}</h2>
          <p>{tPage('cta.ctaSubtitle')}</p>
          <div className="cta-buttons">
            <Link href="/contact" className="btn-primary large" onClick={() => analytics.quoteClick('rwood-micro', 'product_cta')}>
              {tPage('cta.requestQuote')}
            </Link>
            <a href="tel:+3232846818" className="btn-secondary large" onClick={() => analytics.phoneClick('product_cta_rwood-micro')}>
              {tPage('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">{tPage('ordering.takeBack')}</p>
        </div>
      </section>

      <style jsx>{`
        .rwood-micro-product-page {
          --brand-blue-dark: #155d94;
          --line: #e6ecf1;
          --ink-muted: #5f6b76;
        }

        /* ========================================
           HERO
           ======================================== */
        .product-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 8rem 4rem 4rem;
          background: linear-gradient(135deg, var(--cream) 0%, white 100%);
          align-items: center;
        }

        .product-tag {
          display: inline-block;
          color: var(--brand-blue);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .hero-content h1 {
          font-family: var(--font-heading);
          font-size: 4rem;
          line-height: 1.05;
          color: var(--deep-blue);
          margin-bottom: 0.75rem;
          letter-spacing: -1.5px;
        }

        .hero-tagline {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          color: var(--deep-blue);
          font-weight: 600;
          margin-bottom: 1.25rem;
        }

        .hero-description {
          font-size: 1.1rem;
          color: #4a5561;
          line-height: 1.75;
          margin-bottom: 1rem;
          max-width: 520px;
        }

        .hero-manufacturer { font-size: 0.9rem; color: var(--ink-muted); margin: 0.5rem 0 1.5rem; }

        .hero-usps { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; }
        .usp { display: flex; align-items: center; gap: 0.5rem; }
        .usp-icon { display: flex; align-items: center; color: var(--brand-blue); }
        .usp-text { font-weight: 600; color: var(--deep-blue); font-size: 0.9rem; }

        .hero-ctas { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.95rem 2rem;
          background: var(--brand-blue);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          transition: background 0.2s ease, transform 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover { background: var(--brand-blue-dark); transform: translateY(-1px); }
        .btn-primary.large { padding: 1.2rem 2.5rem; font-size: 1.1rem; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.95rem 2rem;
          background: transparent;
          color: var(--deep-blue);
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          border: 2px solid var(--deep-blue);
          transition: background 0.2s ease, color 0.2s ease;
          cursor: pointer;
        }
        .btn-secondary:hover { background: var(--deep-blue); color: white; }
        .btn-secondary.large { padding: 1.2rem 2.5rem; font-size: 1.1rem; }

        .hero-image { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; }

        .image-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          aspect-ratio: 4/5;
          border-radius: 16px;
          overflow: hidden;
          background: var(--cream);
        }
        .image-wrapper { position: absolute; inset: 0; transition: opacity 0.3s ease; }
        .image-wrapper.loading { opacity: 0.7; }
        .image-loading-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.5); }
        .loading-spinner { width: 40px; height: 40px; border: 3px solid var(--brand-blue-pale); border-top-color: var(--brand-blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .finish-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
        }
        .selector-label { font-size: 0.75rem; font-weight: 700; color: var(--brand-blue); text-transform: uppercase; letter-spacing: 0.12em; }
        .finish-options { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; }
        .finish-option {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          border: 2px solid transparent;
          background: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .finish-option:hover { transform: scale(1.08); }
        .finish-option.active { border-color: var(--brand-blue); box-shadow: 0 0 0 2px white, 0 0 0 4px var(--brand-blue); }
        .finish-option:focus-visible { outline: 2px solid var(--brand-blue); outline-offset: 2px; }
        .finish-swatch { display: block; width: 100%; height: 100%; border-radius: 5px; border: 1px solid rgba(0, 0, 0, 0.1); }
        .finish-check { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold; }
        .finish-check.on-dark { color: white; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4); }
        .finish-check.on-light { color: var(--deep-blue); text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6); }
        .selected-finish-name { font-size: 0.9rem; font-weight: 600; color: var(--deep-blue); }

        .section-image .image-container { width: 100%; max-width: none; aspect-ratio: 4/3; }

        /* ========================================
           KPI BAND
           ======================================== */
        .kpi-band { background: var(--deep-blue); color: white; padding: 0 4rem; }
        .kpi-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          padding: 2.5rem 0;
        }
        .kpi { display: flex; flex-direction: column; gap: 0.35rem; }
        .kpi-value { font-family: var(--font-heading); font-size: 2.25rem; font-weight: 700; color: #7ec8f5; line-height: 1; letter-spacing: -0.5px; }
        .kpi-label { font-size: 0.85rem; color: rgba(255, 255, 255, 0.82); line-height: 1.4; }

        /* ========================================
           STICKY NAVIGATION
           ======================================== */
        .product-nav { position: sticky; top: 80px; z-index: 90; background: white; border-bottom: 1px solid var(--line); padding: 0 4rem; overflow-x: auto; }
        .nav-inner { display: flex; gap: 0; max-width: 1200px; margin: 0 auto; min-width: max-content; }
        .nav-item {
          padding: 1.1rem 1.1rem;
          background: none;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
          white-space: nowrap;
        }
        .nav-item:hover { color: var(--brand-blue); }
        .nav-item.active { color: var(--brand-blue); border-bottom-color: var(--brand-blue); }

        /* ========================================
           CONTENT SECTIONS
           ======================================== */
        .content-section { padding: 5rem 4rem; }
        .content-section.dark { background: var(--deep-blue); color: white; }
        .content-section.dark .section-header h2 { color: white; }
        .content-section.dark .section-header p { color: rgba(255, 255, 255, 0.82); }

        .section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto;
          align-items: center;
        }

        .section-header { max-width: 1200px; margin: 0 auto 2.5rem; }
        .section-header p { font-size: 1.1rem; color: #4a5561; line-height: 1.75; max-width: 760px; }

        .section-tag {
          display: inline-block;
          color: var(--brand-blue);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .content-section.dark .section-tag { color: #7ec8f5; }

        .section-header h2,
        .section-content h2 {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          color: var(--deep-blue);
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }
        .section-content p { font-size: 1.05rem; color: #4a5561; line-height: 1.75; margin-bottom: 1.25rem; }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.55rem 0; font-size: 1rem; color: var(--charcoal); line-height: 1.5; }
        .check { color: var(--brand-blue); font-weight: bold; }

        .on-request-note { max-width: 1200px; margin: 0.75rem auto 0; font-size: 0.95rem; color: var(--ink-muted); line-height: 1.6; font-weight: 500; }
        .drawing-note { max-width: 1200px; margin: 1.25rem auto 0; font-size: 0.85rem; color: var(--ink-muted); line-height: 1.5; }

        /* ========================================
           BUILD-UP CARD
           ======================================== */
        .buildup-card { background: var(--cream); border-radius: 16px; padding: 2rem; }
        .buildup-card :global(.buildup-drawing) { display: block; width: 100%; max-width: 300px; height: auto; margin: 0 auto 1.25rem; }
        .buildup-layers { list-style: none; padding: 0; margin: 0 0 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .buildup-layers li { display: flex; gap: 0.75rem; align-items: flex-start; }
        .layer-no { font-family: var(--font-heading); font-weight: 700; color: var(--brand-blue); font-size: 0.9rem; min-width: 1.6rem; padding-top: 0.1rem; }
        .buildup-layers strong { display: block; color: var(--deep-blue); font-size: 0.95rem; }
        .buildup-layers span { display: block; font-size: 0.85rem; color: var(--ink-muted); }
        .buildup-note { font-size: 0.85rem; color: var(--ink-muted); margin: 0; }
        .overview-image { max-width: 1200px; margin: 3rem auto 0; }
        .overview-image .image-container { aspect-ratio: 21/9; }

        /* ========================================
           PERFORATION DENSITIES
           ======================================== */
        .perforations-section { background: white; }
        .perforations-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .perforation-card { display: flex; flex-direction: column; }
        .perforation-card :global(.perf-drawing) {
          display: block;
          width: 100%;
          max-width: 302px;
          height: auto;
          color: var(--deep-blue);
          background: var(--brand-blue-pale);
          border: 1px solid #d6e6f2;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        .perforation-card.standard :global(.perf-drawing) { border-color: var(--brand-blue); box-shadow: 0 0 0 3px var(--brand-blue-pale); }
        .standard-badge {
          display: inline-block;
          align-self: flex-start;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: white;
          background: var(--brand-blue);
          border-radius: 999px;
          padding: 0.3rem 0.7rem;
          margin-bottom: 0.5rem;
        }
        .perforation-card h3 { font-family: var(--font-heading); font-size: 1.1rem; color: var(--deep-blue); margin: 0 0 0.2rem; }
        .perf-spec { font-size: 0.9rem; font-weight: 600; color: var(--brand-blue); margin-bottom: 0.35rem; }
        .perforation-card p { font-size: 0.9rem; color: var(--ink-muted); margin: 0; line-height: 1.5; }

        /* ========================================
           VENEERS
           ======================================== */
        .veneers-section { background: var(--cream); }
        .veneers-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto 2.5rem;
        }
        .veneer-card { margin: 0; }
        .veneer-image { position: relative; aspect-ratio: 648/400; border-radius: 6px; overflow: hidden; background: #ddd; margin-bottom: 0.75rem; }
        .veneer-card figcaption strong { display: block; font-family: var(--font-heading); color: var(--deep-blue); font-size: 1rem; }
        .veneer-card figcaption span { display: block; font-size: 0.85rem; color: var(--deep-blue); }
        .veneer-card figcaption .veneer-grain { color: var(--ink-muted); }
        .veneer-notes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 1200px; margin: 0 auto; }
        .veneer-notes h3 { font-family: var(--font-heading); font-size: 1.05rem; color: var(--deep-blue); margin-bottom: 0.4rem; }
        .veneer-notes p { font-size: 0.95rem; color: #4a5561; line-height: 1.6; margin: 0; }

        /* ========================================
           DATA TABLES (datasheet style)
           ======================================== */
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .data-table { width: 100%; min-width: 280px; border-collapse: collapse; background: white; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
        .data-table thead th { background: var(--cream); color: var(--deep-blue); font-size: 0.8rem; font-weight: 600; text-align: left; padding: 0.7rem 1rem; }
        .data-table tbody th, .data-table tbody td { padding: 0.7rem 1rem; border-top: 1px solid var(--line); font-size: 0.92rem; text-align: left; vertical-align: top; }
        .data-table tbody th { font-weight: 500; color: #5b6770; width: 48%; }
        .data-table tbody td { color: var(--deep-blue); font-weight: 600; }

        /* ========================================
           ACOUSTICS
           ======================================== */
        .acoustics-section { background: white; }
        .acoustics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 1200px; margin: 0 auto; align-items: start; }
        .info-card { background: var(--cream); border-radius: 12px; padding: 1.5rem 1.75rem; }
        .info-card h3 { font-family: var(--font-heading); font-size: 1.1rem; color: var(--deep-blue); margin-bottom: 0.5rem; }
        .info-card p { font-size: 0.95rem; color: #4a5561; line-height: 1.65; margin: 0; }

        /* ========================================
           INSTALLATION
           ======================================== */
        .installation-steps { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .install-step { display: flex; flex-direction: column; gap: 0.5rem; border-top: 1px solid rgba(255, 255, 255, 0.25); padding-top: 1rem; }
        .step-number { font-family: var(--font-heading); font-weight: 700; color: #7ec8f5; font-size: 0.95rem; }
        .step-content h3 { font-family: var(--font-heading); color: white; font-size: 1.05rem; margin: 0 0 0.25rem; }
        .step-content p { font-size: 0.92rem; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.55; }

        /* ========================================
           MADE TO MEASURE / SUSTAINABILITY
           ======================================== */
        .bespoke-section { background: var(--cream); }
        .bespoke-features, .sustainability-features { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem 2rem; }
        .bespoke-item h3, .sustain-item h3 { font-family: var(--font-heading); font-size: 1rem; color: var(--deep-blue); margin: 0 0 0.25rem; }
        .bespoke-item p, .sustain-item p { font-size: 0.92rem; color: #4a5561; margin: 0; line-height: 1.55; }
        .sustainability-section { background: white; }

        /* ========================================
           ORDERING
           ======================================== */
        .ordering-section { background: var(--cream); }
        .ordering-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 1200px; margin: 0 auto 2rem; align-items: start; }
        .dark-band {
          max-width: 1200px;
          margin: 0 auto;
          background: var(--deep-blue);
          color: white;
          border-radius: 16px;
          padding: 2rem 2.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .dark-band h3 { font-family: var(--font-heading); font-size: 1.15rem; color: white; margin-bottom: 0.5rem; }
        .dark-band p { font-size: 0.95rem; color: rgba(255, 255, 255, 0.85); line-height: 1.65; margin: 0 0 1rem; }
        .dark-band a { color: white; text-decoration: underline; text-underline-offset: 3px; }
        .band-ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; }
        .dark-band .btn-primary { background: white; color: var(--deep-blue); }
        .dark-band .btn-primary:hover { background: var(--brand-blue-pale); }
        .dark-band .btn-secondary { border-color: rgba(255, 255, 255, 0.7); color: white; }
        .dark-band .btn-secondary:hover { background: white; color: var(--deep-blue); }

        /* ========================================
           CTA
           ======================================== */
        .cta-section { background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%); text-align: center; }
        .cta-content { max-width: 700px; margin: 0 auto; }
        .cta-content h2 { font-family: var(--font-heading); font-size: 2.25rem; color: white; margin-bottom: 1rem; }
        .cta-content > p { font-size: 1.1rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2rem; }
        .cta-buttons { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }
        .cta-section .btn-primary { background: white; color: var(--brand-blue); }
        .cta-section .btn-primary:hover { background: var(--cream); }
        .cta-section .btn-secondary { border-color: white; color: white; }
        .cta-section .btn-secondary:hover { background: white; color: var(--brand-blue); }
        .cta-note { font-size: 0.9rem; color: rgba(255, 255, 255, 0.8); }

        /* ========================================
           RESPONSIVE
           ======================================== */
        @media (max-width: 1024px) {
          .product-hero { grid-template-columns: 1fr; padding: 6rem 2rem 3rem; gap: 2.5rem; }
          .hero-content h1 { font-size: 3rem; }
          .kpi-band { padding: 0 2rem; }
          .kpi-inner { grid-template-columns: repeat(2, 1fr); }
          .content-section { padding: 4rem 2rem; }
          .section-grid { grid-template-columns: 1fr; gap: 2rem; }
          .perforations-grid { grid-template-columns: repeat(2, 1fr); }
          .veneers-grid { grid-template-columns: repeat(2, 1fr); }
          .veneer-notes { grid-template-columns: 1fr; gap: 1.25rem; }
          .acoustics-grid, .ordering-grid, .dark-band { grid-template-columns: 1fr; }
          .product-nav { padding: 0 2rem; }
        }

        @media (max-width: 640px) {
          .product-hero { padding: 5rem 1rem 2.5rem; }
          .hero-content h1 { font-size: 2.4rem; }
          .kpi-band { padding: 0 1rem; }
          .kpi-value { font-size: 1.75rem; }
          .content-section { padding: 3.5rem 1rem; }
          .product-nav { padding: 0 1rem; }
          .nav-item { padding: 0.9rem 0.8rem; font-size: 0.85rem; }
          .section-header h2, .section-content h2 { font-size: 1.8rem; }
          .perforations-grid { grid-template-columns: 1fr; }
          .veneers-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .installation-steps, .bespoke-features, .sustainability-features { grid-template-columns: 1fr; }
          .dark-band { padding: 1.5rem 1.25rem; }
          .buildup-card { padding: 1.25rem; }
          .hero-ctas .btn-primary, .hero-ctas .btn-secondary, .cta-buttons .btn-primary, .cta-buttons .btn-secondary { width: 100%; }
        }
      `}</style>
    </div>
  );
}
