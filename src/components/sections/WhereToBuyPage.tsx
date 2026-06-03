'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function WhereToBuyPage() {
  const t = useTranslations('whereToBuyPage');

  const experiencePoints = [
    t('hq.experience1'),
    t('hq.experience2'),
    t('hq.experience3'),
    t('hq.experience4'),
  ];

  const alternatives = [
    {
      key: 'samples',
      tag: t('alternatives.samples.tag'),
      title: t('alternatives.samples.title'),
      desc: t('alternatives.samples.desc'),
      cta: t('alternatives.samples.cta'),
      href: '/contact?topic=samples',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      key: 'video',
      tag: t('alternatives.video.tag'),
      title: t('alternatives.video.title'),
      desc: t('alternatives.video.desc'),
      cta: t('alternatives.video.cta'),
      href: '/contact?topic=video-tour',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      key: 'onsite',
      tag: t('alternatives.onsite.tag'),
      title: t('alternatives.onsite.title'),
      desc: t('alternatives.onsite.desc'),
      cta: t('alternatives.onsite.cta'),
      href: '/contact?topic=on-site-demo',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
  ];

  return (
    <main className="wtb-page">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="section-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">{t('hero.description')}</p>
        </div>
      </section>

      {/* ---------- HQ showroom ---------- */}
      <section className="hq">
        <div className="hq-inner">
          <div className="hq-content">
            <span className="section-tag">{t('hq.tag')}</span>
            <h2>{t('hq.title')}</h2>
            <p className="hq-subtitle">{t('hq.subtitle')}</p>
            <p className="hq-description">{t('hq.description')}</p>

            <div className="hq-meta">
              <div className="meta-block">
                <span className="meta-label">{t('hq.addressLabel')}</span>
                <p className="meta-value">
                  {t('hq.addressLine1')}<br />
                  {t('hq.addressLine2')}<br />
                  {t('hq.addressLine3')}
                </p>
              </div>
              <div className="meta-block">
                <span className="meta-label">{t('hq.hoursLabel')}</span>
                <p className="meta-value">{t('hq.hoursValue')}</p>
              </div>
              <div className="meta-block">
                <span className="meta-label">{t('hq.contactLabel')}</span>
                <p className="meta-value">
                  <a href="tel:+3232846818">{t('hq.phoneValue')}</a><br />
                  <a href="mailto:info@re-sound.be">{t('hq.emailValue')}</a>
                </p>
              </div>
            </div>

            <div className="hq-experience">
              <h3>{t('hq.experienceTitle')}</h3>
              <ul>
                {experiencePoints.map((point, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hq-ctas">
              <Link href="/contact?topic=visit-hq" className="btn-primary">
                {t('hq.ctaPrimary')}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/contact?topic=directions" className="btn-secondary">
                {t('hq.ctaSecondary')}
              </Link>
            </div>
          </div>

          {/* Visual: map-like placeholder with pin marker */}
          <div className="hq-visual" aria-hidden="true">
            <div className="map-grid">
              <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                {/* abstract map lines */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(13,58,92,0.06)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="400" height="400" fill="url(#grid)" />
                {/* fake road network */}
                <path d="M 0 220 Q 100 200, 200 230 T 400 200" fill="none" stroke="rgba(13,58,92,0.12)" strokeWidth="3" />
                <path d="M 200 0 L 200 400" stroke="rgba(13,58,92,0.1)" strokeWidth="2" />
                <path d="M 0 280 L 400 280" stroke="rgba(13,58,92,0.08)" strokeWidth="1.5" />
                <path d="M 60 60 L 340 340" stroke="rgba(13,58,92,0.05)" strokeWidth="1" />
                {/* pin */}
                <g transform="translate(200, 200)">
                  <circle r="60" fill="rgba(25, 127, 199, 0.12)" />
                  <circle r="30" fill="rgba(25, 127, 199, 0.25)" />
                  <circle r="10" fill="#197FC7" stroke="white" strokeWidth="3" />
                </g>
              </svg>
              <span className="map-label">Beveren-Waas, BE</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Partner network ---------- */}
      <section className="partners">
        <div className="section-head">
          <span className="section-tag">{t('partners.tag')}</span>
          <h2>{t('partners.title')}</h2>
          <p className="section-intro">{t('partners.description')}</p>
        </div>

        <div className="partners-status">
          <div className="status-card">
            <span className="status-dot active"></span>
            <span className="status-label">{t('partners.statusActive')}</span>
            <span className="status-value">1 — Beveren-Waas (HQ)</span>
          </div>
          <div className="status-card">
            <span className="status-dot coming"></span>
            <span className="status-label">{t('partners.statusComingSoon')}</span>
            <span className="status-value">NL · DE · FR</span>
          </div>
        </div>

        <p className="partners-note">{t('partners.comingSoon')}</p>

        <div className="partners-cta">
          <div className="partners-cta-inner">
            <h3>{t('partners.ctaTitle')}</h3>
            <p>{t('partners.ctaDescription')}</p>
            <Link href="/partner" className="btn-primary">
              {t('partners.ctaButton')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Alternatives ---------- */}
      <section className="alternatives">
        <div className="section-head">
          <span className="section-tag">{t('alternatives.tag')}</span>
          <h2>{t('alternatives.title')}</h2>
          <p className="section-intro">{t('alternatives.description')}</p>
        </div>
        <div className="alt-grid">
          {alternatives.map((alt) => (
            <article className="alt-card" key={alt.key}>
              <span className="alt-tag">{alt.tag}</span>
              <div className="alt-icon">{alt.icon}</div>
              <h3>{alt.title}</h3>
              <p>{alt.desc}</p>
              <Link href={alt.href} className="alt-cta">
                {alt.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Direct contact ---------- */}
      <section className="contact-band">
        <div className="contact-inner">
          <div className="contact-text">
            <span className="section-tag">{t('contact.tag')}</span>
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.description')}</p>
          </div>
          <div className="contact-meta">
            <div className="contact-block">
              <span className="meta-label">{t('contact.phoneLabel')}</span>
              <a href="tel:+3232846818" className="contact-link">{t('contact.phoneValue')}</a>
            </div>
            <div className="contact-block">
              <span className="meta-label">{t('contact.emailLabel')}</span>
              <a href="mailto:info@re-sound.be" className="contact-link">{t('contact.emailValue')}</a>
            </div>
            <div className="contact-block">
              <span className="meta-label">{t('contact.hoursLabel')}</span>
              <span className="contact-value">{t('contact.hoursValue')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="cta">
        <div className="cta-inner">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.subtitle')}</p>
          <div className="cta-buttons">
            <Link href="/contact?topic=visit-hq" className="btn-primary">
              {t('cta.primary')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/contact?topic=samples" className="btn-secondary">
              {t('cta.secondary')}
            </Link>
          </div>
        </div>
      </section>

      <style jsx>{`
        .wtb-page {
          background: white;
        }

        /* ---------- Hero ---------- */
        .hero {
          background: var(--cream, #f7f9fb);
          padding: 9rem 2rem 5rem;
          text-align: center;
        }
        .hero-inner {
          max-width: 820px;
          margin: 0 auto;
        }
        .hero h1 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          line-height: 1.05;
          letter-spacing: -1.5px;
          color: var(--deep-blue, #0d3a5c);
          margin: 0.75rem 0 1.25rem;
        }
        .hero-tagline {
          font-size: 1.3rem;
          color: var(--deep-blue, #0d3a5c);
          margin: 0 0 1.5rem;
          line-height: 1.4;
          opacity: 0.85;
        }
        .hero-description {
          font-size: 1.05rem;
          color: #555;
          line-height: 1.7;
          max-width: 720px;
          margin: 0 auto;
        }

        /* ---------- Section heads (shared) ---------- */
        .section-tag {
          display: inline-block;
          font-size: 0.75rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--brand-blue, #197FC7);
        }
        .section-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 3rem;
        }
        .section-head h2 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          letter-spacing: -0.75px;
          color: var(--deep-blue, #0d3a5c);
          margin: 0.5rem 0 1rem;
          line-height: 1.15;
        }
        .section-intro {
          color: #555;
          font-size: 1.05rem;
          line-height: 1.65;
          margin: 0;
        }

        /* ---------- HQ section ---------- */
        .hq {
          background: white;
          padding: 6rem 2rem;
        }
        .hq-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3.5rem;
          align-items: center;
        }
        .hq h2 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: clamp(2rem, 3.5vw, 2.75rem);
          letter-spacing: -0.75px;
          color: var(--deep-blue, #0d3a5c);
          margin: 0.5rem 0 0.5rem;
          line-height: 1.15;
        }
        .hq-subtitle {
          font-size: 1.2rem;
          color: var(--deep-blue, #0d3a5c);
          opacity: 0.8;
          font-weight: 500;
          margin: 0 0 1.5rem;
        }
        .hq-description {
          color: #555;
          font-size: 1rem;
          line-height: 1.65;
          margin: 0 0 2rem;
        }
        .hq-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem 1.5rem;
          padding: 1.75rem 0;
          border-top: 1px solid rgba(13, 58, 92, 0.1);
          border-bottom: 1px solid rgba(13, 58, 92, 0.1);
          margin-bottom: 2rem;
        }
        .meta-block {
          font-size: 0.95rem;
        }
        .meta-label {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--brand-blue, #197FC7);
          font-weight: 700;
          margin-bottom: 0.4rem;
        }
        .meta-value {
          color: var(--deep-blue, #0d3a5c);
          margin: 0;
          line-height: 1.55;
        }
        .meta-note {
          font-size: 0.85rem;
          color: #777;
          font-style: italic;
        }
        .meta-value a {
          color: var(--deep-blue, #0d3a5c);
          text-decoration: none;
        }
        .meta-value a:hover {
          color: var(--brand-blue, #197FC7);
          text-decoration: underline;
        }
        .hq-experience {
          margin-bottom: 2rem;
        }
        .hq-experience h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.05rem;
          color: var(--deep-blue, #0d3a5c);
          margin: 0 0 0.85rem;
          letter-spacing: -0.25px;
        }
        .hq-experience ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .hq-experience li {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          font-size: 0.95rem;
          color: #333;
          line-height: 1.5;
        }
        .hq-experience li svg {
          flex-shrink: 0;
          margin-top: 4px;
          color: var(--brand-blue, #197FC7);
        }
        .hq-ctas {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* HQ visual (map placeholder) */
        .hq-visual {
          position: relative;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          background: var(--cream, #f7f9fb);
          border: 1px solid rgba(13, 58, 92, 0.08);
        }
        .map-grid {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .map-grid svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .map-label {
          position: absolute;
          bottom: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0.55rem 1.1rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--deep-blue, #0d3a5c);
          box-shadow: 0 4px 12px rgba(13, 58, 92, 0.1);
          letter-spacing: 0.5px;
        }

        /* ---------- Partner network ---------- */
        .partners {
          background: var(--cream, #f7f9fb);
          padding: 6rem 2rem;
        }
        .partners-status {
          max-width: 800px;
          margin: 0 auto 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .status-card {
          background: white;
          padding: 1.25rem 1.5rem;
          border-radius: 10px;
          border: 1px solid rgba(13, 58, 92, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: block;
        }
        .status-dot.active {
          background: #2da34d;
          box-shadow: 0 0 0 4px rgba(45, 163, 77, 0.15);
        }
        .status-dot.coming {
          background: #b8860b;
          box-shadow: 0 0 0 4px rgba(184, 134, 11, 0.15);
        }
        .status-label {
          font-size: 0.72rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #666;
          font-weight: 700;
        }
        .status-value {
          font-size: 1.05rem;
          color: var(--deep-blue, #0d3a5c);
          font-weight: 600;
        }
        .partners-note {
          max-width: 720px;
          margin: 0 auto 3rem;
          text-align: center;
          color: #555;
          font-size: 0.95rem;
          line-height: 1.65;
          font-style: italic;
        }
        .partners-cta {
          max-width: 900px;
          margin: 0 auto;
          background: white;
          border: 1px solid rgba(13, 58, 92, 0.1);
          border-left: 4px solid var(--brand-blue, #197FC7);
          border-radius: 12px;
          padding: 2.25rem 2.5rem;
        }
        .partners-cta-inner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: center;
        }
        .partners-cta h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.35rem;
          color: var(--deep-blue, #0d3a5c);
          margin: 0 0 0.5rem;
          letter-spacing: -0.25px;
        }
        .partners-cta p {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        /* ---------- Alternatives ---------- */
        .alternatives {
          background: white;
          padding: 6rem 2rem;
        }
        .alt-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .alt-card {
          background: var(--cream, #f7f9fb);
          padding: 2rem 1.75rem;
          border-radius: 12px;
          border: 1px solid rgba(13, 58, 92, 0.06);
          display: flex;
          flex-direction: column;
        }
        .alt-tag {
          display: inline-block;
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--brand-blue, #197FC7);
          background: rgba(25, 127, 199, 0.1);
          padding: 0.3rem 0.65rem;
          border-radius: 100px;
          align-self: flex-start;
          margin-bottom: 1.25rem;
        }
        .alt-icon {
          color: var(--brand-blue, #197FC7);
          margin-bottom: 1rem;
        }
        .alt-card h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.25rem;
          color: var(--deep-blue, #0d3a5c);
          letter-spacing: -0.25px;
          margin: 0 0 0.75rem;
        }
        .alt-card p {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 1.5rem;
          flex: 1;
        }
        :global(.alt-cta) {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--brand-blue, #197FC7);
          font-weight: 600;
          font-size: 0.95rem;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        :global(.alt-cta:hover) {
          gap: 0.6rem;
        }

        /* ---------- Direct contact band ---------- */
        .contact-band {
          background: var(--cream, #f7f9fb);
          padding: 5rem 2rem;
        }
        .contact-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 3rem;
          align-items: center;
        }
        .contact-text h2 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: clamp(1.6rem, 2.5vw, 2.1rem);
          color: var(--deep-blue, #0d3a5c);
          letter-spacing: -0.5px;
          margin: 0.5rem 0 0.85rem;
        }
        .contact-text p {
          color: #555;
          font-size: 1rem;
          line-height: 1.65;
          margin: 0;
        }
        .contact-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .contact-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        :global(.contact-link) {
          color: var(--deep-blue, #0d3a5c);
          font-weight: 600;
          text-decoration: none;
          font-size: 1.05rem;
          letter-spacing: -0.25px;
        }
        :global(.contact-link:hover) {
          color: var(--brand-blue, #197FC7);
        }
        .contact-value {
          color: var(--deep-blue, #0d3a5c);
          font-weight: 600;
          font-size: 1.05rem;
        }

        /* ---------- Final CTA ---------- */
        .cta {
          background: var(--deep-blue, #0d3a5c);
          color: white;
          padding: 6rem 2rem;
          text-align: center;
        }
        .cta-inner {
          max-width: 700px;
          margin: 0 auto;
        }
        .cta h2 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.5rem);
          color: white;
          letter-spacing: -0.5px;
          margin: 0 0 1rem;
        }
        .cta p {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 2.25rem;
        }
        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ---------- Shared buttons ---------- */
        :global(.wtb-page .btn-primary) {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.95rem 1.8rem;
          background: var(--brand-blue, #197FC7);
          color: white;
          border-radius: var(--radius-full, 50px);
          font-weight: 600;
          text-decoration: none;
          font-size: 0.98rem;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        :global(.wtb-page .btn-primary:hover) {
          background: #1668a3;
          transform: translateY(-1px);
        }
        :global(.wtb-page .btn-secondary) {
          display: inline-flex;
          align-items: center;
          padding: 0.95rem 1.8rem;
          background: transparent;
          color: white;
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: var(--radius-full, 50px);
          font-weight: 600;
          text-decoration: none;
          font-size: 0.98rem;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        :global(.wtb-page .btn-secondary:hover) {
          border-color: white;
          background: rgba(255, 255, 255, 0.08);
        }
        /* override secondary for the HQ section (light bg) */
        :global(.wtb-page .hq .btn-secondary) {
          color: var(--deep-blue, #0d3a5c);
          border-color: rgba(13, 58, 92, 0.25);
        }
        :global(.wtb-page .hq .btn-secondary:hover) {
          border-color: var(--deep-blue, #0d3a5c);
          background: rgba(13, 58, 92, 0.04);
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 968px) {
          .hq-inner {
            grid-template-columns: 1fr;
          }
          .hq-visual {
            max-width: 460px;
            margin: 0 auto;
          }
          .alt-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .contact-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .partners-cta-inner {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }
        @media (max-width: 640px) {
          .hero {
            padding: 7rem 1.25rem 4rem;
          }
          .hq,
          .partners,
          .alternatives,
          .contact-band,
          .cta {
            padding: 4rem 1.25rem;
          }
          .hq-meta {
            grid-template-columns: 1fr;
          }
          .partners-status {
            grid-template-columns: 1fr;
          }
          .alt-grid {
            grid-template-columns: 1fr;
          }
          .contact-meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
