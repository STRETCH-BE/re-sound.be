# Re-Sound content sprint 2 — report

Source: `content/re-sound-content-data-templates.xlsx` (workbook v2, 6 September
2026) plus the sprint brief. Work done on branch `content/blog-faq-testimonials`,
one commit per section, nothing pushed or deployed. Every number, price, norm
and claim on the new pages traces to the workbook, to `src/data/products.ts`
or to the brief; whatever was missing is a placeholder and an entry in
`docs/needs-michael.md`.

## Commits

| Commit | Section | Subject |
|---|---|---|
| `b4f628d` | 0 | content: import the content workbook and its data files |
| `39ebd45` | 1 | content: publish six Dutch blog posts with BlogPosting and FAQ schema |
| `624e1ba` | 3 | content: workbook FAQ on /faq, the range hubs, product pages and the price guide |
| `d51a87b` | 4 | content: Google reviews as testimonials with a weekly refresh |
| `279da32` | 5 | content: product data updates, Polish production office and the booth price guide |
| `5cc031d` | 2 | content: add twelve FR/DE/EN blog drafts (noindex, status Review) |
| (last commit) | 6 | content: sprint-2 checks, report and needs-Michael list |

Sections 3–5 were committed before section 2 because the drafts were still
in their verification pass; each commit type-checks on its own.

## 0. Inventory

`scripts/content/import-workbook.mjs` (`npm run content:import`) reads the
workbook with SheetJS and writes:

| Sheet | Output | Rows |
|---|---|---|
| Blog_Posts (status Ready for dev) | `content/blog/nl/<slug>.md` — markdown body, JSON front matter | 6 posts |
| Blog_Posts (status Briefed) | `content/blog/briefs.json` | 12 briefs (fr/de/en) |
| FAQ | `content/faq/source.json` (raw) → edited `content/faq/en.json` → translations | 17 rows |
| Testimonials | `content/testimonials.json` | 4 Google reviews |
| Booth_Guide | `content/booth-guide.json` | 3 models + Dutch guide copy |
| Dealers_Showrooms | `content/showrooms.json` | HQ showroom + Częstochowa office |
| — | `content/blog-status.json` (written back instead of into the workbook, which SheetJS would strip of formulas) | 18 ids |

Data sheets used directly: Products_Data (made-in, αw, units, recycled
content), Booth_Guide (prices), Dealers_Showrooms (hours, second location).
Sheets not used in this sprint: Tech_Pages, Tech_Absorption, Finishes,
Fire_Tests, Installation, Spec_Clauses, Case_Studies, Application_Pages,
Listings_Links, Images_Assets, Translation_Tracker (all Backlog).

## 1. Dutch posts — live

| Id | Route | Planned date | Words | Internal links |
|---|---|---|---|---|
| BP-001 | `/nl/blog/belcabine-kantoor-prijs-keuze-plaatsing` | 2026-10-06 | 1423 | 6 |
| BP-002 | `/nl/blog/akoestiek-open-kantoor-verbeteren` | 2026-10-20 | 1237 | 8 |
| BP-003 | `/nl/blog/pet-vilt-of-houten-akoestische-panelen` | 2026-11-03 | 1235 | 7 |
| BP-004 | `/nl/blog/hoeveel-akoestische-panelen-nodig` | 2026-11-17 | 1356 | 4 |
| BP-005 | `/nl/blog/nagalmtijd-klaslokaal-normen` | 2026-12-01 | 1250 | 7 |
| BP-006 | `/nl/blog/akoestische-panelen-restaurant` | 2026-12-15 | 1219 | 7 |

Rendering: `src/lib/content/blog.ts` (gray-matter) → `ContentPost` +
`MarkdownBody` (react-markdown, GFM tables, external links open in a new
tab). Each post emits `BlogPosting` (author Michael Nicasens, jobTitle CEO
Stretch Group, worksFor Re-Sound, `wordCount`), one `FAQPage` with the
post's three questions, and `BreadcrumbList`; the canonical is the post's
own URL and there is no hreflang (single-locale editorial). Posts appear
first on `/nl/blog` and in the sitemap (`lastmod` = `dateModified`).

Dates: the posts are live now, so `datePublished` is 6 September 2026 and
the Content_Calendar date is kept as `plannedDate` (a future
`datePublished` is invalid for `BlogPosting`; see needs-Michael 4).

Link substitutions: the workbook's "Internal links" column is applied by the
importer to the first plain-text mention of each product, range or page
(outside headings, tables and the FAQ block). Planned application pages
(`/nl/applications/kantoor`, `/onderwijs`, `/horeca`) do not exist and were
skipped; ranges that a body never names could not be linked (listed in
needs-Michael 18). Hero images: none of the six requested files exists, so
each post shows the hero of the product it discusses and records the
missing path in `heroImageMissing`.

