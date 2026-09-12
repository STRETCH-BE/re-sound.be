// Duo — transcribed from the former `specCards` prop of DuoProductPage
// (labels: boothPage.specs.*, values: duoPage.specs.*). Dimensions, net
// weight, the ISO 23351-1 figure, airflow and the plant come from
// src/data/products.ts via spec(). No ISO 23351-1 value is on file for Duo
// (speechLevelReductionDbA: null), so the speech-reduction row says
// "measurement pending" instead of a figure until the data holds one.
import type { SpecTableDef } from './types';
import { key, spec } from './types';

const ns = 'duoPage.specs';
const shared = 'boothPage.specs';

const specs: SpecTableDef = [
  {
    title: key(`${ns}.dimensionsTitle`),
    rows: [
      { label: key(`${shared}.externalDim`), value: spec('duo', 'externalDimensions') },
      { label: key(`${shared}.internalDim`), value: key(`${ns}.internalDimValue`) },
      { label: key(`${shared}.doorWidth`), value: key(`${ns}.doorWidthValue`) },
      { label: key(`${shared}.weight`), value: spec('duo', 'weight') },
    ],
  },
  {
    title: key(`${ns}.acousticsTitle`),
    rows: [
      {
        label: key(`${shared}.noiseReduction`),
        value: spec('duo', 'speechLevelReductionDbA', `${shared}.measurementPending`),
      },
      { label: key(`${shared}.absorberMaterial`), value: key(`${ns}.absorberValue`) },
      { label: key(`${shared}.doorSeal`), value: key(`${ns}.doorSealValue`) },
    ],
  },
  {
    title: key(`${ns}.ventilationTitle`),
    rows: [
      { label: key(`${shared}.airflow`), value: spec('duo', 'ventilation') },
      { label: key(`${shared}.fanCount`), value: key(`${ns}.fanCountValue`) },
      { label: key(`${shared}.occupancySensor`), value: key(`${ns}.occupancyValue`) },
    ],
  },
  {
    title: key(`${ns}.electricsTitle`),
    rows: [
      { label: key(`${shared}.powerSockets`), value: key(`${ns}.powerValue`) },
      { label: key(`${shared}.usb`), value: key(`${ns}.usbValue`) },
      { label: key(`${shared}.lighting`), value: key(`${ns}.lightingValue`) },
      { label: key(`${shared}.totalConsumption`), value: key(`${ns}.consumptionValue`) },
    ],
  },
  {
    title: key(`${ns}.materialsTitle`),
    rows: [
      { label: key(`${shared}.frame`), value: key(`${ns}.frameValue`) },
      { label: key(`${shared}.glass`), value: key(`${ns}.glassValue`) },
      { label: key(`${shared}.interior`), value: key(`${ns}.interiorValue`) },
      { label: key(`${shared}.floor`), value: key(`${ns}.floorValue`) },
    ],
  },
  {
    title: key(`${ns}.warrantyTitle`),
    rows: [
      { label: key(`${shared}.madeIn`), value: spec('duo', 'madeIn') },
      { label: key(`${shared}.structural`), value: key(`${ns}.structuralValue`) },
      { label: key(`${shared}.electronics`), value: key(`${ns}.electronicsValue`) },
      { label: key(`${shared}.delivery`), value: key(`${ns}.deliveryValue`) },
    ],
  },
];

export default specs;
