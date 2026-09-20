/**
 * rPET Flex-Groove — specification tables.
 *
 * The Flex Groove is cut from the 9 mm rPET Panel (Michael, 20 September
 * 2026), so material, surface weight, density, colours, reaction to fire and
 * end of life follow the rPET Panel datasheet (EN · 09/2026, v1.0). The
 * former finished format (1 130 × 2 880 mm) cannot come from a 2 800 × 1 220
 * or 2 440 × 1 220 mm panel and is replaced by the panel source plus
 * "on request"; the former weight (4.4 kg) and "density 1.35 kg/m²" were
 * contradicted by the datasheet's 1.8 kg/m² and removed. The minimum
 * bending radius (500 mm) is the earlier page figure — no datasheet source
 * (open question). The 9 mm panel's absorption is not yet measured, so no
 * acoustic figure is shown.
 *
 * Governed figures (thickness, fire class, recycled content, plant) come from
 * src/data/products.ts via spec(); the OEKO-TEX row is guarded by cert().
 * Removed: the smoke / droplet rows derived from a flat B-s1,d0, the "fire
 * retardant: yes (built-in)" row and the "VOC emissions: low" row — none is
 * on the datasheet.
 */
import type { SpecTableDef } from './types';
import { cert, key, spec } from './types';

const specs: SpecTableDef = [
  {
    title: key('rpetFlexGroovePage.specs.dimensionsTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.dimSource'), value: key('rpetFlexGroovePage.specs.dimSourceVal') },
      { label: key('productPage.specLabels.thickness'), value: spec('rpet-flex-groove', 'thickness') },
      { label: key('rpetFlexGroovePage.specs.dimSurfaceWeight'), value: '1.8 kg/m²' },
      { label: key('productPage.specLabels.density'), value: '≈ 200 kg/m³' },
      { label: key('rpetFlexGroovePage.specs.dimFinishedFormat'), value: key('productPage.ordering.onRequest') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.flexibilityTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.flexMinRadius'), value: '500 mm' },
      { label: key('rpetFlexGroovePage.specs.flexBendDir'), value: key('rpetFlexGroovePage.specs.flexBendDirVal') },
      { label: key('rpetFlexGroovePage.specs.flexCutType'), value: key('rpetFlexGroovePage.specs.flexCutTypeVal') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.materialTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.matComposition'), value: key('rpetFlexGroovePage.specs.matCompositionVal') },
      { label: key('productPage.specs.recycledContent'), value: spec('rpet-flex-groove', 'recycledContentPct') },
      { label: key('rpetFlexGroovePage.specs.matColours'), value: key('productPage.rpet.colours.rangeValue') },
      { label: key('rpetFlexGroovePage.specs.matColorVar'), value: key('rpetFlexGroovePage.specs.matColorVarVal') },
      { label: key('productPage.ordering.madeIn'), value: spec('rpet-flex-groove', 'madeIn') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.fireTitle'),
    rows: [
      { label: key('productPage.specLabels.reactionFire'), value: spec('rpet-flex-groove', 'fireClass') },
      { label: key('productPage.specLabels.testStandard'), value: 'EN 13501-1' },
      { label: key('rpetFlexGroovePage.specs.fireReports'), value: key('productPage.ordering.onRequest') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.certsTitle'),
    rows: [
      {
        label: key('rpetFlexGroovePage.specs.certMaterial'),
        value: cert('rpet-flex-groove', 'OEKO-TEX', 'productPage.specs.oekoTexStandard100'),
      },
      { label: key('productPage.specs.endOfLife'), value: key('productPage.rpet.ordering.endOfLifeText') },
    ],
  },
  {
    title: key('rpetFlexGroovePage.specs.applicationsTitle'),
    rows: [
      { label: key('rpetFlexGroovePage.specs.appSurfaces'), value: key('rpetFlexGroovePage.specs.appSurfacesVal') },
      { label: key('rpetFlexGroovePage.specs.appEnvironment'), value: key('rpetFlexGroovePage.specs.appEnvironmentVal') },
      { label: key('rpetFlexGroovePage.specs.appInstallation'), value: key('rpetFlexGroovePage.specs.appInstallationVal') },
      { label: key('rpetFlexGroovePage.specs.appOrientation'), value: key('rpetFlexGroovePage.specs.appOrientationVal') },
    ],
  },
];

export default specs;