## 2. FR/DE/EN drafts — status Review, noindex

| Id | Route (noindex) | Planned date | Words | Internal links |
|---|---|---|---|---|
| BP-007 | `/fr/blog/cabine-acoustique-bureau-prix` | 2026-10-13 | 1388 | 8 |
| BP-008 | `/fr/blog/panneaux-acoustiques-pet-recycle` | 2026-10-27 | 1384 | 10 |
| BP-009 | `/fr/blog/combien-de-panneaux-acoustiques` | 2026-11-10 | 1399 | 8 |
| BP-010 | `/fr/blog/panneau-acoustique-bois-microperfore` | 2026-11-24 | 1394 | 10 |
| BP-011 | `/de/blog/telefonbox-buero-kosten` | 2026-10-13 | 1390 | 8 |
| BP-012 | `/de/blog/akustikpaneele-recyceltes-pet` | 2026-10-27 | 1386 | 11 |
| BP-013 | `/de/blog/din-18041-nachhallzeit-buero` | 2026-11-10 | 1347 | 12 |
| BP-014 | `/de/blog/holz-akustikpaneele-mikroperforiert-oder-genutet` | 2026-11-24 | 1399 | 9 |
| BP-015 | `/en/blog/office-phone-booth-prices` | 2026-10-13 | 1395 | 8 |
| BP-016 | `/en/blog/pet-acoustic-panels-vs-wood` | 2026-10-27 | 1386 | 14 |
| BP-017 | `/en/blog/how-many-acoustic-panels-do-i-need` | 2026-11-10 | 1396 | 8 |
| BP-018 | `/en/blog/specifying-acoustic-panels-aw-nrc-class-a` | 2026-11-24 | 1384 | 11 |

Each draft was written from the Dutch model post and the facts list, then
checked and corrected by an adversarial pass (facts, arithmetic, norms per
market, format rules, front matter, language) and a final read-only check.
`draft: true` keeps them out of `/blog`, the sitemap and the index (`robots:
noindex, nofollow` on the route, a "Draft" banner on the page); flip the
flag to publish. Findings the writers could not settle are in needs-Michael
section G.

## 3. FAQ

`content/faq/en.json` is the edited source (17 rows, answers 21–76 words,
first sentence answers the question); `nl/fr/de/es/pt` were translated and
reviewed, `da/sv/no/is` translated so that the noindex locales stay in their
own language. `src/lib/content/faq.ts` reads them (no English fallback).

| Page | Workbook rows shown | Plus |
|---|---|---|
| `/faq` | all 17, grouped Booths · rPET · rWood · General · Ordering | the 14 existing questions merged into General/Ordering, duplicates dropped |
| Booths hub | 001 002 003 004 005 006 008 010 011 | the hub's own 5 questions |
| rPET hub | 012 013 014 | hub questions |
| rWood hub | 015 016 | hub questions |
| Solo Flex | 001 | product questions |
| Modular XL | 009 | product questions |
| rPET Panel | 013 | product questions |
| Booth price guide | 001 003 004 007 008 009 010 | — |

Accordions are native `<details>/<summary>` everywhere (`FaqList`,
`ProductFaq`); each page emits exactly one `FAQPage` with the questions it
shows. Rows tagged `about`/`sustainability` (011, 017) appear on `/faq`
only; those pages have no FAQ block yet.

## 4. Testimonials

- `scripts/fetch-google-reviews.mjs` runs as `prebuild`: with
  `GOOGLE_PLACES_API_KEY` it calls Places API (New) `places:searchText`
  (field mask `places.id,places.displayName`) to resolve the place id and
  `places/{id}` (field mask `rating,userRatingCount,reviews,googleMapsUri`)
  for the reviews, and writes
  `content/google-reviews.json`; without the key it keeps the committed
  snapshot (workbook rows, 6 September 2026). The key is read from the
  environment only.
- `getTestimonials()` (`src/lib/content/testimonials.ts`) wraps the same
  fetch in `unstable_cache` tagged `google-reviews`, weekly revalidation;
  `/api/cron/google-reviews` (`vercel.json`, Mondays 06:00 UTC,
  `CRON_SECRET` bearer) revalidates the tag.
- `Testimonials` (server component): rating badge linking to the Maps
  listing, review cards in the review's own language with "via Google",
  star-only reviews as rating rows, "Review us on Google" link. Placed on
  the homepage (before the closing CTA), on `/where-to-buy` and on the booth
  price guide. Footer: "Review us on Google". No `Review` or
  `AggregateRating` JSON-LD.

## 5. Data updates

