#!/usr/bin/env node
/**
 * Runs Lighthouse (mobile, simulated slow-4G, performance only) against a
 * local production build for the pages the SEO sprint targets and writes
 * a compact summary + the full JSON reports.
 *
 * Usage:
 *   node scripts/lighthouse-run.mjs <label> [baseUrl] [--runs N]
 *
 *   label    'before' | 'after' | anything — used in the output file names
 *   baseUrl  default http://localhost:3000 (a `next start` is spawned when
 *            nothing answers there)
 *   --runs   number of runs per URL (default 3); the median LCP run is reported
 *
 * Output: docs/lighthouse/<label>-<page>.json and docs/lighthouse/<label>-summary.md
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const args = process.argv.slice(2);
const label = args.find((a) => !a.startsWith('http') && !a.startsWith('--')) ?? 'run';
const base = (args.find((a) => a.startsWith('http')) ?? 'http://localhost:3000').replace(/\/$/, '');
const runsIdx = args.indexOf('--runs');
const RUNS = runsIdx >= 0 ? Number(args[runsIdx + 1]) : 3;

const PAGES = [
  { id: 'home', path: '/en' },
  { id: 'home-nl', path: '/nl' },
  { id: 'solo-flex', path: '/en/products/solo-flex' },
  { id: 'booths-hub', path: '/en/products/acoustic-phone-booths' },
];

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const outDir = resolve(root, 'docs', 'lighthouse');
mkdirSync(outDir, { recursive: true });

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
  ];
  return candidates.find((c) => existsSync(c));
}

async function up(url) {
  try { const r = await fetch(url, { redirect: 'manual' }); return r.status < 500; } catch { return false; }
}

let server = null;
if (!(await up(`${base}/robots.txt`))) {
  const port = new URL(base).port || '3000';
  console.error(`[lighthouse] starting next start on :${port}`);
  // Spawn the next binary directly in its own process group so the whole
  // tree is killed afterwards (killing an `npx` wrapper leaves a stale
  // server behind, serving the previous build from its memory cache).
  const nextBin = resolve(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  server = spawn(process.execPath, [nextBin, 'start', '-p', port], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'], detached: true });
  const t0 = Date.now();
  while (Date.now() - t0 < 60000 && !(await up(`${base}/robots.txt`))) await new Promise((r) => setTimeout(r, 500));
} else {
  console.error(`[lighthouse] using the server already listening at ${base} — make sure it serves the current build`);
}

const chrome = chromePath();
const rows = [];
for (const page of PAGES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const out = resolve(outDir, `${label}-${page.id}-run${i + 1}.json`);
    const r = spawnSync('lighthouse', [
      `${base}${page.path}`,
      '--preset=perf',
      '--form-factor=mobile',
      '--throttling-method=simulate',
      '--only-categories=performance',
      '--output=json',
      `--output-path=${out}`,
      '--quiet',
      '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
    ], { cwd: root, stdio: ['ignore', 'inherit', 'inherit'], env: { ...process.env, CHROME_PATH: chrome } });
    if (r.status !== 0 || !existsSync(out)) { console.error(`[lighthouse] run failed for ${page.path}`); continue; }
    const j = JSON.parse(readFileSync(out, 'utf8'));
    const a = j.audits;
    runs.push({
      run: i + 1,
      score: Math.round((j.categories.performance.score ?? 0) * 100),
      lcp: a['largest-contentful-paint'].numericValue,
      fcp: a['first-contentful-paint'].numericValue,
      tbt: a['total-blocking-time'].numericValue,
      cls: a['cumulative-layout-shift'].numericValue,
      si: a['speed-index'].numericValue,
      tti: a['interactive']?.numericValue ?? null,
      lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? a['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet ?? '',
      file: out,
    });
  }
  if (!runs.length) continue;
  const sorted = [...runs].sort((x, y) => x.lcp - y.lcp);
  const median = sorted[Math.floor(sorted.length / 2)];
  // Keep the median run as the canonical report for this page.
  writeFileSync(resolve(outDir, `${label}-${page.id}.json`), readFileSync(median.file));
  rows.push({ page, median, runs });
}

if (server) { try { process.kill(-server.pid, 'SIGTERM'); } catch { try { server.kill('SIGTERM'); } catch {} } }

const ms = (v) => `${(v / 1000).toFixed(2)} s`;
const lines = [];
lines.push(`# Lighthouse ${label} — mobile, simulated slow 4G, performance only`);
lines.push('');
lines.push(`Base: ${base} · ${RUNS} runs per page · median-LCP run reported (all runs in parentheses)`);
lines.push('');
lines.push('| Page | Score | LCP | FCP | TBT | CLS | Speed Index |');
lines.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  const m = r.median;
  const all = (k, f) => r.runs.map((x) => f(x[k])).join(' / ');
  lines.push(`| ${r.page.path} | ${m.score} (${all('score', (v) => v)}) | ${ms(m.lcp)} (${all('lcp', ms)}) | ${ms(m.fcp)} | ${Math.round(m.tbt)} ms (${all('tbt', (v) => Math.round(v))}) | ${m.cls.toFixed(3)} | ${ms(m.si)} |`);
}
lines.push('');
for (const r of rows) if (r.median.lcpElement) lines.push(`- LCP element on ${r.page.path}: \`${r.median.lcpElement.replace(/\s+/g, ' ').slice(0, 160)}\``);
const summary = lines.join('\n') + '\n';
writeFileSync(resolve(outDir, `${label}-summary.md`), summary);
console.log(summary);
