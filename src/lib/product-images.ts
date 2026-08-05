// =============================================================================
// PRODUCT (SOLUTION) PAGE IMAGES — control panel for all five product pages.
//
// HOW TO ADD PHOTOS:
//   1. Drop files into  public/images/products/  (create the folder if needed).
//   2. Set the matching path below, e.g.  hero: '/images/products/polyester-hero.jpg'.
//   3. Commit & push.
//
// Each product page uses ONE hero photo + THREE feature photos (one per feature
// row, in order). Empty string ('') keeps the branded placeholder, so you can
// fill these in gradually. The "related solutions" thumbnails reuse each
// product's own hero automatically — no extra files needed.
//
// PHOTOS vs DIAGRAMS: a plain path string is treated as a photo (fills + crops
// its slot). For an infographic/diagram that must NOT be cropped, use an object
// instead:  { src: '/images/products/x.jpg', fit: 'contain', ratio: '1/1', bg: '#ffffff' }
//   • fit: 'contain' shows the whole image (no crop)
//   • ratio matches the image shape ('1/1' square, '4/3', '16/9', …)
//   • bg fills any letterbox margin
//
// Filenames are case-sensitive on Vercel: match them EXACTLY.
// Suggested: JPG/WebP, ~1600px long edge, hero landscape ~4:3, features ~16:11.
// =============================================================================

export type ProductImage =
  | string
  | { src: string; fit?: 'cover' | 'contain'; ratio?: string; bg?: string };

export type ProductImageSet = { hero: ProductImage; features: ProductImage[] };

// Normalises a manifest entry (string OR options object) into concrete props.
// `fallbackRatio` is the slot's default shape when an image doesn't override it.
export function pimg(
  img: ProductImage | undefined,
  fallbackRatio: string,
): { src: string; fit: 'cover' | 'contain'; ratio: string; bg?: string } {
  if (!img) return { src: '', fit: 'cover', ratio: fallbackRatio };
  if (typeof img === 'string') return { src: img, fit: 'cover', ratio: fallbackRatio };
  return { src: img.src, fit: img.fit ?? 'cover', ratio: img.ratio ?? fallbackRatio, bg: img.bg };
}

export const productImages: Record<string, ProductImageSet> = {
  // ---- Polyester ----------------------------------------------------------
  'polyester-stretch-ceiling': {
    hero: '/images/products/polyester-stretch-ceiling-hero.jpg',
    features: [
      '/images/products/polyester-stretch-ceiling-detail.jpg', // [0] Cold installation
      '/images/products/polyester-stretch-ceiling-matt-finish.jpg', // [1] A very matte finish
      '/images/products/polyester-acoustic-stretch-ceiling.jpg', // [2] Acoustic & washable
    ],
  },
  // ---- PVC film -----------------------------------------------------------
  'pvc-stretch-ceiling': {
    hero: '/images/products/pvc-stretch-ceiling-hero.jpg',
    features: [
      '/images/products/pvc-stretch-ceiling-sustainable.jpg', // [0] Recyclable to raw material
      '/images/products/pvc-stretch-ceiling-iluminated.jpg', // [1] Backlight & print ready
      '/images/products/pvc-stretch-ceiling-removable.jpg', // [2] Removable & washable
    ],
  },
  // ---- Acoustic -----------------------------------------------------------
  'acoustic-stretch-system': {
    hero: '/images/products/acoustic-stretch-ceiling-hero.jpg',
    features: [
      // Square infographic — show it in full (no crop) on a white panel.
      {
        src: '/images/products/acoustic-stretch-ceiling-absorbtion.jpg',
        fit: 'contain',
        ratio: '1/1',
        bg: '#ffffff',
      }, // [0] Class A absorption
      '/images/products/acoustic-panels.jpg', // [1] Islands & wall panels
      '/images/products/invisible-audio.jpg', // [2] Invisible audio
    ],
  },
  // ---- Light & Print ------------------------------------------------------
  'light-print-stretch-ceiling': {
    hero: '/images/products/illuminated-stretch-ceiling.jpg',
    features: [
      '/images/products/shadowless-illuminated-stretch-ceiling.jpg', // [0] Even backlighting
      '', // [1] LED line lighting
      '/images/products/illuminated-printed-stretch-ceiling.jpg', // [2] Printed designs (Veta interieur bathroom)
    ],
  },
  // ---- Prefab (coming soon — fill in when ready) --------------------------
  'prefab-ceiling-unit': {
    hero: '/images/products/stretch-ceiling-prefab-structure.jpg',
    features: ['', '', ''], // [0] click-fit  [1] made to measure  [2] inspection hatch
  },
  // ---- Starry sky (sub-page) ----------------------------------------------
  'starry-sky': {
    hero: '/images/products/starsky-stretch-ceiling.jpg', // a dark fibre-optic starry-sky ceiling — starry-sky-hero.jpg
    features: [
      '', // [0] A real night sky
      '', // [1] Fibre-optic & LED
      '', // [2] Cinema, bedroom, spa
    ],
  },
  // ---- Inspection hatch (sub-page) ----------------------------------------
  'inspection-hatch': {
    hero: '/images/products/stretch-ceiling-inspection-hatch.jpg', // a near-invisible hatch in a stretch ceiling — inspection-hatch-hero.jpg
    features: [
      '', // [0] Invisible until you need it
      '', // [1] Service without damage
      '', // [2] Any size, any room
    ],
  },
  // ---- Custom print (sub-page) --------------------------------------------
  'custom-print': {
    hero: '/images/products/printed-stretch-ceiling.jpg', // a printed / artwork ceiling — custom-print-hero.jpg
    features: [
      '', // [0] Your image, edge to edge — awaiting Bert Demasure_Blondeel Argendael print03.jpg
      '/images/products/printed-backlit-stretch-ceiling.jpg', // [1] Print plus backlight (Glennwood / Johnson & Johnson)
      '/images/products/custom-print-made-to-your-space.jpg', // [2] Made to your space (showroom coving)
    ],
  },
};

export function productImage(slug: string): ProductImageSet {
  return productImages[slug] ?? { hero: '', features: [] };
}
