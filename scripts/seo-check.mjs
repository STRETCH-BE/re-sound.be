#!/usr/bin/env node
/**
 * Re-Sound SEO check.
 *
 * Runs against a local production build (`next build && next start`) or
 * against any base URL passed as the first argument, and reports:
 *
 *   (a) forbidden strings per locale (see FORBIDDEN below)
 *   (b) share of English text segments on non-English pages, using an
 *       English stop-word ratio on unique text segments of >= 4 words
 *   (c) presence + count of hreflang links and the canonical per page
 *   (d) JSON-LD parse + presence of `offers` on every `Product`
 *   (e) sitemap URL count and `lastmod` distribution
 *   (f) internal links that return 404 (crawling every sitemap URL)
 *   (g) title / meta-description lengths (warn > 65 / > 155 chars)
 *
 * Usage:
 *   node scripts/seo-check.mjs                     # builds if needed, starts next on :3999
 *   node scripts/seo-check.mjs http://localhost:3000
 *   node scripts/seo-check.mjs https://re-sound.be --out docs/seo-check-after.txt
 *
 * Options:
 *   --out <file>        also write the report to <file>
 *   --locales a,b,c     restrict to these locale prefixes (default: all in sitemap)
 *   --also-locales x,y  also crawl these locale prefixes (not in the sitemap, e.g. noindex
 *                       locales) by mirroring every English sitemap page
 *   --max-pages N       stop after N pages (debugging)
 *   --no-build          never run `next build` (fail if .next is missing)
 *   --port N            port for the self-started server (default 3999)
 *   --concurrency N     parallel fetches (default 8)
 *
 * Zero dependencies: Node >= 18 (global fetch).
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const opts = { out: null, locales: null, alsoLocales: null, maxPages: Infinity, build: true, port: 3999, concurrency: 8 };
let baseArg = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--out') opts.out = argv[++i];
  else if (a === '--locales') opts.locales = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
  else if (a === '--also-locales') opts.alsoLocales = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
  else if (a === '--max-pages') opts.maxPages = Number(argv[++i]);
  else if (a === '--no-build') opts.build = false;
  else if (a === '--port') opts.port = Number(argv[++i]);
  else if (a === '--concurrency') opts.concurrency = Number(argv[++i]);
  else if (a.startsWith('http')) baseArg = a.replace(/\/$/, '');
  else {
    console.error(`Unknown argument: ${a}`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------------------
// Forbidden strings
//   scope: 'text'      – anywhere in the visible page text (case-insensitive)
//          'nonEnText' – visible text, non-EN locales only
//          'titleH1'   – inside <title> or any <h1>
// ---------------------------------------------------------------------------

const FORBIDDEN = [
  { needle: 'the earth.', scope: 'text' },
  { needle: 'de aarde.', scope: 'text' },
  { needle: 'la planète.', scope: 'text' },
  { needle: 'die Erde.', scope: 'text' },
  { needle: 'Partner 1', scope: 'text' },
  { needle: 'Partner 2', scope: 'text' },
  { needle: 'micro-grooved', scope: 'text' },
  { needle: 'no installation needed', scope: 'nonEnText' },
  { needle: 'gegroeide', scope: 'text' },
  { needle: 'Milieuresepct', scope: 'text' },
  { needle: 'Staalpackage', scope: 'text' },
  { needle: 'Elevieren', scope: 'text' },
  { needle: 'möbelqualität', scope: 'text' },
  { needle: 'Sans Couture', scope: 'text' },
  { needle: 'soundbooth', scope: 'titleH1' },
  // Sprint 2: wheelchair access is not standard on any booth (needs-Michael) — the old Modular XL claim must not spread.
  { needle: 'accessible-by-design', scope: 'text' },
];

// ---------------------------------------------------------------------------
// English detection
//
// A text segment (>= 4 words) counts as English when the share of its words
// found in ENGLISH_STOPWORDS is >= 20% (at least one hit for 4–7 words, at
// least two hits from 8 words on). Words that are also common in the page's
// own language are removed from the list per locale (COLLISIONS) so that,
// e.g., Dutch "we"/"is"/"of" or Nordic "for"/"at"/"to" do not count.
// ---------------------------------------------------------------------------

const ENGLISH_STOPWORDS = new Set([
  'the', 'and', 'of', 'to', 'with', 'for', 'your', 'our', 'from', 'that', 'this',
  'are', 'you', 'we', 'by', 'it', 'as', 'be', 'can', 'will', 'all', 'into', 'more',
  'not', 'has', 'have', 'which', 'their', 'its', 'than', 'every', 'made', 'is',
  'an', 'or', 'on', 'in', 'at', 'any', 'each', 'when', 'where', 'while', 'without',
  'through', 'about', 'both', 'these', 'those', 'they', 'them', 'been', 'were',
  'was', 'what', 'how', 'why', 'who', 'also', 'only', 'just', 'most', 'other',
  'some', 'such', 'over', 'under', 'between', 'after', 'before', 'during',
  'should', 'would', 'could', 'need', 'needs', 'get', 'use', 'used', 'using',
  'new', 'up', 'out', 'no', 'yes', 'so', 'if', 'but', 'then', 'there', 'here',
]);

const COLLISIONS = {
  nl: ['we', 'is', 'of', 'in', 'over', 'been', 'was', 'at', 'as', 'an', 'no', 'so', 'or', 'on', 'it', 'the', 'get'],
  de: ['in', 'an', 'all', 'also', 'so', 'be', 'at', 'was', 'no', 'or', 'up'],
  fr: ['on', 'a', 'or', 'as', 'an', 'no', 'so', 'but', 'the', 'these'],
  es: ['a', 'as', 'no', 'so', 'en', 'the', 'has', 'so', 'we', 'an', 'or', 'be'],
  pt: ['a', 'as', 'no', 'so', 'the', 'has', 'we', 'an', 'or', 'be', 'at', 'out'],
  da: ['for', 'at', 'to', 'and', 'en', 'in', 'so', 'no', 'or', 'over', 'under', 'an', 'as', 'been', 'was', 'up', 'if', 'but', 'the'],
  sv: ['for', 'at', 'to', 'and', 'en', 'in', 'so', 'no', 'or', 'over', 'under', 'an', 'as', 'been', 'was', 'up', 'if', 'but', 'the', 'all'],
  no: ['for', 'at', 'to', 'and', 'en', 'in', 'so', 'no', 'or', 'over', 'under', 'an', 'as', 'been', 'was', 'up', 'if', 'but', 'the', 'all'],
  is: ['at', 'to', 'and', 'en', 'in', 'so', 'no', 'or', 'over', 'under', 'an', 'as', 'been', 'was', 'up', 'if', 'but', 'the', 'all', 'has'],
};

function stopwordsFor(locale) {
  const set = new Set(ENGLISH_STOPWORDS);
  for (const w of COLLISIONS[locale] ?? []) set.delete(w);
  return set;
}

// Spanish words that do not occur in (European) Portuguese — used to catch
// Spanish copy leaking into /pt pages (the audit found the PT homepage body
// rendered in Spanish). Words spelt the same in Portuguese (para, que, como,
// sobre, cada, também, acústico, reciclado, solicitar …) are deliberately
// left out.
const SPANISH_MARKERS = new Set([
  'el', 'los', 'las', 'del', 'con', 'una', 'y', 'en', 'es', 'más', 'sus',
  'nuestros', 'nuestras', 'nuestro', 'nuestra', 'hasta', 'muy', 'sin', 'pero', 'al',
  'son', 'están', 'tiene', 'tienen', 'hacer', 'ahora', 'ya', 'usted', 'ustedes', 'aquí',
  'día', 'años', 'año', 'diseño', 'diseñado', 'diseñados', 'diseñada', 'cualquier',
  'elegir', 'espacio', 'espacios', 'paneles', 'madera',
  'naturaleza', 'encuentra', 'soluciones', 'descubre', 'descubrir',
]);

// Words and spellings that only occur in Portuguese — a segment is only
// "Spanish" when its Spanish-only evidence outweighs its Portuguese evidence.
const PORTUGUESE_MARKERS = new Set(['não', 'com', 'uma', 'um', 'os', 'as', 'é', 'são', 'ao', 'aos', 'à', 'às', 'também', 'mais', 'muito', 'pelo', 'pela', 'pelos', 'pelas', 'nos', 'nas', 'no', 'na', 'dos', 'das', 'do', 'da', 'se', 'ou', 'em', 'isso', 'esta', 'este', 'estes', 'estas', 'nosso', 'nossa', 'nossos', 'nossas', 'seu', 'sua', 'seus', 'suas', 'onde', 'sobre', 'entre', 'ainda', 'já', 'até', 'desde', 'cada', 'toda', 'todo', 'todos', 'todas', 'qual', 'quais']);
function isSpanishSegment(segment) {
  const lower = segment.toLowerCase();
  const words = lower.replace(/[^\p{L}\p{N}'’-]+/gu, ' ').split(/\s+/).filter(Boolean);
  if (words.length < 4) return false;
  let es = 0, pt = 0;
  for (const w of words) {
    if (SPANISH_MARKERS.has(w) && !PORTUGUESE_MARKERS.has(w)) es++;
    if (PORTUGUESE_MARKERS.has(w) && !SPANISH_MARKERS.has(w)) pt++;
  }
  // Morphology only — function words are counted above (JS \b is ASCII-only,
  // so word-boundary regexes misfire on accented words such as soluções).
  if (/ção|ções|ão(?!\p{L})|õe|nh[ao]|lh[ao]/u.test(lower)) pt += 2;
  if (/ción(?!\p{L})|ciones(?!\p{L})|ñ/u.test(lower)) es += 2;
  return es >= 2 && es > pt;
}

function isEnglishSegment(segment, stopwords) {
  const words = segment
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 4) return false;
  let hits = 0;
  for (const w of words) if (stopwords.has(w)) hits++;
  const ratio = hits / words.length;
  if (words.length < 8) return hits >= 1 && ratio >= 0.2;
  return hits >= 2 && ratio >= 0.2;
}

// ---------------------------------------------------------------------------
// Tiny HTML helpers (no deps)
// ---------------------------------------------------------------------------

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', copy: '©', reg: '®', trade: '™', euro: '€', deg: '°', sup2: '²', sup3: '³', times: '×', middot: '·' };
function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z0-9]+);/gi, (m, n) => (n in ENTITIES ? ENTITIES[n] : m));
}

function parseAttrs(tag) {
  const attrs = {};
  const re = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(tag))) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

function allTags(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(parseAttrs(m[0]));
  return out;
}

function stripNonContent(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<template\b[\s\S]*?<\/template>/gi, '')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, '');
}

function visibleText(html) {
  const body = stripNonContent(html);
  return decode(body.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function textSegments(html) {
  const body = stripNonContent(html);
  const lines = decode(body.replace(/<[^>]+>/g, '\n')).split('\n');
  const set = new Set();
  for (const raw of lines) {
    const t = raw.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    if (t.split(' ').length < 4) continue;
    set.add(t);
  }
  return [...set];
}

function innerText(html, tag) {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(decode(m[1].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim());
  return out;
}

function jsonLdBlocks(html) {
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function* walkNodes(node) {
  if (Array.isArray(node)) {
    for (const n of node) yield* walkNodes(n);
  } else if (node && typeof node === 'object') {
    if (node['@type']) yield node;
    for (const v of Object.values(node)) if (v && typeof v === 'object') yield* walkNodes(v);
  }
}

// ---------------------------------------------------------------------------
// Server bootstrap
// ---------------------------------------------------------------------------

async function waitFor(url, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(url, { redirect: 'manual' });
      if (r.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

let server = null;
async function ensureServer() {
  if (baseArg) return baseArg;
  const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
  if (!existsSync(resolve(root, '.next', 'BUILD_ID'))) {
    if (!opts.build) throw new Error('.next build missing and --no-build given');
    console.error('[seo-check] no .next build found — running `next build` …');
    const r = spawnSync('npx', ['next', 'build'], { cwd: root, stdio: 'inherit' });
    if (r.status !== 0) throw new Error('next build failed');
  }
  const base = `http://localhost:${opts.port}`;
  // A server that is already listening would be a stale one (old build in
  // its memory cache) — refuse rather than report on the wrong build.
  if (await waitFor(`${base}/robots.txt`, 1500)) {
    throw new Error(`port ${opts.port} is already in use — stop that server or pass its URL explicitly`);
  }
  console.error(`[seo-check] starting next start on :${opts.port} …`);
  // Spawn the next binary directly (not via npx) in its own process group so
  // stopServer() can kill the whole tree — killing an `npx` wrapper leaves
  // the real server running.
  const nextBin = resolve(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  server = spawn(process.execPath, [nextBin, 'start', '-p', String(opts.port)], {
    cwd: root, stdio: ['ignore', 'ignore', 'inherit'], detached: true,
  });
  if (!(await waitFor(`${base}/robots.txt`, 60000))) throw new Error('server did not start');
  return base;
}

function stopServer() {
  if (server) {
    try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} }
    server = null;
  }
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

async function readSitemap(base) {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml → HTTP ${res.status}`);
  const xml = await res.text();
  const urls = [];
  const re = /<url>([\s\S]*?)<\/url>/g;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const loc = /<loc>\s*([^<]+?)\s*<\/loc>/.exec(block)?.[1];
    const lastmod = /<lastmod>\s*([^<]+?)\s*<\/lastmod>/.exec(block)?.[1] ?? null;
    const alternates = allTags(block, 'xhtml:link').filter((a) => a.rel === 'alternate').map((a) => ({ hreflang: a.hreflang, href: a.href }));
    if (loc) urls.push({ loc: decode(loc), lastmod, alternates });
  }
  return { xml, urls };
}

// ---------------------------------------------------------------------------
// Page analysis
// ---------------------------------------------------------------------------

function localeOf(pathname) {
  const seg = pathname.split('/').filter(Boolean)[0] ?? '';
  if (seg === 'documents') return 'documents';
  return /^[a-z]{2}$/.test(seg) ? seg : 'en';
}

/** Sitemap URLs listed without alternates (single-locale pages). Filled before the crawl. */
const SINGLE_LOCALE = new Set();

