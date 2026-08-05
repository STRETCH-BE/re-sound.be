'use client';

// Full-bleed, photography-led hero. Four background images crossfade (opacity,
// 1s) on a ~5.5s timer that pauses on hover and resets when a tab is clicked.
// Two dark gradient overlays keep the headline legible; the headline itself is
// always rendered at full opacity (no fade-in). A pinned tab row lets visitors
// jump straight to a slide.
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ModalButton } from '@/components/ui/ModalButton';
import Placeholder from '@/components/ui/Placeholder';
import { homeImages } from '@/lib/home-images';

const SLIDE_IMAGES = [
  homeImages.heroSlides.ceilings,
  homeImages.heroSlides.acoustic,
  homeImages.heroSlides.walls,
  homeImages.heroSlides.light,
];

const ADVANCE_MS = 3000;

export default function Hero() {
  const t = useTranslations('home.hero');
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % SLIDE_IMAGES.length), ADVANCE_MS);
    return () => clearTimeout(id);
  }, [active, paused]);


  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="STRETCH solutions"
    >
      {/* Background image layers + overlays */}
      <div className="hero-bg" aria-hidden="true">
        {SLIDE_IMAGES.map((image, i) => (
          <div key={image} className="hero-layer" style={{ opacity: i === active ? 1 : 0 }}>
            <Placeholder label={`Hero — ${t(`slides.${i}.tabName`)}`} src={image} alt="" priority={i === 0} sizes="100vw" decorative />
          </div>
        ))}
        <div className="hero-ov hero-ov--x" />
        <div className="hero-ov hero-ov--y" />
      </div>

      {/* Headline + CTAs */}
      <div className="container hero-content">
        <div className="hero-kicker">
          <span className="hero-dash" />
          <span>{t(`slides.${active}.kicker`)}</span>
        </div>
        <h1 className="h-display hero-title">
          {t(`slides.${active}.line1`)}
          <br />
          <span className="accent">{t(`slides.${active}.line2`)}</span>
        </h1>
        <p className="hero-sub">{t(`slides.${active}.subhead`)}</p>
        <div className="hero-cta">
          <ModalButton type="quote" source="hero" trackQuote className="btn btn--primary btn--lg">
            {t('quote')} <ArrowRight size={16} />
          </ModalButton>
          <Link href="/products" className="btn btn--ghost-light btn--lg">
            {t('explore')} <ArrowRight size={16} className="btn__arrow" />
          </Link>
          <span className="hero-rating">
            <strong>5.0</strong>
            <span className="hero-stars" aria-hidden="true">★★★★★</span>
            <span className="hero-rating-label">{t('rated')}</span>
          </span>
        </div>
      </div>

      {/* Find-your-solution tab row */}
      <div className="hero-tabs-bar">
        <div className="container hero-tabs" role="tablist" aria-label={t('tabsAria')}>
          {SLIDE_IMAGES.map((image, i) => (
            <button
              key={image}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`hero-tab${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              <span className="hero-tab-bar" aria-hidden="true" />
              <span className="hero-tab-body">
                <span className="hero-tab-name">{t(`slides.${i}.tabName`)}</span>
                <span className="hero-tab-desc">{t(`slides.${i}.tabDesc`)}</span>
              </span>
              <ArrowRight size={16} className="hero-tab-arrow" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero {
          position: relative;
          min-height: 94vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--black);
          color: #fff;
        }
        .hero-bg { position: absolute; inset: 0; z-index: 0; }
        .hero-layer { position: absolute; inset: 0; transition: opacity 1s ease; }
        .hero-layer > * { width: 100%; height: 100%; }
        .hero-ov { position: absolute; inset: 0; pointer-events: none; }
        .hero-ov--x { background: linear-gradient(100deg, rgba(8,8,8,.9) 0%, rgba(8,8,8,.32) 50%, rgba(8,8,8,.6) 100%); }
        .hero-ov--y { background: linear-gradient(to bottom, rgba(8,8,8,.45) 0%, rgba(8,8,8,.15) 40%, rgba(8,8,8,.8) 100%); }

        .hero-content {
          position: relative;
          z-index: 2;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: clamp(48px, 9vw, 120px);
          padding-bottom: clamp(40px, 6vw, 80px);
        }
        .hero-kicker {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: clamp(18px, 2.4vw, 28px);
          font-size: 12.5px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
          color: #fff;
        }
        .hero-dash { width: 34px; height: 2px; background: var(--red); flex-shrink: 0; }
        .hero-title { margin: 0; max-width: 16ch; opacity: 1; }
        .hero-sub {
          font-size: clamp(15px, 1.7vw, 19px); line-height: 1.5; color: var(--on-dark-soft);
          max-width: 46ch; margin: clamp(20px, 2.6vw, 30px) 0 clamp(26px, 3.4vw, 38px);
        }
        .hero-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
        .hero-rating {
          display: inline-flex; align-items: center; gap: 9px;
          color: #fff; font-size: 13px;
        }
        .hero-rating strong { font-family: var(--font-display); font-weight: 900; font-size: 19px; line-height: 1; }
        .hero-stars { color: var(--red); letter-spacing: .04em; font-size: 13px; }
        .hero-rating-label { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--on-dark-muted); }

        .hero-tabs-bar {
          position: relative; z-index: 2; flex: 0 0 auto;
          background: rgba(10,10,10,.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,.16);
        }
        .hero-tabs { display: grid; grid-template-columns: repeat(4, 1fr); }
        .hero-tab {
          position: relative; cursor: pointer; font: inherit; text-align: left;
          background: transparent; border: 0;
          border-left: 1px solid rgba(255,255,255,.12);
          display: flex; align-items: center; gap: 12px;
          padding: clamp(16px, 1.8vw, 24px) clamp(14px, 1.6vw, 22px);
          transition: background .2s;
        }
        .hero-tab:first-child { border-left: 0; }
        .hero-tab:hover { background: rgba(255,255,255,.06); }
        .hero-tab.is-active { background: rgba(255,255,255,.07); }
        .hero-tab-bar { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,.22); transition: background .2s; }
        .hero-tab.is-active .hero-tab-bar { background: var(--red); }
        .hero-tab-body { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .hero-tab-name { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: -.01em; font-size: clamp(13px, 1.25vw, 17px); color: #fff; line-height: 1; }
        .hero-tab-desc { font-size: 11.5px; color: rgba(255,255,255,.6); }
        .hero-tab-arrow { color: var(--red); flex-shrink: 0; }

        @media (max-width: 760px) {
          .hero { min-height: 90vh; }
          .hero-tabs { grid-template-columns: 1fr 1fr; }
          .hero-tab:nth-child(2) { border-left: 1px solid rgba(255,255,255,.12); }
          .hero-tab:nth-child(3) { border-left: 0; }
          .hero-tab:nth-child(3), .hero-tab:nth-child(4) { border-top: 1px solid rgba(255,255,255,.12); }
          .hero-tab-arrow { display: none; }
        }
      ` }} />
    </section>
  );
}
