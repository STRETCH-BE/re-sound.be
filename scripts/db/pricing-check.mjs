#!/usr/bin/env node
/**
 * Proves the catalogue pricing rules and the snapshot fallback without a
 * browser or a database.
 *
 *   npm run catalogue:check
 *
 * 1. Compiles src/lib/catalogue/{types,select,pricing,load}.ts and
 *    src/lib/db/supabase.ts with tsc to node_modules/.cache (CommonJS, so the
 *    real TypeScript is exercised — nothing is re-implemented here).
 * 2. Prices fixed selections against src/data/catalogue.snapshot.json and
 *    compares with the arithmetic on the 2026 price list.
 * 3. Loads the catalogue through load.ts with the database unconfigured and
 *    with an unreachable host: both must fall back to the snapshot.
 *
 * Exit 1 on the first failed assertion.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(REPO, 'node_modules', '.cache', 're-sound-pricing-check');
const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// 1. Compile
// ---------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
// A throw-away tsconfig that extends the project's (so the "@/…" paths resolve)
// but emits CommonJS into OUT instead of type-checking only.
const FILES = ['src/lib/catalogue/types.ts', 'src/lib/catalogue/select.ts', 'src/lib/catalogue/pricing.ts', 'src/lib/catalogue/load.ts', 'src/lib/db/supabase.ts', 'src/lib/order/vat.ts'];
const tsconfig = join(OUT, 'tsconfig.json');
writeFileSync(tsconfig, JSON.stringify({
  extends: join(REPO, 'tsconfig.json'),
  compilerOptions: {
    noEmit: false, module: 'commonjs', moduleResolution: 'node', target: 'es2020', outDir: OUT, rootDir: join(REPO, 'src'),
    incremental: false, declaration: false, isolatedModules: false, plugins: [],
  },
  include: [],
  files: FILES.map((f) => join(REPO, f)),
}, null, 2));
execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['tsc', '-p', tsconfig], { cwd: REPO, stdio: 'inherit' });
// The server modules start with `import 'server-only'`, which Next.js aliases
// to an empty module on the server and to a throwing one in a client bundle.
// Plain node knows neither: give the emitted code an empty stub to resolve.
mkdirSync(join(OUT, 'node_modules', 'server-only'), { recursive: true });
writeFileSync(join(OUT, 'node_modules', 'server-only', 'package.json'), '{ "name": "server-only", "main": "index.js" }\n');
writeFileSync(join(OUT, 'node_modules', 'server-only', 'index.js'), '');
// The emitted code keeps the "@/…" alias: point it at src/.
for (const dir of ['lib/catalogue', 'lib/db', 'lib/order']) {
  for (const f of readdirSync(join(OUT, dir))) {
    if (!f.endsWith('.js')) continue;
    const path = join(OUT, dir, f);
    // "@/data/…" → the live snapshot in src/; every other "@/…" → the emitted JS.
    writeFileSync(path, readFileSync(path, 'utf8')
      .replace(/require\("@\/data\//g, `require("${join(REPO, 'src', 'data').replace(/\\/g, '/')}/`)
      .replace(/require\("@\//g, `require("${OUT.replace(/\\/g, '/')}/`));
  }
}

const { priceSelection, formatCents, centsToDecimal, lineLabel } = require(join(OUT, 'lib/catalogue/pricing.js'));
const {
  defaultSelection, validateSelection, socketArticleForCountry, socketMatchForCountry, categoriesFor,
  NON_MAINLAND_EUROPE, isMainlandEurope, transportSuffixForCountry, transportArticleForCountry, extensionSegments,
  isAutoCategory, chooseableArticles, chooseableCategories, canonicalSelection,
} = require(join(OUT, 'lib/catalogue/select.js'));
const snapshot = JSON.parse(readFileSync(join(REPO, 'src/data/catalogue.snapshot.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------
let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `\n     expected ${JSON.stringify(expected)}\n     actual   ${JSON.stringify(actual)}`}`);
};
const product = (id) => snapshot.products.find((p) => p.id === id);
const article = (code) => snapshot.articles.find((a) => a.code === code);
const cents = (code) => article(code).priceCents;
/**
 * Default configuration + extra codes, with the given quantity, in canonical
 * form (rule 8): the transport line for the country is on it, and the
 * extra-element installation line when installation + an extension are.
 */
