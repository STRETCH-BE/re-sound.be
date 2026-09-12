# Lead sprint report — 12 September 2026

Branch `seo/lead-sprint-sep12`, one commit per section. Nothing was pushed or
deployed. Every number below comes from a local production build
(`npx --offline next build`, `next start` on port 3999) unless a section says
it could not be measured from the build environment.

## What changed per section

### §0 Orientation
- `docs/seo-check-before.txt` and `docs/lighthouse/before-sep12-*` (four pages, three runs, median) captured before any edit; the state of each brief item was mapped against the code (most of §5 and §6 were already in place from earlier sprints).

### §1 Accuracy blockers
- Every "100 % recycled" / "100% gerecycleerd" / "Made in Belgium"-type blanket claim removed from the homepage, the FAQ, the hubs, the product pages and the ten message files; product-specific claims remain only where `src/data/products.ts` supports them (rPET Panel and rPET Flex Groove: "made entirely from recycled PET"; Interior/Solid/Divide meta descriptions: made in Belgium).
- Homepage `<title>` per locale set verbatim from the brief (EN "Acoustic Panels & Phone Booths — Belgian Maker | Re-Sound", NL "… — fabrikant | Re-Sound", FR/DE/ES/PT as specified).
- Booth origin: "Manufactured in: Częstochowa, Poland" row in all four booth spec tables, `countryOfOrigin` PL, the European-manufacture line on the hub intro and the price guide, "manufacturer" in the booth hub title/H1 in every SEO locale.
- One source per spec value: the spec tables (`src/data/specs/*.ts`) and the product pages now read αw, NRC, fire class, thickness, recycled content, plant and certifications from `PRODUCTS[slug]`; rows the data cannot back were removed (EPD/GRS rows without a certification, per-pattern αw for rWood Perf, "US Class A", "up to 1.00 with mineral wool", "Recyclability 100 %", the unsourced "26 dB(A)" for Duo). Solo ECO and Duo show "ISO 23351-1 measurement pending".
- No "EU" `countryOfOrigin` anywhere; every emoji removed from visible text (a small inline SVG `Icon` component replaces them; flags in the language switcher became locale codes); the meta keywords tag is gone.
- `scripts/seo-check.mjs` gained rule (h): forbidden claim strings with the product-page exemption, αw/NRC/fire-class figures on a product page must be values its data allows, "Class A" needs a data αw ≥ 0.90, `countryOfOrigin` must be alpha-2 and equal `madeIn`.
- All 9 other locales retranslated for the changed keys (translators + native review for nl/fr/de/es/pt).

### §2 Legacy Wix URLs
- `legacy/wix-urls.txt` (257 URLs with provenance), `redirects.mjs` (194 rules: www→apex host rule, explicit map, prefix catch-alls), Layer-4 middleware (unknown path → closest live index or locale home), `[locale]` catch-all and `/api/legacy-fallback` for asset-like misses, unknown blog slugs → blog index, `scripts/verify-redirects.mjs` + `verify-redirects-build.mjs`, `docs/legacy-urls.md` (canonical host + DNS).

### §3 Dutch blog posts
- BP-001 rebuilt around Solo ECO from € 2 740 as the entry model, Solo Flex at € 4 118,75 as the mid-tier, a named market table of nine competitors (September 2026), installation quoted separately (about 60 minutes by our installers), no leasing mention, Częstochowa named as the plant; four FAQ entries mirrored in FAQPage JSON-LD.
- All six posts swept: rWood Groove/Micro αw 0.90 (was 0.85), rPET Groove now quoted by NRC per thickness (no αw in the data), fire classes per model (rPET Panel B-s2,d0; the rest B-s1,d0), "rPET Groove 100 %" and "rWood Groove 60 %" removed, worked examples recomputed, Solo ECO added to BP-002, `dateModified` 2026-09-12.
- The four January-2024 posts: `noindex, follow`, out of the sitemap, off the Dutch index (kept on locales without editorial posts).

