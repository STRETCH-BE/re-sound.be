#!/usr/bin/env node
/**
 * Imports the content team's workbook (content/re-sound-content-data-templates.xlsx)
 * into the repo's content files:
 *
 *   content/blog/<locale>/<slug>.md   finished posts (Body (markdown) + front matter)
 *   content/blog/briefs.json          briefed posts still to be written
 *   content/faq/source.json           raw FAQ rows (the editing/translation source)
 *   content/testimonials.json         Google reviews + listing note
 *   content/booth-guide.json          Booth_Guide rows + guide page copy
 *   content/showrooms.json            Dealers_Showrooms rows
 *
 * Usage: node scripts/content/import-workbook.mjs [--dry]
 * The workbook is the source of truth; edit it, re-run, commit the result.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import XLSX from 'xlsx';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..', '..');
const dry = process.argv.includes('--dry');
const wb = XLSX.readFile(resolve(root, 'content/re-sound-content-data-templates.xlsx'), { cellDates: true });
const rows = (sheet) => XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '', raw: false });
const clean = (s) => String(s ?? '').replace(/\r\n/g, '\n').trim();
const list = (s) => clean(s).split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const write = (rel, content) => {
  const p = resolve(root, rel);
  if (dry) { console.log('would write', rel, `${content.length} bytes`); return; }
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
  console.log('wrote', rel);
};

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------
/** Slugs fixed by the cross-links inside the Dutch bodies; the rest derive from the hero file name. */
const SLUGS = {
  'BP-001': 'belcabine-kantoor-prijs-keuze-plaatsing',
  'BP-002': 'akoestiek-open-kantoor-verbeteren',
  'BP-003': 'pet-vilt-of-houten-akoestische-panelen',
  'BP-004': 'hoeveel-akoestische-panelen-nodig',
  'BP-005': 'nagalmtijd-klaslokaal-normen',
  'BP-006': 'akoestische-panelen-restaurant',
};
/** Product hero to use while public/images/blog/<file> does not exist (product named in the alt text). */
const HERO_FALLBACK = {
  'BP-001': '/images/products/solo-flex/hero-solo-flex.webp',
  'BP-002': '/images/products/rpet-groove/hero-rpet-groove.webp',
  'BP-003': '/images/products/rwood-groove/hero-rWood-Groove.webp',
  'BP-004': '/images/products/rpet-groove/hero-rpet-groove.webp',
  'BP-005': '/images/products/rpet-groove/hero-rpet-groove.webp',
  'BP-006': '/images/products/rwood-micro/hero-rwood-micro.webp',
};
const CATEGORY_BY_INTENT = { compare: 'products', buy: 'products', learn: 'education' };
// ---------------------------------------------------------------------------
// Internal links: the workbook's "Internal links" column lists the pages a
// post should link to; the Dutch bodies only carry the blog cross-links. The
// first plain-text mention of the product / range / page is linked (outside
// headings, tables, existing links and the FAQ section). Planned pages that
// do not exist yet (/applications/*) are skipped and listed in the report.
// ---------------------------------------------------------------------------
const LINK_NAMES = {
  '/products/rpet-groove': ['rPET Groove'], '/products/rpet-panel': ['rPET Panel'], '/products/rpet-flex-groove': ['rPET Flex Groove'],
  '/products/rwood-groove': ['rWood Groove'], '/products/rwood-micro': ['rWood Micro'], '/products/rwood-veneer': ['rWood Panel'], '/products/rwood-perf': ['rWood Perf'],
  '/products/interior': ['Interior'], '/products/solid': ['Solid'], '/products/divide': ['Divide'],
  '/products/solo-flex': ['Solo Flex'], '/products/duo': ['Duo'], '/products/modular-xl': ['Modular XL'],
  '/products/pet-akoestische-panelen': ['PET-panelen', 'PET-vilt'], '/products/houten-akoestische-panelen': ['houten akoestische panelen', 'houten panelen'],
  '/products/akoestische-belcabines': ['belcabines', 'belcabine'],
  '/where-to-buy': ['showroom'], '/faq': ['FAQ'],
  'https://stretchplafond.be/products/acoustic-stretch-system': ['akoestisch spanplafond', 'spanplafond'],
};
const EXISTING_ROUTES = /^(\/(products|guides|blog|faq|where-to-buy|contact|about|sustainability)(\/|$)|https?:)/;
const skippedLinks = [];
function injectLinks(body, links, locale, id) {
  const lines = body.split('\n');
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const linked = new Set(lines.join('\n').match(/\]\(([^)]+)\)/g)?.map((m) => m.slice(2, -1)) ?? []);
  for (const href of links) {
    const path = href.replace(new RegExp(`^/${locale}(?=/|$)`), '');
    if (!EXISTING_ROUTES.test(path)) { skippedLinks.push({ id, href, reason: 'planned page (no route yet)' }); continue; }
    if (linked.has(href)) continue;
    const names = LINK_NAMES[path];
    if (!names) { skippedLinks.push({ id, href, reason: 'no anchor phrase configured' }); continue; }
    let done = false, inFaq = false;
    for (let i = 0; i < lines.length && !done; i++) {
      const line = lines[i];
      if (/^#+\s/.test(line)) { inFaq = /veelgestelde vragen|faq|questions fréquentes|häufige fragen|frequently asked/i.test(line); continue; }
      if (inFaq || line.startsWith('|') || /^\*(Bronnen|Sources|Quellen)\s*:/i.test(line) || !line.trim()) continue;
      const parts = line.split(/(\[[^\]]*\]\([^)]*\))/); // keep existing links intact
      for (let j = 0; j < parts.length && !done; j += 2) {
        for (const name of names) {
          const re = new RegExp(`(^|[^\\w-])(${escape(name)})(?![\\w-])`);
          if (re.test(parts[j])) { parts[j] = parts[j].replace(re, `$1[$2](${href})`); done = true; break; }
        }
      }
      if (done) lines[i] = parts.join('');
    }
    if (!done) skippedLinks.push({ id, href, reason: 'anchor phrase not found in the body' });
  }
  return lines.join('\n');
}

