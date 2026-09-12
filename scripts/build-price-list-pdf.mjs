#!/usr/bin/env node
/**
 * Builds the e-mail-gated booth price list PDF — one A4 document per guide
 * locale (en, nl, fr, de) — and writes the four files base64-encoded to
 * src/data/generated/booth-price-list.json, which src/app/api/pricelist/route.ts
 * imports statically (no filesystem access at request time).
 *
 *   npm run pricelist:build          (also runs in "prebuild", after the
 *                                     catalogue snapshot has been refreshed)
 *
 * GOVERNING RULE — nothing in the PDF is typed by hand except the column and
 * section labels in LABELS below. Every figure comes from the same data the
 * guide page (src/components/guides/BoothPriceGuide.tsx) renders from:
 *
 *   - src/data/catalogue.snapshot.json — the committed catalogue. "From" price
 *     per model = lowest active 'base' article of the catalogue products sold
 *     from that product page (lowestBase in src/lib/catalogue/tokens.ts);
 *     glass backwall = lowest 'base' article whose code ends in -BG; Modular XL
 *     extension elements = the additional_segments articles; the options
 *     section lists every active article with priceType 'option', grouped by
 *     catalogue category. Labels: article.labels[locale] / category.labels
 *     [locale], else the English description/name (lineLabel, categoryLabel in
 *     src/lib/catalogue/pricing.ts).
 *   - src/data/products.ts — booth specs (capacity, footprint, external
 *     dimensions, ISO 23351-1 dB(A), ventilation, power, weight) and the ISO
 *     class thresholds (isoSpeechClass). Printed verbatim, as the guide does.
 *   - src/i18n/config.ts — the BCP 47 tag per locale, so prices format exactly
 *     as src/lib/catalogue/format.ts does on the site ("€ 2.740" in nl,
 *     "€2,740" in en, two decimals only when the amount is not whole euros).
 *
 * Both TypeScript files are loaded standalone: transpiled in memory with the
 * project's own `typescript` when it is installed, else imported directly
 * (Node ≥ 22.18 strips types natively). Neither file has runtime imports.
 *
 * Deterministic: the PDF's CreationDate/ModDate — and therefore pdfkit's
 * trailer /ID, an MD5 of the info dictionary — derive from generatedAt, which
 * is the only input that changes between runs (override it with
 * PRICELIST_GENERATED_AT=<ISO date-time> to reproduce a build byte for byte).
 * Fonts: Liberation Sans (SIL OFL, scripts/pdf/fonts) subset-embedded, so
 * "Częstochowa" prints with its diacritics; every string is checked against
 * the font's glyph coverage before it is drawn.
 *
 * This script FAILS the build (exit 1) when a source is missing or a model
 * cannot be priced: a stale committed PDF that drifts from the site is the one
 * outcome it exists to prevent.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import PDFDocument from 'pdfkit';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SNAPSHOT_PATH = join(REPO_ROOT, 'src', 'data', 'catalogue.snapshot.json');
const PRODUCTS_TS = join(REPO_ROOT, 'src', 'data', 'products.ts');
const I18N_TS = join(REPO_ROOT, 'src', 'i18n', 'config.ts');
const OUT_PATH = join(REPO_ROOT, 'src', 'data', 'generated', 'booth-price-list.json');
const FONT_DIR = join(REPO_ROOT, 'scripts', 'pdf', 'fonts');
const rel = (p) => relative(REPO_ROOT, p);

/** GUIDE_LOCALES in src/data/guides.ts — the locales the guide page exists in. */
const LOCALES = ['en', 'nl', 'fr', 'de'];
const WEBSITE = 're-sound.be';