### §4 Conversion paths
- `/[locale]/samples` (indexable, ten locales) with the brief's form fields; every "Order Sample Kit" CTA now links there (the modal was deleted).
- Booth price guide: e-mail-gated PDF price list, generated at build from the catalogue snapshot (`scripts/build-price-list-pdf.mjs`, EN/NL/FR/DE, pdfkit) and served by `POST /api/pricelist` after the lead is forwarded.
- `/[locale]/acoustic-calculator`: Sabine RT60 per octave band with the STRETCH portal's finish and room-type tables (imported byte-identical from `stretch_website/src/lib/portal/acoustic-data.ts`; the arithmetic of `acoustic-summary.ts` was ported; the UI was rebuilt in React — the portal's 94 KB HTML tool is not importable), product recommendation from `products.ts` αw, lead form → `/api/lead`.
- GA4 events `lead_quote`, `lead_sample`, `lead_pricelist`, `lead_calculator` with `locale` + `product_range`, consent-gated through the existing Consent Mode v2 defaults and lazy gtag loader; `isHtml: true` added to the contact/lead/pricelist webhook payloads.
- Live Power Automate test: **not run** — the webhook URL exists only in Vercel and nothing was deployed.

### §5 Schema
- Already in place and verified on the build: `price` + `UnitPriceSpecification` in every priced Offer, `hasMerchantReturnPolicy`, `ItemList` on `/products` and the hubs, `BreadcrumbList` on product/hub/blog pages, sitemap `lastmod` from git.
- Rich Results Test: **not reachable** from the sandbox; a local JSON-LD parse of one product, one hub, `/products` and one blog post is in the "Validation" section.

### §6 Performance
- Google reviews are build-time only (`content/google-reviews.json`); the weekly cron now triggers a redeploy through a Vercel Deploy Hook instead of calling the Places API at request time.
- gtag confirmed `lazyOnload` and consent-gated, no preload of the tag manager URL; hero image `sizes` matches the slot, one `priority` image, second hero image lazy; browserslist already modern.

### §7 Manufacturing pages
- `/en/manufacturing`, `/nl/productie`, `/fr/fabrication`, `/de/fertigung`, `/es/fabricacion`, `/pt/fabrico`: H1 with the market word, both plants, per-line origin table from `madeIn`, certifications from the data only, links to hubs/downloads/samples, Organization (parent STRETCH Group) + LocalBusiness ×2 + BreadcrumbList, footer link, sitemap entries.

## Validation (gate build, 12 September 2026)

Sequence run on the final tree (the last build, after the meta-tag trims): `npx --offline tsc --noEmit` (exit 0) → `rm -rf .next && npx --offline next build` (exit 0, no `MISSING_MESSAGE`, no error) → `node scripts/seo-check.mjs http://localhost:3999 --no-build --out docs/seo-check-after.txt` → `node scripts/verify-redirects.mjs --base http://localhost:3999 --host-header` → `node scripts/lighthouse-run.mjs after-sep12 http://localhost:3999 --runs 3`.

### SEO check — before vs after

| | Before (`docs/seo-check-before.txt`) | After (`docs/seo-check-after.txt`) |
|---|---|---|
| Pages crawled | 190 | 184 (the six 2024 placeholder posts left the sitemap; the new samples, calculator and manufacturing pages joined it) |
| Failures | 0 (the claim rules did not exist yet) | 0 |
| Forbidden-string hits (rule h) | 28 on the same pages when the new rule was first run | 0 |
| Spec mismatches (rule h) | 120 when the new rule was first run | 0 |
| Warnings | 44 | 40 (15 titles > 65 and 19 descriptions > 155 chars, mostly the hub pages and the localised guide/calculator descriptions; six single-locale blog pages without hreflang, by design) |
| English text on non-English pages | — | de 0.5 %, es 0.3 %, fr 0.5 %, nl 0.5 %, pt 0.3 % (the /nl and /fr homepages carry two brand-like English segments each) |
| Internal links returning 404 | 0 | 0 of 282 distinct URLs |
| Sitemap | — | 202 URLs (en 30, nl 36, fr 30, de 30, es 29, pt 29, 18 documents), lastmod from git |

### Legacy URL gate — `scripts/verify-redirects.mjs`

| Group | Checks | Pass | Fail |
|---|---|---|---|
| inventory (`legacy/wix-urls.txt`) | 257 | 257 | 0 |
| trailing-slash variants | 109 | 109 | 0 |
| query-string variants | 109 | 109 | 0 |
| www → apex variants (Host header) | 109 | 109 | 0 |
| invented junk paths → closest index / home | 35 | 35 | 0 |
| **Total** | **619** | **619** | **0** |

Production had the same failure before this sprint: Vercel's runtime-error log for the last seven days shows 636 occurrences of `RangeError: Incorrect locale information provided` on the `/[locale]` route (107 visitors, paths such as `/cord.php`, `/Resound_Studio_v2_0010.jpg`, `/disclaimer-en-privacy-beleid%5D.`), i.e. junk and legacy URLs reaching next-intl with a bogus first segment. The middleware and layout changes below remove that class of error.

