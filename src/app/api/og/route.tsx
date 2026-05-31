import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

/**
 * Unified dynamic OG image route.
 *
 * Handles both the sitewide/homepage variant and per-product variants
 * via query parameters. We keep this as a single static route (no
 * dynamic [product] segment) because — for reasons unknown — the
 * dynamic-segment variant returned blank on Vercel edge runtime even
 * when the JSX was identical, while this static route renders fine.
 *
 * Routing:
 *   /api/og                                → homepage layout (default)
 *   /api/og?page=home                      → homepage layout
 *   /api/og?page=products                  → products-listing layout
 *   /api/og?page=about|sustainability|...  → page-specific titles
 *   /api/og?product=rwood-groove           → product-specific layout
 *   /api/og?product=solo-flex              → STRETCH-branded booth layout
 *
 * All variants accept ?locale=en|nl|fr|de|... for the locale badge.
 *
 * Brand override: products with `brand: 'STRETCH'` (the booth family)
 * render with the STRETCH wordmark instead of Re-Sound. Kept as a single
 * route so we don't fragment OG infra across brands.
 */

export const runtime = 'edge';

interface ProductMeta {
  name: string;
  category: string;
  spec: string;
  family: 'textile' | 'rwood' | 'rpet' | 'booth';
  /** Wordmark override — defaults to "Re-Sound" if absent */
  brand?: string;
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
  // ---- STRETCH white-label soundbooth range ----
  'solo-flex':        { name: 'Solo Flex',        category: 'Single-person soundbooth',              spec: '24 dB(A) reduction / 1 m² / 5yr warranty',    family: 'booth',  brand: 'STRETCH' },
  'duo':              { name: 'Duo',              category: 'Two-configuration soundbooth',          spec: '26 dB(A) / Flex + Work modes / 5yr',          family: 'booth',  brand: 'STRETCH' },
  'modular-xl':       { name: 'Modular XL',       category: 'Scalable meeting pod',                  spec: '25.9 dB(A) / Up to 10 people / Modular',      family: 'booth',  brand: 'STRETCH' },
};

const FAMILY_BG: Record<ProductMeta['family'], string> = {
  textile: '#197FC7',
  rwood:   '#8b6235',
  rpet:    '#2e8a6f',
  booth:   '#14110D',
};

const PAGE_TITLES: Record<string, string> = {
  home: 'Acoustics Made Circular',
  products: 'Circular Acoustic Panels',
  about: 'About Re-Sound',
  sustainability: 'Circular by Design',
  contact: 'Get in Touch',
  faq: 'Frequently Asked Questions',
  blog: 'Insights and Articles',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = (searchParams.get('locale') ?? 'en').toUpperCase();
  const page = searchParams.get('page') ?? '';
  const productSlug = searchParams.get('product') ?? '';

  const product = productSlug ? PRODUCTS[productSlug] : null;
  const isProductVariant = !!product;

  const bg = isProductVariant
    ? FAMILY_BG[product!.family]
    : '#197FC7';

  // Wordmark — STRETCH for booth products, Re-Sound for everything else
  const brand = product?.brand ?? 'Re-Sound';

  // For product variant: category label + product name + spec line
  // For page variant:    title + sitewide tagline
  const headline = isProductVariant ? product!.name : (PAGE_TITLES[page] || 'Acoustics Made Circular');
  const subline = isProductVariant ? product!.spec : 'Recycled by Origin. Circular by Design.';
  const overline = isProductVariant ? product!.category : '';
  const footerLeft = isProductVariant
    ? `re-sound.be/products/${productSlug}`
    : 're-sound.be';
  const footerRight = product?.family === 'booth'
    ? 'EU-wide delivery / 5yr warranty'
    : 'Free take-back program';

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
          <div style={{ fontSize: 44, fontWeight: 800 }}>{brand}</div>
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
          {overline ? (
            <div style={{ fontSize: 32, opacity: 0.85, marginBottom: 16 }}>
              {overline}
            </div>
          ) : null}
          <div
            style={{
              fontSize: isProductVariant ? 104 : 88,
              fontWeight: 800,
              lineHeight: 1.0,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 28,
              opacity: 0.9,
            }}
          >
            {subline}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 22,
            opacity: 0.8,
          }}
        >
          <div>{footerLeft}</div>
          <div>{footerRight}</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