// ---------------------------------------------------------------------------
// Labels — the only hand-written text. Column/section labels, notes and the
// footer; NL in je-form, FR in vous-form, DE in Sie-form. {placeholders} are
// filled by fmt().
// ---------------------------------------------------------------------------
const LABELS = {
  en: {
    title: 'Re-Sound booth price list {year}',
    intro: 'The prices below are the ones published on re-sound.be. Configure a booth on its product page for an exact quotation.',
    priceNote: 'Prices exclude VAT, transport and installation (ex works).',
    currencyNote: 'All prices in {currency}.',
    priceListRef: 'Price list',
    validFrom: 'Valid from',
    generatedOn: 'Generated on',
    modelsTitle: 'Models and from-prices',
    optionsTitle: 'Options and accessories per model',
    model: 'Model',
    fromPrice: 'From price excl. VAT',
    extension: 'Extra 90 cm element',
    capacity: 'Capacity',
    footprint: 'Footprint',
    dimensions: 'External dimensions (W×D×H)',
    iso: 'ISO 23351-1',
    ventilation: 'Ventilation',
    power: 'Power',
    weight: 'Weight',
    person: 'person',
    persons: 'persons',
    classLabel: 'Class {class}',
    pending: 'Measurement pending',
    onRequest: 'On request',
    perSegment: 'per 90 cm segment',
    colArticle: 'Article',
    colDescription: 'Description',
    colPrice: 'Price excl. VAT',
    from: 'from',
    lowestOf: '{model}: lowest base price of {list}.',
    and: 'and',
    manufacturer: 'Re-Sound is a Stretch Group brand. Manufactured in our own plant in Częstochowa (Poland).',
    page: 'Page {n} of {total}',
  },
  nl: {
    title: 'Re-Sound prijslijst belcabines {year}',
    intro: 'De prijzen hieronder zijn de prijzen die op re-sound.be staan. Stel je cabine samen op de productpagina voor een exacte offerte.',
    priceNote: 'Prijzen zijn excl. btw, transport en installatie (af fabriek).',
    currencyNote: 'Alle prijzen in {currency}.',
    priceListRef: 'Prijslijst',
    validFrom: 'Geldig vanaf',
    generatedOn: 'Gegenereerd op',
    modelsTitle: 'Modellen en vanafprijzen',
    optionsTitle: 'Opties en accessoires per model',
    model: 'Model',
    fromPrice: 'Vanafprijs excl. btw',
    extension: 'Extra element van 90 cm',
    capacity: 'Capaciteit',
    footprint: 'Voetafdruk',
    dimensions: 'Buitenafmetingen (B×D×H)',
    iso: 'ISO 23351-1',
    ventilation: 'Ventilatie',
    power: 'Stroom',
    weight: 'Gewicht',
    person: 'persoon',
    persons: 'personen',
    classLabel: 'Klasse {class}',
    pending: 'Meting volgt',
    onRequest: 'Op aanvraag',
    perSegment: 'per segment van 90 cm',
    colArticle: 'Artikel',
    colDescription: 'Omschrijving',
    colPrice: 'Prijs excl. btw',
    from: 'vanaf',
    lowestOf: '{model}: laagste basisprijs van {list}.',
    and: 'en',
    manufacturer: 'Re-Sound is een merk van Stretch Group. Geproduceerd in onze eigen fabriek in Częstochowa (Polen).',
    page: 'Pagina {n} van {total}',
  },
  fr: {
    title: 'Re-Sound liste de prix cabines acoustiques {year}',
    intro: 'Les prix ci-dessous sont ceux publiés sur re-sound.be. Configurez votre cabine sur sa page produit pour obtenir un devis exact.',
    priceNote: "Les prix s'entendent hors TVA, hors transport et hors installation (départ usine).",
    currencyNote: 'Tous les prix sont en {currency}.',
    priceListRef: 'Liste de prix',
    validFrom: 'Valable à partir du',
    generatedOn: 'Généré le',
    modelsTitle: 'Modèles et prix de départ',
    optionsTitle: 'Options et accessoires par modèle',
    model: 'Modèle',
    fromPrice: 'Prix à partir de, hors TVA',
    extension: 'Élément supplémentaire de 90 cm',
    capacity: 'Capacité',
    footprint: 'Emprise au sol',
    dimensions: 'Dimensions extérieures (L×P×H)',
    iso: 'ISO 23351-1',
    ventilation: 'Ventilation',
    power: 'Alimentation',
    weight: 'Poids',
    person: 'personne',
    persons: 'personnes',
    classLabel: 'Classe {class}',
    pending: 'Mesure en attente',
    onRequest: 'Sur demande',
    perSegment: 'par segment de 90 cm',
    colArticle: 'Article',
    colDescription: 'Désignation',
    colPrice: 'Prix hors TVA',
    from: 'à partir de',
    lowestOf: '{model} : prix de base le plus bas de {list}.',
    and: 'et',
    manufacturer: 'Re-Sound est une marque du groupe Stretch. Fabrication dans notre propre usine à Częstochowa (Pologne).',
    page: 'Page {n} sur {total}',
  },
  de: {
    title: 'Re-Sound Preisliste Telefonboxen {year}',
    intro: 'Die folgenden Preise sind die auf re-sound.be veröffentlichten Preise. Konfigurieren Sie Ihre Box auf der Produktseite, um ein genaues Angebot zu erhalten.',
    priceNote: 'Preise verstehen sich zzgl. MwSt., Transport und Montage (ab Werk).',
    currencyNote: 'Alle Preise in {currency}.',
    priceListRef: 'Preisliste',
    validFrom: 'Gültig ab',
    generatedOn: 'Erstellt am',
    modelsTitle: 'Modelle und Ab-Preise',
    optionsTitle: 'Optionen und Zubehör je Modell',
    model: 'Modell',
    fromPrice: 'Ab-Preis zzgl. MwSt.',
    extension: 'Zusätzliches 90-cm-Element',
    capacity: 'Kapazität',
    footprint: 'Stellfläche',
    dimensions: 'Außenmaße (B×T×H)',
    iso: 'ISO 23351-1',
    ventilation: 'Lüftung',
    power: 'Strom',
    weight: 'Gewicht',
    person: 'Person',
    persons: 'Personen',
    classLabel: 'Klasse {class}',
    pending: 'Messung ausstehend',
    onRequest: 'Auf Anfrage',
    perSegment: 'je 90-cm-Segment',
    colArticle: 'Artikel',
    colDescription: 'Bezeichnung',
    colPrice: 'Preis zzgl. MwSt.',
    from: 'ab',
    lowestOf: '{model}: niedrigster Grundpreis von {list}.',
    and: 'und',
    manufacturer: 'Re-Sound ist eine Marke der Stretch Group. Gefertigt in unserem eigenen Werk in Częstochowa (Polen).',
    page: 'Seite {n} von {total}',
  },
};

