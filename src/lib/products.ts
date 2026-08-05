// ============================================================================
// PRODUCT CATALOG
// Data mirrors the Solution Page mockup exactly (names, intros, specs, colours,
// applications). FAQs are DRAFTED for SEO/AEO + FAQPage schema and flagged in
// CHANGES.md for client review — they are not in the source mockup.
// ============================================================================

export type Spec = { k: string; v: string };
export type Highlight = { value: string; label: string };
export type Feature = { title: string; body: string };
export type Faq = { q: string; a: string };
import type { ColourEntry } from '@/lib/polyester-colours';
import { polyesterColours } from '@/lib/polyester-colours';
import { pvcColours } from '@/lib/pvc-colours';

export type Product = {
  /** URL slug (kebab-case). */
  slug: string;
  /** Short data key used in the mockup (polyester/pvc/...). */
  key: string;
  name: string;
  short: string;
  category: string;
  mount: string;
  intro: string;
  /** One-line summary for cards / meta descriptions. */
  summary: string;
  chips: string[];
  highlights: Highlight[];
  features: Feature[];
  specs: Spec[];
  colours: string[];
  /** Optional rich colour chart (swatch + RAL + HEX). Falls back to `colours`. */
  colourChart?: ColourEntry[];
  /** Optional one-line note shown beside the colour chart. */
  colourChartNote?: string;
  applications: string[];
  /** Slugs of related products. */
  related: string[];
  material: string;
  countryOfOrigin: string;
  warrantyYears?: number;
  maxSeamlessWidthM?: number;
  faqs: Faq[];
  /** Show on the /products overview grid + ItemList. Default true; set false for
   *  sub-pages that should have their own page + mega-menu link but no top-level
   *  card on the overview grid. */
  listed?: boolean;
};

