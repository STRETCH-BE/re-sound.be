// Solo ECO — from the 2026 price list tech sheet (labels: boothPage.specs.*
// where a shared label exists, else soloEcoPage.specs.*Label; values:
// soloEcoPage.specs.*). Rows the list does not give (door width, noise
// reduction, fans, lighting, frame, floor) are left out rather than guessed.
import type { SpecTableDef } from './types';
import { key } from './types';

const ns = 'soloEcoPage.specs';
const shared = 'boothPage.specs';

const specs: SpecTableDef = [
  {
    title: key(`${ns}.dimensionsTitle`),
    rows: [
      { label: key(`${shared}.externalDim`), value: key(`${ns}.externalDimValue`) },
      { label: key(`${shared}.internalDim`), value: key(`${ns}.internalDimValue`) },
      { label: key(`${ns}.tableLabel`), value: key(`${ns}.tableValue`) },
      { label: key(`${ns}.weightLabel`), value: key(`${ns}.weightValue`) },
      { label: key(`${ns}.packagingLabel`), value: key(`${ns}.packagingValue`) },
    ],
  },
  {
    title: key(`${ns}.ventilationTitle`),
    rows: [{ label: key(`${shared}.airflow`), value: key(`${ns}.airflowValue`) }],
  },
  {
    title: key(`${ns}.electricsTitle`),
    rows: [
      { label: key(`${shared}.powerSockets`), value: key(`${ns}.powerValue`) },
      { label: key(`${shared}.usb`), value: key(`${ns}.usbValue`) },
      { label: key(`${shared}.totalConsumption`), value: key(`${ns}.consumptionValue`) },
    ],
  },
  {
    title: key(`${ns}.materialsTitle`),
    rows: [
      { label: key(`${shared}.glass`), value: key(`${ns}.glassValue`) },
      { label: key(`${shared}.interior`), value: key(`${ns}.interiorValue`) },
      { label: key(`${ns}.exteriorLabel`), value: key(`${ns}.exteriorValue`) },
      { label: key(`${ns}.backWallLabel`), value: key(`${ns}.backWallValue`) },
      { label: key(`${ns}.doorLabel`), value: key(`${ns}.doorValue`) },
    ],
  },
  {
    title: key(`${ns}.warrantyTitle`),
    rows: [
      { label: key(`${ns}.sparePartsLabel`), value: key(`${ns}.sparePartsValue`) },
      { label: key(`${shared}.delivery`), value: key(`${ns}.deliveryValue`) },
    ],
  },
];

export default specs;
