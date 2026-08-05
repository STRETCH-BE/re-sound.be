// Rich colour chart: a responsive grid of swatches, each with name + RAL + HEX.
// Used on product pages that set `colourChart` (e.g. polyester). Light tones get
// a hairline border so they read on white. Server component (no interactivity).
// Entries arrive pre-localized (SolutionPage translates names/finishes).
import { useTranslations } from 'next-intl';
import type { ColourEntry } from '@/lib/polyester-colours';

// Perceived luminance — light swatches need a border to be visible on white.
function isLight(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.82;
}

const CUSTOM_BG =
  'conic-gradient(from 0deg,#ff0000,#ffb400,#3ad29f,#3a7bd5,#b000ff,#ff0000)';

export default function ColourChart({
  entries,
  note,
}: {
  entries: ColourEntry[];
  note?: string;
}) {
  const t = useTranslations('productPage');
  const count = entries.filter((c) => !c.custom).length;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 'clamp(18px,2vw,24px)',
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--text-faint-2)' }}>
          {t('chartCount', { count })}
        </span>
        {note && <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>· {note}</span>}
      </div>

      <div className="cc-grid">
        {entries.map((c) => {
          const bg = c.custom ? CUSTOM_BG : c.hex;
          const border = !c.custom && isLight(c.hex)
            ? '1px solid var(--border-input)'
            : '1px solid rgba(0,0,0,.07)';
          return (
            <div key={c.name} className="cc-item">
              <div
                role="img"
                aria-label={`${c.name}${c.finish ? ` ${c.finish}` : ''}${c.ral ? ` (${c.ral})` : ''} finish`}
                className="cc-sw"
                style={{ background: bg, border }}
              />
              <div className="cc-name">{c.name}</div>
              {c.custom ? (
                <div className="cc-meta">{t('anyRal')}</div>
              ) : (
                <div className="cc-meta">
                  {c.finish && <span className="cc-finish">{c.finish}</span>}
                  {c.finish && <span className="cc-dot">·</span>}
                  {c.code && <span>{c.code}</span>}
                  {c.code && <span className="cc-dot">·</span>}
                  {c.ral && <span>{c.ral}</span>}
                  {c.ral && <span className="cc-dot">·</span>}
                  <span className="cc-hex">{c.hex.toUpperCase()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .cc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: clamp(14px,1.6vw,20px); }
        .cc-sw { aspect-ratio: 1 / 1; border-radius: 3px; }
        .cc-name { font-size: 13px; font-weight: 600; margin-top: 10px; line-height: 1.2; }
        .cc-meta { font-size: 11.5px; color: var(--text-faint-2); margin-top: 4px; display: flex; flex-wrap: wrap; gap: 5px; align-items: center; }
        .cc-hex { font-variant-numeric: tabular-nums; letter-spacing: .02em; }
        .cc-finish { color: var(--red); font-weight: 600; }
        .cc-dot { opacity: .45; }
        @media (max-width: 560px) { .cc-grid { grid-template-columns: repeat(2, 1fr); } }
      ` }} />
    </div>
  );
}
