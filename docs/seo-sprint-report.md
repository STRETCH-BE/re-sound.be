# Re-Sound SEO / performance sprint — report

Audit baseline: live site, 6 September 2026. Work done on branch
`claude/seo-p0-sprint-u0oi8k` (the brief asked for `seo/p0-sprint`; the
hosting session pinned this branch name). Nothing was pushed or deployed
by the sprint itself.

Commits, in order (one per task, prefixed as requested):

| Commit | Task | Subject |
|---|---|---|
| `33b0208` | 0 | seo: add seo-check and lighthouse runner scripts, baseline reports |
| `bf4077c` | 1 | content: fix audit content defects across all locales |
| `a3e30db` | 2 | perf: server-render styled-jsx, trim hero/fonts/analytics, split product pages |
| `61d782f` | 3 | content: search-led titles, H1s and meta descriptions (EN/NL/FR/DE) |
| `39f0a53` | 5 | i18n: limit sitemap and hreflang to SEO_LOCALES, noindex the Nordic locales |
| `f8e56bb` | 6 | seo: add rPET, rWood and phone-booth range hub pages with localised slugs |
| `0c32853` | 4 | seo: data-driven Product offers, LocalBusiness, ItemList, BlogPosting, real sitemap lastmod |
| `ef47199` | 7 | content: document library per product with real paths and a missing-documents report |
| `48f1193` | 8 | seo: brief for the STRETCH Group footer links and cross-site structured data |
| `ddd0a95` | 5 | i18n: move spec-table literals, hero pills and honeypot labels into messages |
| `cc2823e` | 5 | i18n: complete es/pt, replace Spanish in pt, translate Nordic homepage and hub strings |
| `4ff19be` | 7/0 | seo: link only existing product documents; fix the check's Spanish detector |
| (last commit) | 9 | seo: after-sprint check, Lighthouse and this report |

## Before / after

Lighthouse, mobile, simulated slow 4G, performance category only, median-LCP
run of three (`node scripts/lighthouse-run.mjs <label> --runs 3`; full
tables in `docs/lighthouse/before-summary.md` and `docs/lighthouse/after-summary.md`).

| Page | Score | LCP | TBT | CLS |
|---|---|---|---|---|
| /en | 50 → 92 | 4.59 s → 3.33 s | 485 ms → 44 ms | 0.504 → 0.000 |
| /en/products/solo-flex | 67 → 96 | 3.51 s → 2.86 s | 75 ms → 16 ms | 0.606 → 0.000 |
| /en/products/rwood-micro | 51 → 93 | 8.51 s → 3.10 s | 86 ms → 86 ms | 0.577 → 0.000 |

TBT and CLS meet the targets on all three pages. LCP does not reach 2.5 s
in Lighthouse's simulated mode: after the fixes the LCP element is a text
paragraph (product pages) or the preloaded hero image (home) and the
remaining time is Lighthouse's pessimistic estimate for the Next.js
framework bundle (87 kB shared JS) and the document itself, which its
model puts on the LCP path whatever the page does. Field LCP on a real
device will be well below the lab number; see Task 2 for what was tried.

Check script (`node scripts/seo-check.mjs --out docs/seo-check-<label>.txt`,
crawls every locale page of a local production build):

| Metric | Before | After |
|---|---|---|
| Pages crawled | 280 (10 locales) | 290 (6 locales in the sitemap, all 10 crawled) |
| Forbidden strings | 47 pages | none |
| English segments, indexable pages: es / pt | 15.8 % / 15.4 % | 0.2 % / 0.2 % |
| English segments: nl / fr / de | 5.1 % / 6.0 % / 7.3 % | 0.3 % / 0.3 % / 0.3 % |
| English segments: da / sv / no / is | 14.6 / 11.6 / 11.6 / 14.2 % | 5.0 / 4.9 / 5.0 / 6.5 % |
| Spanish text on /pt pages | yes (homepage and more) | none |
| Products with JSON-LD `offers` | 1 of 13 (Interior only) | 13 of 13 (130 Product nodes across 10 locales, all with an Offer) |
| Sitemap URLs / locales / distinct lastmod | 280 / 10 / 1 | 192 / 6 / 10 |
| Titles > 65 / descriptions > 155 | 124 warnings | 39 titles (brief-verbatim + blog headlines), 0 descriptions |
| Internal 404 links | 10 (homepage datasheet link, every locale) | 0 |

