// =============================================================================
// PREFAB PAGES — content + image slots for the two prefab pages:
//   • Prefab Structures        → /products/prefab-ceiling-unit
//   • Prefab Lighting Elements → /products/prefab-lighting-elements
//
// Both render with <PrefabPage>. Drop photos/drawings into public/images/prefab/
// and set the paths below. Empty string ('') = branded placeholder.
//
// Section image slots:
//   • production.details  → one photo each (cutting / welding / powder-coating)
//   • showcase.items      → a technical `drawing` + the installed/finished
//                           `result`, side by side. Optional `result2` (e.g. a
//                           wider shot of the finished space) makes it a 3-up row.
// Filenames are case-sensitive on Vercel — match them exactly.
// =============================================================================

export type PrefabItem = { title: string; body: string };
export type PrefabDetail = { title: string; body: string; image: string };
export type PrefabShowcase = {
  title: string;
  meta?: string;
  summary: string;
  drawing: string; // technical drawing
  result: string; // installed & finished photo
  result2?: string; // optional extra photo — the finished space (renders a 3-up row)
};

export type PrefabPageData = {
  slug: string;
  name: string;
  eyebrow: string;
  metaDescription: string;
  intro: string;
  hero: string;
  makeHeading: string;
  make: PrefabItem[];
  materialsHeading: string;
  materials: PrefabItem[];
  production?: { heading: string; body: string; details: PrefabDetail[] };
  showcase?: { heading: string; items: PrefabShowcase[] };
  worldwide: string;
};

// --- Prefab structures -------------------------------------------------------
export const prefabStructures: PrefabPageData = {
  slug: 'prefab-ceiling-unit',
  name: 'Prefab Structures',
  eyebrow: 'Prefab structures',
  metaDescription:
    'Made-to-measure prefab carrier structures for stretch ceilings — aluminium, steel and wood beams, coving and height-difference details, cut, welded and powder-coated in-house and shipped worldwide.',
  intro:
    'Prefab carrier structures for stretch-ceiling projects — beams for raster and grid ceilings, coving for floating ceilings, and clean height-difference details. Every structure is made to measure to your drawings, entirely in-house in our own Polish production, and shipped worldwide to our dealers.',
  hero: '/images/prefab/prefab-structures-hero.jpg', // Uhoda tower — red backlit grid ceiling

  makeHeading: 'What we build',
  make: [
    { title: 'Beams — raster & grid ceilings', body: 'Pre-built beams that frame a stretch membrane into a raster or grid ceiling — repeatable modules, square to the millimetre and ready to mount on site.' },
    { title: 'Coving — floating ceilings', body: 'Perimeter coving that lifts a stretch ceiling off the walls for a floating, shadow-gap effect, with a channel for concealed lighting where needed.' },
    { title: 'Height-difference finishes', body: 'Stepped and multi-level carriers that take a stretch membrane across height changes cleanly — no messy build-up or guesswork on site.' },
  ],

  materialsHeading: 'Built in aluminium, steel or wood',
  materials: [
    { title: 'Aluminium', body: 'Lightweight, rigid and corrosion-free — ideal for large spans, humid rooms and integrated lighting profiles.' },
    { title: 'Steel', body: 'Maximum strength for large structures and heavy spans, powder-coated to suit the environment.' },
    { title: 'Wood (MDF / multiplex)', body: 'MDF, multiplex and other boards machined to shape for warm, complex or curved forms.' },
  ],

  production: {
    heading: 'Made in-house, made to measure',
    body: 'Every structure is engineered to your drawings and built entirely in-house in our own Polish production. Cutting, welding and powder-coating all happen under one roof — so we control quality and finish from raw profile to crated, ready-to-ship structure.',
    details: [
      { title: 'Cutting', body: 'Profiles cut to precise lengths and angles, so the structure goes together square and true.', image: '/images/prefab/detail-cutting.jpg' },
      { title: 'Welding', body: 'Clean, strong welds — ground back and finished so the joints disappear into the structure.', image: '/images/prefab/detail-welding.jpg' },
      { title: 'Powder-coating', body: 'A durable powder-coated finish in any RAL, applied in-house for a consistent, hard-wearing surface.', image: '/images/prefab/detail-powdercoating.jpg' },
    ],
  },

  showcase: {
    heading: 'From drawing to finished structure',
    items: [
      { title: 'Raster grid ceiling', meta: 'Aluminium', summary: 'The technical drawing of a raster beam grid, next to the finished structure installed and membrane-finished on site.', drawing: '', result: '' }, // prefab/show-raster-drawing.jpg / -result.jpg — photos still to come
      // BelOrta (Sint-Katelijne-Waver): production drawing SP-2025-11-45 + the installed round coving + the finished space.
      { title: 'Floating coving ceiling', meta: 'Aluminium coving', summary: 'A floating coving detail, from the production drawing to the installed, membrane-finished result.', drawing: '/images/prefab/show-coving-drawing.png', result: '/images/prefab/show-coving-result.jpg', result2: '/images/prefab/show-coving-result2.jpg' },
    ],
  },

  worldwide:
    'Every structure is crated and shipped worldwide, so our dealers anywhere can offer the same clean, repeatable result — without a workshop of their own.',
};