const configure = (id, extra, quantity = 1, country = 'BE') => {
  const base = defaultSelection(product(id), snapshot, country);
  return canonicalSelection({ ...base, quantity, articles: [...base.articles, ...extra] }, snapshot, country);
};
/** Swap the default article of a category for another code. */
const swap = (selection, code) => {
  const target = article(code);
  return { ...selection, articles: [...selection.articles.filter((c) => article(c).categoryKey !== target.categoryKey), code] };
};

// ---------------------------------------------------------------------------
// 2. Pricing rules
// ---------------------------------------------------------------------------
console.log('\n# pricing (src/lib/catalogue/pricing.ts against the snapshot)');

// Solo Flex, closed backwall, monitor bracket, ×2 → 2 × (4 118,75 + 156,25 + 500 transport) = 9 550,00
{
  const sel = configure('solo-flex', ['RS-SF-OMB'], 2);
  check('solo-flex default selection is valid', validateSelection(sel, snapshot), { ok: true });
  const priced = priceSelection(sel, snapshot);
  check('Solo Flex closed + monitor bracket ×2 = 955000', priced.netCents, 2 * (cents('RS-SF-BF') + cents('RS-SF-OMB') + cents('WEB-SOLO-FLEX-TRANSPORT-EU')));
  check('… equals 955000 in cents', priced.netCents, 955000);
  check('… no on-request lines, no segments, no extension', [priced.hasOnRequestItems, priced.segments, priced.extensionSegments], [false, null, 0]);
  check('… included articles are lines at 0 (colour, felt, table, door, socket)',
    priced.lines.filter((l) => l.priceType === 'included').map((l) => l.lineTotalCents), [0, 0, 0, 0, 0]);
  check('… quantity carried on every line', priced.lines.every((l) => l.qty === 2), true);
  check('… the transport line is the last one, 2 × 500', priced.lines.at(-1), {
    code: 'WEB-SOLO-FLEX-TRANSPORT-EU', categoryKey: 'transport', description: 'Transport within mainland Europe', priceType: 'option', qty: 2, unitPriceCents: 50000, lineTotalCents: 100000,
  });
}

// Modular XL, glass backwall, +2 elements, fire protection ×1
// → 14 468,75 + 10 237,50 + (2 + 2) × 2 068,75 + 750 transport = 33 731,25
{
  const sel = swap(configure('modular-xl', ['RS-MX-AS2', 'RS-MX-FP'], 1), 'RS-MX-BG');
  check('modular-xl selection is valid', validateSelection(sel, snapshot), { ok: true });
  const priced = priceSelection(sel, snapshot);
  check('Modular XL glass + AS2 + fire protection ×1 = 3373125', priced.netCents, cents('RS-MX-BG') + cents('RS-MX-AS2') + (2 + 2) * cents('RS-MX-FP') + cents('WEB-MODULAR-XL-TRANSPORT-EU'));
  check('… equals 3373125 in cents', priced.netCents, 3373125);
  check('… segments = 4, extension segments = 2', [priced.segments, priced.extensionSegments], [4, 2]);
  check('… fire protection line qty = 4', priced.lines.find((l) => l.code === 'RS-MX-FP').qty, 4);
  check('… no installation chosen: no extra-element installation line', priced.lines.some((l) => l.code === 'WEB-MODULAR-XL-INST-EXT'), false);
  // ×3 booths: the per-segment line becomes 3 × 4
  const priced3 = priceSelection({ ...sel, quantity: 3 }, snapshot);
  check('… ×3 booths: fire protection qty = 12, net = 3 × 3373125', [priced3.lines.find((l) => l.code === 'RS-MX-FP').qty, priced3.netCents], [12, 3 * 3373125]);
}

