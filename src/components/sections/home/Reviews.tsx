// "Rated 5.0 on Google" — three review cards (middle one dark for rhythm).
// Quotes are placeholder content flagged in CHANGES.md; no aggregateRating is
// emitted in schema until backed by real review data.
import { useTranslations } from 'next-intl';
import Eyebrow from '@/components/ui/Eyebrow';
import { reviews, ratingDisplay } from '@/lib/content';

export default function Reviews() {
  const t = useTranslations('home.reviews');
  const tData = useTranslations('reviewsData');
  const items = tData.raw('items') as { role: string; quote: string }[];
  return (
    <section className="section--surface" id="reviews">
      <div className="container section">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, marginBottom: 'clamp(36px,4vw,56px)' }}>
          <div>
            <Eyebrow num="07" label={t('eyebrow')} />
            <h2 className="h2">
              {t('title', { score: ratingDisplay.score })}
              <span className="accent">.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(40px,5vw,64px)', lineHeight: 1, letterSpacing: '-.03em', color: 'var(--red)' }}>
              {ratingDisplay.score}
            </span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 16, letterSpacing: '.08em', color: 'var(--red)' }}>★★★★★</div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted-2)' }}>
                {t('ratedOn', { source: ratingDisplay.source })}
              </div>
            </div>
          </div>
        </div>

        <div className="rev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {reviews.map((r, i) => {
            const dark = i === 1;
            return (
              <figure
                key={r.name}
                style={{
                  margin: 0,
                  border: dark ? '1px solid var(--black)' : '1px solid var(--border)',
                  background: dark ? 'var(--black)' : '#fff',
                  color: dark ? '#fff' : 'inherit',
                  padding: 'clamp(26px,3vw,38px)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: 15, letterSpacing: '.08em', color: 'var(--red)', marginBottom: 18 }}>★★★★★</div>
                <blockquote style={{ margin: '0 0 24px', fontSize: 16, lineHeight: 1.6, color: dark ? 'var(--on-dark-soft)' : 'var(--text-body)', flex: 1 }}>
                  “{items[i].quote}”
                </blockquote>
                <figcaption style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: dark ? 'var(--red)' : 'var(--black)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15,
                    }}
                  >
                    {r.name.charAt(0)}
                  </span>
                  <span>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{r.name}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: dark ? 'var(--on-dark-muted)' : 'var(--text-faint)' }}>{items[i].role}</span>
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 860px) {
          .rev-grid { grid-template-columns: 1fr !important; }
        }
      ` }} />
    </section>
  );
}
