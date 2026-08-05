// GET /api/og/[slug] — per-page Open Graph image. Looks up the slug in the
// product catalogue, then the blog, and renders its title onto the branded card.
// Falls back to the default tagline for unknown slugs.
import { ImageResponse } from 'next/og';
import { brand } from '@/lib/site-config';
import { getProduct } from '@/lib/products';
import { getBlogPost } from '@/lib/content';

export const runtime = 'edge';

export function GET(_req: Request, { params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  const post = product ? undefined : getBlogPost(params.slug);

  const kicker = product ? product.mount + ' · ' + product.category : post ? 'Guide · STRETCH' : 'Stretch ceilings & walls';
  const title = product ? product.name : post ? post.title : brand.tagline;

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
          padding: '68px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: 46, fontWeight: 900, letterSpacing: -2, color: '#FFFFFF' }}>
            STRETCH<span style={{ color: '#FF0000', fontSize: 20, marginTop: 4 }}>&reg;</span>
          </div>
          <div style={{ display: 'flex', color: '#9A968F', fontSize: 20, letterSpacing: 3, textTransform: 'uppercase' }}>
            {brand.domain}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
            <div style={{ width: 48, height: 6, background: '#FF0000' }} />
            <div style={{ marginLeft: 20, color: '#FF0000', fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase' }}>
              {kicker}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 34 ? 76 : 104,
              fontWeight: 900,
              letterSpacing: -4,
              color: '#FFFFFF',
              lineHeight: 1.02,
              maxWidth: 1040,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', color: '#B6B2AB', fontSize: 26 }}>{brand.tagline}</div>
          <div style={{ display: 'flex', color: '#6E6B66', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase' }}>
            Hand made in Belgium
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
