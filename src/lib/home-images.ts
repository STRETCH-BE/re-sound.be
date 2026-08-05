// =============================================================================
// HOMEPAGE IMAGES — your control panel.
//
// Photos live in  public/images/home/  and are wired to each slot below.
// To swap a photo: replace the file in that folder (keep the same name), or
// change the path here. Empty string ('') = branded placeholder shows instead.
//
// NOTE ON FILENAMES: Vercel's servers are case-sensitive, so the path here must
// match the file name EXACTLY — e.g. "Hero.jpg" (capital H), not "hero.jpg".
// =============================================================================

export const homeImages = {
  // HERO — the showpiece. The rotating hero crossfades 4 background images.
  // Empty for now → branded placeholder tiles show. Drop a photo in
  // public/images/home/ and paste its path here (suggested names shown).
  hero: '/images/home/Hero.jpg', // (legacy single-hero slot, still on disk)
  heroSlides: {
    ceilings: '/images/home/hero-ceilings.jpg', // → '/images/home/hero-ceilings.jpg'
    acoustic: '/images/home/hero-acoustic.jpg', // → '/images/home/hero-acoustic.jpg'
    walls: '/images/home/hero-walls.jpg', //    → '/images/home/hero-walls.jpg'
    light: '/images/home/hero-light.jpg', //    → '/images/home/hero-light.jpg'
  },

  // WHY STRETCH — tall photo beside the benefit grid.
  whyStretch: '/images/home/why-stretch.jpg', // → '/images/home/why-stretch.jpg'

  // INSTALLER / PARTNER — full-height installer photo beside the red copy.
  installer: '/images/home/installer.jpg', // → '/images/home/installer.jpg'

  // CLOSING CTA — full-bleed background photo behind the dark overlay.
  ctaBand: '', // → '/images/home/cta-band.jpg'

  // SOLUTIONS — two room shots.
  solutionsPolyester: '/images/home/polyester.jpg',
  solutionsPvc: '/images/home/pvc.jpg',

  // ACOUSTICS — studio / office / cinema with an acoustic ceiling.
  acoustics: '/images/home/acoustics.jpg',

  // APPLICATIONS (bento grid) — keyed to each tile.
  app: {
    living: '/images/home/app-living.jpg',
    cinema: '/images/home/app-cinema.jpg',
    bathroom: '/images/home/app-bathroom.jpg',
    office: '/images/home/app-office.jpg',
    light: '/images/home/app-starry.jpg', // backlit / starry-sky tile
    commercial: '/images/home/app-retail.jpg', // retail / hotel tile
  },

  // SELECTED WORK — five portrait project photos, shown in this order.
  gallery: [
    '/images/home/gallery-1.jpg',
    '/images/home/gallery-2.jpg',
    '/images/home/gallery-3.jpg',
    '/images/home/gallery-4.jpg',
    '/images/home/gallery-5.jpg',
  ] as string[],
};
