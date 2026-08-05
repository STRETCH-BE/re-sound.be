// "Where stretch works" — a bento grid of application areas. The living-room
// tile spans 2×2 and is flagged "Most popular"; cinema spans two columns. Each
// tile links through to the Inspiration gallery.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { homeImages } from '@/lib/home-images';

const AREAS = [
  { key: 'living', area: 'living', badge: true },
  { key: 'bathroom', area: 'bath' },
  { key: 'office', area: 'office' },
  { key: 'cinema', area: 'cinema', dark: true },
  { key: 'light', area: 'starry' },
  { key: 'commercial', area: 'retail' },
];

export default function ApplicationAreas() {
  const t = useTranslations('home.apps');
  return (
    <section className="container section" id="applications">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 'clamp(36px,4vw,56px)' }}>
        <div>
          <Eyebrow num="04" label={t('eyebrow')} />
          <h2 className="h2">
            {t('title1')}
            <br />
            {t('title2')}
          </h2>
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: 360, margin: 0 }}>
          {t('intro')}
        </p>
      </div>

      <div className="bento">
        {AREAS.map((a, i) => (
          <Link
            key={a.key}
            href="/inspiration"
            className={`bento-cell zoom-wrap${a.dark ? ' bento-cell--dark' : ''}`}
            style={{ gridArea: a.area }}
          >
            <Placeholder
              label={`${t(`areas.${i}.title`)} example`}
              src={homeImages.app[a.key as keyof typeof homeImages.app]}
              alt={`STRETCH — ${t(`areas.${i}.title`)}`}
              sizes="(max-width: 860px) 100vw, 33vw"
              light={!a.dark}
              className="zoom-img"
              decorative
            />
            <div className="bento-overlay">
              {a.badge && <span className="bento-badge">{t('badge')}</span>}
              <div className="bento-meta">
                <h3 className="bento-title">{t(`areas.${i}.title`)}</h3>
                <p className="bento-blurb">{t(`areas.${i}.blurb`)}</p>
                <span className="bento-link">{t('view')} →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bento {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, minmax(190px, 1fr));
          gap: 14px;
          grid-template-areas:
            "living living cinema cinema"
            "living living bath office"
            "starry retail bath office";
          grid-template-rows: repeat(3, minmax(170px, 1fr));
        }
        .bento-cell {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--black);
          display: block;
          min-height: 170px;
        }
        .bento-cell--dark { border-color: var(--black); }
        .bento-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: clamp(16px, 1.8vw, 26px);
          background: linear-gradient(to top, rgba(10,10,10,.82) 0%, rgba(10,10,10,.12) 55%, rgba(10,10,10,0) 100%);
        }
        .bento-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: var(--red);
          color: #fff;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          padding: 6px 11px;
        }
        .bento-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(18px, 2vw, 26px);
          letter-spacing: -.02em;
          text-transform: uppercase;
          color: #fff;
          margin: 0 0 6px;
        }
        .bento-blurb {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--on-dark-soft);
          margin: 0 0 12px;
          max-width: 34ch;
        }
        .bento-link {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #fff;
        }
        .bento-cell:hover .bento-link { color: var(--red); }
        @media (max-width: 860px) {
          .bento {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto;
            grid-template-areas:
              "living living"
              "cinema cinema"
              "bath office"
              "starry retail";
          }
        }
        @media (max-width: 540px) {
          .bento {
            grid-template-columns: 1fr;
            grid-template-areas:
              "living" "cinema" "bath" "office" "starry" "retail";
          }
        }
      ` }} />
    </section>
  );
}
