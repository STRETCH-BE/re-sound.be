/**
 * Absorption coefficients of building finishes and target reverberation
 * times per room type — IMPORTED, not authored here.
 *
 * Source: the STRETCH Group client-portal acoustic calculator,
 *   stretch_website/src/lib/portal/acoustic-data.ts
 * which is itself "transcribed from berekening-nagalmtijd-website-23.xlsx"
 * (the portal tool is the master copy of these numbers). The two tables
 * below are copied byte-for-byte from that file; the portal's own absorber
 * table (ACOUSTIC_PANELS, STRETCH ceilings) is deliberately NOT imported —
 * Re-Sound recommends its own panels from src/data/products.ts.
 *
 * Rules:
 *   - Never edit a number here. A correction belongs in the portal table
 *     first and is then re-copied.
 *   - `naam` is the Dutch label of the source workbook, `en` the English
 *     label; the UI shows `en` (and may show `naam` for nl).
 *   - `a` holds α per octave band, indexed by ACOUSTIC_BANDS.
 */

/** Octave bands, Hz — index into every `a` array. */
export const ACOUSTIC_BANDS = [125, 250, 500, 1000, 2000, 4000] as const;
/** The speech frequencies (500 / 1000 / 2000 Hz) — indices into ACOUSTIC_BANDS. */
export const ACOUSTIC_SPEECH = [2, 3, 4] as const;

export type AcousticMaterial = { nr: number; naam: string; en: string; a: number[] };
export type AcousticTarget = { naam: string; en: string; t: number };

export const ACOUSTIC_MATERIALS: AcousticMaterial[] = [
  {
    "nr": 1,
    "naam": "Beton",
    "en": "Concrete",
    "a": [
      0.01,
      0.01,
      0.02,
      0.02,
      0.02,
      0.03
    ]
  },
  {
    "nr": 2,
    "naam": "Marmer",
    "en": "Marble",
    "a": [
      0.01,
      0.01,
      0.01,
      0.01,
      0.01,
      0.01
    ]
  },
  {
    "nr": 3,
    "naam": "Parket",
    "en": "Wood flooring",
    "a": [
      0.04,
      0.04,
      0.07,
      0.07,
      0.07,
      0.07
    ]
  },
  {
    "nr": 4,
    "naam": "Vloertegels",
    "en": "Floor tiles",
    "a": [
      0.01,
      0.05,
      0.09,
      0.1,
      0.1,
      0.1
    ]
  },
  {
    "nr": 5,
    "naam": "Linoleum",
    "en": "Linoleum",
    "a": [
      0.04,
      0.06,
      0.08,
      0.12,
      0.04,
      0.04
    ]
  },
  {
    "nr": 6,
    "naam": "Tapijt",
    "en": "Carpet",
    "a": [
      0.09,
      0.08,
      0.21,
      0.26,
      0.27,
      0.37
    ]
  },
  {
    "nr": 7,
    "naam": "Pleisterwerk",
    "en": "Plaster",
    "a": [
      0.01,
      0.01,
      0.02,
      0.03,
      0.04,
      0.05
    ]
  },
  {
    "nr": 8,
    "naam": "Gipskartonplaat",
    "en": "Plasterboard",
    "a": [
      0.39,
      0.13,
      0.04,
      0.02,
      0.03,
      0.06
    ]
  },
  {
    "nr": 9,
    "naam": "Metselwerk, open voegen",
    "en": "Brickwork, open joints",
    "a": [
      0.06,
      0.44,
      0.3,
      0.31,
      0.42,
      0.45
    ]
  },
  {
    "nr": 10,
    "naam": "Metselwerk, harde afwerking",
    "en": "Brickwork, hard finish",
    "a": [
      0.02,
      0.03,
      0.03,
      0.04,
      0.05,
      0.07
    ]
  },
  {
    "nr": 11,
    "naam": "Glas enkel",
    "en": "Single glazing",
    "a": [
      0.1,
      0.04,
      0.03,
      0.02,
      0.02,
      0.02
    ]
  },
  {
    "nr": 12,
    "naam": "Glas dubbel",
    "en": "Double glazing",
    "a": [
      0.03,
      0.03,
      0.03,
      0.02,
      0.02,
      0.02
    ]
  },
  {
    "nr": 13,
    "naam": "Hout gelakt",
    "en": "Lacquered wood",
    "a": [
      0.05,
      0.04,
      0.03,
      0.03,
      0.03,
      0.03
    ]
  },
  {
    "nr": 14,
    "naam": "Gordijnen licht",
    "en": "Light curtains",
    "a": [
      0.08,
      0.53,
      0.85,
      0.94,
      1.26,
      1.12
    ]
  },
  {
    "nr": 15,
    "naam": "Gordijnen zwaar",
    "en": "Heavy curtains",
    "a": [
      0.15,
      0.45,
      0.96,
      0.91,
      1.06,
      1.02
    ]
  },
  {
    "nr": 16,
    "naam": "Staalplaat geperforeerd 22%",
    "en": "Perforated steel sheet 22%",
    "a": [
      0.45,
      0.57,
      0.64,
      0.6,
      0.9,
      0.93
    ]
  }
];

export const ACOUSTIC_TARGETS: AcousticTarget[] = [
  {
    "naam": "Kantoorruimte",
    "en": "Office",
    "t": 0.8
  },
  {
    "naam": "Callcenter",
    "en": "Call centre",
    "t": 0.7
  },
  {
    "naam": "Vergaderzaal",
    "en": "Meeting room",
    "t": 0.8
  },
  {
    "naam": "Receptie",
    "en": "Reception",
    "t": 1
  },
  {
    "naam": "Wachtlokaal",
    "en": "Waiting room",
    "t": 1
  },
  {
    "naam": "Sporthal",
    "en": "Sports hall",
    "t": 1.5
  },
  {
    "naam": "Zwembad",
    "en": "Swimming pool",
    "t": 1.5
  },
  {
    "naam": "Leslokaal",
    "en": "Classroom",
    "t": 0.8
  },
  {
    "naam": "Kinderdagverblijf",
    "en": "Nursery",
    "t": 0.8
  },
  {
    "naam": "Restaurant",
    "en": "Restaurant",
    "t": 0.7
  },
  {
    "naam": "Café of bar",
    "en": "Café or bar",
    "t": 0.7
  },
  {
    "naam": "Muziekcafé",
    "en": "Music café",
    "t": 1
  },
  {
    "naam": "Muziekstudio",
    "en": "Music studio",
    "t": 0.4
  },
  {
    "naam": "Repeteerruimte",
    "en": "Rehearsal room",
    "t": 0.9
  },
  {
    "naam": "Magazijn",
    "en": "Warehouse",
    "t": 1
  },
  {
    "naam": "Werkplaats",
    "en": "Workshop",
    "t": 1
  },
  {
    "naam": "Woonkamer",
    "en": "Living room",
    "t": 0.8
  },
  {
    "naam": "Thuisbioscoop",
    "en": "Home cinema",
    "t": 0.5
  }
];