- `src/data/products.ts`: `madeIn` per range (Interior/Solid/Divide BE,
  rWood/rPET/booths PL → `countryOfOrigin`), Solid and Divide αw 1.0 class A,
  textile range priced per piece (`hubs.shared.units.*`, translated), rPET
  Panel / Flex Groove 100 % and rWood Groove 60 % recycled content
  (flagged), Solo Flex `fromPrice` 2 740 and Modular XL 15 000 EUR excl. VAT
  → `Offer` in their Product JSON-LD; Duo keeps no Offer.
- Booth price guide `/guides/…` (`src/data/guides.ts`, localised slugs
  `phone-booth-prices` · `prijzen-belcabines` · `prix-cabines-acoustiques` ·
  `telefonbox-preise`; en/nl/fr/de only, hreflang restricted to those four,
  404 elsewhere): H1, intro with the manufacturer sentence, price table
  (with/without installation, extra 90 cm element, ISO 23351-1 class,
  ventilation, power, weight, assembly, lead time, warranty), what is
  included, installation by Re-Sound or two-person self-assembly, showroom
  test, ISO class table with the thresholds (A+ ≥ 33 … D ≥ 21 dB; Solo Flex
  ≈ 24 and Modular XL 25.9 dB(A) = Class C, Duo not measured), end of life,
  FAQ (rows tagged `guide`), Google reviews, CTA. JSON-LD: BreadcrumbList +
  FAQPage. Linked from the footer, the booths hub table and the three booth
  pages; in the sitemap with priority 0.8.
- Częstochowa production office: `PRODUCTION_OFFICE` in `src/config/site.ts`,
  `productionOfficeSchema()` (second `LocalBusiness`, `parentOrganization`
  → Organization, Mon–Fri 08:00–16:30, knowsLanguage nl/pl/uk/ru/en, no
  geo) and a section on `/where-to-buy`.
- HQ hours 08:00–16:30 in `SHOWROOM` (LocalBusiness), contact page,
  where-to-buy and the footer strings of all ten locales.
- Booths hub H1 no longer says "built in Belgium" (booths are made in
  Częstochowa); rewritten in all locales.
- UI strings for everything above translated into nl/fr/de/es/pt/da/sv/no/is
  (native review for nl/fr/de); four sprint-1 leftovers in the Nordic and
  es/pt locales retranslated on the way.

## 6. Checks

`npm run lint` (one pre-existing warning, MetaPixel `<img>`), `npx tsc --noEmit`
and `npm run build` are clean; every section commit type-checks on its own.
`node scripts/seo-check.mjs --no-build --also-locales da,sv,no,is --out
docs/seo-check-sprint2.txt` crawls the sitemap plus the mirrored Nordic
pages (300 pages, 438 internal URLs):

| Check | Sprint 1 after | Sprint 2 |
|---|---|---|
| Summary | 290 pages, 0 failures, 153 warnings | 300 pages, 1 failure, 159 warnings |
| Forbidden strings | 0 | 1 — the old "accessible-by-design" claim on `/en/products/modular-xl` (needs-Michael 1; flagged on purpose) |
| Broken internal links | 0 | 0 (price-guide links are rendered only in en/nl/fr/de) |
| Product nodes with Offer | 130 / 130 | 130 / 130 |
| Descriptions > 155 | 0 | 0 |
| English segments nl / fr / de | 0.1 / 0.1 / 0.1 % | 0.2 / 0.2 / 0.3 % |
| English segments da / sv / no / is | 0.1 / 0.0 / 0.2 / 0.1 % | 0.2 / 0.1 / 0.3 / 0.2 % |

Sitemap: 202 URLs (en 30, nl 36, fr 30, de 30, es 29, pt 29, 18 documents);
the six Dutch posts have no hreflang by design (single-locale) and the
guide carries a four-locale set. JSON-LD: 656 blocks, 0 parse errors, 46
BlogPosting, 180 FAQPage (one per page), 30 LocalBusiness (HQ + production
office), 130 Product with Offer. Drafts: every FR/DE/EN route answers 200
with `robots: noindex, nofollow`, a draft banner and one FAQPage, and none
appears in the sitemap or the blog index.

Check-script changes in this sprint: "accessible-by-design" is a forbidden
string; single-locale sitemap entries are reported as a warning instead of
"no hreflang links"; the Nordic mirror skips sitemap entries whose hreflang
set does not cover every sitemap locale. The 37 title-length warnings are
the sprint-1 backlog (range hubs and product titles), unchanged.

Fixes made after the first check run: the price-guide links (footer, booths
hub, booth pages) are rendered only in the four guide locales; the English
guide description was shortened to 153 characters.

Not done in this sprint (workbook Backlog): technical pages, case studies,
application pages, dealer list, directory listings.