// Modular XL, closed backwall, +2 elements, installation, transport (Belgium)
// → 13 781,25 + 10 237,50 + 1 645 + 2 × 1 245 + 750 = 28 903,75 (rules 7 and 8)
{
  const sel = configure('modular-xl', ['RS-MX-AS2', 'WEB-MODULAR-XL-INST'], 1);
  check('modular-xl + AS2 + installation is valid', validateSelection(sel, snapshot), { ok: true });
  check('… canonical form appends the transport and the extra-element installation lines', sel.articles.slice(-2), ['WEB-MODULAR-XL-TRANSPORT-EU', 'WEB-MODULAR-XL-INST-EXT']);
  const priced = priceSelection(sel, snapshot);
  check('Modular XL + AS2 + installation + transport = 2890375', priced.netCents,
    cents('RS-MX-BF') + cents('RS-MX-AS2') + cents('WEB-MODULAR-XL-INST') + 2 * cents('WEB-MODULAR-XL-INST-EXT') + cents('WEB-MODULAR-XL-TRANSPORT-EU'));
  check('… equals 2890375 in cents', priced.netCents, 2890375);
  check('… extension segments = 2, nothing on request', [priced.extensionSegments, priced.hasOnRequestItems], [2, false]);
  const ext = priced.lines.find((l) => l.code === 'WEB-MODULAR-XL-INST-EXT');
  check('… extra-element installation line: qty 2 × 1 245', [ext.qty, ext.unitPriceCents, ext.lineTotalCents], [2, 124500, 249000]);
  check('… lines in catalogue order: installation, then extra elements, then transport', priced.lines.slice(-3).map((l) => l.code), ['WEB-MODULAR-XL-INST', 'WEB-MODULAR-XL-INST-EXT', 'WEB-MODULAR-XL-TRANSPORT-EU']);
  // ×2 booths: the per-extension line becomes 2 × 2
  const priced2 = priceSelection({ ...sel, quantity: 2 }, snapshot);
  check('… ×2 booths: extra-element qty = 4, net = 2 × 2890375', [priced2.lines.find((l) => l.code === 'WEB-MODULAR-XL-INST-EXT').qty, priced2.netCents], [4, 2 * 2890375]);
  // +3 elements: 3 × 1 245
  const sel3 = configure('modular-xl', ['RS-MX-AS3', 'WEB-MODULAR-XL-INST'], 1);
  check('… with AS3: extra-element qty = 3, extension segments = 3', [priceSelection(sel3, snapshot).lines.find((l) => l.code === 'WEB-MODULAR-XL-INST-EXT').qty, priceSelection(sel3, snapshot).extensionSegments], [3, 3]);
  // Installation without an extension: main module only, no extra-element line
  const selMain = configure('modular-xl', ['WEB-MODULAR-XL-INST'], 1);
  check('… installation without extension: no extra-element line, 1 645 + base + transport',
    [selMain.articles.includes('WEB-MODULAR-XL-INST-EXT'), priceSelection(selMain, snapshot).netCents], [false, cents('RS-MX-BF') + cents('WEB-MODULAR-XL-INST') + cents('WEB-MODULAR-XL-TRANSPORT-EU')]);
  // The pricing rule alone (rule 7): a per-extension code with 0 extension segments is skipped
  const forced = { ...selMain, articles: [...selMain.articles, 'WEB-MODULAR-XL-INST-EXT'] };
  check('… rule 7: a per-extension line with 0 extension segments is omitted from the lines',
    priceSelection(forced, snapshot).lines.some((l) => l.code === 'WEB-MODULAR-XL-INST-EXT'), false);
}

// Solo ECO default → 2 740 + 300 transport = 3 040; delivered to Ireland → transport on request
{
  const sel = configure('solo-eco', [], 1);
  check('solo-eco default selection is valid', validateSelection(sel, snapshot), { ok: true });
  const priced = priceSelection(sel, snapshot);
  check('Solo ECO default = 304000', priced.netCents, cents('RS-SE-BF') + cents('WEB-SOLO-ECO-TRANSPORT-EU'));
  check('… equals 304000 in cents', priced.netCents, 304000);
  check('… nothing on request', priced.hasOnRequestItems, false);
  const ie = configure('solo-eco', [], 1, 'IE');
  check('… delivered to IE: the on-request transport line replaces the flat one', [ie.articles.includes('WEB-SOLO-ECO-TRANSPORT-XX'), ie.articles.includes('WEB-SOLO-ECO-TRANSPORT-EU')], [true, false]);
  const pricedIe = priceSelection(ie, snapshot);
  const line = pricedIe.lines.find((l) => l.code === 'WEB-SOLO-ECO-TRANSPORT-XX');
  check('… IE: hasOnRequestItems, transport line without amount, net = base', [pricedIe.hasOnRequestItems, line.unitPriceCents, line.lineTotalCents, pricedIe.netCents], [true, null, null, cents('RS-SE-BF')]);
}

