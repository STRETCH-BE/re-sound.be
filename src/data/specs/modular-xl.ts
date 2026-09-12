// Modular XL — transcribed from the former `specCards` prop of
// ModularXLProductPage (labels: boothPage.specs.*, values: modularXlPage.specs.*).
// Base dimensions, net weight, the ISO 23351-1 figure, base airflow and the
// plant come from src/data/products.ts via spec(); should
// speechLevelReductionDbA ever be null the row says "measurement pending".
import type { SpecTableDef } from './types';
import { key, spec } from './types';

const ns = 'modularXlPage.specs';
const shared = 'boothPage.specs';

const specs: SpecTableDef = [
  {
    title: key(`${ns}.dimensionsTitle`),
    rows: [
      { label: key(`${shared}.externalDim`), value: spec('modular-xl', 'externalDimensions') },
      { label: key(`${shared}.internalDim`), value: key(`${ns}.internalDimValue`) },
      { label: key(`${shared}.doorWidth`), value: key(`${ns}.doorWidthValue`) },
      { label: key(`${shared}.weight`), value: spec('modular-xl', 'weight') },
    ],
  },
  {
    title: key(`${ns}.extensionTitle`),
    rows: [
      { label: key(`${shared}.segmentSize`), value: key(`${ns}.segmentSizeValue`) },
      { label: key(`${shared}.segmentWeight`), value: key(`${ns}.segmentWeightValue`) },
      { label: key(`${shared}.segmentFans`), value: key(`${ns}.segmentFansValue`) },
      { label: key(`${shared}.segmentPower`), value: key(`${ns}.segmentPowerValue`) },
    ],
  },
  {
    title: key(`${ns}.acousticsTitle`),
    rows: [
      {
        label: key(`${shared}.noiseReduction`),
        value: spec('modular-xl', 'speechLevelReductionDbA', `${shared}.measurementPending`),
      },
      { label: key(`${shared}.absorberMaterial`), value: key(`${ns}.absorberValue`) },
      { label: key(`${shared}.doorSeal`), value: key(`${ns}.doorSealValue`) },
    ],
  },
  {
    title: key(`${ns}.ventilationTitle`),
    rows: [
      { label: key(`${shared}.airflow`), value: spec('modular-xl', 'ventilation') },
      { label: key(`${shared}.fanCount`), value: key(`${ns}.fanCountValue`) },
      { label: key(`${shared}.occupancySensor`), value: key(`${ns}.occupancyValue`) },
    ],
  },
  {
    title: key(`${ns}.clearancesTitle`),
    rows: [
      { label: key(`${shared}.ceilingHeight`), value: key(`${ns}.ceilingValue`) },
      { label: key(`${shared}.sideClearance`), value: key(`${ns}.sideValue`) },
      { label: key(`${shared}.frontClearance`), value: key(`${ns}.frontValue`) },
    ],
  },
  {
    title: key(`${ns}.warrantyTitle`),
    rows: [
      { label: key(`${shared}.madeIn`), value: spec('modular-xl', 'madeIn') },
      { label: key(`${shared}.structural`), value: key(`${ns}.structuralValue`) },
      { label: key(`${shared}.electronics`), value: key(`${ns}.electronicsValue`) },
      { label: key(`${shared}.delivery`), value: key(`${ns}.deliveryValue`) },
    ],
  },
];

export default specs;
