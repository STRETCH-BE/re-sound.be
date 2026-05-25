import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Per-product dynamic OG image — minimal version.
 *
 * See /api/og/route.tsx for the rationale (gradients + fontFamily fallback
 * caused blank renders on Vercel edge). This route uses the same stripped-
 * down formula: solid background, no fontFamily, no-store cache.
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
  interior:           { name: 'Interior',         category: 'Modular acoustic wall panels',         spec: 'Class A absorption / Made in Belgium',        family: 'textile' },
  solid:              { name: 'Solid',            category: 'Large-format acoustic wall panels',    spec: 'Class A absorption / Hook install',           family: 'textile' },
  divide:             { name: 'Divide',           category: 'Freestanding acoustic screens',         spec: 'Dual-sided / Magnetic modular',              family: 'textile' },
  'rwood-groove':     { name: 'rWood Groove',     category: 'Grooved acoustic wood panels',          spec: 'FSC / Class A / Made in Europe',              family: 'rwood'   },
  'rwood-perf':       { name: 'rWood Perf',       category: 'Perforated acoustic wood panels',       spec: 'FSC / Broadband absorption',                 family: 'rwood'   },
  'rwood-micro':      { name: 'rWood Micro',      category: 'Micro-perforated wood panels',          spec: 'FSC / Dual absorption / Backlit option',     family: 'rwood'   },
  'rwood-veneer':     { name: 'rWood Panel',      category: 'Wood-veneer acoustic panels',           spec: 'FSC / 10 species / Furniture-grade',         family: 'rwood'   },
  'rpet-panel':       { name: 'rPET Panel',       category: 'Flat recycled-PET acoustic panels',     spec: '100% recycled PET / OEKO-TEX',               family: 'rpet'    },
  'rpet-groove':      { name: 'rPET Groove',      category: 'Grooved recycled-PET panels',           spec: '12 colors / 3 thicknesses / B-s1,d0',        family: 'rpet'    },
  'rpet-flex-groove': { name: 'rPET Flex Groove', category: 'Flexible recycled-PET panels',          spec: 'Bendable / OEKO-TEX / Made in Belgium',     family: 'rpet'    },
};

const FAMILY_BG: Record<ProductMeta['family'], string> = {
  textile: '#197FC7',
  rwood:   '#8b6235',
  rpet:    '#2e8a6f',
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') ?? 'en').toUpperCase();
  const slug = params.product;
  const product = PRODUCTS[slug];
  const bg = product ? FAMILY_BG[product.family] : FAMILY_BG.textile;

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
          background: bg,
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
          <div style={{ fontSize: 32, opacity: 0.85, marginBottom: 16 }}>
            {product?.category ?? 'Circular acoustic panels'}
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              lineHeight: 1.0,
            }}
          >
            {product?.name ?? 'Re-Sound'}
          </div>
          {product && (
            <div
              style={{
                marginTop: 28,
                fontSize: 28,
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
            fontSize: 22,
            opacity: 0.8,
          }}
        >
          <div>re-sound.be/products/{slug}</div>
          <div>Free take-back program</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
