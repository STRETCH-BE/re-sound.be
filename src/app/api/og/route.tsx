import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Dynamic OG image for the sitewide / homepage / non-product pages.
 *
 * Why dynamic: there were ~8 referenced static OG files in metadata
 * (og-default, og-home, og-about, og-products, og-sustainability, plus
 * product-specific ones) — none of them existed, so every share on
 * LinkedIn / WhatsApp / Slack / X rendered broken. A single dynamic
 * endpoint that can be themed per locale + page eliminates the drift.
 *
 * Uses `next/og` (built into Next.js 13.3+), so no extra dependency
 * vs. installing @vercel/og separately.
 *
 * Edge runtime keeps cold-start under ~200 ms; CDN cache is set generously
 * because the layout (brand colour, fixed copy) is stable.
 */

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

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
          background: `linear-gradient(135deg, ${BRAND} 0%, ${DARK} 100%)`,
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            Re-Sound
          </div>
          <div
            style={{
              padding: '4px 12px',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              opacity: 0.85,
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
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              fontWeight: 400,
              opacity: 0.85,
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
            fontSize: 20,
            opacity: 0.75,
          }}
        >
          <div>re-sound.be</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span>♻︎ Recycled input</span>
            <span>·</span>
            <span>Made in Europe</span>
            <span>·</span>
            <span>Free take-back</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      },
    }
  );
}