// Modular 4, "Without sofas" credit → 10 218,75 − 856,25 = 9 362,50 (no transport article: not sold online)
{
  const sel = swap(configure('modular-4', [], 1), 'RS-M4-SFN');
  // Modular 4 is not sold from a page (websiteSlug null): validation refuses
  // it for an order, but the pricing rules are the same for every product.
  check('modular-4 cannot be ordered online (no website page)', validateSelection(sel, snapshot), { ok: false, reason: 'product_not_for_sale' });
  check('… but a Modular 4 sold from a page would validate (sofas: exactly one)',
    validateSelection(sel, { ...snapshot, products: snapshot.products.map((p) => (p.id === 'modular-4' ? { ...p, websiteSlug: 'modular-4' } : p)) }), { ok: true });
  check('… has no transport line', sel.articles.some((c) => article(c).categoryKey === 'transport'), false);
  const priced = priceSelection(sel, snapshot);
  check('Modular 4 with "Without sofas" credit = 936250', priced.netCents, cents('RS-M4-BF') + cents('RS-M4-SFN'));
  check('… equals 936250 in cents', priced.netCents, 936250);
  check('… credit line is negative', priced.lines.find((l) => l.code === 'RS-M4-SFN').lineTotalCents, -85625);
}

// Duo Flex with Flex table white → 7 612,50 + 787,50 + 500 transport = 8 900,00
{
  const sel = swap(configure('duo-flex', [], 1), 'RS-DF-TW');
  check('duo-flex selection is valid', validateSelection(sel, snapshot), { ok: true });
  const priced = priceSelection(sel, snapshot);
  check('Duo Flex with Flex table white = 890000', priced.netCents, cents('RS-DF-BF') + cents('RS-DF-TW') + cents('WEB-DUO-FLEX-TRANSPORT-EU'));
  check('… equals 890000 in cents', priced.netCents, 890000);
}

// Installation is priced (Michael, 12 Sep 2026): Solo Flex + installation = 4 118,75 + 1 245 + 500 = 5 863,75
{
  const sel = configure('solo-flex', ['WEB-SOLO-FLEX-INST'], 1);
  check('installation selection is valid', validateSelection(sel, snapshot), { ok: true });
  const priced = priceSelection(sel, snapshot);
  const line = priced.lines.find((l) => l.code === 'WEB-SOLO-FLEX-INST');
  check('Solo Flex + installation = 586375', [priced.netCents, priced.hasOnRequestItems], [cents('RS-SF-BF') + cents('WEB-SOLO-FLEX-INST') + cents('WEB-SOLO-FLEX-TRANSPORT-EU'), false]);
  check('… equals 586375 in cents', priced.netCents, 586375);
  check('… installation line 1 × 1 245', [line.qty, line.unitPriceCents, line.lineTotalCents], [1, 124500, 124500]);
  check('… the five priced installations', ['WEB-SOLO-ECO-INST', 'WEB-SOLO-FLEX-INST', 'WEB-DUO-WORK-INST', 'WEB-DUO-FLEX-INST', 'WEB-MODULAR-XL-INST'].map(cents), [87500, 124500, 124500, 124500, 164500]);
  check('… the others stay on request', ['WEB-SOLO-STAND-INST', 'WEB-MODULAR-4-INST', 'WEB-INTERIOR-INST', 'WEB-DIVIDE-INST', 'WEB-SOLID-INST'].map(cents), [null, null, null, null, null]);
}

// An on-request add-on: flagged, line without amount, net unaffected
{
  const sel = configure('solo-flex', ['WEB-SOLO-FLEX-MONITORMOUNT'], 1);
  check('on-request add-on selection is valid', validateSelection(sel, snapshot), { ok: true });
  const priced = priceSelection(sel, snapshot);
  const line = priced.lines.find((l) => l.code === 'WEB-SOLO-FLEX-MONITORMOUNT');
  check('order with an on-request add-on: hasOnRequestItems', priced.hasOnRequestItems, true);
  check('… its line has null unit and total', [line.unitPriceCents, line.lineTotalCents], [null, null]);
  check('… net is the priced lines only', priced.netCents, cents('RS-SF-BF') + cents('WEB-SOLO-FLEX-TRANSPORT-EU'));
}

