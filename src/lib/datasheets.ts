// =============================================================================
// DATASHEETS — the downloadable technical documents library.
//
// HOW TO ADD / EDIT A DATASHEET:
//   1. Drop the PDF into  public/datasheets/  (create the folder if needed).
//   2. Add or edit an entry below. `file` is the public path to the PDF.
//   3. Commit & push.
//
// Every download is gated: the visitor must submit name + email + phone first
// (captured as a lead via /api/lead), then the file downloads.
//
// Filenames are case-sensitive on Vercel — match them EXACTLY. Group documents
// with `category`; the page lists them grouped, in the order below.
// =============================================================================

export type Datasheet = {
  /** Stable id (kebab-case) — also used for tracking. */
  slug: string;
  title: string;
  description: string;
  /** Grouping heading on the page (e.g. 'Ceiling systems', 'Compliance'). */
  category: string;
  /** Public path to the file, e.g. '/datasheets/acoustic-stretch-system.pdf'. */
  file: string;
  /** Shown on the button row, e.g. 'PDF'. */
  format?: string;
  /** Optional human size, e.g. '1.2 MB'. */
  sizeLabel?: string;
  /** Optional 'last updated' note, e.g. 'Jan 2026'. */
  updated?: string;
};

// NOTE: these are starter entries — replace the titles/paths with your actual
// datasheets, and add as many as you need. Each `file` must exist in
// public/datasheets/ or the download will 404 (the lead is still captured).
export const datasheets: Datasheet[] = [
  {
    slug: 'polyester-stretch-ceiling',
    title: 'Polyester stretch ceiling',
    description: 'Cold-mounted polyester membrane: spans, matte finish, fire rating, cleaning and warranty.',
    category: 'Ceiling systems',
    file: '/datasheets/polyester-stretch-ceiling.pdf',
    format: 'PDF',
    updated: 'Jan 2026',
  },
  {
    slug: 'pvc-stretch-ceiling',
    title: 'PVC film stretch ceiling',
    description: 'Heat-mounted PVC film: seamless to 5.7 m, finishes, recyclability, print and backlight options.',
    category: 'Ceiling systems',
    file: '/datasheets/pvc-stretch-ceiling.pdf',
    format: 'PDF',
    updated: 'Jan 2026',
  },
  {
    slug: 'acoustic-stretch-system',
    title: 'Acoustic stretch system',
    description: 'Micro-perforated acoustic membrane: αw and Class A values, absorber backing and build-up.',
    category: 'Ceiling systems',
    file: '/datasheets/acoustic-stretch-system.pdf',
    format: 'PDF',
    updated: 'Jan 2026',
  },
  {
    slug: 'light-print-stretch-ceiling',
    title: 'Illuminated ceiling',
    description: 'Translucent backlit and edge-to-edge printed ceilings: light build-up, LED options and print specs.',
    category: 'Ceiling systems',
    file: '/datasheets/light-print-stretch-ceiling.pdf',
    format: 'PDF',
    updated: 'Jan 2026',
  },
  {
    slug: 'fire-certifications',
    title: 'Fire ratings & certifications',
    description: 'Reaction-to-fire classifications and certificates for the STRETCH membrane range.',
    category: 'Compliance',
    file: '/datasheets/fire-certifications.pdf',
    format: 'PDF',
    updated: 'Jan 2026',
  },
];

/** Datasheets grouped by category, preserving array order. */
export function datasheetsByCategory(): { category: string; items: Datasheet[] }[] {
  const groups: { category: string; items: Datasheet[] }[] = [];
  for (const d of datasheets) {
    let g = groups.find((x) => x.category === d.category);
    if (!g) {
      g = { category: d.category, items: [] };
      groups.push(g);
    }
    g.items.push(d);
  }
  return groups;
}
