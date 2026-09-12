/**
 * The calculator's input → result step, shared by the client island, the
 * lead e-mail summary and the check script. Pure: no React, no I/O.
 */
import {
  ACOUSTIC_BANDS,
  ACOUSTIC_MATERIALS,
  ACOUSTIC_TARGETS,
  type AcousticMaterial,
  type AcousticTarget,
} from '@/data/acoustic-materials';
import { panelRecommendations, type PanelRecommendation } from '@/lib/acoustics/recommend';
import {
  absorptionToAdd,
  headline,
  parseNum,
  reverberationTimes,
  roomAbsorption,
  roomSurfaces,
  roomVolume,
} from '@/lib/acoustics/sabine';

/** What the form holds: raw strings for the dimensions, table keys for the rest. */
export interface CalculatorInput {
  length: string;
  width: string;
  height: string;
  /** ACOUSTIC_MATERIALS[].nr */
  floor: number;
  ceiling: number;
  walls: number;
  /** ACOUSTIC_TARGETS[].naam (the table's key, as in the portal) */
  roomType: string;
}

export interface CalculationResult {
  /** False when a dimension is missing or a table key is unknown — nothing else is meaningful then. */
  valid: boolean;
  length: number;
  width: number;
  height: number;
  volume: number;
  surfaces: { floor: number; ceiling: number; walls: number };
  finishes: { floor: AcousticMaterial | null; ceiling: AcousticMaterial | null; walls: AcousticMaterial | null };
  target: AcousticTarget | null;
  /** Total absorption per octave band, m² sabine. */
  absorption: number[];
  /** Reverberation time per octave band, s. */
  times: number[];
  /** Mean of 500 / 1000 / 2000 Hz, s. */
  rt60: number;
  meetsTarget: boolean;
  /** m² sabine to add to reach the target (0 when met). */
  deltaA: number;
  recommendations: PanelRecommendation[];
}

export const BANDS = ACOUSTIC_BANDS;

export function findMaterial(nr: number): AcousticMaterial | null {
  return ACOUSTIC_MATERIALS.find((m) => m.nr === nr) ?? null;
}

export function findTarget(naam: string): AcousticTarget | null {
  return ACOUSTIC_TARGETS.find((t) => t.naam === naam) ?? null;
}

export function calculate(input: CalculatorInput): CalculationResult {
  const length = parseNum(input.length);
  const width = parseNum(input.width);
  const height = parseNum(input.height);
  const finishes = { floor: findMaterial(input.floor), ceiling: findMaterial(input.ceiling), walls: findMaterial(input.walls) };
  const target = findTarget(input.roomType);
  const volume = roomVolume(length, width, height);
  const surfaces = roomSurfaces(length, width, height);
  const valid = volume > 0 && !!finishes.floor && !!finishes.ceiling && !!finishes.walls && !!target;

  if (!valid) {
    return {
      valid,
      length, width, height, volume, surfaces, finishes, target,
      absorption: [], times: [], rt60: 0, meetsTarget: false, deltaA: 0, recommendations: [],
    };
  }

  const absorption = roomAbsorption([
    { m2: surfaces.floor, a: finishes.floor!.a },
    { m2: surfaces.ceiling, a: finishes.ceiling!.a },
    { m2: surfaces.walls, a: finishes.walls!.a },
  ]);
  const times = reverberationTimes(volume, absorption);
  const rt60 = headline(times);
  const deltaA = absorptionToAdd(volume, absorption, target!.t);
  const meetsTarget = deltaA === 0 && rt60 > 0;

  return {
    valid,
    length, width, height, volume, surfaces, finishes, target,
    absorption, times, rt60, meetsTarget, deltaA,
    recommendations: deltaA > 0 ? panelRecommendations(deltaA) : [],
  };
}

const r1 = (n: number) => (Math.round(n * 10) / 10).toString();
const r2 = (n: number) => (Math.round(n * 100) / 100).toString();

/**
 * Compact plain-text summary for the lead e-mail (`extraFields.notes`).
 * English on purpose: it is read by the sales team, not the visitor.
 */
export function leadNotes(result: CalculationResult): string {
  if (!result.valid) return 'RT60 calculation: incomplete input.';
  const lines = [
    `Room: ${r2(result.length)} x ${r2(result.width)} x ${r2(result.height)} m, volume ${r1(result.volume)} m3`,
    `Finishes: floor ${result.finishes.floor!.en}, ceiling ${result.finishes.ceiling!.en}, walls ${result.finishes.walls!.en}`,
    `Room type: ${result.target!.en} (target ${r2(result.target!.t)} s)`,
    `RT60 now: ${r2(result.rt60)} s (mean 500/1000/2000 Hz); per band ${BANDS.map((hz, i) => `${hz} Hz ${r2(result.times[i])} s`).join(', ')}`,
    result.meetsTarget
      ? 'Target met, no extra absorption needed.'
      : `Absorption to add: ${r1(result.deltaA)} m2 sabine`,
  ];
  const numeric = result.recommendations.filter((r) => r.m2 !== null);
  if (numeric.length) {
    lines.push(`Recommended: ${numeric.map((r) => `~${r1(r.m2!)} m2 ${r.name} (aw ${r.alphaWSpec})`).join('; ')}`);
  }
  return lines.join('\n');
}
