// =============================================================================
// TECHNICAL HUB — per-membrane documentation pages surfaced in the Technical
// mega-menu. Datasheet / Colours / FAQ reuse existing product data; Fire safety,
// Installation and Specification are NEW drafted content (verify before launch).
// Routes: /technical/{membrane}/{topic}  e.g. /technical/polyester/datasheet
// =============================================================================

export type TechTopicKey =
  | 'datasheet'
  | 'colours'
  | 'fire-safety'
  | 'installation'
  | 'specification'
  | 'faq';

export type TechMembraneKey = 'polyester' | 'pvc';

export const techTopics: { key: TechTopicKey; label: string; sub: string }[] = [
  { key: 'datasheet', label: 'Datasheet', sub: 'Specs & download' },
  { key: 'colours', label: 'Colours & finishes', sub: 'Full range' },
  { key: 'fire-safety', label: 'Fire safety', sub: 'Reaction-to-fire & A2' },
  { key: 'installation', label: 'Installation guide', sub: 'Step by step' },
  { key: 'specification', label: 'Specification text', sub: 'For tenders' },
  { key: 'faq', label: 'FAQ', sub: 'Common questions' },
];

export const techTopicKeys = techTopics.map((t) => t.key);
export const isTechTopic = (s: string): s is TechTopicKey => (techTopicKeys as string[]).includes(s);
export const isTechMembrane = (s: string): s is TechMembraneKey => s === 'polyester' || s === 'pvc';

export type TechMembrane = {
  key: TechMembraneKey;
  productSlug: string;
  label: string; // 'Polyester stretch ceiling'
  short: string; // 'Polyester'
  blurb: string; // one-line hub intro
  fireSafety: { intro: string; rows: { k: string; v: string }[]; body: string[] };
  installation: { intro: string; steps: { title: string; body: string }[] };
  specification: { intro: string; clause: string };
};

