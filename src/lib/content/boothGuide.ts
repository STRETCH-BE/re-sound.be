import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Booth_Guide sheet (content/booth-guide.json, via scripts/content/import-workbook.mjs).
 *
 * Facts only — no prices. Every amount on the guide page comes from the
 * catalogue (src/lib/catalogue/load.ts); the price columns of the sheet are
 * not imported any more.
 */
export interface BoothGuideModel {
  model: string;
  slug: string;
  capacity: string;
  footprintM2: string;
  externalDimensions: string;
  isoDbA: number | null;
  isoClass: string | null;
  ventilation: string;
  power: string;
  lighting: string;
  weightKg: number | null;
  assemblyTime: string;
  leadTimeWeeks: string;
  warranty: string;
  trial: string;
}

export interface BoothGuideData {
  models: BoothGuideModel[];
  guide: { locale: string; title: string; description: string; h1: string; faqQuestions: string[] } | null;
}

export function getBoothGuide(): BoothGuideData {
  return JSON.parse(readFileSync(join(process.cwd(), 'content', 'booth-guide.json'), 'utf8')) as BoothGuideData;
}
