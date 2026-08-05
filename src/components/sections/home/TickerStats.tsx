// Red scrolling ticker + the four-stat band.
import { useTranslations } from 'next-intl';

const TICKER_COUNT = 7;

export function Ticker() {
  const tr = useTranslations('home.ticker');
  const run = Array.from({ length: TICKER_COUNT }, (_, i) => tr(String(i))).map((t) => (
    <span key={t} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, letterSpacing: '.04em', textTransform: 'uppercase', padding: '15px 0' }}>
        &nbsp;&nbsp;{t}&nbsp;&nbsp;&nbsp;▪&nbsp;&nbsp;&nbsp;
      </span>
    </span>
  ));
  return (
    <div style={{ background: 'var(--red)', color: '#fff', overflow: 'hidden', whiteSpace: 'nowrap', borderTop: '1px solid var(--black)', borderBottom: '1px solid var(--black)' }}>
      <div style={{ display: 'inline-flex', willChange: 'transform', animation: 'ticker 34s linear infinite' }}>
        <div style={{ display: 'inline-flex' }}>{run}</div>
        <div style={{ display: 'inline-flex' }} aria-hidden>
          {run}
        </div>
      </div>
    </div>
  );
}

const STATS = [
  { value: '1', accent: '.' },
  { value: '+25', accent: '.' },
  { value: '6.4', accent: 'm' },
  { value: '100', accent: '%' },
];

export function Stats() {
  const t = useTranslations('home.stats');
  return (
    <section
      className="container stats-grid"
      style={{
        paddingTop: 'clamp(40px,5vw,72px)',
        paddingBottom: 'clamp(40px,5vw,72px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 1,
        background: 'var(--border)',
        border: '1px solid var(--border)',
      }}
    >
      {STATS.map((s, i) => (
        <div key={s.value} style={{ background: '#fff', padding: '28px 24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(34px,4vw,52px)', lineHeight: 1, letterSpacing: '-.03em' }}>
            {s.value}
            <span className="accent">{s.accent}</span>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-muted-2)', marginTop: 10 }}>
            {t(String(i))}
          </div>
        </div>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 720px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      ` }} />
    </section>
  );
}
