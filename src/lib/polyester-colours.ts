// =============================================================================
// POLYESTER COLOUR CHART
//
// ⚠️  STARTER PALETTE — replace with STRETCH's real polyester chart from
//     https://stretchplafond.be/polyester-kleuren/ (names + RAL + product code).
//     The HEX values below are RAL-Classic approximations for ON-SCREEN PREVIEW
//     only; always confirm against a physical swatch. Editing is just this one
//     array — add/remove/reorder entries freely.
//
// Each colour is offered in both standard and acoustic finishes.
// Set `custom: true` for the rainbow "any RAL" tile (no RAL/HEX shown).
// Optional `code` = STRETCH product code if you want it displayed.
// =============================================================================

export type ColourEntry = {
  name: string;
  ral?: string; // e.g. 'RAL 9010'
  hex: string; // on-screen preview only
  code?: string; // optional STRETCH product code
  finish?: string; // optional finish label (e.g. 'Gloss', 'Translucent') — used by PVC
  custom?: boolean; // renders the "Custom RAL" rainbow tile
};

export const polyesterColours: ColourEntry[] = [
  // Whites & creams
  { name: 'Pure white', ral: 'RAL 9010', hex: '#FFFFFF' },
  { name: 'Traffic white', ral: 'RAL 9016', hex: '#F4F4F0' },
  { name: 'Cream', ral: 'RAL 9001', hex: '#ECE1CF' },
  { name: 'Oyster white', ral: 'RAL 1013', hex: '#E4DBC8' },
  { name: 'Light ivory', ral: 'RAL 1015', hex: '#E6D6BA' },
  // Beiges & sands
  { name: 'Beige', ral: 'RAL 1001', hex: '#CDB38B' },
  { name: 'Sand', ral: 'RAL 1002', hex: '#D4B96A' },
  { name: 'Grey beige', ral: 'RAL 1019', hex: '#A38F78' },
  // Greys
  { name: 'Silk grey', ral: 'RAL 7044', hex: '#C7C0B0' },
  { name: 'Light grey', ral: 'RAL 7035', hex: '#CBCCC7' },
  { name: 'Pebble grey', ral: 'RAL 7032', hex: '#B8B19B' },
  { name: 'Agate grey', ral: 'RAL 7038', hex: '#B5B8B1' },
  { name: 'Platinum grey', ral: 'RAL 7036', hex: '#9F9B9A' },
  { name: 'Dusty grey', ral: 'RAL 7037', hex: '#7C7D7C' },
  { name: 'Slate grey', ral: 'RAL 7015', hex: '#474C50' },
  { name: 'Anthracite', ral: 'RAL 7016', hex: '#383E42' },
  { name: 'Black grey', ral: 'RAL 7021', hex: '#262A2D' },
  // Blacks
  { name: 'Graphite black', ral: 'RAL 9011', hex: '#1A1B1A' },
  { name: 'Jet black', ral: 'RAL 9005', hex: '#0A0A0A' },
  // Accents
  { name: 'Pastel blue', ral: 'RAL 5024', hex: '#6E96B0' },
  { name: 'Pigeon blue', ral: 'RAL 5014', hex: '#6C7C90' },
  { name: 'Steel blue', ral: 'RAL 5011', hex: '#232F3A' },
  { name: 'Pale green', ral: 'RAL 6021', hex: '#8FA67E' },
  { name: 'Reseda green', ral: 'RAL 6011', hex: '#587246' },
  { name: 'Oxide red', ral: 'RAL 3009', hex: '#7A3B30' },
  { name: 'Wine red', ral: 'RAL 3005', hex: '#6B2A30' },
  { name: 'Golden yellow', ral: 'RAL 1004', hex: '#D4A018' },
  { name: 'Pure orange', ral: 'RAL 2004', hex: '#E15501' },
  // Always last — any RAL on request
  { name: 'Custom RAL', custom: true, hex: '#000000' },
];
