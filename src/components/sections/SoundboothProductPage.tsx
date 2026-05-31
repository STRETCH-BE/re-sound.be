'use client';

import { useTranslations } from 'next-intl';
import LeadGenModal, { LeadFormData } from '@/components/LeadGenModal';
import { analytics, setEnhancedConversionsUserData } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Shared template for STRETCH white-label soundbooth product pages.
 *
 * Each booth (Solo Flex, Duo, Modular XL) sets a translation namespace,
 * a slug, and per-product options (e.g. configurations for Duo). The shared
 * layout — hero → nav → overview → acoustics → use cases → specs → add-ons →
 * downloads → FAQ → CTA — comes from this template, identical to the
 * Re-Sound product-page architecture but themed in the STRETCH palette.
 *
 * NB: brand vars (--stretch-*) are local to this component so they don't
 * collide with the Re-Sound globals.css variables, keeping the two brands
 * cleanly separated even though they share the codebase.
 */

export interface BoothSpecRow {
  label: string;
  value: string;
}

export interface BoothSpecCard {
  /** translation key for the card heading, under `{namespace}.specs` */
  titleKey: string;
  rows: BoothSpecRow[];
}

export interface BoothConfiguration {
  id: string;
  /** Image path under /public */
  image: string;
}

export interface BoothFeature {
  iconKey: string;
  /** translation key tail — resolved as `{namespace}.features.{key}` (title/desc) */
  key: string;
}

export interface BoothAddon {
  id: string;
  image?: string;
}

export interface BoothDownload {
  id: string;
  /** Translation key under `boothPage.downloads` (shared namespace) */
  labelKey: string;
  icon: string;
  file: string;
}

export interface BoothStat {
  value: string;
  labelKey: string;
}

export interface SoundboothProductPageProps {
  /** URL slug, used for analytics + lead-source labels */
  slug: string;
  /** Translation namespace, e.g. 'soloFlexPage' */
  namespace: string;
  /** Image directory, e.g. '/images/products/solo-flex' — used for hero/gallery */
  imageDir: string;
  /** Hero image path under /public */
  heroImage: string;
  /** Three hero KPIs */
  heroStats: [BoothStat, BoothStat, BoothStat];
  /** Six feature-grid items */
  features: BoothFeature[];
  /** Six add-on items */
  addons: BoothAddon[];
  /** Specs cards (max 6) */
  specCards: BoothSpecCard[];
  /** Downloads (PDFs gated by lead modal) */
  downloads: BoothDownload[];
  /** Optional list of configurations (Duo only) */
  configurations?: BoothConfiguration[];
  /** Show the modular growth visualiser (Modular XL only) */
  showGrowthDiagram?: boolean;
  /** Cross-links to other booths */
  crossLinks: Array<{ slug: string; href: string }>;
}

