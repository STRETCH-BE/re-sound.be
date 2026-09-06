/**
 * rPET Panel — specification tables.
 *
 * Transcribed from src/components/sections/rpetpanelpage.tsx,
 * the former <section id="specs"> (lines 758–902 of the pre-refactor file),
 * card by card and row by row, in the original order.
 */
import type { SpecTableDef } from './types';
import { key } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetPanelPage.specs.dimensionsTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.dimStandard'), value: '1,200 × 2,750 mm' },
      { label: key('rpetPanelPage.specs.dimCustomMax'), value: '3,000 × 2,000 mm' },
      { label: key('rpetPanelPage.specs.dimThicknessOptions'), value: '12 / 18 / 24 mm' },
      { label: key('rpetPanelPage.specs.dimCustomThickness'), value: 'Up to 40 mm' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.acousticsTitle'),
    rows: [
      { label: key('productPage.specs.absorptionCoeff'), value: 'Up to 1.00' },
      { label: key('productPage.specs.absorptionClass'), value: key('productPage.acoustics.classA') },
      { label: key('productPage.specs.testStandard'), value: 'ISO 354 / ISO 11654' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.physicalTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.physMaterial'), value: key('productData.specValues.pet100Polyester') },
      { label: key('productPage.specs.recycledContent'), value: 'Up to 50%' },
      { label: key('rpetPanelPage.specs.physWeight12'), value: '3 kg/m²' },
      { label: key('rpetPanelPage.specs.physWeight24'), value: '4 kg/m²' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.fireTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.fireEuClass'), value: 'B-s2, d0' },
      { label: key('rpetPanelPage.specs.fireGerman'), value: 'Bs1 (DIN 4102)' },
      { label: key('productPage.specs.testStandard'), value: 'EN 13501-1' },
    ],
  },
  {
    title: key('rpetPanelPage.specs.healthTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.healthOekoTex'), value: key('productData.specValues.oekoStandard100Class1') },
      { label: key('rpetPanelPage.specs.vocEmissions'), value: key('productData.specValues.classAPlusIso16000') },
      { label: key('rpetPanelPage.specs.healthFormaldehyde'), value: key('productData.specValues.none') },
      { label: key('rpetPanelPage.specs.healthBinders'), value: key('productData.specValues.none') },
    ],
  },
  {
    title: key('rpetPanelPage.specs.colorsTitle'),
    rows: [
      { label: key('rpetPanelPage.specs.colorStandard'), value: key('productData.specValues.fiveMidnightToFrost') },
      { label: key('rpetPanelPage.specs.colorCustom'), value: key('rpetPanelPage.specs.anyRalNcs') },
      { label: key('rpetPanelPage.specs.finishOptions'), value: key('rpetPanelPage.specs.finishOptionsVal') },
      { label: key('rpetPanelPage.specs.recyclability'), value: '100%' },
    ],
  },
];

export default specs;
