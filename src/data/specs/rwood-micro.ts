/**
 * rWood Micro — specification tables.
 *
 * Transcribed from src/components/sections/rwoodmicropage.tsx,
 * the former <section id="specs"> (lines 831–983 of the pre-refactor file),
 * card by card and row by row, in the original order.
 *
 * The first card used `specs.acousticsTitle` by mistake (copy/paste of the
 * second card); it now uses `specs.dimensionsTitle`, which is the key that
 * exists for it in the `rwoodMicroPage.specs` namespace.
 *
 * Governed figures (thickness, αw, class, fire class) come from
 * src/data/products.ts via spec(). The "with mineral wool" αw row was removed
 * (no such value in the data).
 */
import type { SpecTableDef } from './types';
import { key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rwoodMicroPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.customSizes'), value: '100–3050 × 100–1220 mm' },
      { label: key('productPage.specLabels.thickness'), value: spec('rwood-micro', 'thickness') },
      { label: key('productPage.specLabels.weight'), value: key('productData.specValues.fromWeight035') },
      { label: key('rwoodMicroPage.specs.dimCoreDensity'), value: '48,40 kg/m³' },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: spec('rwood-micro', 'alphaW') },
      { label: key('productPage.specs.absorptionClass'), value: spec('rwood-micro', 'absorptionClass') },
      { label: key('productPage.specLabels.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.perfsTitle'),
    rows: [
      { label: key('productData.specValues.perfNano'), value: key('productData.specValues.openArea25') },
      { label: key('productData.specValues.perfMicroS'), value: key('productData.specValues.openArea52') },
      { label: key('productData.specValues.perfMicroM'), value: key('productData.specValues.openArea84') },
      { label: key('productData.specValues.perfMicroL'), value: key('productData.specValues.openArea106') },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.fireTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.reactionFire'), value: spec('rwood-micro', 'fireClass') },
      { label: key('rwoodMicroPage.specs.resistanceFire'), value: 'K1-10 / K2-10' },
      { label: key('productPage.specs.core'), value: key('rwoodMicroPage.specs.fireRetardant') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN 13501' },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.matTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.surfaceLabel'), value: key('rwoodMicroPage.specs.surfaceVal') },
      { label: key('productPage.specs.core'), value: key('rwoodMicroPage.specs.coreVal') },
      { label: key('rwoodMicroPage.specs.edgesLabel'), value: key('rwoodMicroPage.specs.edgesVal') },
      { label: key('rwoodMicroPage.specs.acousticFelt'), value: key('rwoodMicroPage.specs.feltColor') },
    ],
  },
  {
    title: key('rwoodMicroPage.specs.appsTitle'),
    rows: [
      { label: key('rwoodMicroPage.specs.appInstall'), value: key('rwoodMicroPage.specs.appWalls') },
      { label: key('rwoodMicroPage.specs.appEnv'), value: key('rwoodMicroPage.specs.appEnvVal') },
      { label: key('rwoodMicroPage.specs.backlitOption'), value: key('rwoodMicroPage.specs.backlitVal') },
      { label: key('rwoodMicroPage.specs.mountingSystem'), value: key('rwoodMicroPage.specs.concealedClip') },
    ],
  },
];

export default specs;