The first run (before the layout and middleware fixes) failed three unprefixed asset-like junk paths with a 500 (`RangeError: Incorrect locale information provided` — a bogus first segment reached next-intl); the middleware now sends any unprefixed file outside the public prefixes to the home page and the layout validates the locale before `setRequestLocale`.

### Lighthouse — mobile, simulated slow 4G, three runs per page (median-LCP run reported)

| Page | Before: score (3 runs) · LCP · TBT | After: score (3 runs) · LCP · TBT · CLS | Score spread after |
|---|---|---|---|
| /en | 92 (88 / 92 / 92) · 3.26 s · 38 ms | 93 (88 / 95 / 93) · 3.18 s · 17 ms · 0.000 | 7 points |
| /nl | 92 (92 / 92 / 92) · 3.27 s · 44 ms | 93 (95 / 93 / 93) · 3.20 s · 7 ms · 0.000 | 2 points |
| /en/products/solo-flex | 94 (95 / 94 / 94) · 3.03 s · 6 ms | 94 (95 / 94 / 94) · 3.05 s · 28 ms · 0.000 | 1 points |
| /en/products/acoustic-phone-booths | 95 (95 / 96 / 95) · 2.83 s · 11 ms | 95 (95 / 95 / 95) · 2.85 s · 37 ms · 0.000 | 0 points |

Targets: LCP < 2.5 s, TBT < 200 ms, CLS < 0.01, three consecutive runs within 5 points. Score spread across the three runs: /en 7 points, /nl 2 points, /en/products/solo-flex 1 points, /en/products/acoustic-phone-booths 0 points. /en misses the five-point criterion (the hero image LCP swings between runs on the throttled simulation); the other pages are within 0–2 points. Worst median LCP 3.20 s, TBT 7–37 ms, CLS 0 in every run. LCP stays above the 2.5 s target in this simulated slow-4G lab run — the LCP element is the hero image on the two homepages and the intro paragraph on the product and hub pages, so the remaining gap is the throttled network, not a request-time dependency (the Places API call is gone from the render path). TBT and CLS meet the targets. Raw JSON for the median run of each page is in docs/lighthouse/ (force-added; the per-run files are gitignored).

### Structured data (local parse of the built HTML; the Rich Results Test is not reachable from the build environment)