const fmt = (template, vars) => template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

/** Loads a self-contained TypeScript module (no runtime imports) as ESM. */
async function importTs(path) {
  const source = readFileSync(path, 'utf8');
  let ts = null;
  try {
    ts = (await import('typescript')).default;
  } catch {
    // typescript not installed: rely on Node's own type stripping (≥ 22.18).
  }
  if (!ts) return import(pathToFileURL(path).href);
  const { outputText } = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  if (/^\s*import\b/m.test(outputText)) throw new Error(`${rel(path)} has a runtime import; this script loads it standalone`);
  return import(`data:text/javascript;base64,${Buffer.from(outputText, 'utf8').toString('base64')}`);
}

// Sorting and filtering identical to normalise() in src/lib/catalogue/load.ts.
const byProduct = (a, b) => a.sort - b.sort || a.id.localeCompare(b.id);
const byCategory = (a, b) => a.sort - b.sort || a.key.localeCompare(b.key);
const byArticle = (a, b) => a.sort - b.sort || a.code.localeCompare(b.code);

function loadCatalogue() {
  const raw = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  return {
    priceLists: (raw.priceLists ?? []).filter((l) => l.active !== false),
    products: (raw.products ?? []).filter((p) => p.active).sort(byProduct),
    categories: [...(raw.categories ?? [])].sort(byCategory),
    articles: (raw.articles ?? []).filter((a) => a.active).sort(byArticle),
  };
}

// select.ts / pricing.ts helpers, verbatim in spirit.
const articleSuffix = (code) => code.slice(code.lastIndexOf('-') + 1);
const labelFor = (labels, locale, fallback) => (labels && typeof labels[locale] === 'string' && labels[locale].trim()) || fallback;
const lineLabel = (article, locale) => labelFor(article.labels, locale, article.description);
const categoryLabel = (category, locale) => labelFor(category.labels, locale, category.name);
const lowest = (articles) => articles.reduce((min, a) => (a.priceCents !== null && (min === null || a.priceCents < min) ? a.priceCents : min), null);

// ---------------------------------------------------------------------------
// Formatting — formatCents in src/lib/catalogue/pricing.ts, with the same tag
// per locale (localeFullCodes). Intl inserts U+00A0 / U+202F around the
// currency sign; a plain space renders identically in the PDF.
// ---------------------------------------------------------------------------
const tidy = (s) => s.replace(/[  ]/g, ' ');