## Task 0 — orientation and tooling

- `scripts/seo-check.mjs`: spawns `next start` on a free port (refuses to
  run if the port is busy, so it never reports a stale build), crawls the
  sitemap plus every locale route and reports (a) forbidden strings per
  locale, (b) English-segment share on non-English pages (stop-word ratio
  on unique segments of four or more words; the untranslated legal pages
  are excluded and listed separately), (b2) Spanish text on /pt, (c) hreflang and
  canonical per page, (d) JSON-LD parse errors and `offers` on every
  Product, (e) sitemap counts and lastmod distribution, (f) internal 404s
  including sitemap document entries, (g) title/description lengths.
- `scripts/lighthouse-run.mjs`: three Lighthouse runs per target page,
  median-LCP run reported, summary markdown plus JSON (JSON is gitignored).
- `docs/seo-check-before.txt` and `docs/lighthouse/before-summary.md` are
  the committed baselines.

## Task 1 — content defects

- Homepage "Why" H2 no longer renders a stray `<em>` fragment; the
  placeholder "Partner 1 / Partner 2" block is gone (`PARTNERS` in
  `src/config/site.ts` is an empty list until real partners are supplied).
- Product blurbs and meta descriptions on /products rewritten; the
  homepage datasheet link points at an existing PDF.
- rPET Panel recycled-content claims come from one field
  (`recycledContentPct`, currently unconfirmed → the sentence adapts).