export const techMembranes: Record<TechMembraneKey, TechMembrane> = {
  polyester: {
    key: 'polyester',
    productSlug: 'polyester-stretch-ceiling',
    label: 'Polyester stretch ceiling',
    short: 'Polyester',
    blurb: 'Cold-mounted polyester membrane — a very matte, seamless ceiling tensioned by hand.',
    fireSafety: {
      intro:
        'The polyester membrane is classified B-s1,d0 to EN 13501-1 — flame-retardant, with very limited smoke and no flaming droplets. A non-combustible A2-s1,d0 version is available where the strictest fire requirements apply.',
      rows: [
        { k: 'Standard classification', v: 'B-s1,d0' },
        { k: 'Non-combustible option', v: 'A2-s1,d0' },
        { k: 'Smoke production', v: 's1 — very limited' },
        { k: 'Flaming droplets', v: 'd0 — none' },
        { k: 'Test standard', v: 'EN 13501-1' },
      ],
      body: [
        'The classification B-s1,d0 means the membrane is flame-retardant (B), produces very little smoke (s1) and releases no burning droplets (d0) — the combination most public and commercial interiors require.',
        'For escape routes, high-rise buildings, hospitals and other projects where a non-combustible lining is specified, the A2-s1,d0 version meets that higher requirement while keeping the same seamless, very matte appearance.',
        'Reaction-to-fire certificates and declarations of performance are available on request for inclusion in your fire dossier.',
      ],
    },
    installation: {
      intro:
        'Polyester is tensioned cold — no heat guns, no drying time, no fumes. A two-person team typically completes a room in a single day, even in furnished, occupied spaces.',
      steps: [
        { title: 'Survey & measure', body: 'The room is laser-measured and the membrane is cut and welded to a single seamless panel up to 5.15 m wide, made to the exact shape of the room.' },
        { title: 'Fit the perimeter profile', body: 'A slim clip profile is fixed to the wall or ceiling at the chosen height, following straight runs, curves and corners.' },
        { title: 'Tension cold by hand', body: 'The cold membrane is clipped into the profile and hand-tensioned across the room, pulling drum-tight to a perfectly flat surface — with no heat involved.' },
        { title: 'Finish & detailing', body: 'Edges, corners and any integrated lighting or inspection hatches are detailed. There is no drying time, so the room is clean and back in use immediately.' },
      ],
    },
    specification: {
      intro: 'A copy-ready clause for tender and bestek documents. Adjust the bracketed values to your project.',
      clause:
        'Supply and install a cold-tensioned polyester stretch ceiling system [STRETCH or approved equivalent]. The membrane shall be a knitted polyester textile, tensioned cold into a perimeter clip profile without the application of heat, forming a seamless, very matte surface up to 5.15 m wide. Reaction to fire shall be class B-s1,d0 to EN 13501-1 (class A2-s1,d0 where indicated). The system shall be washable and humidity-resistant, suitable for installation in occupied spaces, and carry a manufacturer warranty of [10] years. Colour: [RAL ____]. Where an acoustic performance is specified, provide a micro-perforated membrane with high-density absorber backing achieving sound absorption up to class A.',
    },
  },
  pvc: {
    key: 'pvc',
    productSlug: 'pvc-stretch-ceiling',
    label: 'PVC stretch ceiling',
    short: 'PVC film',
    blurb: 'Heat-mounted PVC film — fully recyclable, removable and seamless to 6.4 m.',
    fireSafety: {
      intro:
        'The PVC film is classified B-s1,d0 to EN 13501-1 — flame-retardant, with very limited smoke development and no flaming droplets.',
      rows: [
        { k: 'Classification', v: 'B-s1,d0' },
        { k: 'Smoke production', v: 's1 — very limited' },
        { k: 'Flaming droplets', v: 'd0 — none' },
        { k: 'Test standard', v: 'EN 13501-1' },
      ],
      body: [
        'The classification B-s1,d0 means the film is flame-retardant (B), produces very little smoke (s1) and releases no burning droplets (d0), making it suitable for the great majority of residential and commercial interiors.',
        'Because the film is removable, it can be unclipped and re-tensioned for access to the services above without affecting its fire performance.',
        'Reaction-to-fire certificates and declarations of performance are available on request for your fire dossier.',
      ],
    },
    installation: {
      intro:
        'PVC film is warmed and tensioned on install — a tired ceiling becomes a flawless new one in a single day, with the old surface left in place underneath.',
      steps: [
        { title: 'Survey & measure', body: 'The room is measured and the film is high-frequency welded to size with a perimeter harpoon edge, made to the shape of the room and seamless up to 6.4 m wide.' },
        { title: 'Fit the perimeter profile', body: 'A harpoon/clip profile is fixed around the room at the chosen height, following the wall line and any features.' },
        { title: 'Heat & tension', body: 'The space is warmed with a heat source to soften the film; the harpoon edge is hooked into the profile and the film tensions taut and flat as it cools.' },
        { title: 'Finish & detailing', body: 'Edges, corners, light fittings and inspection hatches are finished. The film wipes clean and is immediately serviceable.' },
      ],
    },
    specification: {
      intro: 'A copy-ready clause for tender and bestek documents. Adjust the bracketed values to your project.',
      clause:
        'Supply and install a heat-tensioned PVC film stretch ceiling system [STRETCH or approved equivalent]. The membrane shall be a calendered PVC film, welded to size and tensioned with a perimeter harpoon/clip profile, forming a seamless surface up to 6.4 m wide in [matte / satin / gloss / translucent] finish. Reaction to fire shall be class B-s1,d0 to EN 13501-1. The film shall be 100% recyclable, removable and re-tensionable for access to the void above, washable and humidity-resistant, and carry a manufacturer warranty of [10] years. Colour/finish: [____]. Where backlighting is specified, provide a translucent film over an LED field for even, hotspot-free illumination.',
    },
  },
};
