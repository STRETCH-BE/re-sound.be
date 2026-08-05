// =============================================================================
// APPLICATIONS — room-type landing pages (/applications/<slug>).
// Each pulls together the relevant solutions + portfolio projects for a space.
// `hero` reuses existing photos so pages show real images immediately; swap to
// dedicated shots in public/images/applications/ when you have them.
// =============================================================================

export type Application = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  metaDescription: string;
  intro: string;
  hero: string;
  benefits: { title: string; body: string }[];
  /** Product slugs to feature as recommended solutions. */
  solutionSlugs: string[];
  /** Portfolio project keys (content.ts) to show as selected work. */
  projectKeys: string[];
};

export const applications: Application[] = [
  {
    slug: 'living-cinema',
    name: 'Living rooms & home cinema',
    shortName: 'Living & cinema',
    eyebrow: 'Living & cinema',
    metaDescription:
      'Stretch ceilings for living rooms and home cinemas — seamless finishes, integrated lighting, fibre-optic starry skies and better acoustics, fitted in a day.',
    intro:
      'A flawless ceiling sets the tone of a living space. STRETCH gives you a perfectly smooth, seamless finish — with hidden lighting, a fibre-optic starry sky for the cinema, and acoustic comfort, all fitted cold in a single day.',
    hero: '/images/home/app-living.jpg',
    benefits: [
      { title: 'A seamless, perfect finish', body: 'No cracks, no joins and no repainting — a smooth membrane tensioned wall to wall, in a deep matte or any colour you like.' },
      { title: 'Cinema-ready atmosphere', body: 'Add a fibre-optic starry sky, integrated LED lines and dimmable backlight to set the perfect mood for movie nights.' },
      { title: 'Calmer, quieter rooms', body: 'An acoustic membrane tames echo in open-plan living spaces, so conversation and sound feel warmer and clearer.' },
    ],
    solutionSlugs: ['polyester-stretch-ceiling', 'starry-sky', 'acoustic-stretch-system'],
    projectKeys: ['living', 'cinema', 'light'],
  },
  {
    slug: 'bathroom-kitchen',
    name: 'Bathrooms & kitchens',
    shortName: 'Bathroom & kitchen',
    eyebrow: 'Bathroom & kitchen',
    metaDescription:
      'Humidity-proof stretch ceilings for bathrooms and kitchens — waterproof, mould-resistant and wipe-clean, with integrated lighting, fitted in a single day.',
    intro:
      'Bathrooms and kitchens are tough on ceilings. A STRETCH membrane is waterproof, mould-resistant and wipe-clean — hiding pipework and ducting behind a flawless surface, with downlights and extraction integrated neatly.',
    hero: '/images/home/app-bathroom.jpg',
    benefits: [
      { title: 'Humidity- and water-proof', body: 'The membrane shrugs off steam and splashes and will not flake, stain or grow mould like a painted or plastered ceiling.' },
      { title: 'Wipe-clean surface', body: 'A quick wipe keeps it looking new — ideal above showers, baths and cooking zones.' },
      { title: 'Neat, integrated services', body: 'Downlights, speakers, extraction and inspection hatches all integrate into the surface, hiding the pipework above.' },
    ],
    solutionSlugs: ['pvc-stretch-ceiling', 'prefab-ceiling-unit', 'inspection-hatch'],
    projectKeys: ['bathroom'],
  },
  {
    slug: 'office-retail',
    name: 'Offices & retail',
    shortName: 'Office & retail',
    eyebrow: 'Office & retail',
    metaDescription:
      'Stretch ceilings for offices, retail and hospitality — Class A acoustics, branded printed ceilings and integrated lighting, installed fast with minimal disruption.',
    intro:
      'Commercial spaces need to look sharp and sound right. STRETCH delivers Class A acoustic comfort, branded printed ceilings and integrated lighting — installed cold and fast, with minimal disruption to a working space.',
    hero: '/images/home/app-retail.jpg',
    benefits: [
      { title: 'Class A acoustic comfort', body: 'A micro-perforated acoustic ceiling cuts reverberation in open offices, meeting rooms and restaurants for clearer speech.' },
      { title: 'Branded, printed ceilings', body: 'Print any image, pattern or brand graphic edge-to-edge — a striking feature for retail, showrooms and hospitality.' },
      { title: 'Fast, low-disruption fit', body: 'Cold installation means no dust and no mess, with most rooms finished in a single day — ideal for occupied premises.' },
    ],
    solutionSlugs: ['acoustic-stretch-system', 'custom-print', 'light-print-stretch-ceiling'],
    projectKeys: ['office', 'commercial', 'acoustic'],
  },
];

export function getApplication(slug: string): Application | undefined {
  return applications.find((a) => a.slug === slug);
}

export const applicationSlugs = applications.map((a) => a.slug);
