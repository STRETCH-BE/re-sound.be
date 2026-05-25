import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Dynamic OG image — minimal version after v2 still rendered blank.
 *
 * The previous attempts (with gradients + fontFamily fallback chain) failed
 * on Vercel edge. This version strips everything to the basics that the
 * Next.js docs guarantee works:
 *   - no `fontFamily` (Satori uses its bundled default)
 *   - solid background colour (no gradient)
 *   - `no-store` cache so any earlier blank response is not served from CDN
 *     while we debug
 *
 * Once this is confirmed rendering, we can layer styling back on.
 */

export const runtime = 'edge';

const BRAND = '#197FC7';
const DARK = '#0a1628';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') ?? 'en').toUpperCase();
  const page = searchParams.get('page') ?? '';

  const titleByPage: Record<string, string> = {
    home: 'Acoustics Made Circular',
    products: 'Circular Acoustic Panels',
    about: 'About Re-Sound',
    sustainability: 'Circular by Design',
    contact: 'Get in Touch',
    faq: 'Frequently Asked Questions',
    blog: 'Insights and Articles',
  };
  const title = titleByPage[page] || 'Acoustics Made Circular';

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
          background: BRAND,
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: 44, fontWeight: 800 }}>Re-Sound</div>
          <div
            style={{
              padding: '6px 16px',
              border: '2px solid white',
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {locale}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              opacity: 0.9,
            }}
          >
            Recycled by Origin. Circular by Design.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            opacity: 0.85,
          }}
        >
          <div>re-sound.be</div>
          <div>Free take-back program</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // `no-store` while debugging — bypasses Vercel's CDN so any change
        // here is reflected on the next request. Tighten to a real cache
        // policy once this is confirmed rendering.
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
