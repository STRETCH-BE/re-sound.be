#!/usr/bin/env node
/**
 * Check script for the Sabine library — plain node, no test runner.
 *
 *   node src/lib/acoustics/sabine.check.mjs
 *
 * Transpiles the TypeScript modules it needs with the project's own
 * `typescript` package into a temp dir (rewriting `@/` imports to relative
 * paths), then reproduces one worked example with the portal's own loop
 * (stretch_website/src/lib/portal/acoustic-summary.ts, copied below) and
 * asserts that the library gives the same numbers. Exit code 1 on any
 * mismatch.
 */
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SRC = path.join(ROOT, 'src');
const FILES = [
  'data/acoustic-materials.ts',
  'data/products.ts',
  'lib/acoustics/sabine.ts',
  'lib/acoustics/recommend.ts',
  'lib/acoustics/calculate.ts',
];

// ── transpile ──────────────────────────────────────────────────────────────
const out = mkdtempSync(path.join(tmpdir(), 'resound-acoustics-'));
for (const rel of FILES) {
  const source = readFileSync(path.join(SRC, rel), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    fileName: rel,
  }).outputText;
  const dir = path.dirname(rel);
  const rewritten = js.replace(/from '@\/([^']+)'/g, (_m, p) => {
    let relPath = path.relative(dir, p).split(path.sep).join('/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    return `from '${relPath}.js'`;
  });
  const target = path.join(out, rel.replace(/\.ts$/, '.js'));
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, rewritten);
}
const load = (rel) => import(pathToFileURL(path.join(out, rel)).href);
const data = await load('data/acoustic-materials.js');
const products = await load('data/products.js');
const sabine = await load('lib/acoustics/sabine.js');
const recommend = await load('lib/acoustics/recommend.js');
const calc = await load('lib/acoustics/calculate.js');

// ── the portal's arithmetic, copied from acoustic-summary.ts ───────────────
function portalSummary(L, B, H, floorNr, ceilingNr, wallsNr) {
  const num = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, ''));
    return Number.isFinite(n) && n > 0 ? n : 0;
  };
  const material = (nr) => data.ACOUSTIC_MATERIALS.find((m) => m.nr === nr)?.a ?? [0, 0, 0, 0, 0, 0];
  const l = num(L), b = num(B), h = num(H);
  const V = Math.round(l * b * h * 10) / 10;
  const surfaces = [
    { m2: l * b, a: material(floorNr) },
    { m2: l * b, a: material(ceilingNr) },
    { m2: 2 * (l + b) * h, a: material(wallsNr) },
  ];
  const tBefore = [];
  for (let i = 0; i < 6; i++) {
    let A = 0;
    for (const s of surfaces) A += s.m2 * s.a[i];
    tBefore.push(V > 0 && A > 0 ? V / (6 * A) : 0);
  }
  const mean = (arr) => data.ACOUSTIC_SPEECH.reduce((s, i) => s + arr[i], 0) / data.ACOUSTIC_SPEECH.length;
  return { V, tBefore, rt_before_s: Math.round(mean(tBefore) * 1000) / 1000 };
}

const close = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;
const f = (n, d = 3) => n.toFixed(d);

// ── parseNum / parseAlphaW ────────────────────────────────────────────────
assert.equal(sabine.parseNum('8,4'), 8.4);
assert.equal(sabine.parseNum(' 2.80 '), 2.8);
assert.equal(sabine.parseNum('abc'), 0);
assert.equal(sabine.parseNum('-3'), 0);
assert.equal(sabine.parseNum(''), 0);
assert.equal(sabine.parseAlphaW('1.0'), 1);
assert.equal(sabine.parseAlphaW('0.90'), 0.9);
assert.equal(sabine.parseAlphaW('up to 1.00'), null);
assert.equal(sabine.parseAlphaW('0.35–0.85 (per pattern)'), null);
assert.equal(sabine.parseAlphaW(null), null);

// ── worked example: 5 × 4 × 2.8 m, concrete floor, plasterboard ceiling, plaster walls, office ──
const concrete = data.ACOUSTIC_MATERIALS.find((m) => m.en === 'Concrete');
const plasterboard = data.ACOUSTIC_MATERIALS.find((m) => m.en === 'Plasterboard');
const plaster = data.ACOUSTIC_MATERIALS.find((m) => m.en === 'Plaster');
const office = data.ACOUSTIC_TARGETS.find((t) => t.en === 'Office');
assert.ok(concrete && plasterboard && plaster && office, 'table rows found');