// Publication dates: content/blog-status.json remembers when a post first went live.
const today = new Date().toISOString().slice(0, 10);
const statusPath = resolve(root, 'content/blog-status.json');
const previousStatus = existsSync(statusPath) ? JSON.parse(readFileSync(statusPath, 'utf8')) : {};

const AUTHORS = { 'Michael Nicasens': { name: 'Michael Nicasens', jobTitle: 'CEO Stretch Group' } };

function parseFaq(cell) {
  const out = [];
  const lines = clean(cell).split('\n').map((l) => l.trim()).filter(Boolean);
  let q = null;
  for (const line of lines) {
    const m = line.match(/^(?:V|Q|F)\s*:\s*(.+)$/i);
    const a = line.match(/^(?:A|R)\s*:\s*(.+)$/i);
    if (m) q = m[1].trim();
    else if (a && q) { out.push({ question: q, answer: a[1].trim() }); q = null; }
  }
  return out;
}

const yaml = (v) => JSON.stringify(v); // JSON is valid YAML; keeps quotes/colons safe

const briefs = [];
let posts = 0;
for (const r of rows('Blog_Posts')) {
  const id = clean(r.ID);
  if (!/^BP-0(0[1-9]|1[0-8])$/.test(id) || !clean(r.Locale)) continue; // skips template rows
  const locale = clean(r.Locale);
  const status = clean(r.Status);
  const author = AUTHORS[clean(r['Author (named person)'])] ?? { name: clean(r['Author (named person)']) };
  const base = {
    id, locale, market: clean(r.Market), keyword: clean(r['Target keyword']), secondaryKeywords: list(r['Secondary keywords']),
    intent: clean(r.Intent), workingTitle: clean(r['Working title']), author, datePublished: clean(r['Planned publish date']),
    wordCountTarget: Number(clean(r['Word count target'])) || 1200,
  };
  if (status !== 'Ready for dev') { briefs.push({ ...base, status }); continue; }
  const body = clean(r['Body (markdown)']);
  const h1FromBody = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const bodyNoH1 = body.replace(/^#\s+.+\n+/, '');
  const internalLinks = list(r['Internal links (hub / product / case study)']);
  const bodyLinked = injectLinks(bodyNoH1, internalLinks, locale, id);
  const heroRel = clean(r['Hero image']).replace(/^\/?/, '/');
  const heroExists = existsSync(resolve(root, 'public', heroRel.replace(/^\//, '')));
  const slug = SLUGS[id];
  const fm = {
    id, slug, locale, title: clean(r['Title tag (≤65)']), description: clean(r['Meta description (≤155)']), h1: clean(r.H1) || h1FromBody,
    keyword: base.keyword, secondaryKeywords: base.secondaryKeywords, intent: base.intent, category: CATEGORY_BY_INTENT[base.intent] ?? 'education',
    // Live today: datePublished is the real publication date (a future calendar date would be an invalid BlogPosting date); the calendar date stays in plannedDate.
    author, plannedDate: base.datePublished, datePublished: previousStatus[id]?.publishedDate ?? today, dateModified: previousStatus[id]?.publishedDate ?? today,
    heroImage: heroExists ? heroRel : HERO_FALLBACK[id], heroImageMissing: heroExists ? null : heroRel, heroAlt: clean(r['Hero alt']),
    internalLinks, cta: clean(r.CTA), sources: clean(r.Sources),
    faq: parseFaq(r['FAQ (2–3 Q&A)']), draft: false, wordCount: bodyNoH1.split(/\s+/).filter(Boolean).length,
  };
  const front = Object.entries(fm).map(([k, v]) => `${k}: ${yaml(v)}`).join('\n');
  write(`content/blog/${locale}/${slug}.md`, `---\n${front}\n---\n\n${bodyLinked}\n`);
  posts++;
}
write('content/blog/briefs.json', JSON.stringify(briefs, null, 2) + '\n');
console.log(`blog: ${posts} finished posts, ${briefs.length} briefs`);

// ---------------------------------------------------------------------------
// FAQ (raw rows — edited/translated into content/faq/<locale>.json separately)
// ---------------------------------------------------------------------------
const faq = rows('FAQ').filter((r) => /^FAQ-\d{3}$/.test(clean(r.ID)) && clean(r.Locale)).map((r) => ({
  id: clean(r.ID), category: clean(r.Category), locale: clean(r.Locale), question: clean(r['Question (market vocabulary)']),
  answer: clean(r['Answer (≤80 words)']), showOn: list(r['Show on pages']), schema: /^y/i.test(clean(r['Schema (Y/N)'])), status: clean(r.Status),
}));
write('content/faq/source.json', JSON.stringify(faq, null, 2) + '\n');
console.log(`faq: ${faq.length} rows (${faq.filter((f) => !f.answer).length} without answer)`);

// ---------------------------------------------------------------------------
// Testimonials (Google reviews) — the example row and the note row are not reviews
// ---------------------------------------------------------------------------
const tRows = rows('Testimonials');
const reviews = tRows.filter((r) => clean(r.Source) === 'Google' && !/^\(name\)|^Pick/.test(clean(r['Customer name'])) && clean(r['Customer name']) && !/^Google listing/.test(clean(r['Customer name'])));
const note = tRows.map((r) => clean(r['Customer name'])).find((n) => /^Google listing/.test(n)) ?? '';
const cid = (reviews.map((r) => clean(r['Source URL'])).find((u) => /cid=\d+/.test(u)) ?? '').match(/cid=(\d+)/)?.[1] ?? null;
const testimonials = {
  google: { name: 'Re-Sound', rating: 5, reviewCount: 4, cid, mapsUrl: cid ? `https://maps.google.com/?cid=${cid}` : null, placeId: null, capturedOn: '2026-09-06', note },
  reviews: reviews.map((r) => {
    const quote = clean(r['Quote (1–3 sentences)']);
    return { author: clean(r['Customer name']), rating: Number(clean(r['Rating (1–5)'])) || 5, text: /^\(/.test(quote) ? '' : quote, source: 'Google', url: cid ? `https://maps.google.com/?cid=${cid}` : null, date: clean(r.Date), locale: clean(r['Locale of quote']) || 'nl', consent: /^y/i.test(clean(r['Consent to publish (Y/N)'])), showOn: list(r['Show on pages']) };
  }),
};
write('content/testimonials.json', JSON.stringify(testimonials, null, 2) + '\n');
console.log(`testimonials: ${testimonials.reviews.length} Google reviews`);

// ---------------------------------------------------------------------------
// Booth guide — the workbook's example row (Solo Flex at 3990 with leasing) is a template row
// ---------------------------------------------------------------------------
const bg = rows('Booth_Guide').filter((r) => /^(Solo Flex|Duo|Modular XL)$/.test(clean(r.Model)) && !/\(define\)/.test(clean(r['Trial / return'])));
const num = (s) => { const n = Number(String(s).replace(/[^\d.]/g, '')); return Number.isFinite(n) && n > 0 ? n : null; };
const guideRow = rows('Booth_Guide').find((r) => clean(r['Guide locale']) === 'nl');
const boothGuide = {
  models: bg.map((r) => ({
    model: clean(r.Model), slug: clean(r.Model).toLowerCase().replace(/\s+/g, '-'), capacity: clean(r.Capacity), footprintM2: clean(r['Footprint m²']), externalDimensions: clean(r['External W×D×H mm']),
    priceExclVat: num(r['Price excl. VAT (EUR)']), options: [r['Option 1 + price'], r['Option 2 + price'], r['Option 3 + price']].map(clean).filter(Boolean),
    isoDbA: num(r['ISO 23351-1 dB(A)']), isoClass: clean(r['ISO class (formula)']) || null, ventilation: clean(r.Ventilation), power: clean(r['Power / connectivity']), lighting: clean(r.Lighting),
    weightKg: num(r['Weight kg']), assemblyTime: clean(r['Assembly time']), leadTimeWeeks: clean(r['Lead time (weeks)']), deliveryInstallation: clean(r['Delivery & installation zone']), warranty: clean(r.Warranty), trial: clean(r['Trial / return']),
  })),
  guide: guideRow ? { locale: 'nl', title: clean(guideRow['Guide title tag (≤65)']), description: clean(guideRow['Guide meta (≤155)']), h1: clean(guideRow['Guide H1']), faqQuestions: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => clean(guideRow[`Guide FAQ Q${i}`])).filter(Boolean) } : null,
};
write('content/booth-guide.json', JSON.stringify(boothGuide, null, 2) + '\n');
console.log(`booth guide: ${boothGuide.models.map((m) => `${m.model}=${m.priceExclVat ?? 'n/a'}`).join(', ')}`);

// ---------------------------------------------------------------------------
// Showrooms — keep the latest HQ row (08:00–16:30) and the Poland office
// ---------------------------------------------------------------------------
const sr = rows('Dealers_Showrooms').filter((r) => /^Re-Sound/.test(clean(r.Name)));
const dedup = new Map();
for (const r of sr) dedup.set(clean(r.Name) + clean(r.Type), r); // last row wins
const showrooms = [...dedup.values()].map((r) => ({
  name: clean(r.Name), type: clean(r.Type), country: clean(r.Country), city: clean(r.City), address: clean(r.Address),
  latitude: num(r.Latitude), longitude: num(r.Longitude), email: clean(r.Email) || null, phone: clean(r.Phone) || null, website: clean(r.Website) || null,
  openingHours: clean(r['Opening hours']), languages: list(r['Languages spoken']), products: list(r['Products displayed']), status: clean(r.Status),
}));
write('content/showrooms.json', JSON.stringify(showrooms, null, 2) + '\n');
console.log(`showrooms: ${showrooms.map((s) => `${s.name} (${s.openingHours})`).join('; ')}`);
if (skippedLinks.length) console.log('internal links not placed:\n' + skippedLinks.map((l) => `  ${l.id} ${l.href} — ${l.reason}`).join('\n'));

// ---------------------------------------------------------------------------
// Blog status — written back as JSON instead of into the workbook, because
// SheetJS would drop the sheet's formulas and formatting on save.
// ---------------------------------------------------------------------------
const status = { ...previousStatus };
for (const r of rows('Blog_Posts')) {
  const id = clean(r.ID);
  if (!/^BP-0(0[1-9]|1[0-8])$/.test(id) || !clean(r.Locale)) continue;
  if (clean(r.Status) === 'Ready for dev') status[id] = { status: 'Live', publishedDate: previousStatus[id]?.publishedDate ?? today, route: `/${clean(r.Locale)}/blog/${SLUGS[id]}` };
  else if (!status[id]) status[id] = { status: clean(r.Status), publishedDate: null, route: null };
}
write('content/blog-status.json', JSON.stringify(status, null, 2) + '\n');
