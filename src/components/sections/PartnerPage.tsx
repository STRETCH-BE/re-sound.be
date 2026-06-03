'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function PartnerPage() {
  const t = useTranslations('partnerPage');

  const whyItems = [
    { key: 'item1', title: t('why.item1.title'), desc: t('why.item1.desc') },
    { key: 'item2', title: t('why.item2.title'), desc: t('why.item2.desc') },
    { key: 'item3', title: t('why.item3.title'), desc: t('why.item3.desc') },
    { key: 'item4', title: t('why.item4.title'), desc: t('why.item4.desc') },
    { key: 'item5', title: t('why.item5.title'), desc: t('why.item5.desc') },
    { key: 'item6', title: t('why.item6.title'), desc: t('why.item6.desc') },
  ];

  const tracks = [
    {
      key: 'specifier',
      accent: 'var(--brand-blue)',
      badge: t('tracks.specifier.badge'),
      name: t('tracks.specifier.name'),
      description: t('tracks.specifier.description'),
      points: [
        t('tracks.specifier.point1'),
        t('tracks.specifier.point2'),
        t('tracks.specifier.point3'),
        t('tracks.specifier.point4'),
        t('tracks.specifier.point5'),
      ],
      fee: t('tracks.specifier.fee'),
      apply: t('tracks.specifier.apply'),
    },
    {
      key: 'dealer',
      accent: 'var(--deep-blue)',
      badge: t('tracks.dealer.badge'),
      name: t('tracks.dealer.name'),
      description: t('tracks.dealer.description'),
      points: [
        t('tracks.dealer.point1'),
        t('tracks.dealer.point2'),
        t('tracks.dealer.point3'),
        t('tracks.dealer.point4'),
        t('tracks.dealer.point5'),
      ],
      fee: t('tracks.dealer.fee'),
      apply: t('tracks.dealer.apply'),
    },
    {
      key: 'distributor',
      accent: '#1a4a5c',
      badge: t('tracks.distributor.badge'),
      name: t('tracks.distributor.name'),
      description: t('tracks.distributor.description'),
      points: [
        t('tracks.distributor.point1'),
        t('tracks.distributor.point2'),
        t('tracks.distributor.point3'),
        t('tracks.distributor.point4'),
        t('tracks.distributor.point5'),
      ],
      fee: t('tracks.distributor.fee'),
      apply: t('tracks.distributor.apply'),
    },
  ];

  const benefits = [
    { key: 'item1', title: t('benefits.item1.title'), desc: t('benefits.item1.desc') },
    { key: 'item2', title: t('benefits.item2.title'), desc: t('benefits.item2.desc') },
    { key: 'item3', title: t('benefits.item3.title'), desc: t('benefits.item3.desc') },
    { key: 'item4', title: t('benefits.item4.title'), desc: t('benefits.item4.desc') },
    { key: 'item5', title: t('benefits.item5.title'), desc: t('benefits.item5.desc') },
    { key: 'item6', title: t('benefits.item6.title'), desc: t('benefits.item6.desc') },
  ];

  const steps = [
    { number: t('process.step1.number'), title: t('process.step1.title'), desc: t('process.step1.desc') },
    { number: t('process.step2.number'), title: t('process.step2.title'), desc: t('process.step2.desc') },
    { number: t('process.step3.number'), title: t('process.step3.title'), desc: t('process.step3.desc') },
    { number: t('process.step4.number'), title: t('process.step4.title'), desc: t('process.step4.desc') },
  ];

  const resources = [
    { label: t('resources.partnerPack'), available: true },
    { label: t('resources.brandGuidelines'), available: true },
    { label: t('resources.sampleKit'), available: true },
    { label: t('resources.bimCad'), available: false },
    { label: t('resources.caseStudies'), available: true },
    { label: t('resources.pricing'), available: false },
  ];

  return (
    <main className="partner-page">
      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="hero-inner">
          <span className="section-tag">{t('hero.tag')}</span>
          <h1>{t('hero.title')}</h1>
          <p className="hero-tagline">{t('hero.tagline')}</p>
          <p className="hero-description">{t('hero.description')}</p>
          <div className="hero-ctas">
            <Link href="/contact?topic=partner" className="btn-primary">
              {t('hero.ctaPrimary')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <a href="mailto:info@re-sound.be?subject=Partner%20programme%20enquiry" className="btn-secondary">
              {t('hero.ctaSecondary')}
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Why partner ---------- */}
      <section className="why">
        <div className="section-head">
          <span className="section-tag">{t('why.tag')}</span>
          <h2>{t('why.title')}</h2>
        </div>
        <div className="why-grid">
          {whyItems.map((item, i) => (
            <div className="why-card" key={item.key}>
              <span className="why-number">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Partner tracks ---------- */}
      <section className="tracks">
        <div className="section-head">
          <span className="section-tag">{t('tracks.tag')}</span>
          <h2>{t('tracks.title')}</h2>
          <p className="section-intro">{t('tracks.description')}</p>
        </div>
        <div className="tracks-grid">
          {tracks.map((track) => (
            <article className="track-card" key={track.key} style={{ borderTopColor: track.accent }}>
              <span className="track-badge" style={{ color: track.accent }}>
                {track.badge}
              </span>
              <h3>{track.name}</h3>
              <p className="track-description">{track.description}</p>
              <ul className="track-points">
                {track.points.map((p, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={track.accent} strokeWidth="2.5" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="track-footer">
                <span className="track-fee">{track.fee}</span>
                <Link
                  href={`/contact?topic=partner&track=${track.key}`}
                  className="track-apply"
                  style={{ color: track.accent }}
                >
                  {track.apply}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- What you get ---------- */}
      <section className="benefits">
        <div className="section-head">
          <span className="section-tag">{t('benefits.tag')}</span>
          <h2>{t('benefits.title')}</h2>
          <p className="section-intro">{t('benefits.description')}</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((item) => (
            <div className="benefit-card" key={item.key}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="process">
        <div className="section-head">
          <span className="section-tag">{t('process.tag')}</span>
          <h2>{t('process.title')}</h2>
          <p className="section-intro">{t('process.description')}</p>
        </div>
        <ol className="process-list">
          {steps.map((step, i) => (
            <li className="process-step" key={i}>
              <span className="step-number">{step.number}</span>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Trade resources ---------- */}
      <section className="resources">
        <div className="section-head">
          <span className="section-tag">{t('resources.tag')}</span>
          <h2>{t('resources.title')}</h2>
          <p className="section-intro">{t('resources.description')}</p>
        </div>
        <ul className="resources-list">
          {resources.map((r, i) => (
            <li className="resource-item" key={i}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="resource-label">{r.label}</span>
              {r.available ? (
                <span className="resource-status available">●</span>
              ) : (
                <span className="resource-status pending">○</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="cta">
        <div className="cta-inner">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.subtitle')}</p>
          <div className="cta-buttons">
            <Link href="/contact?topic=partner" className="btn-primary">
              {t('cta.primary')}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
            <a href="mailto:info@re-sound.be?subject=Partner%20programme%20enquiry" className="btn-secondary">
              {t('cta.secondary')}
            </a>
          </div>
        </div>
      </section>

      <style jsx>{`
        .partner-page {
          background: white;
        }

        /* ---------- Hero ---------- */
        .hero {
          background: var(--deep-blue, #0d3a5c);
          color: white;
          padding: 9rem 2rem 6rem;
          text-align: center;
        }
        .hero-inner {
          max-width: 860px;
          margin: 0 auto;
        }
        .hero .section-tag {
          color: rgba(255, 255, 255, 0.7);
        }
        .hero h1 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          line-height: 1.05;
          letter-spacing: -1.5px;
          color: white;
          margin: 0.75rem 0 1.25rem;
        }
        .hero-tagline {
          font-size: 1.35rem;
          color: rgba(255, 255, 255, 0.92);
          margin: 0 0 1.5rem;
          line-height: 1.4;
        }
        .hero-description {
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.7;
          max-width: 700px;
          margin: 0 auto 2.5rem;
        }
        .hero-ctas {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* ---------- Section heads ---------- */
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

        /* ---------- Why grid ---------- */
        .why {
          background: var(--cream, #f7f9fb);
          padding: 6rem 2rem;
        }
        .why-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .why-card {
          background: white;
          padding: 2rem 1.75rem;
          border-radius: 12px;
          border: 1px solid rgba(13, 58, 92, 0.08);
        }
        .why-number {
          display: inline-block;
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--brand-blue, #197FC7);
          letter-spacing: 1px;
          margin-bottom: 1rem;
        }
        .why-card h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.2rem;
          color: var(--deep-blue, #0d3a5c);
          letter-spacing: -0.25px;
          margin: 0 0 0.65rem;
          line-height: 1.3;
        }
        .why-card p {
          color: #555;
          line-height: 1.65;
          font-size: 0.95rem;
          margin: 0;
        }

        /* ---------- Tracks ---------- */
        .tracks {
          background: white;
          padding: 6rem 2rem;
        }
        .tracks-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .track-card {
          background: white;
          border: 1px solid rgba(13, 58, 92, 0.1);
          border-top: 4px solid var(--brand-blue, #197FC7);
          border-radius: 12px;
          padding: 2.25rem 1.75rem 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .track-badge {
          font-size: 0.7rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .track-card h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.35rem;
          color: var(--deep-blue, #0d3a5c);
          letter-spacing: -0.25px;
          margin: 0 0 0.85rem;
          line-height: 1.25;
        }
        .track-description {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.65;
          margin: 0 0 1.5rem;
        }
        .track-points {
          list-style: none;
          padding: 0;
          margin: 0 0 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1;
        }
        .track-points li {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          font-size: 0.92rem;
          color: #333;
          line-height: 1.5;
        }
        .track-points svg {
          flex-shrink: 0;
          margin-top: 3px;
        }
        .track-footer {
          padding-top: 1.25rem;
          border-top: 1px solid rgba(13, 58, 92, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .track-fee {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }
        :global(.track-apply) {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        :global(.track-apply:hover) {
          gap: 0.6rem;
        }

        /* ---------- Benefits ---------- */
        .benefits {
          background: var(--cream, #f7f9fb);
          padding: 6rem 2rem;
        }
        .benefits-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .benefit-card {
          background: white;
          padding: 1.75rem;
          border-radius: 10px;
          border: 1px solid rgba(13, 58, 92, 0.06);
        }
        .benefit-card h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.05rem;
          color: var(--deep-blue, #0d3a5c);
          margin: 0 0 0.5rem;
        }
        .benefit-card p {
          font-size: 0.92rem;
          color: #555;
          line-height: 1.6;
          margin: 0;
        }

        /* ---------- Process ---------- */
        .process {
          background: white;
          padding: 6rem 2rem;
        }
        .process-list {
          max-width: 1200px;
          margin: 0 auto;
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .process-step {
          position: relative;
          padding: 0 0.5rem;
        }
        .process-step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 1.5rem;
          right: -0.75rem;
          width: 1.5rem;
          height: 2px;
          background: rgba(25, 127, 199, 0.25);
        }
        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: var(--brand-blue, #197FC7);
          color: white;
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .step-content h3 {
          font-family: var(--font-heading, 'Syne'), system-ui, sans-serif;
          font-size: 1.2rem;
          color: var(--deep-blue, #0d3a5c);
          margin: 0 0 0.5rem;
        }
        .step-content p {
          color: #555;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        /* ---------- Resources ---------- */
        .resources {
          background: var(--cream, #f7f9fb);
          padding: 6rem 2rem;
        }
        .resources-list {
          max-width: 880px;
          margin: 0 auto;
          list-style: none;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .resource-item {
          background: white;
          padding: 1.1rem 1.25rem;
          border-radius: 8px;
          border: 1px solid rgba(13, 58, 92, 0.08);
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.95rem;
          color: var(--deep-blue, #0d3a5c);
        }
        .resource-item svg {
          flex-shrink: 0;
          color: var(--brand-blue, #197FC7);
        }
        .resource-label {
          flex: 1;
        }
        .resource-status {
          font-size: 0.85rem;
        }
        .resource-status.available {
          color: #2da34d;
        }
        .resource-status.pending {
          color: #b8860b;
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
        :global(.partner-page .btn-primary) {
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
        :global(.partner-page .btn-primary:hover) {
          background: #1668a3;
          transform: translateY(-1px);
        }
        :global(.partner-page .btn-secondary) {
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
        :global(.partner-page .btn-secondary:hover) {
          border-color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 968px) {
          .why-grid,
          .tracks-grid,
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .process-list {
            grid-template-columns: repeat(2, 1fr);
          }
          .process-step:not(:last-child)::after {
            display: none;
          }
          .resources-list {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .hero {
            padding: 7rem 1.25rem 4rem;
          }
          .why,
          .tracks,
          .benefits,
          .process,
          .resources,
          .cta {
            padding: 4rem 1.25rem;
          }
          .why-grid,
          .tracks-grid,
          .benefits-grid,
          .process-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
