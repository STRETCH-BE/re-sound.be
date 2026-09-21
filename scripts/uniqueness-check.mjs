#!/usr/bin/env node
/**
 * Uniqueness gate — every page of every locale must be its own page.
 *
 *   node scripts/uniqueness-check.mjs [base] [--threshold 0.3] [--out docs/uniqueness-check.txt]
 *   npm run verify:unique              (base defaults to http://localhost:3999)
 *
 * What it does
 *   1. Collects the site's pages: every sitemap URL, the same path under every
 *      locale (the Nordic locales are noindex and absent from the sitemap but
 *      are pages all the same), and every editorial blog post of every locale
 *      (content/blog/<locale>/*.md). A path that does not answer 200 for a
 *      locale is skipped (localised hub slugs, pages that exist in some
 *      locales only).
 *   2. Reads each page's <title>, meta description, first <h1> and its main
 *      text (<main> when present, otherwise the body without header, nav,
 *      footer, script, style and noscript), lower-cased and tokenised.
 *   3. Builds 8-word shingles per page. Shingles that occur on four or more
 *      of a locale's pages (or on more than half of them when the locale
 *      has few pages) are template text — cookie banner, newsletter, footer
 *      claims, CTA blocks, product cards, download blocks, sticky navs — and
 *      are removed from every page before comparing, so only the page's own
 *      content counts. Copy that two or three pages share stays in and is
 *      what the pairwise test measures.
 *   4. Fails when, within one locale, two pages share more than THRESHOLD of
 *      their shingles (Jaccard), when two pages share a title, a description
 *      or an H1, when a page has no H1, or when two pages of different
 *      locales are near-identical (Jaccard > 0.8: an untranslated copy).
 *      Warns on thin pages (fewer than 60 own shingles).
 *
 * Exit code 1 on any failure; the report goes to --out.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(ROOT, 'package.json'));
const matter = require('gray-matter');

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? 'http://localhost:3999').replace(/\/$/, '');
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const THRESHOLD = Number(opt('--threshold', '0.3'));
const OUT = opt('--out', 'docs/uniqueness-check.txt');
const LOCALES = ['en', 'nl', 'fr', 'de', 'es', 'pt', 'da', 'sv', 'no', 'is'];
const SHINGLE = 8;
const THIN = 60;
const CHROME_MIN_PAGES = 4;

const lines = [];
const log = (s = '') => {
  lines.push(s);
  console.log(s);
};

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function stripTags(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function mainText(html) {
  let h = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  const main = /<main[^>]*>([\s\S]*?)<\/main>/i.exec(h);
  if (main) h = main[1];
  else h = h.replace(/<header[\s\S]*?<\/header>/gi, ' ').replace(/<footer[\s\S]*?<\/footer>/gi, ' ');
  // Navigation inside the page (sticky section navs, breadcrumbs) is template, not content.
  h = h.replace(/<nav[\s\S]*?<\/nav>/gi, ' ');
  return stripTags(h);
}

function tokens(text) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+(?:[’'.,-][\p{L}\p{N}]+)*/gu) ?? [];
}

function shingles(text) {
  const t = tokens(text);
  const set = new Set();
  for (let i = 0; i + SHINGLE <= t.length; i++) set.add(t.slice(i, i + SHINGLE).join(' '));
  return set;
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const s of small) if (large.has(s)) inter++;
  return inter / (a.size + b.size - inter);
}

function localeOf(path) {
  const seg = path.split('/').filter(Boolean)[0] ?? '';
  return LOCALES.includes(seg) ? seg : null;
}

async function fetchPage(path) {
  const res = await fetch(`${base}${path}`, { redirect: 'manual', headers: { 'user-agent': 'resound-uniqueness-check/1.0' } });
  if (res.status !== 200) return null;
  const html = await res.text();
  const title = stripTags(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '');
  const description = decode(/<meta\s+name="description"\s+content="([^"]*)"/i.exec(html)?.[1] ?? /<meta\s+content="([^"]*)"\s+name="description"/i.exec(html)?.[1] ?? '');
  const h1 = stripTags(/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1] ?? '');
  const robots = /<meta\s+name="robots"\s+content="([^"]*)"/i.exec(html)?.[1] ?? '';
  return { path, locale: localeOf(path), title, description, h1, robots, text: mainText(html) };
}