// ---------------------------------------------------------------------------
// select.ts: defaults, sockets, validation
// ---------------------------------------------------------------------------
console.log('\n# selection (src/lib/catalogue/select.ts)');
{
  const sf = product('solo-flex');
  check('categoriesFor(solo-flex) in sort order', categoriesFor(sf, snapshot).map((c) => c.key),
    ['construction', 'exterior_color', 'interior_felt', 'table', 'door_orientation', 'power_socket', 'options', 'fire_protection', 'installation', 'transport']);
  check('chooseableCategories(solo-flex) leaves the auto category out', chooseableCategories(sf, snapshot).map((c) => c.key),
    ['construction', 'exterior_color', 'interior_felt', 'table', 'door_orientation', 'power_socket', 'options', 'fire_protection', 'installation']);
  check('chooseableCategories(modular-xl) has neither transport nor installation_extension', chooseableCategories(product('modular-xl'), snapshot).map((c) => c.key).filter((k) => k === 'transport' || k === 'installation_extension'), []);
  check('chooseableArticles(modular-xl) has no auto article', chooseableArticles(product('modular-xl'), snapshot).map((a) => a.code).filter((c) => /TRANSPORT|INST-EXT/.test(c)), []);
  check('isAutoCategory', snapshot.categories.filter(isAutoCategory).map((c) => c.key), ['installation_extension', 'transport']);

  // Transport: mainland Europe = every country of the order form but the islands
  check('NON_MAINLAND_EUROPE', [...NON_MAINLAND_EUROPE].sort(), ['CY', 'GB', 'IE', 'IS', 'MT', 'XI']);
  check('isMainlandEurope', ['BE', 'de', 'PL', 'CH', 'NO', 'RS', 'UA', 'IT', 'GB', 'xi', 'IE', 'MT', 'CY', 'IS', '', null, undefined, 'US'].map((c) => isMainlandEurope(c)),
    [true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true]);
  check('transportSuffixForCountry', ['BE', 'GB', 'IE', '', null].map((c) => transportSuffixForCountry(c)), ['EU', 'XX', 'XX', 'EU', 'EU']);
  check('every country of the order form gets a transport suffix, six of them XX',
    require(join(OUT, 'lib/order/vat.js')).COUNTRIES.filter((c) => transportSuffixForCountry(c.code) === 'XX').map((c) => c.code).sort(), ['CY', 'GB', 'IE', 'IS', 'MT', 'XI']);
  check('transportArticleForCountry(solo-eco)', ['BE', 'IE', null].map((c) => transportArticleForCountry('solo-eco', snapshot, c).code),
    ['WEB-SOLO-ECO-TRANSPORT-EU', 'WEB-SOLO-ECO-TRANSPORT-XX', 'WEB-SOLO-ECO-TRANSPORT-EU']);
  check('the five booths sold online have both transport articles', ['solo-eco', 'solo-flex', 'duo-work', 'duo-flex', 'modular-xl'].map((id) => [transportArticleForCountry(id, snapshot, 'BE')?.priceCents, transportArticleForCountry(id, snapshot, 'GB')?.priceCents]),
    [[30000, null], [50000, null], [50000, null], [50000, null], [75000, null]]);
  check('products without a figure have no transport article', ['solo-stand', 'modular-4', 'interior', 'divide', 'solid'].map((id) => transportArticleForCountry(id, snapshot, 'BE')), [null, null, null, null, null]);

  // Extension segments and the canonical form
  check('extensionSegments', [[], ['RS-MX-BF'], ['RS-MX-BF', 'RS-MX-AS1'], ['RS-MX-AS2'], ['RS-MX-AS3', 'nope']].map((codes) => extensionSegments(codes, snapshot)), [0, 0, 1, 2, 3]);
  const mx = defaultSelection(product('modular-xl'), snapshot, 'BE');
  check('defaultSelection(modular-xl, BE) ends with the mainland transport line', mx.articles.at(-1), 'WEB-MODULAR-XL-TRANSPORT-EU');
  check('canonicalSelection: country change swaps the transport line', canonicalSelection(mx, snapshot, 'GB').articles.at(-1), 'WEB-MODULAR-XL-TRANSPORT-XX');
  check('canonicalSelection: a stale island line is replaced for Belgium', canonicalSelection({ ...mx, articles: [...mx.articles.filter((c) => !/TRANSPORT/.test(c)), 'WEB-MODULAR-XL-TRANSPORT-XX'] }, snapshot, 'BE').articles.filter((c) => /TRANSPORT/.test(c)), ['WEB-MODULAR-XL-TRANSPORT-EU']);
  check('canonicalSelection: no country → mainland', canonicalSelection(mx, snapshot).articles.at(-1), 'WEB-MODULAR-XL-TRANSPORT-EU');
  check('canonicalSelection: idempotent', canonicalSelection(canonicalSelection(mx, snapshot, 'IE'), snapshot, 'IE'), canonicalSelection(mx, snapshot, 'IE'));
  const withInst = canonicalSelection({ ...mx, articles: [...mx.articles, 'RS-MX-AS1', 'WEB-MODULAR-XL-INST'] }, snapshot, 'BE');
  check('canonicalSelection: installation + extension → extra-element line after the transport line', withInst.articles.slice(-2), ['WEB-MODULAR-XL-TRANSPORT-EU', 'WEB-MODULAR-XL-INST-EXT']);
  check('canonicalSelection: non-auto codes keep their order', withInst.articles.filter((c) => !/TRANSPORT|INST-EXT/.test(c)), [...mx.articles.filter((c) => !/TRANSPORT/.test(c)), 'RS-MX-AS1', 'WEB-MODULAR-XL-INST']);
  check('canonicalSelection: extension without installation → no extra-element line', canonicalSelection({ ...mx, articles: [...mx.articles, 'RS-MX-AS2'] }, snapshot, 'BE').articles.includes('WEB-MODULAR-XL-INST-EXT'), false);
  check('canonicalSelection: installation without extension → no extra-element line', canonicalSelection({ ...mx, articles: [...mx.articles, 'WEB-MODULAR-XL-INST'] }, snapshot, 'BE').articles.includes('WEB-MODULAR-XL-INST-EXT'), false);
  check('canonicalSelection: a stray extra-element code is dropped when the rule does not apply', canonicalSelection({ ...mx, articles: [...mx.articles, 'WEB-MODULAR-XL-INST-EXT'] }, snapshot, 'BE').articles.includes('WEB-MODULAR-XL-INST-EXT'), false);
  check('canonicalSelection: unknown codes are kept for validateSelection to report', canonicalSelection({ ...mx, articles: [...mx.articles, 'RS-MX-ZZZ'] }, snapshot, 'BE').articles.includes('RS-MX-ZZZ'), true);
  check('canonicalSelection(interior): nothing to add', canonicalSelection(defaultSelection(product('interior'), snapshot), snapshot, 'BE').articles, ['WEB-INTERIOR-SET']);
  check('socket per country', ['BE', 'FR', 'PL', 'CZ', 'SK', 'CH', 'LI', 'DK', 'GB', 'XI', 'IE', 'MT', 'CY', 'DE', 'NL', 'AT', 'LU', 'IT', 'US', ''].map((c) => socketArticleForCountry(sf, snapshot, c).code),
    ['RS-SF-PE', 'RS-SF-PE', 'RS-SF-PE', 'RS-SF-PE', 'RS-SF-PE', 'RS-SF-PJ', 'RS-SF-PJ', 'RS-SF-PK', 'RS-SF-PG', 'RS-SF-PG', 'RS-SF-PG', 'RS-SF-PG', 'RS-SF-PG', 'RS-SF-PF', 'RS-SF-PF', 'RS-SF-PF', 'RS-SF-PF', 'RS-SF-PF', 'RS-SF-PF', 'RS-SF-PF']);
  check('socketMatchForCountry: listed countries match (type F ones included), Italy and unknown codes get the default', ['BE', 'MT', 'LI', 'CY', 'DE', 'UA', 'ES', 'IT', 'US', ''].map((c) => socketMatchForCountry(c)),
    ['PE', 'PG', 'PJ', 'PG', 'PF', 'PF', 'PF', null, null, null]);
  check('every country of the order form has a socket, Italy excepted', require(join(OUT, 'lib/order/vat.js')).COUNTRIES.filter((c) => socketMatchForCountry(c.code) === null).map((c) => c.code), ['IT']);
  check('textile products have no socket article', socketArticleForCountry(product('interior'), snapshot, 'BE'), null);
  check('defaultSelection(solo-flex, DE) picks the type F socket, the standard felt and the mainland transport', defaultSelection(sf, snapshot, 'DE').articles,
    ['RS-SF-BF', 'RS-SF-XW', 'RS-SF-FG', 'RS-SF-TW', 'RS-SF-DL', 'RS-SF-PF', 'WEB-SOLO-FLEX-TRANSPORT-EU']);
  check('defaultSelection(solo-flex) without a country: catalogue socket default, transport as for Belgium', defaultSelection(sf, snapshot).articles,
    ['RS-SF-BF', 'RS-SF-XW', 'RS-SF-FG', 'RS-SF-TW', 'RS-SF-DL', 'RS-SF-PE', 'WEB-SOLO-FLEX-TRANSPORT-EU']);
  check('defaultSelection(solo-flex, GB): type G socket, transport on request', defaultSelection(sf, snapshot, 'GB').articles.slice(-2), ['RS-SF-PG', 'WEB-SOLO-FLEX-TRANSPORT-XX']);
  check('defaultSelection(modular-xl) has no extension and no multi-select articles',
    defaultSelection(product('modular-xl'), snapshot, 'BE').articles.filter((c) => /AS\d|FP|OMB|OET|INST/.test(c)), []);
  check('defaultSelection(interior)', defaultSelection(product('interior'), snapshot), { productId: 'interior', quantity: 1, articles: ['WEB-INTERIOR-SET'] });

  const ok = defaultSelection(sf, snapshot, 'BE');
  const reasons = [
    ['unknown product', { ...ok, productId: 'nope' }],
    ['product not sold on a page', { ...defaultSelection(product('solo-stand'), snapshot, 'BE') }],
    ['quantity 0', { ...ok, quantity: 0 }],
    ['quantity above max', { ...ok, quantity: 26 }],
    ['quantity fractional', { ...ok, quantity: 1.5 }],
    ['article of another product', { ...ok, articles: [...ok.articles, 'RS-DF-OET'] }],
    ['unknown article', { ...ok, articles: [...ok.articles, 'RS-SF-ZZZ'] }],
    ['duplicate article', { ...ok, articles: [...ok.articles, 'RS-SF-BF'] }],
    ['two constructions', { ...ok, articles: [...ok.articles, 'RS-SF-BG'] }],
    ['missing socket', { ...ok, articles: ok.articles.filter((c) => c !== 'RS-SF-PE') }],
    ['two extensions', { ...defaultSelection(product('modular-xl'), snapshot, 'BE'), articles: [...defaultSelection(product('modular-xl'), snapshot, 'BE').articles, 'RS-MX-AS1', 'RS-MX-AS2'] }],
    ['two transport articles', { ...ok, articles: [...ok.articles, 'WEB-SOLO-FLEX-TRANSPORT-XX'] }],
  ].map(([name, sel]) => [name, validateSelection(sel, snapshot).reason]);
  check('validateSelection reasons', reasons, [
    ['unknown product', 'unknown_product'],
    ['product not sold on a page', 'product_not_for_sale'],
    ['quantity 0', 'quantity_invalid'],
    ['quantity above max', 'quantity_invalid'],
    ['quantity fractional', 'quantity_invalid'],
    ['article of another product', 'unknown_article:RS-DF-OET'],
    ['unknown article', 'unknown_article:RS-SF-ZZZ'],
    ['duplicate article', 'duplicate_article:RS-SF-BF'],
    ['two constructions', 'category_required:construction'],
    ['missing socket', 'category_required:power_socket'],
    ['two extensions', 'category_single:additional_segments'],
    ['two transport articles', 'category_single:transport'],
  ]);
  check('a selection without its transport line still validates (the callers canonicalise)', validateSelection({ ...ok, articles: ok.articles.filter((c) => !/TRANSPORT/.test(c)) }, snapshot), { ok: true });
  check('one extension is fine', validateSelection({ ...defaultSelection(product('modular-xl'), snapshot, 'BE'), articles: [...defaultSelection(product('modular-xl'), snapshot, 'BE').articles, 'RS-MX-AS3'] }, snapshot), { ok: true });
  check('two accessories are fine (multi)', validateSelection({ ...ok, articles: [...ok.articles, 'RS-SF-OMB', 'RS-SF-OET'] }, snapshot), { ok: true });
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
console.log('\n# formatting');
check('formatCents 411875 nl-BE', formatCents(411875, 'nl-BE'), '€ 4.118,75');
check('formatCents 274000 nl-BE drops the decimals', formatCents(274000, 'nl-BE'), '€ 2.740');
check('formatCents 761250 en-BE keeps two decimals', formatCents(761250, 'en-BE'), '€7,612.50');
check('formatCents 761250 fr-BE', formatCents(761250, 'fr-BE'), '7 612,50 €');
check('formatCents credit', formatCents(-85625, 'en-BE'), '-€856.25');
check('centsToDecimal', [centsToDecimal(411875), centsToDecimal(274000), centsToDecimal(-85625), centsToDecimal(5)], ['4118.75', '2740', '-856.25', '0.05']);
check('lineLabel falls back to the description', lineLabel({ labels: {}, description: 'Glass backwall' }, 'nl'), 'Glass backwall');
check('lineLabel uses the label', lineLabel({ labels: { nl: 'Glazen achterwand' }, description: 'Glass backwall' }, 'nl'), 'Glazen achterwand');

// ---------------------------------------------------------------------------
// 3. load.ts: snapshot fallback (unconfigured, then an unreachable host)
// ---------------------------------------------------------------------------
console.log('\n# load.ts fallback');
for (const k of ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']) delete process.env[k];
const load = require(join(OUT, 'lib/catalogue/load.js'));
const supabase = require(join(OUT, 'lib/db/supabase.js'));
const warnings = [];
const origWarn = console.warn;
console.warn = (...args) => warnings.push(args.join(' '));
try {
  check('isSupabaseConfigured() without env', supabase.isSupabaseConfigured(), false);
  check('createServerClient() without env', supabase.createServerClient(), null);
  const c1 = await load.getCatalogue();
  // The loader keeps inactive rows out of the catalogue it serves.
  check('unconfigured → snapshot', [c1.source, c1.products.length, c1.categories.length, c1.articles.length],
    ['snapshot', snapshot.products.filter((p) => p.active).length, snapshot.categories.length, snapshot.articles.filter((a) => a.active).length]);
  check('getFromPriceCents(solo-flex) = 411875', await load.getFromPriceCents('solo-flex'), 411875);
  check('getProductPrices()', Object.fromEntries(await load.getProductPrices()), { 'solo-eco': 274000, 'solo-flex': 411875, duo: 761250, 'modular-xl': 1378125, interior: 38700, divide: 123800, solid: 40700 });
  const duo = await load.getConfiguratorData('duo');
  check('getConfiguratorData(duo)', [duo.products.map((p) => p.id), duo.categories.length, duo.articles.length, duo.priceList],
    [['duo-work', 'duo-flex'], 14, snapshot.articles.filter((a) => a.active && (a.productId === 'duo-work' || a.productId === 'duo-flex')).length, { id: 'booths-2026', validFrom: '2026-09-21' }]);
  check('… every loaded article carries perExtension, one of them true', [c1.articles.every((a) => typeof a.perExtension === 'boolean'), c1.articles.filter((a) => a.perExtension).map((a) => a.code)], [true, ['WEB-MODULAR-XL-INST-EXT']]);
  check('getConfiguratorData(unknown) is empty', (await load.getConfiguratorData('nope')).products, []);
  check('one warning so far', warnings.length, 1);
  check('the snapshot carries no internal notes', [snapshot.articles.every((a) => a.notes === null), snapshot.priceLists.every((l) => l.notes.length === 0)], [true, true]);

  // Unreachable host: a closed local port → immediate connection error, not a hang
  process.env.SUPABASE_URL = 'http://127.0.0.1:9';
  process.env.SUPABASE_ANON_KEY = 'not-a-key';
  check('isSupabaseConfigured() with env', supabase.isSupabaseConfigured(), true);
  check('createServerClient() with env', supabase.createServerClient() !== null, true);
  load.resetCatalogueCache();
  const started = Date.now();
  const c2 = await load.getCatalogue();
  const elapsed = Date.now() - started;
  check('unreachable host → snapshot', [c2.source, c2.products.length], ['snapshot', snapshot.products.filter((p) => p.active).length]);
  check('… answered within the 4 s ceiling', elapsed < supabase.FETCH_TIMEOUT_MS + 500, true);
  check('… memoised: second call returns the same object without a new attempt', (await load.getCatalogue()) === c2, true);
  check('… still one warning per process', warnings.length, 1);
  console.log(`     (fallback took ${elapsed} ms; warning: ${warnings[0]})`);
} finally {
  console.warn = origWarn;
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nall checks passed');
process.exit(failures ? 1 : 0);
