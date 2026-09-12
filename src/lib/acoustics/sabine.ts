/**
 * Sabine arithmetic for the reverberation-time calculator — pure functions,
 * no React, no I/O.
 *
 * The formulas mirror the STRETCH Group portal tool exactly
 * (stretch_website/src/lib/portal/acoustic-summary.ts):
 *   - T = V / (6 × A) per octave band,
 *   - A = Σ surface (m²) × α (per band),
 *   - headline = mean of the 500 / 1000 / 2000 Hz bands (ACOUSTIC_SPEECH),
 *   - `parseNum()` accepts a decimal comma or point like the portal's `num()`,
 *   - the volume is rounded to 0.1 m³ like the portal.
 *
 * Only `absorptionToAdd()` is new: the portal computes "before" and "after"
 * for a chosen quantity of panels, this site inverts the question — how many
 * m² sabine must be added so that the headline meets the room type's target.
 */
import { ACOUSTIC_BANDS, ACOUSTIC_SPEECH } from '@/data/acoustic-materials';

/** One absorbing surface: an area in m² and its α per octave band. */
export interface AbsorbingSurface {
  m2: number;
  a: readonly number[];
}

export const BAND_COUNT = ACOUSTIC_BANDS.length;

/** Same parsing as the portal's num(): "8,4" → 8.4; blank, NaN or ≤ 0 → 0. */
export function parseNum(v: unknown): number {
  const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Room volume in m³, rounded to 0.1 like the portal. 0 when a dimension is missing. */
export function roomVolume(length: number, width: number, height: number): number {
  if (length <= 0 || width <= 0 || height <= 0) return 0;
  return Math.round(length * width * height * 10) / 10;
}

/** The three main surfaces of a rectangular room (m²). */
export function roomSurfaces(length: number, width: number, height: number): { floor: number; ceiling: number; walls: number } {
  if (length <= 0 || width <= 0 || height <= 0) return { floor: 0, ceiling: 0, walls: 0 };
  return { floor: length * width, ceiling: length * width, walls: 2 * (length + width) * height };
}

/** Total absorption A per octave band (m² sabine): Σ m² × α. */
export function roomAbsorption(surfaces: readonly AbsorbingSurface[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < BAND_COUNT; i++) {
    let A = 0;
    for (const s of surfaces) A += s.m2 * (s.a[i] ?? 0);
    out.push(A);
  }
  return out;
}

/** Sabine per band: T = V / (6 × A); 0 when V or A is not positive (portal behaviour). */
export function reverberationTimes(volume: number, absorptionPerBand: readonly number[]): number[] {
  return absorptionPerBand.map((A) => (volume > 0 && A > 0 ? volume / (6 * A) : 0));
}

/** Headline value: the mean of the speech bands (500 / 1000 / 2000 Hz). */
export function headline(bands: readonly number[]): number {
  return ACOUSTIC_SPEECH.reduce((s, i) => s + (bands[i] ?? 0), 0) / ACOUSTIC_SPEECH.length;
}

/**
 * Extra absorption ΔA (m² sabine) to add — evenly to every band, which is
 * what a single-number αw product does — so that the headline reverberation
 * time drops to `targetT`. 0 when the target is already met or the input is
 * unusable. Solved by bisection on the speech bands: the headline is
 * strictly decreasing in ΔA, so the root is unique.
 */
export function absorptionToAdd(volume: number, currentAbsorptionPerBand: readonly number[], targetT: number): number {
  if (volume <= 0 || targetT <= 0) return 0;
  const speech = ACOUSTIC_SPEECH.map((i) => currentAbsorptionPerBand[i] ?? 0);
  if (speech.some((A) => A <= 0)) return 0;
  const headlineWith = (delta: number) => speech.reduce((s, A) => s + volume / (6 * (A + delta)), 0) / speech.length;
  if (headlineWith(0) <= targetT) return 0;

  let lo = 0;
  // Upper bound: with A = V / (6 T) in every band the headline equals T, so
  // adding that much on top of any positive A always overshoots.
  let hi = volume / (6 * targetT);
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (headlineWith(mid) > targetT) lo = mid;
    else hi = mid;
    if (hi - lo < 1e-9) break;
  }
  return hi;
}

/** m² of a product with weighted absorption αw needed to supply `deltaA` m² sabine. */
export function productAreaNeeded(deltaA: number, alphaW: number): number {
  if (deltaA <= 0 || alphaW <= 0) return 0;
  return deltaA / alphaW;
}

/**
 * The single αw of a product spec ('1.0', '0.90') as a number; anything else
 * — null, 'up to 1.00', '0.35–0.85 (per pattern)' — has no usable single
 * value and returns null so the product is never recommended by number.
 */
export function parseAlphaW(spec: string | null | undefined): number | null {
  if (!spec || !/^\d+(\.\d+)?$/.test(spec.trim())) return null;
  const n = Number(spec);
  return n > 0 ? n : null;
}
