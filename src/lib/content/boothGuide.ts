import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Booth_Guide sheet (content/booth-guide.json, via scripts/content/import-workbook.mjs). */
export interface BoothGuideModel {
  model: string;
  slug: string;
  capacity: string;
  footprintM2: string;
  externalDimensions: string;
  priceExclVat: number | null;
  options: string[];
  isoDbA: number | null;
  isoClass: string | null;
  ventilation: string;
  power: string;
  lighting: string;
  weightKg: number | null;
  assemblyTime: string;
  leadTimeWeeks: string;
  deliveryInstallation: string;
  warranty: string;
  trial: string;
}

export interface BoothGuideData {
  models: BoothGuideModel[];
  guide: { locale: string; title: string; description: string; h1: string; faqQuestions: string[] } | null;
}

/** Installation prices from the workbook facts (excl. VAT). */
export const BOOTH_PRICES = {
  'solo-flex': { exclInstallation: 2740, inclInstallation: 3605, installation: 865 },
  duo: { exclInstallation: null, inclInstallation: null, installation: null },
  'modular-xl': { exclInstallation: 15000, inclInstallation: 17990, extraElementIncl: 7264 },
} as const;

export function getBoothGuide(): BoothGuideData {
  return JSON.parse(readFileSync(join(process.cwd(), 'content', 'booth-guide.json'), 'utf8')) as BoothGuideData;
}