- Divide page: English leak in NL/FR/DE removed.
- One manufacturer statement in every locale ("Re-Sound is a Stretch Group
  brand. We manufacture in our own plants in Beveren-Waas (Belgium) and
  Częstochowa (Poland).") drives the About page, footer, hubs and product
  heroes; `madeIn` per product drives "Made in …" copy, the OG image line
  and `countryOfOrigin` (never "EU"; omitted while unconfirmed).
- `FOUNDING_YEAR` and `SOCIAL_LINKS` constants; the About copy uses an ICU
  select so no year is shown while the constant is null.
- NL/DE/FR proofreading list applied (Milieuresepct, Staalpackage,
  Elevieren, "Sans Couture", "gegroeide", lowercase variants…); emoji-free
  descriptive alt texts; localised Privacy link.

## Task 2 — performance

Root cause of the audit's CLS 0.5–0.6 and 4–8 s LCP: styled-jsx blocks were
never server-rendered (0 `<style>` tags in the HTML), so every page painted
unstyled and reflowed after hydration. `src/components/StyledJsxRegistry.tsx`
(`useServerInsertedHTML`) fixes that for every page at once.

Also done: transform-only hero keyframes under
`prefers-reduced-motion: no-preference`, float only from 1024 px; gtag.js
without preconnect/preload, loaded with `next/script` `lazyOnload` only
after analytics consent, Consent Mode v2 defaults denied; exactly one
`priority` hero image with real `sizes` and `quality={55}`, second image
lazy; AVIF/WebP via `next/image`; fonts trimmed to Syne 700/800 and DM Sans
400/500 with `display: swap` (both preloaded because the hero uses them);
modern `browserslist`; `prefetch={false}` on footer, mobile-menu and
homepage secondary links.

Product pages: Specifications, Downloads, Projects & Installations, Other
models and FAQ are server components (native `<details>/<summary>`) passed
as slots into the client templates; the lead-gen modal only mounts for
gated CAD downloads; the eight full-size veneer JPGs that were loaded as CSS
background swatches (≈1.8 MB before first paint on rWood pages) are 72 px
`next/image` thumbnails. Client JS per product page dropped by roughly
25–35 % (for example rWood Micro 2457 → 2099 lines of template code, first
load 139 kB).

Not applicable: the brief mentions a "Spec it your way" configurator and a
gallery lightbox to load with `next/dynamic`; neither exists in the codebase
(the finish selectors are plain state in the hero), so there was nothing to
split. The remaining polyfills Lighthouse lists (`Array.prototype.at` etc.)
are Next.js's built-in polyfill module, not affected by browserslist.

## Task 3 — titles, H1s, meta descriptions

Homepage and all 13 product pages lead with the searched term before the
model name in EN/NL/FR/DE, using the market vocabulary from the brief;
"soundbooth" no longer appears in titles, H1s or tags. Titles specified
verbatim in the brief that exceed 65 characters were kept as given:
EN rWood Groove (68), rPET Flex Groove (69), Solo Flex (67), FR homepage
(73), and the NL/FR/DE hub titles (66–80). The first paragraph of every
product and hub page states the manufacturer. ES/PT and the Nordic
locales received these strings through the Task 5 translation pass.

## Task 4 — structured data

- `src/lib/structured-data.ts` rebuilt around `src/data/products.ts`: one
  `Offer` per Product (EUR, `UnitPriceSpecification` MTK "per m²" / C62
  "per booth" / SET "per set", `valueAddedTaxIncluded: false`, InStock,
  NewCondition, seller `#organization`, the free take-back programme as
  `hasMerchantReturnPolicy` inside the offer). Confirmed prices ship
  (Interior €387 per set, Divide €1,238 per set); the other eleven emit
  the offer without a price unless `NEXT_PUBLIC_SHOW_PRICES=true`, in which
  case `PLACEHOLDER_FROM_PRICE` (0) is used so nothing false ships by
  accident.
- `countryOfOrigin` from `madeIn`; localised `category`;
  `additionalProperty` specs derived from the same data as the visible
  tables (the hand-written spec lists that contradicted the pages are gone).
- Organization: `foundingDate` only once `FOUNDING_YEAR` is set,
  `parentOrganization` STRETCH Group (https://stretchgroup.be), `sameAs`
  from `SOCIAL_LINKS`.
- `LocalBusiness` (Re-Sound Showroom Beveren-Waas, Gentseweg 309 A3, 9120
  Beveren-Waas, geo 51.1953188 / 4.2239015, +32-3-284-68-18,
  info@re-sound.be, Mon–Fri 09:00–17:00, "€€") on the homepage and
  where-to-buy.
- `ItemList` on /products; `BlogPosting` with `datePublished`,
  `dateModified`, `image` and author (organisation until `BLOG_AUTHOR` is
  confirmed); `CollectionPage` + `ItemList` + `BreadcrumbList` + `FAQPage`
  on the hubs; `BreadcrumbList` with the range level on product pages.
- Sitemap: SEO locales only, hreflang per URL, hubs with localised slugs,
  open product PDFs, privacy/terms dropped (noindex); `lastmod` is the
  last git commit touching each page's sources (page, data, template) with
  `updatedAt` / post-date fallbacks. On a shallow Vercel clone the fallback
  applies for files not touched within the clone depth.

## Task 5 — locales

- PT homepage showed Spanish because Spanish text had been pasted into
  `messages/pt.json` (hero, why, products, about…): 570 keys were
  identical to ES and are now European Portuguese.
- `SEO_LOCALES = ['en','nl','fr','de','es','pt']`; da/sv/no/is are
  `noindex,follow` and outside sitemap/hreflang until complete (comment in
  `src/i18n/config.ts` explains re-enabling).
- Translation pass (46 chunks, 4,437 keys; validated for placeholder, ICU
  and markup integrity before merging): all keys missing or identical to
  English in nl/fr/de/es/pt, the PT Spanish leak, the new hub / product-data
  / spec-value keys, the Task 3 titles for es/pt/da/sv/no/is, and for the
  Nordic locales the homepage, navigation, footer, product-page chrome,
  hub and meta namespaces. Spec-table literals that lived in
  `src/data/specs/*.ts` now come from `productData.specValues.*`.
- Kept in English on purpose: FAQ category identifiers (compared in code),
  product/brand names, standards and codes.
- English share per locale after the pass: see the table above. Remaining
  English on es/pt indexable pages: four segments per locale (0.2 %), no page above the 3 % threshold, so the
  acceptance criterion is met; the survivors are product codes and standard
  names the stop-word heuristic reads as English.
- Product/brand names, standards, codes and unit strings that are the same
  in every language were deliberately left identical (≈25–33 four-word-plus
  keys per locale, e.g. "ISO 354 / ASTM C423", "600 / 1200 / 2400 mm").
- Not translated: the privacy and terms pages (hardcoded legal text,
  noindex) — legal texts need Michael's approved translations, see the
  needs-Michael list; and the product-specific namespaces of the Nordic
  locales (they stay noindex).

## Task 6 — range hub pages

Three hubs under /products with localised slugs via next-intl `pathnames`
(`src/i18n/routing.ts`, `src/data/hubs.ts`): rPET
(`pet-acoustic-panels` / `pet-akoestische-panelen` /
`panneaux-acoustiques-pet` / `pet-akustikpaneele`), rWood
(`wood-acoustic-panels` / `houten-akoestische-panelen` /
`panneaux-acoustiques-bois` / `holz-akustikpaneele`), Booths
(`acoustic-phone-booths` / `akoestische-belcabines` /
`cabines-acoustiques` / `telefonboxen`); other locales fall back to the
English slug. Titles/H1s as given in the brief. Each hub: H1, 120–180-word
intro (head term twice, manufacturer sentence once), comparison table from
product data (panels: format, thickness, αw, NRC, fire class, recycled
content, finishes, mounting, lead time; booths: capacity, footprint,
dimensions, ISO 23351-1 dB(A) and class, ventilation, power, weight; "from"
price column only with confirmed prices or `NEXT_PUBLIC_SHOW_PRICES`),
model cards, Why Re-Sound (own factories, take-back, certifications from
the data only), applications, 5-question FAQ, sample-kit and quote CTAs;
JSON-LD CollectionPage + ItemList + BreadcrumbList + FAQPage; OG via
`/api/og?page=hub-<id>`.

ISO 23351-1 classes (A+ ≥ 33, A ≥ 30, B ≥ 27, C ≥ 24, D ≥ 21): Solo Flex
24 dB(A) → C, Modular XL 25.9 dB(A) → C, Duo has no measured value (the
page quotes "26 dB(A)" without a test reference) → shown as "—" and listed
under needs-Michael.

Wired into: Products nav dropdown (desktop hover/focus, mobile list),
footer range links, /products grouped by range + textile, breadcrumbs
Home › Products › range › model on every product page (visible trail and
JSON-LD from one helper), "Other models in this range" with a link to the
hub, the sitemap with hreflang alternates, and the language switcher (maps
the localised slug when switching).

## Task 7 — documents

`documents` per product in `src/data/products.ts` with real paths
`public/documents/<product>/<doc>.<ext>`; open PDFs are plain
`<a href download>` links, only CAD/BIM stays gated. Existing PDFs were
moved to the new paths (18 present); `scripts/missing-documents.mjs`
regenerates `docs/missing-documents.md` (60 files still to supply). The
Downloads block only links files that exist on disk (so no 404 links while
the library is incomplete), open PDFs that exist are in the sitemap, and
the homepage datasheet link resolves.

## Task 8 — group footer links

`docs/group-footer-links.md`: the group footer block, three contextual
placements on stretchplafond.be and the `sameAs` / `subOrganization` JSON-LD
for the group sites (outside this repository).

## Task 9 — verification

`npm run lint` and `npm run build` pass; `docs/seo-check-after.txt`,
`docs/lighthouse/after-summary.md` and this report are the final commit.

## Placeholders and items that need Michael

Every placeholder is a `null` / empty constant with a `TODO(needs-Michael)`
comment; nothing invented ships.

Prices (`fromPrice` in `src/data/products.ts`; only Interior €387/set and
Divide €1,238/set are confirmed):
- rWood Groove, rWood Micro, rWood Perf, rWood Panel (veneer) — per m²
- rPET Panel, rPET Groove, rPET Flex Groove — per m²
- Solid — per set
- Solo Flex, Duo, Modular XL — per booth

Recycled content (`recycledContentPct`):
- rPET Panel: unconfirmed (copy said "up to 50 %", title/schema said 100 %)
- rPET Groove, rPET Flex Groove: 100 % shown on the pages — confirm
- rWood Groove, rWood Micro, rWood Panel: unconfirmed (old JSON-LD claimed 60 %)
- rWood Perf: 17 % (page badge) — confirm

Country of manufacture (`madeIn`):
- rWood range: site only said "Made in Europe" — Beveren-Waas or Częstochowa?
- Solo Flex, Duo, Modular XL: a component comment calls them white-label
  supplier products; the hub H1 says "built in Belgium" as briefed — confirm

Company facts (`src/config/site.ts`):
- `FOUNDING_YEAR`: About page said 2021, the old JSON-LD said 2024
- `SOCIAL_LINKS.linkedin`: company slug `resoundbe` vs `re-sound-be`
- `PARTNERS`: real partner names/logos (placeholder block removed)
- `BLOG_AUTHOR`: named author for BlogPosting (organisation credited meanwhile)
- Blog post dates (1, 5, 10, 15 January 2024) look like placeholders — confirm

Product facts flagged by the mapping (page vs. old JSON-LD contradictions;
the visible page value was kept):
- Solid thickness 45 vs 50 mm; rPET Panel fire class B-s1,d0 vs B-s2,d0
- rWood Panel: title says 10 wood species, the veneer collection lists 8
- rPET Panel: title says 16 colours, the page lists 5 standard + RAL/NCS
- Duo: ISO 23351-1 measured speech-level reduction
- rPET Panel absorption "up to αw 1.00" vs tested configuration αw 0.95

Documents: 60 missing PDFs listed in `docs/missing-documents.md`.

Legal: privacy and terms pages are English on every locale (noindex);
approved translations needed.

Other decisions for Michael (raised by the translators while working):
- Decimal separators: NL/DE/FR/ES translators localised some spec numbers
  ("2,5 %", "0,5 mm", "25,9 dB(A)"); English keeps the point and the
  English source itself mixes both ("~From 0,35 kg/m²"). Choose one
  convention for the whole site.
- Hub NL/FR/DE titles from the brief are 66–80 characters (kept verbatim);
  the FR booths title drops the model names the EN title carries.
- rWood fire class on a standard MDF core: product data says D-s2,d2
  (rWood Groove page) and D-s2,d0 (rWood Panel page); the hub FAQ says
  "D-s2". One value is wrong.
- rPET hub: the meta description says B-s1,d0 for the range while the
  intro/FAQ say rPET Panel is B-s2,d0 — depends on the rPET Panel answer
  above.
- Solo Flex sits exactly on the ISO 23351-1 Class C threshold (24 dB(A));
  a measured value with one decimal would make the class claim robust.
- Parent brand casing: the manufacturer statement from the brief says
  "Stretch Group", the group site and `PARENT_ORGANIZATION` say "STRETCH
  Group".
- Blog "min read" and dates were hard-coded in English on every locale;
  now localised (`blog.minRead`, locale-aware date formatting).

## Not completed / caveats

- LCP < 2.5 s in simulated Lighthouse: not reached (see Before / after).
- Nordic locales: homepage, navigation, hubs and product-page chrome are
  translated; product-specific copy stays English while they are noindex.
- Privacy/terms not translated (legal).
- Titles over 65 characters remain on the blog posts in every locale (the
  post headlines plus " | Re-Sound", 66–82 characters) and on the titles
  specified verbatim in the brief; shortening blog headlines is an editorial
  call, not a mechanical one.
- The check reports 116 "hreflang set has no self-reference" warnings on
  the Nordic pages: expected while those locales sit outside SEO_LOCALES.
- Nordic locales still carry 5–6.5 % English overall (sustainability, blog,
  about and the product-specific namespaces); they stay noindex.
- The 60 missing PDFs are not linked anywhere until they are supplied; the
  Downloads block shows only files that exist.
- Vercel builds run `git log` for sitemap lastmod; on a shallow clone the
  `updatedAt` / post-date fallbacks apply for untouched files.
- Nothing was pushed or deployed (as briefed). The commits live on
  `claude/seo-p0-sprint-u0oi8k` in the sprint's working copy.