export const products: Product[] = [
  {
    slug: 'polyester-stretch-ceiling',
    key: 'polyester',
    name: 'Polyester Stretch Ceiling',
    short: 'Polyester',
    category: 'Cold-mounted membrane',
    mount: 'Cold mount',
    intro:
      'An aesthetic, functional stretch membrane for new build and renovation alike. Tensioned cold by hand for a flawless, very matte finish — with acoustic and washable options built in.',
    summary:
      'Cold-mounted polyester stretch ceiling with a very matte finish, seamless to 5.15 m and a 10-year warranty.',
    chips: ['Seamless to 5.15m', '+25-year lifespan', 'Up to Class A acoustic', 'Washable'],
    highlights: [
      { value: '5.15m', label: 'Seamless width' },
      { value: 'Cold', label: 'Mounting method' },
      { value: 'Matte', label: 'Surface look' },
      { value: 'A', label: 'Acoustic class' },
    ],
    features: [
      {
        title: 'Cold installation',
        body: 'No heat guns, no drying time. The polyester membrane is tensioned cold and clipped into a perimeter profile — clean, fast and fume-free, even in occupied rooms.',
      },
      {
        title: 'A very matte finish',
        body: 'A deep, glare-free matte surface that reads like freshly painted plaster — without the cracks, flaking or repainting that come with it.',
      },
      {
        title: 'Acoustic & washable',
        body: 'Choose a micro-perforated, absorber-backed version to tame reverberation. Every finish wipes clean and resists humidity for 25 years.',
      },
    ],
    specs: [
      { k: 'Material', v: 'Knitted polyester membrane' },
      { k: 'Mounting', v: 'Cold-tensioned, clip profile' },
      { k: 'Max seamless width', v: '5.15 m' },
      { k: 'Surface', v: 'Very matte' },
      { k: 'Fire rating', v: 'B-s1,d0 (A2 option)' },
      { k: 'Acoustic', v: 'Up to Class A (perforated)' },
      { k: 'Cleaning', v: 'Washable, humidity-proof' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['White', 'Off-white', 'Light grey', 'Anthracite', 'Sand', 'Custom RAL'],
    colourChart: polyesterColours,
    colourChartNote: 'Every colour is available in standard and acoustic finishes.',
    applications: ['Living room', 'Bathroom', 'Office', 'Home cinema', 'Healthcare', 'Retail'],
    related: ['pvc-stretch-ceiling', 'acoustic-stretch-system', 'light-print-stretch-ceiling'],
    material: 'Knitted polyester membrane',
    countryOfOrigin: 'EU',
    warrantyYears: 10,
    maxSeamlessWidthM: 5.15,
    faqs: [
      {
        q: 'How long does a polyester stretch ceiling take to install?',
        a: 'Most rooms are completed in a single day. A two-person team fits up to roughly 50 m² per day, and because the membrane is tensioned cold there is no drying time before the room is back in use.',
      },
      {
        q: 'Is the cold-mount method really dust-free?',
        a: 'Yes. There is no demolition of the existing ceiling, no sanding and no painting. The membrane clips into a slim perimeter profile, so installation is clean enough to carry out in furnished, occupied rooms.',
      },
      {
        q: 'Can a polyester ceiling improve a room’s acoustics?',
        a: 'A micro-perforated version backed with a high-density absorber reaches up to Class A sound absorption. It looks identical to the standard finish but measurably reduces reverberation and noise.',
      },
      {
        q: 'How do I clean and maintain it?',
        a: 'Wipe it down with a damp cloth. The surface is washable and humidity-proof, will not crack, flake or yellow, and never needs repainting across its 25-year warranty.',
      },
    ],
  },
  {
    slug: 'pvc-stretch-ceiling',
    key: 'pvc',
    name: 'PVC Film Stretch Ceiling',
    short: 'PVC Film',
    category: 'Heat-mounted film',
    mount: 'Heat mount',
    intro:
      'A warmed PVC film tensioned on install — fully recyclable and easily removable. Replace a tired ceiling with a flawless new one in a single day.',
    summary:
      'Heat-mounted PVC film stretch ceiling, 100% recyclable and removable, seamless to 6.4 m with a 10-year warranty.',
    chips: ['Seamless to 6.4 m', '100% recyclable', 'Easily removable', 'Washable'],
    highlights: [
      { value: '6.4m', label: 'Seamless width' },
      { value: 'Heat', label: 'Mounting method' },
      { value: '100%', label: 'Recyclable' },
      { value: 'A', label: 'Acoustic class' },
    ],
    features: [
      {
        title: 'Recyclable to raw material',
        body: 'The PVC system is fully recyclable back to raw material — a circular choice that is easy to remove and refit whenever you need to.',
      },
      {
        title: 'Backlight & print ready',
        body: 'Translucent films diffuse LED light evenly with no hotspots; any image, texture or starry sky can be printed edge-to-edge.',
      },
      {
        title: 'Removable & washable',
        body: 'Unclip for access to the services above, then re-tension in minutes. The film wipes clean and shrugs off humidity.',
      },
    ],
    specs: [
      { k: 'Material', v: 'Calendered PVC film' },
      { k: 'Mounting', v: 'Heat-tensioned, clip profile' },
      { k: 'Max seamless width', v: '6.4 m' },
      { k: 'Surface', v: 'Matte / satin / gloss / translucent' },
      { k: 'Fire rating', v: 'B-s1,d0' },
      { k: 'Acoustic', v: 'Up to Class A (perforated)' },
      { k: 'Cleaning', v: 'Washable, humidity-proof' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['White', 'Satin white', 'Translucent', 'Black gloss', 'Custom print', 'Custom RAL'],
    colourChart: pvcColours,
    colourChartNote: 'Available in matte, satin, gloss, translucent and metallic finishes.',
    applications: ['Bathroom', 'Pool & wellness', 'Retail', 'Hospitality', 'Office', 'Home cinema'],
    related: ['polyester-stretch-ceiling', 'acoustic-stretch-system', 'light-print-stretch-ceiling'],
    material: 'Calendered PVC film',
    countryOfOrigin: 'PL',
    warrantyYears: 10,
    maxSeamlessWidthM: 6.4,
    faqs: [
      {
        q: 'What makes a PVC stretch ceiling “100% recyclable”?',
        a: 'The film is recyclable back to raw material at the end of its life, and it is removable during use — you can unclip it to reach the services above and re-tension it in minutes, rather than tearing out and replacing a plasterboard ceiling.',
      },
      {
        q: 'How wide a span can a PVC ceiling cover without a seam?',
        a: 'Up to 6.4 m seamless — the widest in our range. Larger rooms can be covered by welding panels with a near-invisible joint or by introducing a deliberate profile line.',
      },
      {
        q: 'Is PVC film suitable for bathrooms and wet areas?',
        a: 'Yes. It is fully washable and humidity-proof, which makes it a popular choice for bathrooms, pools and wellness areas where a painted ceiling would blister or stain.',
      },
      {
        q: 'Can it be backlit or printed?',
        a: 'Translucent films diffuse an LED field evenly with no hotspots, and any photograph, pattern or starry-sky design can be printed edge-to-edge. See the Illuminated ceiling system for the full range.',
      },
    ],
  },
  {
    slug: 'acoustic-stretch-system',
    key: 'acoustic',
    name: 'Acoustic Stretch System',
    short: 'Acoustic',
    category: 'Sound-absorbing membrane',
    mount: 'Cold / heat',
    intro:
      'A micro-perforated stretch membrane backed with high-density absorbers — a flawless ceiling that measurably cuts reverberation and noise in any room.',
    summary:
      'Micro-perforated acoustic stretch membrane with high-density absorber backing, reaching up to Class A sound absorption.',
    chips: ['Up to Class A', 'Seamless surface', 'Invisible audio option', 'Washable face'],
    highlights: [
      { value: 'A', label: 'Absorption class' },
      { value: 'αw', label: 'Tested values' },
      { value: '0', label: 'Visible joints' },
      { value: '+25y', label: 'Lifespan' },
    ],
    features: [
      {
        title: 'Class A absorption',
        body: 'High-density polyester wool behind a micro-perforated face delivers up to Class A sound absorption with no visible treatment.',
      },
      {
        title: 'Islands & wall panels',
        body: 'Free-hanging baffles and decorative wall absorbers extend the same system to any surface in the room.',
      },
      {
        title: 'Invisible audio',
        body: 'Loudspeakers mount completely behind the film for clean, sourceless sound that fills the space.',
      },
    ],
    specs: [
      { k: 'Material', v: 'Perforated membrane + absorber' },
      { k: 'Mounting', v: 'Cold or heat, clip profile' },
      { k: 'Max seamless width', v: '5.15' },
      { k: 'Absorption', v: 'Up to Class A (αw)' },
      { k: 'Fire rating', v: 'B-s1,d0 (A2 option)' },
      { k: 'Backing', v: 'High-density polyester wool' },
      { k: 'Cleaning', v: 'Washable face' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['White', 'Off-white', 'Grey', 'Anthracite', 'Custom print', 'Custom RAL'],
    applications: ['Office', 'Restaurant', 'Studio', 'Home cinema', 'School', 'Healthcare'],
    related: ['polyester-stretch-ceiling', 'pvc-stretch-ceiling', 'light-print-stretch-ceiling'],
    material: 'Perforated membrane + polyester-wool absorber',
    countryOfOrigin: 'EU',
    warrantyYears: 10,
    faqs: [
      {
        q: 'How much does the acoustic system actually reduce noise?',
        a: 'With the high-density absorber backing it reaches up to Class A absorption (the highest rating), measured as αw values. In practice that turns a hard, echoey room into a calm, comfortable space without any visible acoustic panels.',
      },
      {
        q: 'Does the acoustic finish look different from a normal ceiling?',
        a: 'No. The absorption happens behind a micro-perforated membrane, so the ceiling reads as one flawless, seamless surface — the treatment is invisible.',
      },
      {
        q: 'Can speakers be hidden behind the ceiling?',
        a: 'Yes. Loudspeakers can be mounted completely behind the stretched film for clean, sourceless sound — a popular option for home cinemas and studios.',
      },
      {
        q: 'Where is the acoustic system most useful?',
        a: 'Anywhere reverberation is a problem: offices, restaurants, recording studios, schools, healthcare spaces and home cinemas. It can also extend to free-hanging islands and wall panels.',
      },
    ],
  },
  {
    slug: 'light-print-stretch-ceiling',
    key: 'light',
    name: 'Illuminated Ceiling',
    short: 'Illuminated',
    category: 'Translucent membrane',
    mount: 'Cold / heat',
    intro:
      'Translucent stretch films that turn an entire ceiling into a soft, even light source — or a printed canvas of any image you choose.',
    summary:
      'Translucent backlit stretch ceilings and edge-to-edge printed designs, including fibre-optic starry-sky finishes.',
    chips: ['Even backlight', 'LED line option', 'Edge-to-edge print', 'Seamless'],
    highlights: [
      { value: '360°', label: 'Even diffusion' },
      { value: 'RGB', label: 'LED options' },
      { value: 'Print', label: 'Any image' },
      { value: '5.15m', label: 'Seamless width' },
    ],
    features: [
      {
        title: 'Even backlighting',
        body: 'A translucent film over an LED field diffuses light with no hotspots — a luminous sky in any room, dimmable to suit the mood.',
      },
      {
        title: 'LED line lighting',
        body: 'Recessed light lines integrate seamlessly into the membrane for crisp, architectural lighting effects.',
      },
      {
        title: 'Printed designs',
        body: 'Any photograph, pattern or texture printed edge-to-edge — including a fibre-optic starry-sky night ceiling.',
      },
    ],
    specs: [
      { k: 'Material', v: 'Translucent PVC film' },
      { k: 'Mounting', v: 'Cold or heat, clip profile' },
      { k: 'Max seamless width', v: '5.15 m' },
      { k: 'Light source', v: 'LED field / line, dimmable' },
      { k: 'Print', v: 'Edge-to-edge, any image' },
      { k: 'Fire rating', v: 'B-s1,d0' },
      { k: 'Cleaning', v: 'Washable' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['Translucent white', 'Warm white', 'RGB', 'Starry sky', 'Custom print', 'Custom RAL'],
    applications: ['Home cinema', 'Bathroom', 'Retail', 'Hospitality', 'Spa', 'Office'],
    related: ['pvc-stretch-ceiling', 'acoustic-stretch-system', 'polyester-stretch-ceiling'],
    material: 'Translucent PVC film',
    countryOfOrigin: 'EU',
    warrantyYears: 10,
    maxSeamlessWidthM: 5.15,
    faqs: [
      {
        q: 'Will a backlit ceiling show hotspots from the LEDs?',
        a: 'No. The translucent film sits over an LED field and diffuses the light evenly across the whole surface, so you see a soft, uniform glow rather than individual points.',
      },
      {
        q: 'What can be printed on the ceiling?',
        a: 'Effectively any high-resolution image, pattern or texture — printed edge-to-edge with no visible seam. A common choice is a fibre-optic starry-sky ceiling for cinemas and bedrooms.',
      },
      {
        q: 'Can the lighting be dimmed or change colour?',
        a: 'Yes. Backlit ceilings are dimmable, and RGB LED options let you change colour and mood. LED line lighting can also be recessed into the membrane for a crisp architectural effect.',
      },
    ],
  },
  {
    slug: 'prefab-ceiling-unit',
    key: 'prefab',
    name: 'Prefab Structures',
    short: 'Prefab Structures',
    category: 'Prefab carrier structure',
    mount: 'Prefabricated',
    listed: false,
    intro:
      'Prefab carrier structures for stretch-ceiling projects — aluminium, steel and wood beams, coving and height-difference details, made to measure in our Polish production and shipped worldwide to our dealers.',
    summary:
      'Made-to-measure prefab structures in aluminium, steel and wood — beams for raster ceilings, coving for floating ceilings, and clean height-difference details.',
    chips: ['Aluminium / steel / wood', 'Beams & coving', 'Made to measure', 'Shipped worldwide'],
    highlights: [
      { value: '1', label: 'Day on site' },
      { value: 'Prefab', label: 'Built off-site' },
      { value: 'Access', label: 'Inspection hatch' },
      { value: '25y', label: 'Lifespan' },
    ],
    features: [
      {
        title: 'Built off-site',
        body: 'Modules are confectioned in our Belgian workshop and quality-checked before they ever reach the site.',
      },
      {
        title: 'Click-fit on site',
        body: 'Pre-tensioned units click into a perimeter frame — minimal trades, minimal time, a perfect result.',
      },
      {
        title: 'Integrated access',
        body: 'Discreet inspection hatches keep the services above reachable without breaking the clean ceiling line.',
      },
    ],
    specs: [
      { k: 'Material', v: 'Membrane on prefab frame' },
      { k: 'Mounting', v: 'Click-fit module' },
      { k: 'Lead time', v: 'Made to order' },
      { k: 'Access', v: 'Integrated inspection hatch' },
      { k: 'Fire rating', v: 'B-s1,d0 (A2 option)' },
      { k: 'Acoustic', v: 'Optional absorber backing' },
      { k: 'Cleaning', v: 'Washable' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['White', 'Off-white', 'Grey', 'Anthracite', 'Custom', 'Custom RAL'],
    applications: ['Bathroom pods', 'Hotels', 'Modular build', 'Healthcare', 'Retail', 'Office'],
    related: ['polyester-stretch-ceiling', 'pvc-stretch-ceiling', 'acoustic-stretch-system'],
    material: 'Membrane on prefab frame',
    countryOfOrigin: 'BE',
    warrantyYears: 25,
    faqs: [
      {
        q: 'What is a prefab stretch-ceiling unit?',
        a: 'It is a complete ceiling module — frame and tensioned membrane — assembled and quality-checked in our Belgian workshop, then delivered ready to click into a perimeter frame on site.',
      },
      {
        q: 'Why choose prefab over an on-site fit?',
        a: 'Prefab units suit modular construction and repeatable rooms such as hotel bathrooms and bathroom pods: most of the work happens off-site, so installation needs minimal trades and minimal time.',
      },
      {
        q: 'How do you access services above a prefab ceiling?',
        a: 'Each unit can include a discreet integrated inspection hatch, so pipework and services above stay reachable without breaking the clean ceiling line.',
      },
    ],
  },
  {
    slug: 'starry-sky',
    key: 'starry',
    name: 'Starry Sky Ceiling',
    short: 'Starry Sky',
    category: 'Fibre-optic / backlit',
    mount: 'Backlit',
    listed: false,
    intro:
      'A stretch ceiling scattered with hundreds of fibre-optic points — a calm, twinkling night sky over your cinema, bedroom or spa.',
    summary:
      'Fibre-optic and LED starry-sky stretch ceilings: hundreds of dimmable star points, optional shooting stars and RGB, on a seamless membrane.',
    chips: ['Hundreds of stars', 'Dimmable', 'Optional RGB', 'Shooting stars'],
    highlights: [
      { value: '500+', label: 'Star points' },
      { value: 'RGB', label: 'Colour options' },
      { value: '1 day', label: 'Installation' },
      { value: '10yr', label: 'Warranty' },
    ],
    features: [
      {
        title: 'A real night sky',
        body: 'Hundreds of fibre-optic points are set behind a tensioned membrane to create a deep, twinkling star field — mapped to a constellation or scattered at random.',
      },
      {
        title: 'Fibre-optic & LED',
        body: 'A single LED light engine drives every fibre, so the stars stay cool and fully dimmable. Add a twinkle wheel for movement, RGB for colour, or shooting-star effects.',
      },
      {
        title: 'Cinema, bedroom, spa',
        body: 'Perfect where you want atmosphere without glare — home cinemas, bedrooms, spas and restaurants. Combine with an acoustic backing for a calm, quiet room.',
      },
    ],
    specs: [
      { k: 'Effect', v: 'Fibre-optic star field' },
      { k: 'Membrane', v: 'Dark translucent / printed film' },
      { k: 'Star points', v: 'From ~150 to 1,000+' },
      { k: 'Light source', v: 'Single LED engine, dimmable' },
      { k: 'Options', v: 'Twinkle, RGB, shooting stars' },
      { k: 'Mounting', v: 'Tensioned clip profile' },
      { k: 'Cleaning', v: 'Washable' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['Deep blue', 'Black', 'Midnight', 'Custom print', 'Warm-white stars', 'RGB stars'],
    applications: ['Home cinema', 'Bedroom', 'Spa & wellness', 'Restaurant', 'Hospitality', 'Kids room'],
    related: ['light-print-stretch-ceiling', 'acoustic-stretch-system', 'pvc-stretch-ceiling'],
    material: 'Translucent PVC film + fibre optics',
    countryOfOrigin: 'EU',
    warrantyYears: 10,
    maxSeamlessWidthM: 6.4,
    faqs: [
      {
        q: 'How many stars can a starry-sky ceiling have?',
        a: 'Anywhere from around 150 points for a subtle effect to over a thousand for a dense, dramatic sky. The density is chosen to suit the room size and the mood you want.',
      },
      {
        q: 'Do the fibre-optic stars give off heat?',
        a: 'No. All the fibres are driven by a single remote LED light engine, so the points themselves stay completely cool — only the light travels through the fibre.',
      },
      {
        q: 'Can the stars twinkle or change colour?',
        a: 'Yes. An optional twinkle wheel makes the stars shimmer, RGB engines let you change colour, and shooting-star effects can be added for movement. Everything is dimmable.',
      },
    ],
  },
  {
    slug: 'inspection-hatch',
    key: 'hatch',
    name: 'Inspection Hatch',
    short: 'Inspection Hatch',
    category: 'Access solution',
    mount: 'Integrated',
    listed: false,
    intro:
      'Discreet, serviceable access through a stretch ceiling — reach valves, junction boxes and fittings without cutting or replacing the membrane.',
    summary:
      'Integrated inspection hatches for stretch ceilings: near-invisible, re-openable access to services hidden above the membrane, in any size.',
    chips: ['Near-invisible', 'Re-openable', 'Any size', 'Retrofit-ready'],
    highlights: [
      { value: 'Hidden', label: 'In the surface' },
      { value: 'Any', label: 'Size & shape' },
      { value: 'Re-open', label: 'As often as needed' },
      { value: '1 day', label: 'Installation' },
    ],
    features: [
      {
        title: 'Invisible until you need it',
        body: 'The hatch frame is built into the perimeter detailing and finished in the same membrane, so it disappears into the ceiling until it has to be opened.',
      },
      {
        title: 'Service without damage',
        body: 'Reach shut-off valves, junction boxes, dampers and light fittings hidden above the ceiling — and close it all up again, as many times as needed.',
      },
      {
        title: 'Any size, any room',
        body: 'From a small round access point to a large rectangular panel, sized to the service behind it. Works in new installs and as a retrofit into existing ceilings.',
      },
    ],
    specs: [
      { k: 'Type', v: 'Integrated access hatch' },
      { k: 'Finish', v: 'Matched to ceiling membrane' },
      { k: 'Shape', v: 'Round or rectangular' },
      { k: 'Size', v: 'Made to measure' },
      { k: 'Opening', v: 'Magnetic or hinged frame' },
      { k: 'Retrofit', v: 'Yes, into existing ceilings' },
      { k: 'Cleaning', v: 'Washable' },
      { k: 'Warranty', v: '10 years' },
    ],
    colours: ['Matched to membrane', 'White', 'Off-white', 'Grey', 'Anthracite', 'Custom RAL'],
    applications: ['Bathroom', 'Kitchen', 'Utility room', 'Office', 'Retail', 'Healthcare'],
    related: ['prefab-ceiling-unit', 'polyester-stretch-ceiling', 'pvc-stretch-ceiling'],
    material: 'Membrane + concealed frame',
    countryOfOrigin: 'BE',
    warrantyYears: 25,
    faqs: [
      {
        q: 'Can you access services behind a stretch ceiling?',
        a: 'Yes — an integrated inspection hatch gives discreet, re-openable access to valves, junction boxes and fittings above the membrane, so the ceiling never has to be cut or replaced to reach them.',
      },
      {
        q: 'Is the hatch visible in the ceiling?',
        a: 'Barely. The frame is built into the perimeter detailing and finished in the same membrane, so it blends into the surface and is only noticeable when you look for it.',
      },
      {
        q: 'Can a hatch be added to an existing stretch ceiling?',
        a: 'In most cases yes. Hatches can be retrofitted into an existing ceiling, sized and positioned to suit the service that needs access behind it.',
      },
    ],
  },
  {
    slug: 'custom-print',
    key: 'print',
    name: 'Custom Print Ceiling',
    short: 'Custom Print',
    category: 'Printed membrane',
    mount: 'Heat or cold',
    listed: false,
    intro:
      'Any photograph, artwork or pattern printed edge-to-edge across a seamless stretch ceiling — your image, wall to wall, with no visible join.',
    summary:
      'Edge-to-edge printed stretch ceilings: any high-resolution image, photo or brand graphic across a seamless membrane, optionally backlit.',
    chips: ['Any image', 'Edge-to-edge', 'Backlit option', 'Seamless'],
    highlights: [
      { value: 'Any', label: 'Image or art' },
      { value: 'HD', label: 'Photo-grade print' },
      { value: 'Backlit', label: 'Optional glow' },
      { value: '5.7m', label: 'Seamless width' },
    ],
    features: [
      {
        title: 'Your image, edge to edge',
        body: 'Supply a photo, illustration, brand graphic or pattern and we print it across the full membrane — colour-managed and seamless, with no panel lines.',
      },
      {
        title: 'Print plus backlight',
        body: 'Combine a translucent film with an LED field to backlight the print, turning artwork or a sky scene into a soft, glowing feature ceiling.',
      },
      {
        title: 'Made to your space',
        body: 'Artwork is scaled and positioned to your exact room. We proof the file with you before production, so what you approve is what goes up.',
      },
    ],
    specs: [
      { k: 'Print', v: 'Edge-to-edge, full colour' },
      { k: 'Resolution', v: 'Photo-grade, colour-managed' },
      { k: 'Membrane', v: 'PVC film (opaque or translucent)' },
      { k: 'Backlight', v: 'Optional LED field' },
      { k: 'Max seamless width', v: '5.7 m' },
      { k: 'Fire rating', v: 'B-s2,d0' },
      { k: 'Cleaning', v: 'Washable' },
      { k: 'Warranty', v: '25 years' },
    ],
    colours: ['Full-colour print', 'Photographic', 'Brand graphics', 'Patterns', 'Sky scenes', 'Custom artwork'],
    applications: ['Retail', 'Hospitality', 'Home cinema', 'Office', 'Showroom', 'Restaurant'],
    related: ['light-print-stretch-ceiling', 'starry-sky', 'pvc-stretch-ceiling'],
    material: 'Printed PVC film',
    countryOfOrigin: 'BE',
    warrantyYears: 25,
    maxSeamlessWidthM: 5.7,
    faqs: [
      {
        q: 'What image quality do I need for a printed ceiling?',
        a: 'A high-resolution file gives the best result. We review and colour-manage your artwork, scale it to the ceiling and proof it before printing, so the final result matches your expectation.',
      },
      {
        q: 'Can a printed ceiling be backlit?',
        a: 'Yes. Printed on a translucent film over an LED field, the image is evenly backlit with no hotspots — ideal for sky scenes and feature artwork.',
      },
      {
        q: 'Is there a visible seam on large prints?',
        a: 'No. The image is printed edge-to-edge across a single seamless membrane up to 5.7 m wide, so there are no panel lines across your artwork.',
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const productSlugs = products.map((p) => p.slug);
