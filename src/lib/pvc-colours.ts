// =============================================================================
// PVC FILM COLOUR CHART
//
// ⚠️  STARTER PALETTE — replace with STRETCH's real PVC chart from
//     https://stretchplafond.be/kleuren-pvc-spanplafonds/ (names + finish + RAL
//     + product code). HEX values are approximations for ON-SCREEN PREVIEW only;
//     gloss/metallic/translucent finishes can't be fully represented by a flat
//     tile — the `finish` label carries that. Editing is just this one array.
//
// PVC film comes in several finishes (matte, satin, gloss/lacquer, translucent,
// metallic). Set `finish` per colour so it shows on the swatch.
// =============================================================================

import type { ColourEntry } from '@/lib/polyester-colours';

export const pvcColours: ColourEntry[] = [
  // Matte — the everyday ceiling finish
  { name: 'White', finish: 'Matte', ral: 'RAL 9010', hex: '#FFFFFF' },
  { name: 'Off-white', finish: 'Matte', ral: 'RAL 9001', hex: '#ECE1CF' },
  { name: 'Light grey', finish: 'Matte', ral: 'RAL 7035', hex: '#CBCCC7' },
  { name: 'Grey', finish: 'Matte', ral: 'RAL 7037', hex: '#7C7D7C' },
  { name: 'Anthracite', finish: 'Matte', ral: 'RAL 7016', hex: '#383E42' },
  { name: 'Black', finish: 'Matte', ral: 'RAL 9005', hex: '#0A0A0A' },
  { name: 'Sand', finish: 'Matte', ral: 'RAL 1002', hex: '#D4B96A' },
  { name: 'Cappuccino', finish: 'Matte', ral: 'RAL 1019', hex: '#A38F78' },
  // Satin — a soft sheen
  { name: 'White', finish: 'Satin', ral: 'RAL 9010', hex: '#F4F4F0' },
  { name: 'Grey', finish: 'Satin', ral: 'RAL 7038', hex: '#B5B8B1' },
  { name: 'Champagne', finish: 'Satin', hex: '#D8C9A8' },
  // Gloss / lacquer — the signature reflective ceiling
  { name: 'White', finish: 'Gloss', ral: 'RAL 9003', hex: '#F7F7F4' },
  { name: 'Black', finish: 'Gloss', ral: 'RAL 9005', hex: '#0A0A0A' },
  { name: 'Anthracite', finish: 'Gloss', ral: 'RAL 7016', hex: '#2E3438' },
  { name: 'Silver grey', finish: 'Gloss', ral: 'RAL 7001', hex: '#9AA0A4' },
  { name: 'Red', finish: 'Gloss', ral: 'RAL 3020', hex: '#C1121C' },
  { name: 'Bordeaux', finish: 'Gloss', ral: 'RAL 3005', hex: '#5E2129' },
  { name: 'Blue', finish: 'Gloss', ral: 'RAL 5010', hex: '#14457A' },
  { name: 'Petrol', finish: 'Gloss', ral: 'RAL 5020', hex: '#1B4A52' },
  { name: 'Chocolate', finish: 'Gloss', ral: 'RAL 8017', hex: '#45302A' },
  { name: 'Champagne', finish: 'Gloss', hex: '#C9A86A' },
  // Translucent — for backlit ceilings
  { name: 'Translucent white', finish: 'Translucent', hex: '#F2F4F2' },
  { name: 'Opal', finish: 'Translucent', hex: '#E9EEF0' },
  // Metallic & pearl
  { name: 'Silver', finish: 'Metallic', hex: '#B8BCC0' },
  { name: 'Gold', finish: 'Metallic', hex: '#C8A24A' },
  { name: 'Bronze', finish: 'Metallic', hex: '#8C6A44' },
  { name: 'Pearl', finish: 'Metallic', hex: '#EDE9E0' },
  // Any RAL / print on request
  { name: 'Custom RAL', custom: true, hex: '#000000' },
];