- `/en/products/solo-flex`: Product with Offer {price 4118.75 EUR, InStock, priceValidUntil 2027-12-31, UnitPriceSpecification unitCode C62 "per booth", valueAddedTaxIncluded false}, MerchantReturnPolicy, countryOfOrigin PL; BreadcrumbList (4 items); FAQPage (6).
- `/en/products/interior`: Offer {price 387, unitCode SET "per set"}, countryOfOrigin BE; BreadcrumbList (3); FAQPage (5).
- `/en/products/acoustic-phone-booths`: CollectionPage + ItemList (4), BreadcrumbList (3), FAQPage (14). `/en/products`: ItemList (14).
- `/nl/blog/belcabine-kantoor-prijs-keuze-plaatsing`: BlogPosting {author Person "Michael Nicasens", jobTitle "CEO Stretch Group", worksFor #organization; inLanguage nl; publisher #organization; datePublished 2026-09-06; dateModified 2026-09-12}, FAQPage (4), BreadcrumbList (3); canonical to self, no hreflang, robots index.
- `/en/manufacturing`: Organization (parentOrganization STRETCH Group, location → #plant-be, #plant-pl), LocalBusiness ×2 (Beveren-Waas BE, Częstochowa PL), BreadcrumbList (2); hreflang for en/nl/fr/de/es/pt + x-default.
- `/en/samples`, `/en/acoustic-calculator`: FAQPage (3 each), canonical + hreflang, index.
- The four January-2024 posts: `robots: noindex, follow`, absent from the sitemap.

### Live form test

Not run: the Power Automate webhook URL exists only in the Vercel project and this sprint was not deployed. Verified instead: `/api/pricelist` answers 405 to GET, 400 to an invalid e-mail, and returns a 38 KB `application/pdf` (honeypot request → PDF served, lead not forwarded); the four payloads (`/api/contact`, `/api/lead`, `/api/pricelist`, the calculator via `/api/lead`) send HTML in `body`, plain text in `text` and `isHtml: true`, recipient `leads@stretchgroup.be` hardcoded in the lead routes. One test per form is item A.4 of `docs/needs-michael.md`.

## Blog posts and prices

### Posts that went live or changed (all `/nl/blog/…`, single-locale)

| Post | What changed on 12 September |
|---|---|
| `belcabine-kantoor-prijs-keuze-plaatsing` (BP-001) | Rebuilt: opens on Solo ECO from the catalogue price as the entry model, Solo Flex as the mid-tier (sit-stand desk, 4.6 m³/min, 24 dB(A) ISO 23351-1 class C stated plainly), a named nine-competitor table (September 2026), Duo and Modular XL (+ element price) from the catalogue, installation quoted separately (about 60 minutes by our installers, two people < 3 h for Solo Flex), no leasing mention, "gebouwd in onze eigen fabriek in Częstochowa", Solo ECO and Duo marked "nog geen ISO 23351-1-meting gepubliceerd", four FAQ entries mirrored in FAQPage JSON-LD, Solo ECO photo as hero. |
| `akoestiek-open-kantoor-verbeteren` (BP-002) | rPET Groove quoted by NRC per thickness instead of αw 0.85; rWood Groove/Micro αw 0.90; Solo ECO added next to Solo Flex in the booth section with the Częstochowa plant. |
| `pet-vilt-of-houten-akoestische-panelen` (BP-003) | Comparison table rebuilt from the data (rWood Groove/Micro αw 0.90 class A, rPET Groove NRC 0.55/0.75/0.90, fire class per model incl. rPET Panel B-s2,d0 and rWood Panel FR/standard core); "rPET Groove 100 %" and "rWood Groove 60 %" removed; decision table and FAQ aligned; veneer count eight. |
| `hoeveel-akoestische-panelen-nodig` (BP-004) | Worked examples recomputed with Solid (αw 1.0) and rWood Groove (0.90) instead of an rPET Groove αw the data does not hold; FAQ answer aligned. |
| `nagalmtijd-klaslokaal-normen` (BP-005) | Classroom example uses rWood Groove 0.90; rPET Groove quoted by NRC; fire classes per model. |
| `akoestische-panelen-restaurant` (BP-006) | rWood Groove 0.90, rPET Groove by NRC, fire classes per model, example recomputed (38.7 m² sabine). |
| The four January-2024 placeholders | `noindex, follow`, out of the sitemap, off the Dutch index; still listed on the other locales' index because they have no published post yet. |

All six posts carry `dateModified: 2026-09-12`; the `datePublished` of 6 September is unchanged. The FR/DE/EN drafts (BP-007 to BP-018) stay in "Review".

### Prices

No price changed in this sprint. Every price on the site, in the blog posts (`{{price:…}}` tokens) and in the new PDF comes from the catalogue in the database (snapshot `src/data/catalogue.snapshot.json`, 2026 list valid from 21 September 2026): Solo ECO € 2 740, Solo Flex € 4 118,75, Duo € 7 612,50, Modular XL € 13 781,25 base and € 5 118,75 / € 10 237,50 / € 15 356,25 for one, two, three elements, Interior € 387 per set, Solid € 407 per panel (website line, unconfirmed), all excl. VAT, transport and installation. Competitor prices quoted in BP-001 are the September-2026 figures from the brief.

## Translation

Three rounds, nine locales each, translators plus native reviewers for nl/fr/de/es/pt on the two large rounds: round 1 the ~140 keys changed by the accuracy pass, round 2 the ~200 new keys of the samples, calculator, price-list gate and manufacturing pages (plus 270 Spanish leaks repaired in `pt.json`), round 3 the six rewritten fire-class FAQ answers and the last stale αw / "Class A" strings. Icelandic is flagged for a native check (translator notes in the workflow output).

## Not done / done differently

- Live Power Automate test and GA4 key-event marking: not possible from the build environment (see Validation and `docs/needs-michael.md` A.3–A.4).
- Rich Results Test: not reachable; local JSON-LD parse instead.
- The calculator's explanation, FAQ and lead form are rendered inside a client island (the page copy is still server-rendered and indexable); the rest of the new pages are server components.
- The four 2024 placeholder posts were not rewritten (the brief allowed noindex + removal from index and sitemap); they remain on the non-Dutch blog indexes so those pages are not empty.
- Competitor names were reinstated in BP-001 as the brief instructs, reversing the 6 September answer — flagged in `docs/needs-michael.md` A.1.
- The nine locale files are single files, so all three translation rounds landed with the §1 commit (the planned separate i18n commit for round 2 had nothing left to add).
- Intermediate commits are grouped by section and share a few files (the layout, `BoothPriceGuide.tsx`, `sitemap.ts`, `package.json`); only the final tree was gate-checked. `messages/en.json` is split by namespace across the section commits so each commit carries its own English copy.
- `scripts/pdf/fonts` adds Liberation Sans (SIL OFL, 828 KB) so the PDF can print "Częstochowa"; `src/data/generated/booth-price-list.json` (208 KB, four base64 PDFs) is committed and regenerated by `prebuild` on every build.

## Redirect map (`redirects.mjs`, 194 rules, in evaluation order)

Sources are next.config path patterns; `:locale` matches the ten locale prefixes; every rule is permanent (308). The prefix catch-alls at the end only catch what the explicit rules above them did not. Everything nothing maps falls to the middleware (closest live index or locale home).

| # | Source | Destination | Status | Note |
|---|---|---|---|---|
| 1 | `/:path*` | `https://re-sound.be/:path*` | 308 | host=www.re-sound.be |
| 2 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/interior` | `/:locale/products/interior` | 308 |  |
| 3 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-interior` | `/:locale/products/interior` | 308 |  |
| 4 | `/product-page/interior` | `/en/products/interior` | 308 |  |
| 5 | `/product-page/copy-of-interior` | `/en/products/interior` | 308 |  |
| 6 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/re-sound-interior` | `/:locale/products/interior` | 308 |  |
| 7 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-re-sound-interior` | `/:locale/products/interior` | 308 |  |
| 8 | `/product-page/re-sound-interior` | `/en/products/interior` | 308 |  |
| 9 | `/product-page/copy-of-re-sound-interior` | `/en/products/interior` | 308 |  |
| 10 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/solid` | `/:locale/products/solid` | 308 |  |
| 11 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-solid` | `/:locale/products/solid` | 308 |  |
| 12 | `/product-page/solid` | `/en/products/solid` | 308 |  |
| 13 | `/product-page/copy-of-solid` | `/en/products/solid` | 308 |  |
| 14 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/re-sound-solid` | `/:locale/products/solid` | 308 |  |
| 15 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-re-sound-solid` | `/:locale/products/solid` | 308 |  |
| 16 | `/product-page/re-sound-solid` | `/en/products/solid` | 308 |  |
| 17 | `/product-page/copy-of-re-sound-solid` | `/en/products/solid` | 308 |  |
| 18 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/divide` | `/:locale/products/divide` | 308 |  |
| 19 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-divide` | `/:locale/products/divide` | 308 |  |
| 20 | `/product-page/divide` | `/en/products/divide` | 308 |  |
| 21 | `/product-page/copy-of-divide` | `/en/products/divide` | 308 |  |
| 22 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/re-sound-divide` | `/:locale/products/divide` | 308 |  |
| 23 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-re-sound-divide` | `/:locale/products/divide` | 308 |  |
| 24 | `/product-page/re-sound-divide` | `/en/products/divide` | 308 |  |
| 25 | `/product-page/copy-of-re-sound-divide` | `/en/products/divide` | 308 |  |
| 26 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rwood-groove` | `/:locale/products/rwood-groove` | 308 |  |
| 27 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rwood-groove` | `/:locale/products/rwood-groove` | 308 |  |
| 28 | `/product-page/rwood-groove` | `/en/products/rwood-groove` | 308 |  |
| 29 | `/product-page/copy-of-rwood-groove` | `/en/products/rwood-groove` | 308 |  |
| 30 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rwood-micro` | `/:locale/products/rwood-micro` | 308 |  |
| 31 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rwood-micro` | `/:locale/products/rwood-micro` | 308 |  |
| 32 | `/product-page/rwood-micro` | `/en/products/rwood-micro` | 308 |  |
| 33 | `/product-page/copy-of-rwood-micro` | `/en/products/rwood-micro` | 308 |  |
| 34 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rwood-perf` | `/:locale/products/rwood-perf` | 308 |  |
| 35 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rwood-perf` | `/:locale/products/rwood-perf` | 308 |  |
| 36 | `/product-page/rwood-perf` | `/en/products/rwood-perf` | 308 |  |
| 37 | `/product-page/copy-of-rwood-perf` | `/en/products/rwood-perf` | 308 |  |
| 38 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rwood-veneer` | `/:locale/products/rwood-veneer` | 308 |  |
| 39 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rwood-veneer` | `/:locale/products/rwood-veneer` | 308 |  |
| 40 | `/product-page/rwood-veneer` | `/en/products/rwood-veneer` | 308 |  |
| 41 | `/product-page/copy-of-rwood-veneer` | `/en/products/rwood-veneer` | 308 |  |
| 42 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rwood-panel` | `/:locale/products/rwood-veneer` | 308 |  |
| 43 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rwood-panel` | `/:locale/products/rwood-veneer` | 308 |  |
| 44 | `/product-page/rwood-panel` | `/en/products/rwood-veneer` | 308 |  |
| 45 | `/product-page/copy-of-rwood-panel` | `/en/products/rwood-veneer` | 308 |  |
| 46 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rpet-panel` | `/:locale/products/rpet-panel` | 308 |  |
| 47 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rpet-panel` | `/:locale/products/rpet-panel` | 308 |  |
| 48 | `/product-page/rpet-panel` | `/en/products/rpet-panel` | 308 |  |
| 49 | `/product-page/copy-of-rpet-panel` | `/en/products/rpet-panel` | 308 |  |
| 50 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rpet-groove` | `/:locale/products/rpet-groove` | 308 |  |
| 51 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rpet-groove` | `/:locale/products/rpet-groove` | 308 |  |
| 52 | `/product-page/rpet-groove` | `/en/products/rpet-groove` | 308 |  |
| 53 | `/product-page/copy-of-rpet-groove` | `/en/products/rpet-groove` | 308 |  |
| 54 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rpet-flex-groove` | `/:locale/products/rpet-flex-groove` | 308 |  |
| 55 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rpet-flex-groove` | `/:locale/products/rpet-flex-groove` | 308 |  |
| 56 | `/product-page/rpet-flex-groove` | `/en/products/rpet-flex-groove` | 308 |  |
| 57 | `/product-page/copy-of-rpet-flex-groove` | `/en/products/rpet-flex-groove` | 308 |  |
| 58 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/rpet-flex` | `/:locale/products/rpet-flex-groove` | 308 |  |
| 59 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-rpet-flex` | `/:locale/products/rpet-flex-groove` | 308 |  |
| 60 | `/product-page/rpet-flex` | `/en/products/rpet-flex-groove` | 308 |  |
| 61 | `/product-page/copy-of-rpet-flex` | `/en/products/rpet-flex-groove` | 308 |  |
| 62 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/solo-eco` | `/:locale/products/solo-eco` | 308 |  |
| 63 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-solo-eco` | `/:locale/products/solo-eco` | 308 |  |
| 64 | `/product-page/solo-eco` | `/en/products/solo-eco` | 308 |  |
| 65 | `/product-page/copy-of-solo-eco` | `/en/products/solo-eco` | 308 |  |
| 66 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/solo-flex` | `/:locale/products/solo-flex` | 308 |  |
| 67 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-solo-flex` | `/:locale/products/solo-flex` | 308 |  |
| 68 | `/product-page/solo-flex` | `/en/products/solo-flex` | 308 |  |
| 69 | `/product-page/copy-of-solo-flex` | `/en/products/solo-flex` | 308 |  |
| 70 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/solo` | `/:locale/products/solo-flex` | 308 |  |
| 71 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-solo` | `/:locale/products/solo-flex` | 308 |  |
| 72 | `/product-page/solo` | `/en/products/solo-flex` | 308 |  |
| 73 | `/product-page/copy-of-solo` | `/en/products/solo-flex` | 308 |  |
| 74 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/duo` | `/:locale/products/duo` | 308 |  |
| 75 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-duo` | `/:locale/products/duo` | 308 |  |
| 76 | `/product-page/duo` | `/en/products/duo` | 308 |  |
| 77 | `/product-page/copy-of-duo` | `/en/products/duo` | 308 |  |
| 78 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/modular-xl` | `/:locale/products/modular-xl` | 308 |  |
| 79 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-modular-xl` | `/:locale/products/modular-xl` | 308 |  |
| 80 | `/product-page/modular-xl` | `/en/products/modular-xl` | 308 |  |
| 81 | `/product-page/copy-of-modular-xl` | `/en/products/modular-xl` | 308 |  |
| 82 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/modular` | `/:locale/products/modular-xl` | 308 |  |
| 83 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/copy-of-modular` | `/:locale/products/modular-xl` | 308 |  |
| 84 | `/product-page/modular` | `/en/products/modular-xl` | 308 |  |
| 85 | `/product-page/copy-of-modular` | `/en/products/modular-xl` | 308 |  |
| 86 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/akoestische-scheidingspanelen` | `/:locale/products/divide` | 308 |  |
| 87 | `/akoestische-scheidingspanelen` | `/nl/products/divide` | 308 |  |
| 88 | `/copy-of-akoestische-scheidingspanelen` | `/nl/products/divide` | 308 |  |
| 89 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/akoestische-wandpanelen` | `/:locale/products/interior` | 308 |  |
| 90 | `/akoestische-wandpanelen` | `/nl/products/interior` | 308 |  |
| 91 | `/copy-of-akoestische-wandpanelen` | `/nl/products/interior` | 308 |  |
| 92 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/akoestische-panelen` | `/:locale/products` | 308 |  |
| 93 | `/akoestische-panelen` | `/nl/products` | 308 |  |
| 94 | `/copy-of-akoestische-panelen` | `/nl/products` | 308 |  |
| 95 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/houten-akoestische-panelen` | `/:locale/products/wood-acoustic-panels` | 308 |  |
| 96 | `/houten-akoestische-panelen` | `/nl/products/wood-acoustic-panels` | 308 |  |
| 97 | `/copy-of-houten-akoestische-panelen` | `/nl/products/wood-acoustic-panels` | 308 |  |
| 98 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/pet-akoestische-panelen` | `/:locale/products/pet-acoustic-panels` | 308 |  |
| 99 | `/pet-akoestische-panelen` | `/nl/products/pet-acoustic-panels` | 308 |  |
| 100 | `/copy-of-pet-akoestische-panelen` | `/nl/products/pet-acoustic-panels` | 308 |  |
| 101 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/akoestische-belcabines` | `/:locale/products/acoustic-phone-booths` | 308 |  |
| 102 | `/akoestische-belcabines` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 103 | `/copy-of-akoestische-belcabines` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 104 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/belcabines` | `/:locale/products/acoustic-phone-booths` | 308 |  |
| 105 | `/belcabines` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 106 | `/copy-of-belcabines` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 107 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/telefooncellen` | `/:locale/products/acoustic-phone-booths` | 308 |  |
| 108 | `/telefooncellen` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 109 | `/copy-of-telefooncellen` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 110 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/vergaderpods` | `/:locale/products/acoustic-phone-booths` | 308 |  |
| 111 | `/vergaderpods` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 112 | `/copy-of-vergaderpods` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 113 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/over-ons` | `/:locale/about` | 308 |  |
| 114 | `/over-ons` | `/nl/about` | 308 |  |
| 115 | `/copy-of-over-ons` | `/nl/about` | 308 |  |
| 116 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/duurzaamheid` | `/:locale/sustainability` | 308 |  |
| 117 | `/duurzaamheid` | `/nl/sustainability` | 308 |  |
| 118 | `/copy-of-duurzaamheid` | `/nl/sustainability` | 308 |  |
| 119 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/circulair` | `/:locale/sustainability` | 308 |  |
| 120 | `/circulair` | `/nl/sustainability` | 308 |  |
| 121 | `/copy-of-circulair` | `/nl/sustainability` | 308 |  |
| 122 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/producten` | `/:locale/products` | 308 |  |
| 123 | `/producten` | `/nl/products` | 308 |  |
| 124 | `/copy-of-producten` | `/nl/products` | 308 |  |
| 125 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/downloads` | `/:locale/products` | 308 |  |
| 126 | `/downloads` | `/nl/products` | 308 |  |
| 127 | `/copy-of-downloads` | `/nl/products` | 308 |  |
| 128 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/projecten` | `/:locale/products` | 308 |  |
| 129 | `/projecten` | `/nl/products` | 308 |  |
| 130 | `/copy-of-projecten` | `/nl/products` | 308 |  |
| 131 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/realisaties` | `/:locale/products` | 308 |  |
| 132 | `/realisaties` | `/nl/products` | 308 |  |
| 133 | `/copy-of-realisaties` | `/nl/products` | 308 |  |
| 134 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/verkooppunten` | `/:locale/where-to-buy` | 308 |  |
| 135 | `/verkooppunten` | `/nl/where-to-buy` | 308 |  |
| 136 | `/copy-of-verkooppunten` | `/nl/where-to-buy` | 308 |  |
| 137 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/dealers` | `/:locale/where-to-buy` | 308 |  |
| 138 | `/dealers` | `/nl/where-to-buy` | 308 |  |
| 139 | `/copy-of-dealers` | `/nl/where-to-buy` | 308 |  |
| 140 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/showroom` | `/:locale/where-to-buy` | 308 |  |
| 141 | `/showroom` | `/nl/where-to-buy` | 308 |  |
| 142 | `/copy-of-showroom` | `/nl/where-to-buy` | 308 |  |
| 143 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/veelgestelde-vragen` | `/:locale/faq` | 308 |  |
| 144 | `/veelgestelde-vragen` | `/nl/faq` | 308 |  |
| 145 | `/copy-of-veelgestelde-vragen` | `/nl/faq` | 308 |  |
| 146 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/nieuws` | `/:locale/blog` | 308 |  |
| 147 | `/nieuws` | `/nl/blog` | 308 |  |
| 148 | `/copy-of-nieuws` | `/nl/blog` | 308 |  |
| 149 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/acoustic-panels` | `/:locale/products` | 308 |  |
| 150 | `/acoustic-panels` | `/nl/products` | 308 |  |
| 151 | `/copy-of-acoustic-panels` | `/nl/products` | 308 |  |
| 152 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/acoustic-dividers` | `/:locale/products/divide` | 308 |  |
| 153 | `/acoustic-dividers` | `/nl/products/divide` | 308 |  |
| 154 | `/copy-of-acoustic-dividers` | `/nl/products/divide` | 308 |  |
| 155 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/room-dividers` | `/:locale/products/divide` | 308 |  |
| 156 | `/room-dividers` | `/nl/products/divide` | 308 |  |
| 157 | `/copy-of-room-dividers` | `/nl/products/divide` | 308 |  |
| 158 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/acoustic-wall-panels` | `/:locale/products/interior` | 308 |  |
| 159 | `/acoustic-wall-panels` | `/nl/products/interior` | 308 |  |
| 160 | `/copy-of-acoustic-wall-panels` | `/nl/products/interior` | 308 |  |
| 161 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/phone-booths` | `/:locale/products/acoustic-phone-booths` | 308 |  |
| 162 | `/phone-booths` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 163 | `/copy-of-phone-booths` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 164 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/office-pods` | `/:locale/products/acoustic-phone-booths` | 308 |  |
| 165 | `/office-pods` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 166 | `/copy-of-office-pods` | `/nl/products/acoustic-phone-booths` | 308 |  |
| 167 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/about-us` | `/:locale/about` | 308 |  |
| 168 | `/about-us` | `/nl/about` | 308 |  |
| 169 | `/copy-of-about-us` | `/nl/about` | 308 |  |
| 170 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/about-1` | `/:locale/about` | 308 |  |
| 171 | `/about-1` | `/nl/about` | 308 |  |
| 172 | `/copy-of-about-1` | `/nl/about` | 308 |  |
| 173 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/contact-1` | `/:locale/contact` | 308 |  |
| 174 | `/contact-1` | `/nl/contact` | 308 |  |
| 175 | `/copy-of-contact-1` | `/nl/contact` | 308 |  |
| 176 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/shop` | `/:locale/products` | 308 |  |
| 177 | `/shop` | `/nl/products` | 308 |  |
| 178 | `/copy-of-shop` | `/nl/products` | 308 |  |
| 179 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/news` | `/:locale/blog` | 308 |  |
| 180 | `/news` | `/nl/blog` | 308 |  |
| 181 | `/copy-of-news` | `/nl/blog` | 308 |  |
| 182 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/blog-1` | `/:locale/blog` | 308 |  |
| 183 | `/blog-1` | `/nl/blog` | 308 |  |
| 184 | `/copy-of-blog-1` | `/nl/blog` | 308 |  |
| 185 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/:path*` | `/:locale/products` | 308 |  |
| 186 | `/product-page/:path*` | `/en/products` | 308 |  |
| 187 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/post/:path*` | `/:locale/blog` | 308 |  |
| 188 | `/post/:path*` | `/nl/blog` | 308 |  |
| 189 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/blog-1/:path*` | `/:locale/blog` | 308 |  |
| 190 | `/blog-1/:path*` | `/nl/blog` | 308 |  |
| 191 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/copy-of-:path*` | `/:locale` | 308 |  |
| 192 | `/copy-of-:path*` | `/nl` | 308 |  |
| 193 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/shop/:path*` | `/:locale/products` | 308 |  |
| 194 | `/shop/:path*` | `/en/products` | 308 |  |
