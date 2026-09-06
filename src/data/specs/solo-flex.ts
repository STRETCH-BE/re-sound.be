// Solo Flex — transcribed from the former `specCards` prop of
// SoloFlexProductPage (labels: boothPage.specs.*, values: soloFlexPage.specs.*)
import type { SpecTableDef } from './types';
import { key } from './types';

const ns = 'soloFlexPage.specs';
const shared = 'boothPage.specs';

const specs: SpecTableDef = [
  {
    title: key(`${ns}.dimensionsTitle`),
    rows: [
      { label: key(`${shared}.externalDim`), value: key(`${ns}.externalDimValue`) },
      { label: key(`${shared}.internalDim`), value: key(`${ns}.internalDimValue`) },
      { label: key(`${shared}.doorWidth`), value: key(`${ns}.doorWidthValue`) },
      { label: key(`${shared}.weight`), value: key(`${ns}.weightValue`) },
    ],
  },
  {
    title: key(`${ns}.acousticsTitle`),
    rows: [
      { label: key(`${shared}.noiseReduction`), value: key(`${ns}.noiseReductionValue`) },
      { label: key(`${shared}.absorberMaterial`), value: key(`${ns}.absorberValue`) },
      { label: key(`${shared}.doorSeal`), value: key(`${ns}.doorSealValue`) },
    ],
  },
  {
    title: key(`${ns}.ventilationTitle`),
    rows: [
      { label: key(`${shared}.airflow`), value: key(`${ns}.airflowValue`) },
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
      { label: key(`${shared}.structural`), value: key(`${ns}.structuralValue`) },
      { label: key(`${shared}.electronics`), value: key(`${ns}.electronicsValue`) },
      { label: key(`${shared}.delivery`), value: key(`${ns}.deliveryValue`) },
    ],
  },
];

export default specs;
