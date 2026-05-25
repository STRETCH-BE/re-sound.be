import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Dynamic OG image for the sitewide / homepage / non-product pages.
 *
 * Defensive design notes:
 *   - Solid background, no linear-gradient (Satori on edge runtime
 *     can render gradients as blank in some cases).
 *   - ASCII-only text (no recycle glyphs / middle dots) — Satori
 *     skips glyphs that the default font doesn't ship, and a single
 *     missing glyph can fail the whole render silently on edge.
 *   - System font stack so we never depend on a font being fetched.
 */

export const runtime = 'edge';

const BRAND = '#197FC7';
const DARK = '#0a1628';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') ?? 'en';
  const page = searchParams.get('page') ?? '';

  const titleByPage: Record<string, string> = {
    home: 'Acoustics Made Circular',
    products: 'Circular Acoustic Panels',
    about: 'About Re-Sound',
    sustainability: 'Circular by Design',
    contact: 'Get in Touch',
    faq: 'Frequently Asked Questions',
    blog: 'Insights & Articles',
  };

  const title = titleByPage[page] || 'Acoustics Made Circular';
  const tagline = 'Recycled by Origin. Circular by Design.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          backgroundColor: BRAND,
          backgroundImage: `linear-gradient(135deg, ${BRAND} 0%, ${DARK} 100%)`,
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Re-Sound
          </div>
          <div
            style={{
              padding: '6px 14px',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {locale.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              fontWeight: 400,
              opacity: 0.9,
            }}
          >
            {tagline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
            opacity: 0.8,
          }}
        >
          <div>re-sound.be</div>
          <div>Recycled input / Made in Europe / Free take-back</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    }
  );
}
