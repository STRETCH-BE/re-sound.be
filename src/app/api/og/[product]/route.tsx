import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Per-product dynamic OG image.
 *
 *   /api/og/rwood-groove?locale=en
 *
 * Defensive design notes (after a v1 that rendered blank on Vercel edge):
 *   - Solid background per family + supplementary gradient. Solid colour
 *     guarantees a visible background even if Satori skips the gradient.
 *   - ASCII-only text. Greek alpha and dot separators are out — a single
 *     unrenderable glyph can fail the whole image silently on edge.
 *   - System-font stack so we never block on a font fetch.
 */

export const runtime = 'edge';

interface RouteParams {
  params: { product: string };
}

interface ProductMeta {
  name: string;
  category: string;
  spec: string;
  family: 'textile' | 'rwood' | 'rpet';
}

const PRODUCTS: Record<string, ProductMeta> = {
  interior:           { name: 'Interior',         category: 'Modular acoustic wall panels',         spec: 'Class A absorption / Made in Belgium',         family: 'textile' },
  solid:              { name: 'Solid',            category: 'Large-format acoustic wall panels',     spec: 'Class A absorption / Hook install / Belgium',  family: 'textile' },
  divide:             { name: 'Divide',           category: 'Freestanding acoustic screens',         spec: 'Dual-sided / Magnetic modular / Belgium',     family: 'textile' },
  'rwood-groove':     { name: 'rWood Groove',     category: 'Grooved acoustic wood panels',          spec: 'FSC / Class A / Made in Europe',               family: 'rwood'   },
  'rwood-perf':       { name: 'rWood Perf',       category: 'Perforated acoustic wood panels',       spec: 'FSC / Broadband absorption / Europe',         family: 'rwood'   },
  'rwood-micro':      { name: 'rWood Micro',      category: 'Micro-perforated wood panels',          spec: 'FSC / Dual absorption / Backlit option',      family: 'rwood'   },
  'rwood-veneer':     { name: 'rWood Panel',      category: 'Wood-veneer acoustic panels',           spec: 'FSC / 10 species / Furniture-grade',          family: 'rwood'   },
  'rpet-panel':       { name: 'rPET Panel',       category: 'Flat recycled-PET acoustic panels',     spec: '100% recycled PET / OEKO-TEX / Belgium',      family: 'rpet'    },
  'rpet-groove':      { name: 'rPET Groove',      category: 'Grooved recycled-PET panels',           spec: '12 colors / 3 thicknesses / B-s1,d0',         family: 'rpet'    },
  'rpet-flex-groove': { name: 'rPET Flex Groove', category: 'Flexible recycled-PET panels',          spec: 'Bendable / OEKO-TEX / Made in Belgium',       family: 'rpet'    },
};

const FAMILY_BG: Record<ProductMeta['family'], { solid: string; gradient: string }> = {
  textile: { solid: '#197FC7', gradient: 'linear-gradient(135deg, #197FC7 0%, #0a1628 100%)' },
  rwood:   { solid: '#8b6235', gradient: 'linear-gradient(135deg, #8b6235 0%, #2a1810 100%)' },
  rpet:    { solid: '#2e8a6f', gradient: 'linear-gradient(135deg, #2e8a6f 0%, #0a1f1a 100%)' },
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') ?? 'en';
  const slug = params.product;
  const product = PRODUCTS[slug];
  const bg = FAMILY_BG[product?.family ?? 'textile'];

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
          backgroundColor: bg.solid,
          backgroundImage: bg.gradient,
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em' }}>
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
              fontSize: 30,
              fontWeight: 500,
              opacity: 0.85,
              letterSpacing: '0.02em',
              marginBottom: 16,
            }}
          >
            {product?.category ?? 'Circular acoustic panels'}
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.0,
            }}
          >
            {product?.name ?? 'Re-Sound'}
          </div>
          {product && (
            <div
              style={{
                marginTop: 28,
                fontSize: 26,
                fontWeight: 400,
                opacity: 0.9,
              }}
            >
              {product.spec}
            </div>
          )}
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
          <div>
            re-sound.be/{locale}/products/{slug}
          </div>
          <div>Free take-back program</div>
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