export default function SoundboothProductPage(props: SoundboothProductPageProps) {
  const {
    slug,
    namespace,
    imageDir,
    heroImage,
    heroStats,
    features,
    addons,
    specCards,
    downloads,
    configurations,
    showGrowthDiagram,
    crossLinks,
  } = props;

  const t = useTranslations(namespace);
  const tShared = useTranslations('boothPage');
  const [activeSection, setActiveSection] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeConfig, setActiveConfig] = useState(configurations?.[0]?.id ?? '');

  useEffect(() => {
    analytics.viewItem(slug, 'booth');
  }, [slug]);

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
          downloadedFile: selectedDownload.split('/').pop(),
          source: `${slug} Product Page`,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        try {
          await setEnhancedConversionsUserData(data.email, data.phone);
          analytics.generateLead({ product: slug, source: 'pdf_download_modal' });
          const fileName = selectedDownload.split('/').pop() || '';
          analytics.fileDownload(slug, fileName);
        } catch (err) {
          console.warn('Analytics dispatch failed:', err);
        }
        try {
          const w = window as unknown as { clarity?: (...a: unknown[]) => void };
          if (typeof w.clarity === 'function') {
            w.clarity('set', 'lead_status', 'submitted');
            w.clarity('set', 'lead_product', slug);
            if (data.companyName) w.clarity('set', 'company', data.companyName);
            if (data.email) w.clarity('identify', data.email);
            w.clarity('upgrade', 'submitted_lead');
          }
        } catch { /* Clarity may not be loaded */ }

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
    { id: 'overview',  label: tShared('nav.overview') },
    { id: 'acoustics', label: tShared('nav.acoustics') },
    ...(configurations ? [{ id: 'configurations', label: tShared('nav.configurations') }] : []),
    ...(showGrowthDiagram ? [{ id: 'modular', label: tShared('nav.modular') }] : []),
    { id: 'features',  label: tShared('nav.features') },
    { id: 'specs',     label: tShared('nav.specs') },
    { id: 'addons',    label: tShared('nav.addons') },
    { id: 'downloads', label: tShared('nav.downloads') },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Currently selected configuration (Duo only). Image source defaults to hero
  // if no config picked.
  const activeConfigObj = configurations?.find((c) => c.id === activeConfig);
  const displayHero = activeConfigObj?.image ?? heroImage;

  return (
    <div className="booth-product-page">
      {/* ========== HERO ========== */}
      <section className="product-hero">
        <div className="hero-content">
          <span className="product-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">{t('hero.description')}</p>

          <div className="hero-stats">
            {heroStats.map((stat, i) => (
              <div key={i} className="hero-stat">
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{t(stat.labelKey)}</span>
              </div>
            ))}
          </div>

          <div className="hero-ctas">
            <Link
              href="/contact"
              className="btn-primary"
              onClick={() => analytics.quoteClick(slug, 'product_cta')}
            >
              {tShared('cta.requestQuote')}
            </Link>
            <a
              href="#specs"
              onClick={(e) => { e.preventDefault(); scrollToSection('specs'); }}
              className="btn-secondary"
            >
              {tShared('cta.viewSpecifications')}
            </a>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-container">
            <Image
              src={displayHero}
              alt={t('hero.title')}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
            <div className="hero-badge">
              <span className="hero-badge-eyebrow">{tShared('hero.badgeEyebrow')}</span>
              <span className="hero-badge-text">{t('hero.badge')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STICKY NAV ========== */}
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

      {/* ========== OVERVIEW ========== */}
      <section id="overview" className="content-section overview-section">
        <div className="section-grid">
          <div className="section-content">
            <span className="section-tag">{t('overview.tag')}</span>
            <h2>{t('overview.title')}</h2>
            <p className="lead">{t('overview.description')}</p>
            <ul className="feature-list">
              {['feature1', 'feature2', 'feature3', 'feature4'].map((key) => (
                <li key={key}>
                  <span className="check">✓</span>
                  {t(`overview.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="section-image">
            <div className="image-container">
              <Image
                src={`${imageDir}/overview.jpg`}
                alt={t('overview.title')}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== ACOUSTICS ========== */}
      <section id="acoustics" className="content-section acoustics-section dark">
        <div className="acoustics-header">
          <span className="section-tag light">{t('acoustics.tag')}</span>
          <h2>{t('acoustics.title')}</h2>
          <p>{t('acoustics.description')}</p>
        </div>

        <div className="acoustics-visual">
          <div className="absorption-rating">
            <div className="rating-circle">
              <span className="rating-value">{t('acoustics.dbValue')}</span>
              <span className="rating-unit">{t('acoustics.dbUnit')}</span>
            </div>
            <p>{t('acoustics.dbCaption')}</p>
          </div>

          <div className="acoustics-benefits">
            <div className="benefit">
              <span className="benefit-icon">🗣️</span>
              <h4>{tShared('acoustics.benefitSpeech.title')}</h4>
              <p>{tShared('acoustics.benefitSpeech.desc')}</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🧠</span>
              <h4>{tShared('acoustics.benefitFocus.title')}</h4>
              <p>{tShared('acoustics.benefitFocus.desc')}</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">😌</span>
              <h4>{tShared('acoustics.benefitStress.title')}</h4>
              <p>{tShared('acoustics.benefitStress.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONFIGURATIONS (Duo only) ========== */}
      {configurations && (
        <section id="configurations" className="content-section configurations-section">
          <div className="configurations-header">
            <span className="section-tag">{t('configurations.tag')}</span>
            <h2>{t('configurations.title')}</h2>
            <p>{t('configurations.description')}</p>
          </div>

          <div className="config-switcher">
            {configurations.map((c) => (
              <button
                key={c.id}
                className={`config-tab ${activeConfig === c.id ? 'active' : ''}`}
                onClick={() => setActiveConfig(c.id)}
              >
                <span className="config-letter">
                  {t(`configurations.${c.id}.letter`)}
                </span>
                <span className="config-name">
                  {t(`configurations.${c.id}.name`)}
                </span>
              </button>
            ))}
          </div>

          {activeConfigObj && (
            <div className="config-detail">
              <div className="config-image">
                <div className="image-container">
                  <Image
                    src={activeConfigObj.image}
                    alt={t(`configurations.${activeConfig}.name`)}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              <div className="config-text">
                <h3>{t(`configurations.${activeConfig}.heading`)}</h3>
                <p>{t(`configurations.${activeConfig}.description`)}</p>
                <ul className="feature-list">
                  {['point1', 'point2', 'point3', 'point4'].map((key) => (
                    <li key={key}>
                      <span className="check">✓</span>
                      {t(`configurations.${activeConfig}.${key}`)}
                    </li>
                  ))}
                </ul>
                <div className="config-meta">
                  <div className="meta-item">
                    <span className="meta-label">{tShared('configurations.capacity')}</span>
                    <span className="meta-value">{t(`configurations.${activeConfig}.capacity`)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">{tShared('configurations.deskSize')}</span>
                    <span className="meta-value">{t(`configurations.${activeConfig}.deskSize`)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">{tShared('configurations.deskHeight')}</span>
                    <span className="meta-value">{t(`configurations.${activeConfig}.deskHeight`)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========== MODULAR GROWTH (Modular XL only) ========== */}
      {showGrowthDiagram && (
        <section id="modular" className="content-section modular-section dark">
          <div className="modular-header">
            <span className="section-tag light">{t('modular.tag')}</span>
            <h2>{t('modular.title')}</h2>
            <p>{t('modular.description')}</p>
          </div>

          <div className="growth-visualiser">
            <svg viewBox="0 0 800 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Modular growth diagram">
              {/* Base unit */}
              <g>
                <rect x="40" y="80" width="240" height="160" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                <text x="160" y="170" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="14" fontWeight="600">{t('modular.baseLabel')}</text>
                <text x="160" y="190" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">240 × 180 cm</text>
                <text x="160" y="265" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" letterSpacing="2">{t('modular.baseTag')}</text>
              </g>
              {/* + segment 1 */}
              <g>
                <rect x="290" y="80" width="90" height="160" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="335" y="170" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="20" fontWeight="700">+</text>
                <text x="335" y="190" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">90 cm</text>
              </g>
              {/* + segment 2 */}
              <g>
                <rect x="390" y="80" width="90" height="160" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.22)" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="435" y="170" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="20" fontWeight="700">+</text>
                <text x="435" y="190" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">90 cm</text>
              </g>
              {/* + ellipsis */}
              <g>
                <text x="520" y="170" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="28" fontWeight="700">…</text>
              </g>
              {/* arrow */}
              <g>
                <line x1="40" y1="50" x2="640" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <polygon points="640,50 634,46 634,54" fill="rgba(255,255,255,0.4)" />
                <text x="340" y="38" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11" letterSpacing="2">{t('modular.scaleLabel')}</text>
              </g>
            </svg>
          </div>

          <div className="modular-scenarios">
            {['scenario1', 'scenario2', 'scenario3'].map((key) => (
              <div key={key} className="scenario">
                <span className="scenario-size">{t(`modular.${key}.size`)}</span>
                <h4>{t(`modular.${key}.title`)}</h4>
                <p>{t(`modular.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========== FEATURES GRID ========== */}
      <section id="features" className="content-section features-section">
        <div className="features-header">
          <span className="section-tag">{t('features.tag')}</span>
          <h2>{t('features.title')}</h2>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.key} className="feature-card">
              <span className="feature-icon">{f.iconKey}</span>
              <h4>{t(`features.${f.key}.title`)}</h4>
              <p>{t(`features.${f.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========== SPECS ========== */}
      <section id="specs" className="content-section specs-section">
        <div className="specs-header">
          <span className="section-tag">{t('specs.tag')}</span>
          <h2>{t('specs.title')}</h2>
        </div>

        <div className="specs-grid">
          {specCards.map((card) => (
            <div key={card.titleKey} className="spec-card">
              <h4>{t(`specs.${card.titleKey}`)}</h4>
              <table>
                <tbody>
                  {card.rows.map((row) => (
                    <tr key={row.label}>
                      <td>{tShared(`specs.${row.label}`)}</td>
                      <td>{t(`specs.${row.value}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      {/* ========== ADD-ONS ========== */}
      <section id="addons" className="content-section addons-section">
        <div className="addons-header">
          <span className="section-tag">{t('addons.tag')}</span>
          <h2>{t('addons.title')}</h2>
          <p>{t('addons.description')}</p>
        </div>

        <div className="addons-grid">
          {addons.map((a) => (
            <div key={a.id} className="addon-card">
              {a.image && (
                <div className="addon-image">
                  <div className="image-container">
                    <Image src={a.image} alt={t(`addons.${a.id}.title`)} fill style={{ objectFit: 'cover' }} />
                  </div>
                </div>
              )}
              <div className="addon-body">
                <h4>{t(`addons.${a.id}.title`)}</h4>
                <p>{t(`addons.${a.id}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========== DOWNLOADS ========== */}
      <section id="downloads" className="content-section downloads-section">
        <div className="downloads-header">
          <span className="section-tag">{tShared('downloads.tag')}</span>
          <h2>{tShared('downloads.title')}</h2>
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
                <h4>{tShared(download.labelKey)}</h4>
                <span>PDF</span>
              </div>
              <span className="download-arrow">↓</span>
            </button>
          ))}
        </div>
      </section>

      <LeadGenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleLeadSubmit}
        downloadFile={selectedDownload}
        isSubmitting={isSubmitting}
      />

      {/* ========== CROSS-LINKS ========== */}
      <section className="content-section crosslinks-section">
        <div className="crosslinks-header">
          <span className="section-tag">{tShared('crosslinks.tag')}</span>
          <h2>{tShared('crosslinks.title')}</h2>
        </div>
        <div className="crosslinks-grid">
          {crossLinks.map((c) => (
            <Link key={c.slug} href={c.href} className="crosslink-card">
              <span className="crosslink-name">{tShared(`crosslinks.${c.slug}.name`)}</span>
              <span className="crosslink-tag">{tShared(`crosslinks.${c.slug}.tag`)}</span>
              <span className="crosslink-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="content-section cta-section">
        <div className="cta-content">
          <h2>{tShared('cta.ctaTitle')}</h2>
          <p>{tShared('cta.ctaSubtitle')}</p>
          <div className="cta-buttons">
            <Link
              href="/contact"
              className="btn-primary large"
              onClick={() => analytics.quoteClick(slug, 'product_cta')}
            >
              {tShared('cta.requestQuote')}
            </Link>
            <a
              href="tel:+3232846818"
              className="btn-secondary large"
              onClick={() => analytics.phoneClick(`product_cta_${slug}`)}
            >
              {tShared('cta.callUs')}
            </a>
          </div>
          <p className="cta-note">{tShared('cta.deliveryNote')}</p>
        </div>
      </section>

      {/* ========== STYLES ==========
          STRETCH white-label palette — kept local to this component so it
          doesn't leak into Re-Sound globals. Cream backgrounds + deep ink +
          rust accent (distinct from Re-Sound's #197FC7 blue). */}
      <style jsx>{`
        .booth-product-page {
          --stretch-ink:      #14110D;
          --stretch-ink-2:    #2A251E;
          --stretch-cream:    #F5F3EE;
          --stretch-cream-2:  #EEEAE0;
          --stretch-paper:    #FAF8F4;
          --stretch-rust:     #B8341A;
          --stretch-rust-d:   #8C2614;
          --stretch-muted:    #6B6357;
          --stretch-line:     rgba(20, 17, 13, 0.12);

          background: var(--stretch-paper);
          color: var(--stretch-ink);
        }

        /* ===== HERO ===== */
        .product-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 8rem 4rem 4rem;
          background: var(--stretch-cream);
          min-height: 80vh;
          align-items: center;
        }
        .product-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--stretch-rust);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
        }
        .hero-content h1 {
          font-size: 4.5rem;
          color: var(--stretch-ink);
          line-height: 1;
          margin-bottom: 0.75rem;
          letter-spacing: -2px;
          font-family: var(--font-heading, 'Syne', sans-serif);
        }
        .hero-tagline {
          font-size: 1.4rem;
          color: var(--stretch-ink-2);
          font-style: italic;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }
        .hero-description {
          font-size: 1.05rem;
          color: var(--stretch-muted);
          line-height: 1.75;
          margin-bottom: 2.25rem;
          max-width: 500px;
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          margin-bottom: 2.25rem;
          border-top: 1px solid var(--stretch-line);
          border-bottom: 1px solid var(--stretch-line);
          padding: 1.5rem 0;
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          padding-right: 1rem;
        }
        .hero-stat + .hero-stat { border-left: 1px solid var(--stretch-line); padding-left: 1rem; }
        .hero-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--stretch-ink);
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
          font-family: var(--font-heading, 'Syne', sans-serif);
        }
        .hero-stat-label {
          font-size: 0.75rem;
          color: var(--stretch-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .hero-ctas { display: flex; gap: 1rem; }

        :global(.booth-product-page) :global(.btn-primary) {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: var(--stretch-ink);
          color: white;
          text-decoration: none;
          border-radius: 0;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          transition: background 0.2s ease;
          border: none;
          cursor: pointer;
        }
        :global(.booth-product-page) :global(.btn-primary:hover) { background: var(--stretch-rust); }
        :global(.booth-product-page) :global(.btn-primary.large) { padding: 1.25rem 2.5rem; font-size: 1rem; }

        :global(.booth-product-page) :global(.btn-secondary) {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: transparent;
          color: var(--stretch-ink);
          text-decoration: none;
          border-radius: 0;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          border: 1.5px solid var(--stretch-ink);
          transition: all 0.2s ease;
          cursor: pointer;
        }
        :global(.booth-product-page) :global(.btn-secondary:hover) { background: var(--stretch-ink); color: white; }
        :global(.booth-product-page) :global(.btn-secondary.large) { padding: 1.25rem 2.5rem; font-size: 1rem; }

        .hero-image { position: relative; }
        .hero-image .image-container {
          position: relative;
          aspect-ratio: 4 / 5;
          background: var(--stretch-cream-2);
          overflow: hidden;
        }
        .hero-badge {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          background: rgba(20, 17, 13, 0.92);
          color: white;
          padding: 1rem 1.25rem;
          backdrop-filter: blur(8px);
          max-width: 260px;
        }
        .hero-badge-eyebrow {
          display: block;
          font-size: 0.65rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          opacity: 0.65;
          margin-bottom: 0.35rem;
        }
        .hero-badge-text {
          display: block;
          font-size: 0.95rem;
          font-weight: 500;
          line-height: 1.4;
        }

        /* ===== STICKY NAV ===== */
        .product-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(245, 243, 238, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--stretch-line);
        }
        .nav-inner {
          display: flex;
          gap: 0.5rem;
          padding: 0 4rem;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .nav-inner::-webkit-scrollbar { display: none; }
        .nav-item {
          padding: 1.25rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 0.85rem;
          letter-spacing: 0.5px;
          color: var(--stretch-muted);
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .nav-item:hover { color: var(--stretch-ink); }
        .nav-item.active { color: var(--stretch-ink); border-bottom-color: var(--stretch-rust); }

        /* ===== SECTIONS ===== */
        .content-section { padding: 6rem 4rem; }
        .content-section.dark { background: var(--stretch-ink); color: var(--stretch-cream); }
        .section-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--stretch-rust);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .section-tag.light { color: rgba(245, 243, 238, 0.85); }
        .content-section h2 {
          font-size: 2.75rem;
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 1rem;
          font-family: var(--font-heading, 'Syne', sans-serif);
        }
        .section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        .section-image .image-container {
          position: relative;
          aspect-ratio: 4 / 5;
          background: var(--stretch-cream-2);
          overflow: hidden;
        }
        .section-content .lead { font-size: 1.15rem; color: var(--stretch-muted); line-height: 1.75; margin-bottom: 1.75rem; }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.6rem 0;
          font-size: 1rem;
          color: var(--stretch-ink-2);
        }
        .check {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          background: var(--stretch-ink);
          color: white;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }

        /* ===== ACOUSTICS ===== */
        .acoustics-header { text-align: center; max-width: 720px; margin: 0 auto 3.5rem; }
        .acoustics-header p { font-size: 1.1rem; opacity: 0.8; line-height: 1.75; }
        .acoustics-visual { display: grid; grid-template-columns: 320px 1fr; gap: 3rem; align-items: center; max-width: 1200px; margin: 0 auto; }
        .absorption-rating { text-align: center; }
        .rating-circle {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: var(--stretch-rust);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 20px 60px rgba(184, 52, 26, 0.35);
        }
        .rating-value { font-size: 3.5rem; font-weight: 700; line-height: 1; font-family: var(--font-heading, 'Syne', sans-serif); }
        .rating-unit { font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 0.4rem; opacity: 0.9; }
        .absorption-rating p { font-size: 0.95rem; opacity: 0.75; max-width: 260px; margin: 0 auto; }

        .acoustics-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .benefit { background: rgba(255, 255, 255, 0.05); padding: 1.75rem; border-left: 2px solid var(--stretch-rust); }
        .benefit-icon { font-size: 1.75rem; display: block; margin-bottom: 0.75rem; }
        .benefit h4 { font-size: 1.05rem; margin-bottom: 0.5rem; font-family: var(--font-heading, 'Syne', sans-serif); }
        .benefit p { font-size: 0.9rem; opacity: 0.75; line-height: 1.65; }

        /* ===== CONFIGURATIONS ===== */
        .configurations-header { text-align: center; max-width: 720px; margin: 0 auto 2.5rem; }
        .configurations-header p { font-size: 1.1rem; color: var(--stretch-muted); line-height: 1.75; }
        .config-switcher { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 3rem; }
        .config-tab {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          background: transparent;
          border: 1.5px solid var(--stretch-line);
          cursor: pointer;
          transition: all 0.25s ease;
          color: var(--stretch-ink);
        }
        .config-tab:hover { border-color: var(--stretch-ink); }
        .config-tab.active { background: var(--stretch-ink); color: white; border-color: var(--stretch-ink); }
        .config-letter {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--stretch-rust);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
          font-family: var(--font-heading, 'Syne', sans-serif);
        }
        .config-name { font-weight: 600; font-size: 1rem; letter-spacing: 0.5px; }
        .config-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; max-width: 1400px; margin: 0 auto; align-items: center; }
        .config-image .image-container { position: relative; aspect-ratio: 4 / 5; background: var(--stretch-cream-2); }
        .config-text h3 { font-size: 2rem; margin-bottom: 1rem; font-family: var(--font-heading, 'Syne', sans-serif); }
        .config-text > p { font-size: 1.05rem; color: var(--stretch-muted); margin-bottom: 1.5rem; line-height: 1.75; }
        .config-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--stretch-line); }
        .meta-label { display: block; font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--stretch-muted); margin-bottom: 0.3rem; }
        .meta-value { font-size: 0.95rem; font-weight: 600; color: var(--stretch-ink); }

        /* ===== MODULAR / GROWTH ===== */
        .modular-header { text-align: center; max-width: 760px; margin: 0 auto 3rem; }
        .modular-header p { font-size: 1.1rem; opacity: 0.8; line-height: 1.75; }
        .growth-visualiser { max-width: 1000px; margin: 0 auto 3rem; padding: 2rem; background: rgba(255, 255, 255, 0.03); }
        .growth-visualiser svg { width: 100%; height: auto; }
        .modular-scenarios { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .scenario { background: rgba(255, 255, 255, 0.05); padding: 2rem; border-left: 2px solid var(--stretch-rust); }
        .scenario-size { font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; color: var(--stretch-rust); display: block; margin-bottom: 0.75rem; }
        .scenario h4 { font-size: 1.15rem; margin-bottom: 0.5rem; font-family: var(--font-heading, 'Syne', sans-serif); }
        .scenario p { font-size: 0.9rem; opacity: 0.75; line-height: 1.65; }

        /* ===== FEATURES GRID ===== */
        .features-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .feature-card { background: var(--stretch-cream); padding: 2rem; border-left: 2px solid var(--stretch-ink); }
        .feature-icon { font-size: 1.75rem; display: block; margin-bottom: 1rem; }
        .feature-card h4 { font-size: 1.15rem; margin-bottom: 0.6rem; font-family: var(--font-heading, 'Syne', sans-serif); }
        .feature-card p { font-size: 0.95rem; color: var(--stretch-muted); line-height: 1.7; }

        /* ===== SPECS ===== */
        .specs-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .spec-card { background: var(--stretch-cream); padding: 1.75rem; border-top: 3px solid var(--stretch-ink); }
        .spec-card h4 { font-size: 1.05rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1.5px; font-family: var(--font-heading, 'Syne', sans-serif); }
        .spec-card table { width: 100%; border-collapse: collapse; }
        .spec-card td {
          padding: 0.65rem 0;
          font-size: 0.92rem;
          border-bottom: 1px solid var(--stretch-line);
          vertical-align: top;
        }
        .spec-card td:first-child { color: var(--stretch-muted); padding-right: 1rem; }
        .spec-card td:last-child { color: var(--stretch-ink); font-weight: 500; text-align: right; }
        .spec-card tr:last-child td { border-bottom: none; }

        /* ===== ADD-ONS ===== */
        .addons-header { text-align: center; max-width: 760px; margin: 0 auto 3rem; }
        .addons-header p { font-size: 1.05rem; color: var(--stretch-muted); line-height: 1.75; }
        .addons-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .addon-card { background: var(--stretch-cream); display: grid; grid-template-columns: 180px 1fr; gap: 1.5rem; }
        .addon-image .image-container { position: relative; aspect-ratio: 1; background: var(--stretch-cream-2); }
        .addon-body { padding: 1.75rem 1.75rem 1.75rem 0; }
        .addon-body h4 { font-size: 1.1rem; margin-bottom: 0.6rem; font-family: var(--font-heading, 'Syne', sans-serif); }
        .addon-body p { font-size: 0.92rem; color: var(--stretch-muted); line-height: 1.7; }

        /* ===== DOWNLOADS ===== */
        .downloads-section { background: var(--stretch-cream); }
        .downloads-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .downloads-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 1200px; margin: 0 auto; }
        .download-card {
          background: white;
          border: 1px solid var(--stretch-line);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          color: var(--stretch-ink);
        }
        .download-card:hover { background: var(--stretch-ink); color: white; border-color: var(--stretch-ink); }
        .download-icon { font-size: 1.5rem; }
        .download-info { flex: 1; }
        .download-info h4 { font-size: 0.95rem; margin-bottom: 0.15rem; font-family: var(--font-heading, 'Syne', sans-serif); }
        .download-info span { font-size: 0.75rem; opacity: 0.6; letter-spacing: 1px; }
        .download-arrow { font-size: 1.25rem; opacity: 0.5; }
        .download-card:hover .download-arrow { opacity: 1; }

        /* ===== CROSSLINKS ===== */
        .crosslinks-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .crosslinks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 1200px; margin: 0 auto; }
        :global(.booth-product-page) :global(.crosslink-card) {
          padding: 1.75rem;
          background: var(--stretch-cream);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--stretch-ink);
          border-left: 2px solid transparent;
          transition: all 0.2s ease;
          position: relative;
        }
        :global(.booth-product-page) :global(.crosslink-card:hover) { border-left-color: var(--stretch-rust); background: var(--stretch-cream-2); }
        :global(.booth-product-page) :global(.crosslink-name) { font-size: 1.25rem; font-weight: 700; font-family: var(--font-heading, 'Syne', sans-serif); }
        :global(.booth-product-page) :global(.crosslink-tag) { font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--stretch-muted); }
        :global(.booth-product-page) :global(.crosslink-arrow) { position: absolute; right: 1.75rem; top: 1.75rem; font-size: 1.5rem; color: var(--stretch-rust); }

        /* ===== CTA ===== */
        .cta-section { background: var(--stretch-ink); color: white; text-align: center; }
        .cta-content { max-width: 720px; margin: 0 auto; }
        .cta-content h2 { color: white; font-size: 2.75rem; margin-bottom: 1rem; }
        .cta-content > p { font-size: 1.1rem; opacity: 0.8; margin-bottom: 2.5rem; line-height: 1.75; }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; }

        :global(.booth-product-page) .cta-section :global(.btn-primary) { background: white; color: var(--stretch-ink); }
        :global(.booth-product-page) .cta-section :global(.btn-primary:hover) { background: var(--stretch-rust); color: white; }
        :global(.booth-product-page) .cta-section :global(.btn-secondary) { color: white; border-color: rgba(255,255,255,0.5); }
        :global(.booth-product-page) .cta-section :global(.btn-secondary:hover) { background: white; color: var(--stretch-ink); border-color: white; }

        .cta-note { font-size: 0.85rem; opacity: 0.5; letter-spacing: 0.5px; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .product-hero { grid-template-columns: 1fr; padding: 6rem 2rem 3rem; gap: 2.5rem; }
          .hero-content h1 { font-size: 3rem; }
          .section-grid, .config-detail { grid-template-columns: 1fr; gap: 2.5rem; }
          .features-grid, .specs-grid, .downloads-grid, .crosslinks-grid, .modular-scenarios, .acoustics-benefits { grid-template-columns: repeat(2, 1fr); }
          .addons-grid { grid-template-columns: 1fr; }
          .acoustics-visual { grid-template-columns: 1fr; }
          .content-section { padding: 4rem 2rem; }
          .nav-inner { padding: 0 2rem; }
        }
        @media (max-width: 640px) {
          .hero-stats { grid-template-columns: 1fr; }
          .hero-stat + .hero-stat { border-left: none; border-top: 1px solid var(--stretch-line); padding-left: 0; padding-top: 1rem; margin-top: 1rem; }
          .features-grid, .specs-grid, .downloads-grid, .crosslinks-grid, .modular-scenarios, .acoustics-benefits, .config-meta { grid-template-columns: 1fr; }
          .hero-ctas, .cta-buttons { flex-direction: column; }
          .addon-card { grid-template-columns: 1fr; }
          .addon-body { padding: 1.5rem; }
          .config-switcher { flex-direction: column; }
          .content-section h2 { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}