function formatCents(cents, localeTag, currency) {
  const whole = cents % 100 === 0;
  return tidy(
    new Intl.NumberFormat(localeTag, {
      style: 'currency',
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(cents / 100),
  );
}

function formatDate(iso, localeTag) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`invalid date "${iso}"`);
  // Date-only strings parse as UTC midnight; timestamps are shown as Brussels dates.
  const timeZone = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? 'UTC' : 'Europe/Brussels';
  return tidy(new Intl.DateTimeFormat(localeTag, { day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(d));
}

// ---------------------------------------------------------------------------
// Data → the facts each PDF prints
// ---------------------------------------------------------------------------
function collect(catalogue, productsModule) {
  const { PRODUCTS, FAMILY_PRODUCTS, isoSpeechClass } = productsModule;
  const models = (FAMILY_PRODUCTS?.booth ?? [])
    .map((slug) => PRODUCTS[slug])
    .filter((p) => p && p.specs && p.specs.kind === 'booth');
  if (models.length === 0) throw new Error(`no booth models in ${rel(PRODUCTS_TS)}`);

  const slugs = new Set(models.map((m) => m.slug));
  const soldFrom = (slug) => catalogue.products.filter((p) => p.websiteSlug === slug);
  const articlesOfProduct = (id) => catalogue.articles.filter((a) => a.productId === id);
  const articlesOf = (slug) => soldFrom(slug).flatMap((p) => articlesOfProduct(p.id));

  const rows = models.map((m) => {
    const products = soldFrom(m.slug);
    const arts = articlesOf(m.slug);
    const bases = arts.filter((a) => a.priceType === 'base');
    const fromCents = lowest(bases);
    const glassArticles = bases.filter((a) => articleSuffix(a.code) === 'BG');
    return {
      slug: m.slug,
      name: m.name,
      specs: m.specs,
      isoClass: isoSpeechClass(m.specs.speechLevelReductionDbA),
      products,
      fromCents,
      fromArticles: bases.filter((a) => a.priceCents === fromCents),
      // one base article per product (its cheapest), for the "lowest of …" note
      perProduct: products.map((p) => {
        const own = bases.filter((a) => a.productId === p.id);
        const min = lowest(own);
        return { product: p, cents: min, article: own.find((a) => a.priceCents === min) ?? null };
      }),
      glassCents: lowest(glassArticles),
      glassArticles,
      extensions: arts.filter((a) => a.categoryKey === 'additional_segments'),
    };
  });

  const glassLabelArticle = rows.map((r) => r.glassArticles[0]).find((a) => a !== undefined) ?? null;

  // Options section: every catalogue product sold from a guide page, in catalogue order.
  const optionProducts = catalogue.products
    .filter((p) => slugs.has(p.websiteSlug))
    .map((p) => {
      const arts = articlesOfProduct(p.id);
      const bases = arts.filter((a) => a.priceType === 'base');
      const options = arts.filter((a) => a.priceType === 'option');
      const groups = catalogue.categories
        .map((c) => ({ category: c, articles: options.filter((a) => a.categoryKey === c.key) }))
        .filter((g) => g.articles.length > 0);
      const constructionCategory = catalogue.categories.find((c) => c.key === (bases[0]?.categoryKey ?? 'construction')) ?? null;
      return { product: p, bases, fromCents: lowest(bases), constructionCategory, groups };
    });

  const listId = optionProducts.map((o) => o.product.priceListId).find((id) => id) ?? null;
  const priceList = catalogue.priceLists.find((l) => l.id === listId) ?? catalogue.priceLists[0] ?? null;
  if (!priceList) throw new Error(`no price list in ${rel(SNAPSHOT_PATH)}`);
  const validFrom = priceList.validFrom ?? priceList.valid_from ?? null;
  if (!validFrom) throw new Error(`price list ${priceList.id} has no valid_from`);

  return { rows, glassLabelArticle, optionProducts, priceList, validFrom, currency: priceList.currency || 'EUR' };
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------
const A4 = { width: 595.28, height: 841.89 };
const MARGIN = { top: 46, right: 42, bottom: 64, left: 42 };
const CONTENT_WIDTH = A4.width - MARGIN.left - MARGIN.right;
const COLORS = {
  brand: '#197FC7',
  ink: '#1f2933',
  muted: '#6b7280',
  rule: '#d7dce2',
  zebra: '#f4f6f8',
  head: '#e8f2fa',
  group: '#eef1f4',
};
const DASH = '—';

/** Checks every character has a glyph in the active embedded font (no tofu). */
function assertGlyphs(doc, str) {
  const font = doc._font && doc._font.font;
  if (!font || typeof font.hasGlyphForCodePoint !== 'function') return;
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (cp === 0x0a) continue;
    if (!font.hasGlyphForCodePoint(cp)) throw new Error(`font lacks U+${cp.toString(16).toUpperCase()} ("${ch}") for "${str}"`);
  }
}

function heightOf(doc, str, { font = 'Sans', size = 9, width = CONTENT_WIDTH, lineGap = 1.5, characterSpacing = 0 } = {}) {
  doc.font(font).fontSize(size);
  return doc.heightOfString(str, { width, lineGap, characterSpacing });
}

function write(doc, str, x, y, opts = {}) {
  const { font = 'Sans', size = 9, color = COLORS.ink, width = CONTENT_WIDTH, align = 'left', lineGap = 1.5, characterSpacing = 0 } = opts;
  doc.font(font).fontSize(size).fillColor(color);
  assertGlyphs(doc, str);
  doc.text(str, x, y, { width, align, lineGap, characterSpacing, lineBreak: true });
  return heightOf(doc, str, { font, size, width, lineGap, characterSpacing });
}

function rule(doc, x, y, width, color = COLORS.rule, lineWidth = 0.5) {
  doc.save().moveTo(x, y).lineTo(x + width, y).lineWidth(lineWidth).strokeColor(color).stroke().restore();
}

class Flow {
  constructor(doc, runningHeader) {
    this.doc = doc;
    this.y = MARGIN.top;
    this.runningHeader = runningHeader;
  }
  get bottom() {
    return A4.height - MARGIN.bottom;
  }
  ensure(height, onNewPage) {
    if (this.y + height <= this.bottom) return;
    this.doc.addPage();
    this.y = MARGIN.top;
    if (this.runningHeader) this.runningHeader(this);
    if (onNewPage) onNewPage(this);
  }
}

/**
 * Simple grid: `columns` [{ width, align }], `header` string[], `rows`
 * [{ cells: [{ text, bold, color }], span?: true }]. A span row is one cell
 * across the full width (category group). The header repeats after a page
 * break, and never sits alone at the foot of a page.
 */
function drawTable(flow, { x = MARGIN.left, columns, header, rows, size = 8.5, pad = 3.5 }) {
  const { doc } = flow;
  const totalWidth = columns.reduce((s, c) => s + c.width, 0);
  const cellOpts = (col, cell) => ({
    font: cell.bold ? 'SansBold' : 'Sans',
    size: cell.size ?? size,
    width: col.width - 2 * pad,
    align: col.align ?? 'left',
    color: cell.color ?? COLORS.ink,
    lineGap: 1,
  });
  const rowHeight = (cells, cols) => Math.max(...cells.map((cell, i) => heightOf(doc, cell.text, cellOpts(cols[i], cell)))) + 2 * pad;
  const drawCells = (cells, cols, y, bg) => {
    const h = rowHeight(cells, cols);
    if (bg) doc.save().rect(x, y, totalWidth, h).fill(bg).restore();
    let cx = x;
    cells.forEach((cell, i) => {
      write(doc, cell.text, cx + pad, y + pad, cellOpts(cols[i], cell));
      cx += cols[i].width;
    });
    rule(doc, x, y + h, totalWidth);
    return h;
  };
  const headerCells = header.map((t) => ({ text: t, bold: true }));
  const drawHeader = () => {
    flow.y += drawCells(headerCells, columns, flow.y, COLORS.head);
  };
  const colsFor = (row) => (row.span ? [{ width: totalWidth, align: 'left' }] : columns);

  flow.ensure(rowHeight(headerCells, columns) + (rows[0] ? rowHeight(rows[0].cells, colsFor(rows[0])) : 0));
  drawHeader();
  let zebra = 0;
  rows.forEach((row) => {
    const cols = colsFor(row);
    const h = rowHeight(row.cells, cols);
    flow.ensure(h, drawHeader);
    let bg = null;
    if (row.span) {
      bg = COLORS.group;
      zebra = 0;
    } else {
      bg = zebra % 2 === 1 ? COLORS.zebra : null;
      zebra += 1;
    }
    flow.y += drawCells(row.cells, cols, flow.y, bg);
  });
}

function sectionTitle(flow, title) {
  flow.ensure(64);
  write(flow.doc, title, MARGIN.left, flow.y, { font: 'SansBold', size: 12.5 });
  flow.y += 16;
  flow.doc.save().rect(MARGIN.left, flow.y, 28, 2).fill(COLORS.brand).restore();
  flow.y += 8;
}

function buildPdf(locale, localeTag, data, generatedAt) {
  const L = LABELS[locale];
  const { rows, glassLabelArticle, optionProducts, priceList, validFrom, currency } = data;
  const year = validFrom.slice(0, 4);
  const title = fmt(L.title, { year });
  const money = (cents) => (cents === null || cents === undefined ? L.onRequest : formatCents(cents, localeTag, currency));
  const generated = new Date(generatedAt);
  const metaLine = `${L.priceListRef} ${priceList.id} · ${L.validFrom} ${formatDate(validFrom, localeTag)} · ${L.generatedOn} ${formatDate(generatedAt, localeTag)}`;

  const doc = new PDFDocument({
    size: 'A4',
    margins: MARGIN,
    bufferPages: true,
    lang: locale,
    displayTitle: true,
    info: {
      Title: title,
      Author: 'Re-Sound',
      Subject: priceList.name,
      Keywords: `Re-Sound, ${priceList.id}, ${locale}`,
      Creator: 'scripts/build-price-list-pdf.mjs',
      Producer: 'PDFKit',
      CreationDate: generated,
      ModDate: generated,
    },
  });
  doc.registerFont('Sans', join(FONT_DIR, 'LiberationSans-Regular.ttf'));
  doc.registerFont('SansBold', join(FONT_DIR, 'LiberationSans-Bold.ttf'));

  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise((resolveDone, reject) => {
    doc.on('end', () => resolveDone(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const runningHeader = (flow) => {
    write(doc, title, MARGIN.left, MARGIN.top - 18, { size: 8, color: COLORS.muted, width: CONTENT_WIDTH - 120 });
    write(doc, WEBSITE, MARGIN.left + CONTENT_WIDTH - 120, MARGIN.top - 18, { size: 8, color: COLORS.muted, width: 120, align: 'right' });
    rule(doc, MARGIN.left, MARGIN.top - 6, CONTENT_WIDTH);
  };
  const flow = new Flow(doc, runningHeader);

  // ── Title block ──────────────────────────────────────────────────────────
  flow.y += write(doc, 'RE-SOUND', MARGIN.left, flow.y, { font: 'SansBold', size: 10, color: COLORS.brand, characterSpacing: 2 }) + 4;
  flow.y += write(doc, title, MARGIN.left, flow.y, { font: 'SansBold', size: 20 }) + 4;
  flow.y += write(doc, metaLine, MARGIN.left, flow.y, { size: 8.5, color: COLORS.muted }) + 8;
  flow.y += write(doc, L.intro, MARGIN.left, flow.y, { size: 9.5 }) + 3;
  flow.y += write(doc, `${L.priceNote} ${fmt(L.currencyNote, { currency })}`, MARGIN.left, flow.y, { size: 9, color: COLORS.muted }) + 12;

  // ── Model table (attributes as rows, models as columns — like the guide) ─
  sectionTitle(flow, L.modelsTitle);
  const labelWidth = 112;
  const modelWidth = (CONTENT_WIDTH - labelWidth) / rows.length;
  const columns = [{ width: labelWidth }, ...rows.map(() => ({ width: modelWidth }))];
  const spec = (r, key) => r.specs[key] || DASH;
  const capacity = (r) => `${r.specs.capacity} ${r.specs.capacity === '1' ? L.person : L.persons}`;
  const iso = (r) => {
    const db = r.specs.speechLevelReductionDbA;
    return db !== null && r.isoClass ? `${fmt(L.classLabel, { class: r.isoClass })} · ${db} dB(A)` : L.pending;
  };
  // The table cell is narrow: print the label's leading segment ("+1 element"
  // from "+1 element - total depth 2.7 m, …"); the full catalogue label and
  // code follow in the options section. A label without a " - " separator
  // prints whole.
  const shortLabel = (a) => {
    const full = lineLabel(a, locale);
    const [head, ...rest] = full.split(/\s[-–—]\s/);
    return rest.length > 0 && head.trim() ? head.trim() : full;
  };
  const extensionCell = (r) => (r.extensions.length === 0 ? DASH : r.extensions.map((a) => `${shortLabel(a)}: ${money(a.priceCents)}`).join('\n'));
  const row = (label, cell, opts = {}) => ({
    cells: [{ text: label, bold: true }, ...rows.map((r) => ({ text: cell(r), ...opts }))],
  });
  const modelRows = [
    row(L.capacity, capacity),
    row(L.footprint, (r) => spec(r, 'footprint')),
    row(L.dimensions, (r) => spec(r, 'externalDimensions')),
    row(L.fromPrice, (r) => money(r.fromCents), { bold: true, color: COLORS.brand }),
    ...(glassLabelArticle ? [row(lineLabel(glassLabelArticle, locale), (r) => money(r.glassCents))] : []),
    row(L.extension, extensionCell),
    row(L.iso, iso),
    row(L.ventilation, (r) => spec(r, 'ventilation')),
    row(L.power, (r) => spec(r, 'power')),
    row(L.weight, (r) => spec(r, 'weight')),
  ];
  drawTable(flow, { columns, header: [L.model, ...rows.map((r) => r.name)], rows: modelRows });

  // Footnotes: which catalogue model a multi-model page's from-price comes from.
  flow.y += 6;
  for (const r of rows) {
    if (r.perProduct.length < 2) continue;
    const parts = r.perProduct.map((pp) => `${pp.product.name} (${pp.article ? pp.article.code : DASH}, ${money(pp.cents)})`);
    const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} ${L.and} ${parts[parts.length - 1]}` : parts[0];
    const note = fmt(L.lowestOf, { model: r.name, list });
    flow.ensure(heightOf(doc, note, { size: 8, width: CONTENT_WIDTH }));
    flow.y += write(doc, note, MARGIN.left, flow.y, { size: 8, color: COLORS.muted }) + 2;
  }
  flow.y += 8;

  // ── Options per catalogue product, grouped by category ──────────────────
  sectionTitle(flow, L.optionsTitle);
  const optColumns = [{ width: 78 }, { width: CONTENT_WIDTH - 78 - 96 }, { width: 96, align: 'right' }];
  const optHeader = [L.colArticle, L.colDescription, L.colPrice];
  // Only price-list articles carry an orderable article number; website-
  // defined lines (source 'website', WEB-…) are quoted on request and show
  // no code, as on the product pages.
  const articleRow = (a, { highlight = false } = {}) => {
    const text = a.perSegment ? `${lineLabel(a, locale)} · ${L.perSegment}` : lineLabel(a, locale);
    const priced = a.priceCents !== null;
    return {
      cells: [
        { text: a.source === 'price-list' ? a.code : '', color: COLORS.muted, size: 8 },
        { text, bold: highlight },
        { text: money(a.priceCents), bold: highlight, color: priced ? COLORS.ink : COLORS.muted },
      ],
    };
  };
  for (const op of optionProducts) {
    const headingH = 20;
    flow.ensure(headingH + 60);
    write(doc, op.product.name, MARGIN.left, flow.y, { font: 'SansBold', size: 11, width: CONTENT_WIDTH - 200 });
    if (op.fromCents !== null) {
      write(doc, `${L.from} ${money(op.fromCents)}`, MARGIN.left + CONTENT_WIDTH - 200, flow.y + 1.5, { size: 9, color: COLORS.muted, width: 200, align: 'right' });
    }
    flow.y += headingH;
    const tableRows = [];
    if (op.bases.length > 0) {
      tableRows.push({ span: true, cells: [{ text: op.constructionCategory ? categoryLabel(op.constructionCategory, locale) : op.bases[0].categoryKey, bold: true }] });
      for (const a of op.bases) tableRows.push(articleRow(a, { highlight: a.priceCents === op.fromCents }));
    }
    for (const g of op.groups) {
      tableRows.push({ span: true, cells: [{ text: categoryLabel(g.category, locale), bold: true }] });
      const priced = g.articles.filter((a) => a.priceCents !== null);
      const onRequest = g.articles.filter((a) => a.priceCents === null);
      for (const a of priced) tableRows.push(articleRow(a));
      if (onRequest.length === 1) tableRows.push(articleRow(onRequest[0]));
      else if (onRequest.length > 1) {
        // Several unpriced lines in one category: one row naming them all.
        tableRows.push({
          cells: [
            { text: onRequest.every((a) => a.source === 'price-list') ? onRequest.map((a) => a.code).join(', ') : '', color: COLORS.muted, size: 8 },
            { text: onRequest.map((a) => lineLabel(a, locale)).join(', ') },
            { text: L.onRequest, color: COLORS.muted },
          ],
        });
      }
    }
    drawTable(flow, { columns: optColumns, header: optHeader, rows: tableRows, size: 8.5 });
    flow.y += 12;
  }

  // ── Footer on every page ────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  const total = range.count;
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    // pdfkit starts a new page when text reaches the bottom margin; the
    // footer lives inside that margin, so lift it while drawing.
    const savedBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    let y = A4.height - MARGIN.bottom + 14;
    rule(doc, MARGIN.left, y - 6, CONTENT_WIDTH);
    y += write(doc, L.manufacturer, MARGIN.left, y, { size: 7.5, color: COLORS.muted }) + 1;
    const pageLabel = fmt(L.page, { n: i - range.start + 1, total });
    write(doc, `${L.validFrom} ${formatDate(validFrom, localeTag)} · ${L.generatedOn} ${formatDate(generatedAt, localeTag)} · ${WEBSITE}`, MARGIN.left, y, {
      size: 7.5,
      color: COLORS.muted,
      width: CONTENT_WIDTH - 90,
    });
    write(doc, pageLabel, MARGIN.left + CONTENT_WIDTH - 90, y, { size: 7.5, color: COLORS.muted, width: 90, align: 'right' });
    doc.page.margins.bottom = savedBottom;
  }

  doc.end();
  return done;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const generatedAt = process.env.PRICELIST_GENERATED_AT?.trim() || new Date().toISOString();
  if (Number.isNaN(new Date(generatedAt).getTime())) throw new Error(`PRICELIST_GENERATED_AT is not a date: "${generatedAt}"`);

  const catalogue = loadCatalogue();
  const productsModule = await importTs(PRODUCTS_TS);
  const i18n = await importTs(I18N_TS);
  const tags = i18n.localeFullCodes ?? {};
  for (const locale of LOCALES) {
    if (!tags[locale]) throw new Error(`no BCP 47 tag for "${locale}" in ${rel(I18N_TS)}`);
    if (!LABELS[locale]) throw new Error(`no labels for "${locale}"`);
  }

  const data = collect(catalogue, productsModule);

  console.log(`[price-list-pdf] price list ${data.priceList.id} (${data.currency}), valid from ${data.validFrom}, generated ${generatedAt}`);
  for (const r of data.rows) {
    const from = r.fromArticles.map((a) => a.code).join('/') || DASH;
    const glass = r.glassArticles.map((a) => `${a.code}=${a.priceCents}`).join('/') || DASH;
    const ext = r.extensions.map((a) => `${a.code}=${a.priceCents}`).join(', ') || DASH;
    console.log(`  ${r.name.padEnd(11)} from ${String(r.fromCents).padStart(8)} cents (${from}) · glass ${glass} · extensions ${ext}`);
  }
  for (const op of data.optionProducts) {
    const n = op.groups.reduce((s, g) => s + g.articles.length, 0);
    console.log(`  options ${op.product.name.padEnd(11)} ${op.bases.length} base + ${n} option articles in ${op.groups.length} categories`);
  }

  const files = {};
  for (const locale of LOCALES) {
    const pdf = await buildPdf(locale, tags[locale], data, generatedAt);
    if (!pdf.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`${locale}: output is not a PDF`);
    files[locale] = pdf.toString('base64');
    console.log(`  ${locale}: ${pdf.length} bytes`);
  }

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify({ generatedAt, validFrom: data.validFrom, files }, null, 2)}\n`);
  console.log(`[price-list-pdf] wrote ${rel(OUT_PATH)}`);
}

main().catch((err) => {
  console.error(`[price-list-pdf] failed: ${err instanceof Error ? err.stack || err.message : String(err)}`);
  process.exit(1);
});
