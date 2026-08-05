// GET /api/og — default Open Graph image (1200×630). Branded card: black field,
// red STRETCH wordmark, tagline. Rendered with next/og's ImageResponse (no
// external fonts, so it works offline and on the edge).
import { ImageResponse } from 'next/og';
import { brand } from '@/lib/site-config';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0A0A0A',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 54, height: 6, background: '#FF0000' }} />
          <div
            style={{
              marginLeft: 22,
              color: '#9A968F',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 6,
              textTransform: 'uppercase',
            }}
          >
            Stretch ceilings &amp; walls
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              fontSize: 188,
              fontWeight: 900,
              letterSpacing: -8,
              color: '#FFFFFF',
              lineHeight: 1,
            }}
          >
            STRETCH
            <span style={{ color: '#FF0000', fontSize: 64, marginTop: 16 }}>&reg;</span>
          </div>
          <div style={{ display: 'flex', color: '#B6B2AB', fontSize: 40, marginTop: 18 }}>
            {brand.tagline}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#6E6B66', fontSize: 22, letterSpacing: 1 }}>
            {brand.domain}
          </div>
          <div style={{ display: 'flex', color: '#9A968F', fontSize: 22, letterSpacing: 2, textTransform: 'uppercase' }}>
            Hand made in Belgium
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
