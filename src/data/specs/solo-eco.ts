// Solo ECO — from the 2026 price list tech sheet (labels: boothPage.specs.*
// where a shared label exists, else soloEcoPage.specs.*Label; values:
// soloEcoPage.specs.*). Rows the list does not give (door width, fans,
// lighting, frame, floor) are left out rather than guessed. Dimensions, net
// weight, airflow, the ISO 23351-1 figure and the plant come from
// src/data/products.ts via spec(); while speechLevelReductionDbA is null the
// row says "measurement pending" instead of a figure (gross weight stays
// visible in the packaging row).
import type { SpecTableDef } from './types';
import { key, spec } from './types';

const ns = 'soloEcoPage.specs';
const shared = 'boothPage.specs';

const specs: SpecTableDef = [
  {
    title: key(`${ns}.dimensionsTitle`),
    rows: [
      { label: key(`${shared}.externalDim`), value: spec('solo-eco', 'externalDimensions') },
      { label: key(`${shared}.internalDim`), value: key(`${ns}.internalDimValue`) },
      { label: key(`${ns}.tableLabel`), value: key(`${ns}.tableValue`) },
      { label: key(`${shared}.weight`), value: spec('solo-eco', 'weight') },
      { label: key(`${ns}.packagingLabel`), value: key(`${ns}.packagingValue`) },
    ],
  },
  {
    title: key(`${ns}.acousticsTitle`),
    rows: [
      {
        label: key(`${shared}.noiseReduction`),
        value: spec('solo-eco', 'speechLevelReductionDbA', `${shared}.measurementPending`),
      },
    ],
  },
  {
    title: key(`${ns}.ventilationTitle`),
    rows: [{ label: key(`${shared}.airflow`), value: spec('solo-eco', 'ventilation') }],
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
      { label: key(`${shared}.madeIn`), value: spec('solo-eco', 'madeIn') },
      { label: key(`${ns}.sparePartsLabel`), value: key(`${ns}.sparePartsValue`) },
      { label: key(`${shared}.delivery`), value: key(`${ns}.deliveryValue`) },
    ],
  },
];

export default specs;