const input = { length: '5', width: '4', height: '2,8', floor: concrete.nr, ceiling: plasterboard.nr, walls: plaster.nr, roomType: office.naam };
const r = calc.calculate(input);
const p = portalSummary('5', '4', '2,8', concrete.nr, plasterboard.nr, plaster.nr);

assert.equal(r.valid, true);
assert.equal(r.volume, p.V);
for (let i = 0; i < 6; i++) assert.ok(close(r.times[i], p.tBefore[i]), `band ${data.ACOUSTIC_BANDS[i]} Hz`);
assert.equal(Math.round(r.rt60 * 1000) / 1000, p.rt_before_s);
assert.equal(r.target.t, office.t);

// ΔA: adding it evenly to every band must bring the headline exactly to the target
const after = sabine.reverberationTimes(r.volume, r.absorption.map((A) => A + r.deltaA));
assert.ok(close(sabine.headline(after), office.t, 1e-6), 'headline after ΔA equals target');
assert.equal(r.meetsTarget, false);

// Recommendations: exactly the panel products with a single numeric αw get a number
const expectedNumeric = Object.values(products.PRODUCTS)
  .filter((x) => x.specs.kind === 'panel' && /^\d+(\.\d+)?$/.test(x.specs.alphaW ?? ''))
  .map((x) => x.slug);
const numeric = r.recommendations.filter((x) => x.m2 !== null).map((x) => x.slug);
assert.deepEqual(numeric.sort(), [...expectedNumeric].sort());
for (const rec of r.recommendations) {
  assert.notEqual(products.PRODUCTS[rec.slug].specs.kind, 'booth');
  if (rec.m2 !== null) assert.ok(close(rec.m2, r.deltaA / rec.alphaW));
}
const families = recommend.recommendedFamilies(r.recommendations);

// A room that already meets its target: ΔA = 0, no recommendation
const met = calc.calculate({ ...input, floor: data.ACOUSTIC_MATERIALS.find((m) => m.en === 'Carpet').nr, ceiling: data.ACOUSTIC_MATERIALS.find((m) => m.en === 'Perforated steel sheet 22%').nr, walls: data.ACOUSTIC_MATERIALS.find((m) => m.en === 'Heavy curtains').nr });
assert.equal(met.deltaA, 0);
assert.equal(met.meetsTarget, true);
assert.equal(met.recommendations.length, 0);

// Invalid input never throws and is flagged
assert.equal(calc.calculate({ ...input, height: '' }).valid, false);
assert.equal(calc.calculate({ ...input, floor: 999 }).valid, false);

// ── print the worked example ──────────────────────────────────────────────
console.log('Worked example: 5 x 4 x 2.8 m, floor Concrete, ceiling Plasterboard, walls Plaster, room type Office (target %s s)', office.t);
console.log('  volume            %s m3', r.volume);
console.log('  surfaces          floor %s m2, ceiling %s m2, walls %s m2', r.surfaces.floor, r.surfaces.ceiling, f(r.surfaces.walls, 1));
console.log('  absorption A      %s  (m2 sabine per band 125..4000 Hz)', r.absorption.map((a) => f(a, 3)).join(' | '));
console.log('  RT60 per band     %s  (s)', r.times.map((t) => f(t, 2)).join(' | '));
console.log('  RT60 headline     %s s  (mean 500/1000/2000 Hz; portal rt_before_s = %s)', f(r.rt60, 3), p.rt_before_s);
console.log('  meets target      %s', r.meetsTarget);
console.log('  absorption to add %s m2 sabine (headline after = %s s)', f(r.deltaA, 2), f(sabine.headline(after), 3));
for (const rec of r.recommendations) {
  console.log(rec.m2 === null
    ? `  - ${rec.name}: measured per pattern / thickness (alphaW spec: ${rec.alphaWSpec ?? 'null'})`
    : `  - ~${f(rec.m2, 1)} m2 of ${rec.name} (alphaW ${rec.alphaW}, ${rec.family})`);
}
console.log('  product_range     %s', families);
console.log('  lead notes:\n' + calc.leadNotes(r).split('\n').map((l) => '    ' + l).join('\n'));
console.log('OK — all assertions passed');
