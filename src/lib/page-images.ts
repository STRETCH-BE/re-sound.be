// =============================================================================
// PAGE IMAGES — hero/feature photos for the non-product pages.
//
// HOW TO ADD A PHOTO:
//   1. Drop the file into  public/images/pages/  (create the folder if needed).
//   2. Set the matching path below, e.g.  partners: '/images/pages/partners.jpg'.
//   3. Commit & push.
//
// Empty string ('') keeps the branded placeholder. Filenames are case-sensitive
// on Vercel — match them EXACTLY. Suggested ~1600px long edge, optimised.
//
// (Inspiration / portfolio photos live with each project in content.ts via the
//  project `image:` field — not here.)
// =============================================================================

export const pageImages = {
  // Partners page — an installer / team / handshake photo (portrait-ish 4:3).
  partners: '', // public/images/pages/partners.jpg

  // Installer training page — a workshop / training-in-progress photo (4:3).
  training: '/images/pages/training.jpg', // membrane tuck-in during a workshop session

  // About page — your workshop or team (4:3).
  about: '', // public/images/pages/about.jpg

  // Contact page — workshop exterior, map, or a welcoming shot (tall block).
  contact: '', // public/images/pages/contact.jpg
};
