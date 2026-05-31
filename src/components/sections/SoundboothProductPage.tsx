'use client';

import { useTranslations } from 'next-intl';
import LeadGenModal, { LeadFormData } from '@/components/LeadGenModal';
import { analytics, setEnhancedConversionsUserData } from '@/lib/analytics';
import { Link } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * Shared template for the Re-Sound soundbooth product pages.
 *
 * Each booth (Solo Flex, Duo, Modular XL) sets a translation namespace,
 * a slug, and per-product options (e.g. configurations for Duo). The shared
 * layout — hero -> nav -> overview -> acoustics -> use cases -> specs ->
 * add-ons -> downloads -> FAQ -> CTA — comes from this template.
 *
 * Visual identity: pulls from globals.css design tokens so the booth pages
 * read as part of the Re-Sound product family — same brand blue, pill
 * buttons, Syne/DM Sans typography, cream/blue-pale section backgrounds.
 * All booths render under the Re-Sound brand, sharing the same visual
 * tokens as the panel range.
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
              <g>
                <rect x="40" y="80" width="240" height="160" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
                <text x="160" y="170" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="14" fontWeight="600">{t('modular.baseLabel')}</text>
                <text x="160" y="190" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">240 × 180 cm</text>
                <text x="160" y="265" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11" letterSpacing="2">{t('modular.baseTag')}</text>
              </g>
              <g>
                <rect x="290" y="80" width="90" height="160" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="335" y="170" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="20" fontWeight="700">+</text>
                <text x="335" y="190" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">90 cm</text>
              </g>
              <g>
                <rect x="390" y="80" width="90" height="160" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.22)" strokeDasharray="4 4" strokeWidth="1.5" />
                <text x="435" y="170" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="20" fontWeight="700">+</text>
                <text x="435" y="190" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">90 cm</text>
              </g>
              <g>
                <text x="520" y="170" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="28" fontWeight="700">…</text>
              </g>
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
          Pulls from globals.css design tokens (--brand-blue, --deep-blue,
          --cream, --font-heading, --radius-full etc.) so the booth pages
          read as part of the same Re-Sound product family. No local brand
          overrides — visual identity inherits from the rest of the site. */}
      <style jsx>{`
        /* ===== HERO ===== */
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
          font-family: var(--font-heading);
          line-height: 1;
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
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(25, 127, 199, 0.18);
          border-bottom: 1px solid rgba(25, 127, 199, 0.18);
        }
        .hero-stat { display: flex; flex-direction: column; }
        .hero-stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--deep-blue);
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
          font-family: var(--font-heading);
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.75rem;
          color: var(--brand-blue);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-weight: 600;
        }
        .hero-ctas { display: flex; gap: 1rem; }

        :global(.booth-product-page) :global(.btn-primary) {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: var(--brand-blue);
          color: white;
          text-decoration: none;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.95rem;
          transition: all var(--transition-normal, 0.3s ease);
          border: none;
          cursor: pointer;
        }
        :global(.booth-product-page) :global(.btn-primary:hover) {
          background: var(--brand-blue-dark);
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(25, 127, 199, 0.3);
        }
        :global(.booth-product-page) :global(.btn-primary.large) { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        :global(.booth-product-page) :global(.btn-secondary) {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: transparent;
          color: var(--brand-blue);
          text-decoration: none;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.95rem;
          border: 2px solid var(--brand-blue);
          transition: all var(--transition-normal, 0.3s ease);
          cursor: pointer;
        }
        :global(.booth-product-page) :global(.btn-secondary:hover) {
          background: var(--brand-blue);
          color: white;
        }
        :global(.booth-product-page) :global(.btn-secondary.large) { padding: 1.25rem 2.5rem; font-size: 1.1rem; }

        .hero-image { position: relative; }
        .hero-image .image-container {
          position: relative;
          aspect-ratio: 4 / 5;
          background: var(--cream);
          overflow: hidden;
          border-radius: var(--radius-md);
          box-shadow: 0 30px 80px rgba(13, 58, 92, 0.15);
        }

        /* ===== STICKY NAV ===== */
        .product-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(13, 58, 92, 0.08);
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
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast, 0.2s ease);
          font-family: var(--font-body);
        }
        .nav-item:hover { color: var(--deep-blue); }
        .nav-item.active { color: var(--brand-blue); border-bottom-color: var(--brand-blue); }

        /* ===== SECTIONS ===== */
        .content-section { padding: 6rem 4rem; }
        .content-section.dark {
          background: linear-gradient(135deg, var(--deep-blue) 0%, #0a1628 100%);
          color: white;
        }
        .section-tag {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brand-blue);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .section-tag.light { color: var(--brand-blue-light); }
        .content-section h2 {
          font-size: 3rem;
          color: var(--deep-blue);
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 1rem;
          font-family: var(--font-heading);
        }
        .content-section.dark h2 { color: white; }
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
          background: var(--cream);
          overflow: hidden;
          border-radius: var(--radius-md);
          box-shadow: 0 20px 60px rgba(13, 58, 92, 0.12);
        }
        .section-content .lead { font-size: 1.15rem; color: #555; line-height: 1.75; margin-bottom: 1.75rem; }

        .feature-list { list-style: none; padding: 0; margin: 0; }
        .feature-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.6rem 0;
          font-size: 1rem;
          color: #444;
        }
        .check {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          background: var(--brand-blue);
          color: white;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        /* ===== ACOUSTICS ===== */
        .acoustics-header { text-align: center; max-width: 720px; margin: 0 auto 3.5rem; }
        .acoustics-header p { font-size: 1.1rem; opacity: 0.85; line-height: 1.75; }
        .acoustics-visual {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 3rem;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .absorption-rating { text-align: center; }
        .rating-circle {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 20px 60px rgba(25, 127, 199, 0.4);
        }
        .rating-value { font-size: 3.5rem; font-weight: 700; line-height: 1; font-family: var(--font-heading); }
        .rating-unit { font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 0.4rem; opacity: 0.9; }
        .absorption-rating p { font-size: 0.95rem; opacity: 0.85; max-width: 260px; margin: 0 auto; }

        .acoustics-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .benefit {
          background: rgba(255, 255, 255, 0.06);
          padding: 1.75rem;
          border-radius: var(--radius-md);
          border-top: 3px solid var(--brand-blue);
        }
        .benefit-icon { font-size: 1.75rem; display: block; margin-bottom: 0.75rem; }
        .benefit h4 { font-size: 1.05rem; margin-bottom: 0.5rem; font-family: var(--font-heading); color: white; }
        .benefit p { font-size: 0.9rem; opacity: 0.8; line-height: 1.65; }

        /* ===== CONFIGURATIONS ===== */
        .configurations-section { background: var(--cream); }
        .configurations-header { text-align: center; max-width: 720px; margin: 0 auto 2.5rem; }
        .configurations-header p { font-size: 1.1rem; color: #555; line-height: 1.75; }
        .config-switcher { display: flex; justify-content: center; gap: 0.75rem; margin-bottom: 3rem; flex-wrap: wrap; }
        .config-tab {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.75rem;
          background: white;
          border: 2px solid rgba(13, 58, 92, 0.12);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-normal, 0.3s ease);
          color: var(--deep-blue);
          font-family: var(--font-body);
        }
        .config-tab:hover { border-color: var(--brand-blue); }
        .config-tab.active { background: var(--brand-blue); color: white; border-color: var(--brand-blue); box-shadow: 0 8px 24px rgba(25, 127, 199, 0.25); }
        .config-letter {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--brand-blue-pale);
          color: var(--brand-blue);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          font-family: var(--font-heading);
        }
        .config-tab.active .config-letter { background: rgba(255, 255, 255, 0.25); color: white; }
        .config-name { font-weight: 600; font-size: 0.95rem; }
        .config-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; max-width: 1400px; margin: 0 auto; align-items: center; }
        .config-image .image-container { position: relative; aspect-ratio: 4 / 5; background: white; border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 20px 60px rgba(13, 58, 92, 0.12); }
        .config-text h3 { font-size: 2rem; margin-bottom: 1rem; font-family: var(--font-heading); color: var(--deep-blue); }
        .config-text > p { font-size: 1.05rem; color: #555; margin-bottom: 1.5rem; line-height: 1.75; }
        .config-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(13, 58, 92, 0.1); }
        .meta-label { display: block; font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--brand-blue); margin-bottom: 0.3rem; font-weight: 600; }
        .meta-value { font-size: 0.95rem; font-weight: 600; color: var(--deep-blue); }

        /* ===== MODULAR / GROWTH ===== */
        .modular-header { text-align: center; max-width: 760px; margin: 0 auto 3rem; }
        .modular-header p { font-size: 1.1rem; opacity: 0.85; line-height: 1.75; }
        .growth-visualiser {
          max-width: 1000px;
          margin: 0 auto 3rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.04);
          border-radius: var(--radius-md);
        }
        .growth-visualiser svg { width: 100%; height: auto; }
        .modular-scenarios { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .scenario {
          background: rgba(255, 255, 255, 0.06);
          padding: 2rem;
          border-radius: var(--radius-md);
          border-top: 3px solid var(--brand-blue);
        }
        .scenario-size { font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase; color: var(--brand-blue-light); display: block; margin-bottom: 0.75rem; font-weight: 600; }
        .scenario h4 { font-size: 1.15rem; margin-bottom: 0.5rem; font-family: var(--font-heading); color: white; }
        .scenario p { font-size: 0.9rem; opacity: 0.8; line-height: 1.65; }

        /* ===== FEATURES GRID ===== */
        .features-section { background: white; }
        .features-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .feature-card {
          background: var(--cream);
          padding: 2rem;
          border-radius: var(--radius-md);
          transition: transform var(--transition-normal, 0.3s ease), box-shadow var(--transition-normal, 0.3s ease);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(13, 58, 92, 0.1);
        }
        .feature-icon {
          font-size: 1.5rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--brand-blue-pale);
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        .feature-card h4 { font-size: 1.15rem; margin-bottom: 0.6rem; font-family: var(--font-heading); color: var(--deep-blue); }
        .feature-card p { font-size: 0.95rem; color: #555; line-height: 1.7; }

        /* ===== SPECS ===== */
        .specs-section { background: var(--cream); }
        .specs-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .specs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
        .spec-card {
          background: white;
          padding: 1.75rem;
          border-radius: var(--radius-md);
          border-top: 3px solid var(--brand-blue);
          box-shadow: 0 4px 12px rgba(13, 58, 92, 0.04);
        }
        .spec-card h4 { font-size: 1.05rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1.5px; font-family: var(--font-heading); color: var(--deep-blue); }
        .spec-card table { width: 100%; border-collapse: collapse; }
        .spec-card td {
          padding: 0.65rem 0;
          font-size: 0.92rem;
          border-bottom: 1px solid rgba(13, 58, 92, 0.08);
          vertical-align: top;
        }
        .spec-card td:first-child { color: #666; padding-right: 1rem; }
        .spec-card td:last-child { color: var(--deep-blue); font-weight: 500; text-align: right; }
        .spec-card tr:last-child td { border-bottom: none; }

        /* ===== ADD-ONS ===== */
        .addons-section { background: white; }
        .addons-header { text-align: center; max-width: 760px; margin: 0 auto 3rem; }
        .addons-header p { font-size: 1.05rem; color: #555; line-height: 1.75; }
        .addons-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .addon-card {
          background: var(--cream);
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 1.5rem;
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: transform var(--transition-normal, 0.3s ease), box-shadow var(--transition-normal, 0.3s ease);
        }
        .addon-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(13, 58, 92, 0.1);
        }
        .addon-image .image-container { position: relative; aspect-ratio: 1; background: white; }
        .addon-body { padding: 1.75rem 1.75rem 1.75rem 0; }
        .addon-body h4 { font-size: 1.1rem; margin-bottom: 0.6rem; font-family: var(--font-heading); color: var(--deep-blue); }
        .addon-body p { font-size: 0.92rem; color: #555; line-height: 1.7; }

        /* ===== DOWNLOADS ===== */
        .downloads-section { background: var(--cream); }
        .downloads-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .downloads-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 1200px; margin: 0 auto; }
        .download-card {
          background: white;
          border: 1px solid rgba(13, 58, 92, 0.08);
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all var(--transition-normal, 0.3s ease);
          text-align: left;
          color: var(--deep-blue);
          border-radius: var(--radius-md);
        }
        .download-card:hover {
          background: var(--brand-blue);
          color: white;
          border-color: var(--brand-blue);
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(25, 127, 199, 0.25);
        }
        .download-icon { font-size: 1.5rem; }
        .download-info { flex: 1; }
        .download-info h4 { font-size: 0.95rem; margin-bottom: 0.15rem; font-family: var(--font-heading); }
        .download-info span { font-size: 0.75rem; opacity: 0.6; letter-spacing: 1px; }
        .download-arrow { font-size: 1.25rem; opacity: 0.5; }
        .download-card:hover .download-arrow { opacity: 1; }

        /* ===== CROSSLINKS ===== */
        .crosslinks-section { background: white; }
        .crosslinks-header { text-align: center; max-width: 720px; margin: 0 auto 3rem; }
        .crosslinks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 1200px; margin: 0 auto; }
        :global(.booth-product-page) :global(.crosslink-card) {
          padding: 2rem;
          background: var(--cream);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--deep-blue);
          border-radius: var(--radius-md);
          transition: all var(--transition-normal, 0.3s ease);
          position: relative;
        }
        :global(.booth-product-page) :global(.crosslink-card:hover) {
          background: var(--brand-blue);
          color: white;
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(25, 127, 199, 0.25);
        }
        :global(.booth-product-page) :global(.crosslink-name) { font-size: 1.25rem; font-weight: 700; font-family: var(--font-heading); }
        :global(.booth-product-page) :global(.crosslink-tag) { font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.7; font-weight: 500; }
        :global(.booth-product-page) :global(.crosslink-arrow) { position: absolute; right: 2rem; top: 2rem; font-size: 1.5rem; }

        /* ===== CTA ===== */
        .cta-section {
          background: linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-dark) 100%);
          color: white;
          text-align: center;
        }
        .cta-content { max-width: 720px; margin: 0 auto; }
        .cta-content h2 { color: white; font-size: 3rem; margin-bottom: 1rem; }
        .cta-content > p {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.92);
          margin-bottom: 2.5rem;
          line-height: 1.75;
        }
        .cta-buttons { display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem; flex-wrap: wrap; }

        :global(.booth-product-page) .cta-section :global(.btn-primary) { background: white; color: var(--brand-blue); }
        :global(.booth-product-page) .cta-section :global(.btn-primary:hover) { background: var(--cream); color: var(--brand-blue-dark); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2); }
        :global(.booth-product-page) .cta-section :global(.btn-secondary) { color: white; border-color: white; }
        :global(.booth-product-page) .cta-section :global(.btn-secondary:hover) { background: white; color: var(--brand-blue); }

        .cta-note { font-size: 0.9rem; color: rgba(255, 255, 255, 0.78); }

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
          .hero-stats { grid-template-columns: 1fr; gap: 0.75rem; padding: 1rem 0; }
          .features-grid, .specs-grid, .downloads-grid, .crosslinks-grid, .modular-scenarios, .acoustics-benefits, .config-meta { grid-template-columns: 1fr; }
          .hero-ctas, .cta-buttons { flex-direction: column; }
          .addon-card { grid-template-columns: 1fr; }
          .addon-body { padding: 1.5rem; }
          .content-section h2, .cta-content h2 { font-size: 2.25rem; }
        }
      `}</style>
    </div>
  );
}
