import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { PRODUCTS as PRODUCT_DATA } from '@/data/products';

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
 *
 * All variants accept ?locale=en|nl|fr|de|... for the locale badge.
 *
 * Product families are colour-themed: textile uses the brand blue,
 * rWood a warm brown, rPET a sustainability green, and booths the
 * Re-Sound deep blue (sibling to brand blue, distinct enough to read
 * as a separate range at a glance).
 */

export const runtime = 'edge';

interface ProductMeta {
  name: string;
  category: string;
  spec: string;
  family: 'textile' | 'rwood' | 'rpet' | 'booth';
}

const MADE_IN: Record<string, string> = { BE: 'Made in Belgium', PL: 'Made in Poland' };

/** "Made in …" only when the country is confirmed in product data. */
function origin(slug: string): string[] {
  const madeIn = PRODUCT_DATA[slug]?.madeIn;
  return madeIn ? [MADE_IN[madeIn]] : [];
}

/** Recycled-content claim only when the figure is confirmed in product data. */
function recycled(slug: string, material: string): string[] {
  const pct = PRODUCT_DATA[slug]?.recycledContentPct;
  return pct === null || pct === undefined ? [`Recycled ${material}`] : [`${pct}% recycled ${material}`];
}

const spec = (...parts: Array<string | string[]>) => parts.flat().join(' / ');

const PRODUCTS: Record<string, ProductMeta> = {
  interior:           { name: 'Interior',         category: 'Modular acoustic wall panels',         spec: spec('Class A absorption', origin('interior')),                  family: 'textile' },
  solid:              { name: 'Solid',            category: 'Large-format acoustic wall panels',    spec: spec('Class A absorption', 'Hook install', origin('solid')),    family: 'textile' },
  divide:             { name: 'Divide',           category: 'Freestanding acoustic screens',         spec: spec('Dual-sided', 'Magnetic modular', origin('divide')),       family: 'textile' },
  'rwood-groove':     { name: 'rWood Groove',     category: 'Grooved acoustic wood panels',          spec: spec('FSC', 'Class A', origin('rwood-groove')),                 family: 'rwood'   },
  'rwood-perf':       { name: 'rWood Perf',       category: 'Perforated acoustic wood panels',       spec: spec('FSC', 'Broadband absorption', origin('rwood-perf')),      family: 'rwood'   },
  'rwood-micro':      { name: 'rWood Micro',      category: 'Micro-perforated wood panels',          spec: spec('FSC', 'Dual absorption', 'Backlit option'),               family: 'rwood'   },
  'rwood-veneer':     { name: 'rWood Panel',      category: 'Wood-veneer acoustic panels',           spec: spec('FSC', '10 species', 'Furniture-grade'),                   family: 'rwood'   },
  'rpet-panel':       { name: 'rPET Panel',       category: 'Flat recycled-PET acoustic panels',     spec: spec(recycled('rpet-panel', 'PET'), 'OEKO-TEX', origin('rpet-panel')), family: 'rpet' },
  'rpet-groove':      { name: 'rPET Groove',      category: 'Grooved recycled-PET panels',           spec: spec('12 colors', '3 thicknesses', 'B-s1,d0', origin('rpet-groove')), family: 'rpet' },
  'rpet-flex-groove': { name: 'rPET Flex Groove', category: 'Flexible recycled-PET panels',          spec: spec('Bendable', 'OEKO-TEX', origin('rpet-flex-groove')),       family: 'rpet'    },
  // ---- Re-Sound phone booth range ----
  'solo-eco':         { name: 'Solo ECO',         category: 'Entry-level one-person office phone booth', spec: 'Standing table / 1.1 m² / 5yr warranty',     family: 'booth'   },
  'solo-flex':        { name: 'Solo Flex',        category: 'One-person office phone booth',         spec: '24 dB(A) reduction / 1 m² / 5yr warranty',    family: 'booth'   },
  'duo':              { name: 'Duo',              category: 'Two-person office phone booth',         spec: 'Flex + Work modes / 2 m² / 5yr warranty',     family: 'booth'   },
  'modular-xl':       { name: 'Modular XL',       category: 'Scalable acoustic meeting pod',         spec: '25.9 dB(A) / Up to 10 people / Modular',      family: 'booth'   },
};

const FAMILY_BG: Record<ProductMeta['family'], string> = {
  textile: '#197FC7', // brand blue
  rwood:   '#8b6235', // warm wood
  rpet:    '#2e8a6f', // sustainability green
  booth:   '#0d3a5c', // deep blue (Re-Sound family, distinct from textile)
};

const PAGE_TITLES: Record<string, string> = {
  home: 'Acoustics Made Circular',
  products: 'Circular Acoustic Panels',
  'hub-rpet': 'PET Acoustic Panels',
  'hub-rwood': 'Wood Acoustic Panels',
  'hub-booths': 'Office Phone Booths',
  'booth-guide': 'Office Phone Booth Prices',
  about: 'About Re-Sound',
  sustainability: 'Circular by Design',
  contact: 'Get in Touch',
  faq: 'Frequently Asked Questions',
  blog: 'Insights and Articles',
  samples: 'Order a Sample Kit',
  'acoustic-calculator': 'Reverberation Time Calculator',
  manufacturing: 'Our Two Plants',
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
