// "Selected work" — a five-tile project strip pulled from the Inspiration
// catalogue, linking through to the full portfolio.
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import Placeholder from '@/components/ui/Placeholder';
import { homeImages } from '@/lib/home-images';
import { projects } from '@/lib/content';

const FEATURED = projects.slice(0, 5);

export default function Gallery() {
  const t = useTranslations('home.gallery');
  return (
    <section className="container section" id="work">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 'clamp(34px,4vw,52px)' }}>
        <div>
          <Eyebrow num="06" label={t('eyebrow')} />
          <h2 className="h2">
            {t('title1')}
            <br />
            {t('title2')}
          </h2>
        </div>
        <Link href="/inspiration" className="btn btn--ghost" style={{ alignSelf: 'flex-end' }}>
          {t('cta')} →
        </Link>
      </div>

      <div className="gal-grid">
        {FEATURED.map((p, i) => (
          <Link key={p.title} href={`/inspiration/${p.slug}`} className="gal-cell zoom-wrap">
            <Placeholder
              label={`${p.title} project`}
              src={homeImages.gallery[i]}
              alt={`${p.title} — ${p.cat}`}
              sizes="(max-width: 980px) 50vw, 20vw"
              className="zoom-img"
              decorative
            />
            <div className="gal-overlay">
              <span className="gal-cat">{p.cat}</span>
              <h3 className="gal-title">{p.title}</h3>
              <span className="gal-meta">{p.meta}</span>
            </div>
          </Link>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gal-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .gal-cell {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--border);
          aspect-ratio: 3 / 4;
          display: block;
        }
        .gal-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 18px 16px;
          background: linear-gradient(to top, rgba(10,10,10,.85) 0%, rgba(10,10,10,.1) 60%, rgba(10,10,10,0) 100%);
        }
        .gal-cat {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--red);
          background: #fff;
          align-self: flex-start;
          padding: 4px 8px;
          margin-bottom: 10px;
        }
        .gal-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 16px;
          letter-spacing: -.01em;
          color: #fff;
          margin: 0 0 4px;
        }
        .gal-meta { font-size: 11.5px; color: var(--on-dark-soft); }
        @media (max-width: 980px) {
          .gal-grid { grid-template-columns: repeat(3, 1fr); }
          .gal-cell:nth-child(4), .gal-cell:nth-child(5) { display: none; }
        }
        @media (max-width: 560px) {
          .gal-grid { grid-template-columns: 1fr 1fr; }
          .gal-cell:nth-child(3) { display: none; }
        }
      ` }} />
    </section>
  );
}