async function analysePage(base, url) {
  const u = new URL(url);
  const local = `${base}${u.pathname}${u.search}`;
  const res = await fetch(local, { redirect: 'manual', headers: { 'user-agent': 'resound-seo-check/1.0' } });
  const status = res.status;
  const html = status === 200 ? await res.text() : '';
  const locale = localeOf(u.pathname);
  const page = { url, path: u.pathname, locale, status, problems: [], warnings: [] };
  if (status !== 200) {
    page.problems.push(`HTTP ${status}`);
    return page;
  }

  // (g) title + description
  page.title = innerText(html, 'title')[0] ?? '';
  const metas = allTags(html, 'meta');
  page.description = metas.find((m) => m.name === 'description')?.content ?? '';
  page.robots = metas.find((m) => m.name === 'robots')?.content ?? '';
  page.h1s = innerText(html, 'h1');
  if (!page.title) page.problems.push('missing <title>');
  if (page.title.length > 65) page.warnings.push(`title ${page.title.length} chars > 65`);
  if (!page.description) page.problems.push('missing meta description');
  if (page.description.length > 155) page.warnings.push(`description ${page.description.length} chars > 155`);
  if (page.h1s.length !== 1) page.warnings.push(`${page.h1s.length} <h1> elements`);

  // (c) canonical + hreflang
  const links = allTags(html, 'link');
  const canonicals = links.filter((l) => l.rel === 'canonical').map((l) => l.href);
  page.canonical = canonicals[0] ?? '';
  page.hreflang = links.filter((l) => l.rel === 'alternate' && l.hreflang).map((l) => ({ hreflang: l.hreflang, href: l.href }));
  if (canonicals.length !== 1) page.problems.push(`${canonicals.length} canonical links`);
  else {
    const want = u.pathname.replace(/\/$/, '') || '/';
    const got = (() => { try { return new URL(page.canonical, base).pathname.replace(/\/$/, '') || '/'; } catch { return page.canonical; } })();
    if (got !== want) page.problems.push(`canonical points to ${page.canonical}`);
  }
  if (page.hreflang.length === 0 && !/noindex/i.test(page.robots)) {
    // Single-locale editorial posts (content/blog/<locale>) carry a canonical only — no hreflang by design.
    if (SINGLE_LOCALE.has(u.pathname.replace(/\/$/, ''))) page.warnings.push('single-locale page: no hreflang by design');
    else page.problems.push('no hreflang links');
  }
  if (page.hreflang.length > 0 && !page.hreflang.some((h) => h.hreflang === 'x-default')) page.warnings.push('hreflang set has no x-default');
  if (page.hreflang.length > 0 && !page.hreflang.some((h) => h.hreflang === locale)) page.warnings.push(`hreflang set has no self-reference (${locale})`);

  // (d) JSON-LD
  page.jsonLd = { blocks: 0, types: [], products: 0, productsWithOffers: 0, parseErrors: 0 };
  for (const raw of jsonLdBlocks(html)) {
    page.jsonLd.blocks++;
    let data;
    try { data = JSON.parse(raw); } catch (e) { page.jsonLd.parseErrors++; page.problems.push(`JSON-LD parse error: ${e.message.slice(0, 80)}`); continue; }
    for (const node of walkNodes(data)) {
      const types = [].concat(node['@type']);
      page.jsonLd.types.push(...types);
      if (types.includes('Product')) {
        page.jsonLd.products++;
        if (node.offers) page.jsonLd.productsWithOffers++;
        else page.problems.push(`Product "${node.name ?? '?'}" has no offers`);
      }
    }
  }

  // (a) forbidden strings
  const text = visibleText(html);
  const textLower = text.toLowerCase();
  const titleH1 = [page.title, ...page.h1s].join(' | ').toLowerCase();
  for (const f of FORBIDDEN) {
    const needle = f.needle.toLowerCase();
    if (f.scope === 'text' && textLower.includes(needle)) page.problems.push(`forbidden string "${f.needle}"`);
    if (f.scope === 'nonEnText' && locale !== 'en' && textLower.includes(needle)) page.problems.push(`forbidden string "${f.needle}" on non-EN page`);
    if (f.scope === 'titleH1' && titleH1.includes(needle)) page.problems.push(`forbidden string "${f.needle}" in <title>/<h1>`);
  }

  // (b) English share
  const segments = textSegments(html);
  page.segments = segments.length;
  if (locale !== 'en') {
    const sw = stopwordsFor(locale);
    const english = segments.filter((s) => isEnglishSegment(s, sw));
    page.englishSegments = english.length;
    page.englishShare = segments.length ? english.length / segments.length : 0;
    page.englishSamples = english.slice(0, 12);
  }
  if (locale === 'pt') {
    const spanish = segments.filter(isSpanishSegment);
    page.spanishSegments = spanish.length;
    page.spanishSamples = spanish.slice(0, 8);
    if (spanish.length) page.problems.push(`${spanish.length} Spanish text segments on a PT page`);
  }

  // (f) internal links
  const hrefs = new Set();
  for (const a of allTags(html, 'a')) {
    const h = a.href;
    if (!h) continue;
    if (/^(mailto:|tel:|javascript:|#)/i.test(h)) continue;
    let abs;
    try { abs = new URL(h, base); } catch { continue; }
    const baseOrigin = new URL(base).origin;
    const isInternal = abs.origin === baseOrigin || /re-sound\.be$/.test(abs.hostname);
    if (!isInternal) continue;
    abs.hash = '';
    hrefs.add(abs.pathname + abs.search);
  }
  page.internalLinks = [...hrefs];
  return page;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}

const linkCache = new Map();
async function checkLink(base, pathAndSearch) {
  if (linkCache.has(pathAndSearch)) return linkCache.get(pathAndSearch);
  const p = (async () => {
    try {
      let r = await fetch(`${base}${pathAndSearch}`, { method: 'HEAD', redirect: 'manual' });
      if (r.status === 405 || r.status === 501) r = await fetch(`${base}${pathAndSearch}`, { method: 'GET', redirect: 'manual' });
      if (r.status >= 300 && r.status < 400) {
        const loc = r.headers.get('location');
        return { status: r.status, redirect: loc };
      }
      return { status: r.status };
    } catch (e) {
      return { status: 0, error: e.message };
    }
  })();
  linkCache.set(pathAndSearch, p);
  return p;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const out = [];
const log = (s = '') => { out.push(s); console.log(s); };

try {
  const base = await ensureServer();
  log(`Re-Sound SEO check — ${new Date().toISOString()}`);
  log(`Base URL: ${base}`);
  log('');

  // (e) sitemap
  const { urls: sitemapUrls } = await readSitemap(base);
  log('== (e) Sitemap');
  log(`URLs in sitemap: ${sitemapUrls.length}`);
  const byLocale = {};
  for (const u of sitemapUrls) { const l = localeOf(new URL(u.loc).pathname); byLocale[l] = (byLocale[l] ?? 0) + 1; }
  log(`Per locale: ${Object.entries(byLocale).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  const lastmods = {};
  let withoutLastmod = 0;
  for (const u of sitemapUrls) {
    if (!u.lastmod) { withoutLastmod++; continue; }
    const d = u.lastmod.slice(0, 10);
    lastmods[d] = (lastmods[d] ?? 0) + 1;
  }
  const distinctLastmod = new Set(sitemapUrls.map((u) => u.lastmod).filter(Boolean)).size;
  log(`lastmod distribution (by day): ${Object.entries(lastmods).sort().map(([k, v]) => `${k}=${v}`).join(', ') || 'none'}`);
  log(`distinct lastmod values: ${distinctLastmod}${withoutLastmod ? `, ${withoutLastmod} URLs without lastmod` : ''}`);
  if (distinctLastmod <= 1 && sitemapUrls.length > 1) log('WARN: every URL carries the same lastmod (build time?) — not a real last-modified signal');
  const hreflangCounts = sitemapUrls.map((u) => u.alternates.length);
  for (const u of sitemapUrls) if (u.alternates.length === 0 && !/\.(pdf|dwg|zip)$/i.test(u.loc)) SINGLE_LOCALE.add(new URL(u.loc).pathname.replace(/\/$/, ''));
  log(`single-locale URLs (no hreflang by design): ${SINGLE_LOCALE.size}`);
  log(`hreflang alternates per URL: min ${Math.min(...hreflangCounts)}, max ${Math.max(...hreflangCounts)}`);
  const nonHtml = sitemapUrls.filter((u) => /\.(pdf|dwg|zip)$/i.test(u.loc)).length;
  if (nonHtml) log(`document entries (pdf/dwg): ${nonHtml}`);
  log('');

  // pages to crawl: html sitemap entries (documents are link-checked instead)
  let pages = sitemapUrls.filter((u) => !/\.(pdf|dwg|zip|xml)$/i.test(u.loc)).map((u) => u.loc);
  if (opts.locales) pages = pages.filter((p) => opts.locales.includes(localeOf(new URL(p).pathname)));
  if (opts.alsoLocales) {
    // Mirror only the English entries that exist in every sitemap locale; a
    // page with a restricted hreflang set (e.g. the booth price guide, en/nl/fr/de
    // only) has no counterpart in the noindex locales and would 404 by design.
    const sitemapLocales = Object.keys(byLocale).filter((l) => l !== 'documents');
    const byLoc = new Map(sitemapUrls.map((u) => [u.loc, u]));
    const allEn = pages.filter((p) => localeOf(new URL(p).pathname) === 'en');
    const enPages = allEn.filter((p) => { const u = byLoc.get(p); return u && u.alternates.length > 0 && sitemapLocales.every((l) => u.alternates.some((a) => a.hreflang === l)); });
    for (const loc of opts.alsoLocales) for (const p of enPages) pages.push(p.replace(/\/en(\/|$)/, `/${loc}$1`));
    log(`also crawling ${opts.alsoLocales.join(', ')}: ${enPages.length} pages each (mirrored from the English sitemap entries; ${allEn.length - enPages.length} locale-restricted entries skipped)`);
  }
  pages = pages.slice(0, opts.maxPages);
  log(`Crawling ${pages.length} pages …`);
  const results = await mapLimit(pages, opts.concurrency, (p) => analysePage(base, p));
  log('');

  // (a) forbidden strings
  log('== (a) Forbidden strings');
  const forb = results.filter((p) => p.problems.some((x) => x.startsWith('forbidden')));
  if (!forb.length) log('OK — none found');
  for (const p of forb) for (const x of p.problems.filter((y) => y.startsWith('forbidden'))) log(`FAIL ${p.path}: ${x}`);
  log('');

  // (b) English share
  log('== (b) English text segments on non-English pages (unique segments >= 4 words)');
  log('   (the noindex legal pages privacy/terms are excluded from the aggregate and listed separately below)');
  const nonEn = results.filter((p) => p.status === 200 && p.locale !== 'en');
  const perLocale = {};
  const noindexPages = [];
  for (const p of nonEn) {
    if (/\/(privacy|terms)$/.test(p.path)) { noindexPages.push(p); continue; }
    const l = (perLocale[p.locale] ??= { pages: 0, seg: 0, en: 0, worst: [] });
    l.pages++; l.seg += p.segments; l.en += p.englishSegments;
    l.worst.push(p);
  }
  for (const [loc, l] of Object.entries(perLocale).sort()) {
    const share = l.seg ? (100 * l.en / l.seg) : 0;
    log(`${loc}: ${share.toFixed(1)}% English (${l.en}/${l.seg} segments over ${l.pages} pages)`);
    const worst = l.worst.filter((p) => p.englishShare >= 0.03).sort((a, b) => b.englishShare - a.englishShare);
    for (const p of worst) log(`  ${(100 * p.englishShare).toFixed(1).padStart(5)}%  ${p.path}  (${p.englishSegments}/${p.segments})`);
  }
  const noindexEnglish = noindexPages.filter((p) => p.englishShare >= 0.03).sort((a, b) => b.englishShare - a.englishShare);
  if (noindexEnglish.length) {
    log('-- legal pages (privacy/terms, noindex) with English text (not counted above)');
    for (const p of noindexEnglish) log(`  ${(100 * p.englishShare).toFixed(1).padStart(5)}%  ${p.path}  (${p.englishSegments}/${p.segments}, ${p.robots})`);
  }
  log('');
  log('-- sample English segments per flagged page (max 12 each)');
  for (const p of nonEn.filter((p) => p.englishShare >= 0.03).sort((a, b) => b.englishShare - a.englishShare)) {
    log(`${p.path}:`);
    for (const s of p.englishSamples) log(`    · ${s.length > 140 ? s.slice(0, 137) + '…' : s}`);
  }
  log('');

  // (b2) Spanish leaking into PT
  log('== (b2) Spanish text segments on /pt pages');
  const ptPages = results.filter((p) => p.status === 200 && p.locale === 'pt');
  const ptSpanish = ptPages.filter((p) => p.spanishSegments > 0);
  if (!ptPages.length) log('no PT pages crawled');
  else if (!ptSpanish.length) log('OK — none found');
  for (const p of ptSpanish) {
    log(`FAIL ${p.path}: ${p.spanishSegments} Spanish segments`);
    for (const s of p.spanishSamples) log(`    · ${s.length > 140 ? s.slice(0, 137) + '…' : s}`);
  }
  log('');

  // (c) hreflang + canonical
  log('== (c) hreflang + canonical per page');
  const hlCounts = {};
  for (const p of results.filter((r) => r.status === 200)) {
    const key = `${p.hreflang.length} hreflang, canonical ${p.canonical ? 'present' : 'MISSING'}${/noindex/i.test(p.robots) ? ', noindex' : ''}`;
    (hlCounts[key] ??= []).push(p.path);
  }
  for (const [k, v] of Object.entries(hlCounts).sort((a, b) => b[1].length - a[1].length)) log(`${v.length} pages: ${k}${v.length <= 6 ? ` — ${v.join(', ')}` : ''}`);
  for (const p of results) for (const x of p.problems.filter((y) => /canonical|hreflang/.test(y))) log(`FAIL ${p.path}: ${x}`);
  log('');

  // (d) JSON-LD
  log('== (d) JSON-LD');
  let blocks = 0, products = 0, withOffers = 0, parseErrors = 0;
  const typeCounts = {};
  for (const p of results.filter((r) => r.status === 200)) {
    blocks += p.jsonLd.blocks; products += p.jsonLd.products; withOffers += p.jsonLd.productsWithOffers; parseErrors += p.jsonLd.parseErrors;
    for (const t of p.jsonLd.types) typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  }
  log(`blocks: ${blocks}, parse errors: ${parseErrors}`);
  log(`types: ${Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(', ')}`);
  log(`Product nodes: ${products}, with offers: ${withOffers}${products && withOffers < products ? '  ← FAIL' : products ? '  OK' : ''}`);
  for (const p of results) for (const x of p.problems.filter((y) => /JSON-LD|offers/.test(y))) log(`FAIL ${p.path}: ${x}`);
  log('');

  // (f) internal links
  log('== (f) Internal links returning 404 (from crawled pages + sitemap document entries)');
  const linkOrigins = new Map();
  for (const p of results.filter((r) => r.status === 200)) for (const l of p.internalLinks) { if (!linkOrigins.has(l)) linkOrigins.set(l, []); linkOrigins.get(l).push(p.path); }
  for (const u of sitemapUrls) { const path = new URL(u.loc).pathname; if (!linkOrigins.has(path)) linkOrigins.set(path, ['(sitemap)']); }
  const linkList = [...linkOrigins.keys()];
  const linkResults = await mapLimit(linkList, opts.concurrency, (l) => checkLink(base, l));
  let broken = 0;
  linkList.forEach((l, i) => {
    const r = linkResults[i];
    if (r.status === 404 || r.status === 0 || r.status >= 500) {
      broken++;
      const from = linkOrigins.get(l);
      log(`FAIL ${r.status || 'ERR'} ${l}  ← linked from ${from.length} page(s): ${from.slice(0, 3).join(', ')}${from.length > 3 ? ', …' : ''}`);
    }
  });
  log(`checked ${linkList.length} distinct internal URLs, ${broken} broken`);
  const redirects = linkList.filter((_, i) => linkResults[i].redirect);
  if (redirects.length) log(`note: ${redirects.length} links redirect (e.g. ${redirects.slice(0, 3).map((l, i) => `${l} → ${linkResults[linkList.indexOf(l)].redirect}`).join('; ')})`);
  log('');

  // (g) lengths
  log('== (g) Title / meta description lengths (warn > 65 / > 155)');
  const longTitles = results.filter((p) => p.title && p.title.length > 65);
  const longDescs = results.filter((p) => p.description && p.description.length > 155);
  log(`titles > 65 chars: ${longTitles.length}; descriptions > 155 chars: ${longDescs.length}`);
  for (const p of longTitles) log(`WARN title ${String(p.title.length).padStart(3)}  ${p.path}  "${p.title}"`);
  for (const p of longDescs) log(`WARN desc  ${String(p.description.length).padStart(3)}  ${p.path}`);
  for (const p of results) for (const x of p.problems.filter((y) => /missing/.test(y))) log(`FAIL ${p.path}: ${x}`);
  log('');

  // per-page table
  log('== Per-page summary');
  log('status  loc  title  desc  h1  hreflang  canon  ld  prod/offers  robots  english%  path');
  for (const p of results) {
    if (p.status !== 200) { log(`${p.status}     ${p.locale}   —  ${p.path}`); continue; }
    log([
      String(p.status).padEnd(6),
      p.locale.padEnd(4),
      String(p.title.length).padStart(5),
      String(p.description.length).padStart(5),
      String(p.h1s.length).padStart(3),
      String(p.hreflang.length).padStart(8),
      (p.canonical ? 'yes' : 'NO').padStart(6),
      String(p.jsonLd.blocks).padStart(3),
      `${p.jsonLd.products}/${p.jsonLd.productsWithOffers}`.padStart(11),
      (/noindex/i.test(p.robots) ? 'noindex' : 'index').padEnd(7),
      (p.locale === 'en' ? '—' : (100 * p.englishShare).toFixed(1)).padStart(8),
      p.path,
    ].join('  '));
  }
  log('');

  const failures = results.reduce((n, p) => n + p.problems.length, 0) + broken;
  const warnings = results.reduce((n, p) => n + p.warnings.length, 0);
  log(`== Summary: ${results.length} pages, ${failures} failures, ${warnings} warnings`);
  for (const p of results) for (const w of p.warnings) if (!/^title|^description/.test(w)) log(`warn ${p.path}: ${w}`);

  if (opts.out) {
    mkdirSync(dirname(resolve(opts.out)), { recursive: true });
    writeFileSync(resolve(opts.out), out.join('\n') + '\n');
    console.error(`[seo-check] report written to ${opts.out}`);
  }
  stopServer();
  process.exit(failures ? 1 : 0);
} catch (e) {
  stopServer();
  console.error(`[seo-check] ${e.stack || e}`);
  process.exit(2);
}