// --- Prefab lighting elements ------------------------------------------------
export const prefabLighting: PrefabPageData = {
  slug: 'prefab-lighting-elements',
  name: 'Prefab Lighting Elements',
  eyebrow: 'Prefab lighting elements',
  metaDescription:
    'Prefab lighting elements built from an aluminium structure and finished with a STRETCH membrane — luminous coves, light lines and backlit features, engineered to your drawings, built in-house and shipped worldwide.',
  intro:
    'Pre-assembled lighting elements built from an aluminium structure and finished with our stretch membrane — luminous coves, light lines and backlit features. Engineered to your drawings, built in-house in our Polish production, and shipped worldwide to our dealers.',
  hero: '/images/prefab/prefab-lighting-hero.jpg', // CitizenM San Francisco — lit ceiling element

  makeHeading: 'What we build',
  make: [
    { title: 'Luminous coves', body: 'Perimeter coves that wash a wall or ceiling with even, hidden light — built as a ready-to-mount aluminium element.' },
    { title: 'Light lines', body: 'Crisp recessed light lines integrated into a stretch surface for clean, architectural lighting.' },
    { title: 'Backlit features', body: 'Backlit panels and shapes finished with a translucent stretch membrane for an even, hotspot-free glow.' },
  ],

  materialsHeading: 'How they are built',
  materials: [
    { title: 'Aluminium structure', body: 'A precise, rigid aluminium frame machined to your dimensions — the backbone of every lighting element.' },
    { title: 'LED & diffusion', body: 'Dimmable LED, sized and placed for even output, with the membrane diffusing the light smoothly.' },
    { title: 'Stretch membrane finish', body: 'A translucent or printed STRETCH membrane tensioned over the frame for a flawless luminous surface.' },
  ],

  showcase: {
    heading: 'From drawing to finished element',
    items: [
      { title: 'Luminous cove', meta: 'Aluminium + membrane', summary: 'The drawing of a perimeter light cove, next to the finished, glowing element installed on site.', drawing: '', result: '' }, // prefab/show-cove-drawing.jpg / -result.jpg
      { title: 'Backlit feature', meta: 'Aluminium + LED + membrane', summary: 'A backlit feature panel, from production drawing to the even, hotspot-free finished result.', drawing: '', result: '' }, // prefab/show-panel-drawing.jpg / -result.jpg
    ],
  },

  worldwide:
    'Like all our prefab elements, lighting features are crated and shipped worldwide — built and tested here, ready to install there.',
};

export const prefabPages: Record<string, PrefabPageData> = {
  'prefab-ceiling-unit': prefabStructures,
  'prefab-lighting-elements': prefabLighting,
};