async function collectPaths() {
  const paths = new Set();
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml → HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => decode(m[1]));
  const stripped = new Set();
  for (const loc of locs) {
    const p = new URL(loc).pathname.replace(/\/$/, '') || '/';
    if (/\.(pdf|dwg|zip|xml)$/i.test(p)) continue;
    const l = localeOf(p);
    stripped.add(l ? p.slice(l.length + 1) || '/' : p);
  }
  for (const s of stripped) for (const l of LOCALES) paths.add(s === '/' ? `/${l}` : `/${l}${s}`);
  const blogDir = join(ROOT, 'content', 'blog');
  if (existsSync(blogDir)) {
    for (const l of readdirSync(blogDir)) {
      const dir = join(blogDir, l);
      if (!LOCALES.includes(l)) continue;
      for (const f of readdirSync(dir)) {
        if (!f.endsWith('.md')) continue;
        const { data } = matter(readFileSync(join(dir, f), 'utf8'));
        if (data.slug && !data.draft) paths.add(`/${l}/blog/${data.slug}`);
      }
      paths.add(`/${l}/blog`);
    }
  }
  return [...paths].sort();
}

async function main() {
  log(`uniqueness-check — ${base} — threshold ${THRESHOLD} — ${new Date().toISOString()}`);
  const paths = await collectPaths();
  log(`candidate paths: ${paths.length}`);
  const pages = [];
  let skipped = 0;
  const queue = [...paths];
  const workers = Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const p = queue.shift();
      try {
        const page = await fetchPage(p);
        if (page) pages.push(page);
        else skipped++;
      } catch (e) {
        log(`ERROR ${p}: ${e.message}`);
        skipped++;
      }
    }
  });
  await Promise.all(workers);
  pages.sort((a, b) => a.path.localeCompare(b.path));
  log(`pages fetched: ${pages.length} (skipped ${skipped} non-200)`);
  log('');

  const failures = [];
  const warnings = [];
  const byLocale = new Map();
  for (const p of pages) {
    if (!p.locale) continue;
    if (!byLocale.has(p.locale)) byLocale.set(p.locale, []);
    byLocale.get(p.locale).push(p);
  }

  // shingles + chrome removal per locale
  for (const [locale, list] of byLocale) {
    const raw = list.map((p) => shingles(p.text));
    const counts = new Map();
    for (const set of raw) for (const s of set) counts.set(s, (counts.get(s) ?? 0) + 1);
    const minPages = Math.min(CHROME_MIN_PAGES, Math.max(2, Math.ceil(list.length / 2)));
    const chrome = new Set([...counts].filter(([, n]) => n >= minPages).map(([s]) => s));
    list.forEach((p, i) => {
      p.own = new Set([...raw[i]].filter((s) => !chrome.has(s)));
    });
    log(`== ${locale}: ${list.length} pages, ${chrome.size} chrome shingles removed`);

    // metadata uniqueness
    for (const field of ['title', 'description', 'h1']) {
      const seen = new Map();
      for (const p of list) {
        const v = p[field].trim().toLowerCase();
        if (!v) {
          if (field === 'h1') failures.push(`${p.path}: no <h1>`);
          continue;
        }
        if (seen.has(v)) failures.push(`${p.path}: ${field} identical to ${seen.get(v)} ("${p[field].slice(0, 70)}")`);
        else seen.set(v, p.path);
      }
    }
    // thin pages
    for (const p of list) if (p.own.size < THIN) warnings.push(`${p.path}: thin — ${p.own.size} own shingles`);
    // pairwise similarity
    const pairs = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const sim = jaccard(list[i].own, list[j].own);
        if (sim > 0) pairs.push({ a: list[i].path, b: list[j].path, sim });
      }
    }
    pairs.sort((x, y) => y.sim - x.sim);
    for (const pr of pairs.slice(0, 5)) log(`   ${(pr.sim * 100).toFixed(1).padStart(5)} %  ${pr.a}  ~  ${pr.b}`);
    for (const pr of pairs) if (pr.sim > THRESHOLD) failures.push(`${pr.a} ~ ${pr.b}: ${(pr.sim * 100).toFixed(1)} % of 8-word shingles shared (> ${THRESHOLD * 100} %)`);
  }
  log('');

  // cross-locale copies (same path shape, different locale, near-identical text)
  const all = pages.filter((p) => p.locale && p.own);
  const byShape = new Map();
  for (const p of all) {
    const shape = p.path.replace(/^\/[a-z]{2}(?=\/|$)/, '');
    if (!byShape.has(shape)) byShape.set(shape, []);
    byShape.get(shape).push(p);
  }
  for (const [shape, list] of byShape) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const sim = jaccard(list[i].own, list[j].own);
        if (sim > 0.8) failures.push(`${list[i].path} ~ ${list[j].path}: ${(sim * 100).toFixed(1)} % identical across locales (untranslated copy?)`);
      }
    }
  }

  log(`== Result: ${failures.length} failures, ${warnings.length} warnings ${failures.length ? '← FAIL' : 'OK'}`);
  for (const f of failures) log(`FAIL ${f}`);
  for (const w of warnings) log(`warn ${w}`);
  const outPath = join(ROOT, OUT);
  if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, lines.join('\n') + '\n');
  console.log(`[uniqueness-check] report written to ${OUT}`);
  process.exit(failures.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
