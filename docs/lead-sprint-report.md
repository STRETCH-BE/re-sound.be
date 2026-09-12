# Lead sprint report — 12 September 2026

Branch `seo/lead-sprint-sep12`, one commit per section, plus a `fix:` commit
from the pre-production review. On Michael's instruction the branch was then
fast-forwarded into `main` (`6a9099f` → `a41f6d2`) and Vercel deployed it to
production at 14:23 UTC on 12 September (see "Production deployment" at the
end). Every number below comes from a local production build
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
- `legacy/wix-urls.txt` (257 URLs with provenance), `redirects.mjs` (266 rules: www→apex host rule, explicit map with per-locale hub slugs, prefix catch-alls), Layer-4 middleware (unknown path → closest live index or locale home), `[locale]` catch-all and `/api/legacy-fallback` for asset-like misses, unknown blog slugs → blog index (middleware, generated slug list), `scripts/verify-redirects.mjs` + `verify-redirects-build.mjs`, `docs/legacy-urls.md` (canonical host + DNS).

### §3 Dutch blog posts
- BP-001 rebuilt around Solo ECO from € 2 740 as the entry model, Solo Flex at € 4 118,75 as the mid-tier, a named market table of nine competitors (September 2026), installation quoted separately (about 60 minutes by our installers), no leasing mention, Częstochowa named as the plant; four FAQ entries mirrored in FAQPage JSON-LD.
- All six posts swept: rWood Groove/Micro αw 0.90 (was 0.85), rPET Groove now quoted by NRC per thickness (no αw in the data), fire classes per model (rPET Panel B-s2,d0; the rest B-s1,d0), "rPET Groove 100 %" and "rWood Groove 60 %" removed, worked examples recomputed, Solo ECO added to BP-002, `dateModified` 2026-09-12.
- The four January-2024 posts: `noindex, follow`, out of the sitemap, off the Dutch index (kept on locales without editorial posts).

### §4 Conversion paths
- `/[locale]/samples` (indexable, ten locales) with the brief's form fields; every "Order Sample Kit" CTA now links there (the modal was deleted).
- Booth price guide: e-mail-gated PDF price list, generated at build from the catalogue snapshot (`scripts/build-price-list-pdf.mjs`, EN/NL/FR/DE, pdfkit) and served by `POST /api/pricelist` after the lead is forwarded.
- `/[locale]/acoustic-calculator`: Sabine RT60 per octave band with the STRETCH portal's finish and room-type tables (imported byte-identical from `stretch_website/src/lib/portal/acoustic-data.ts`; the arithmetic of `acoustic-summary.ts` was ported; the UI was rebuilt in React — the portal's 94 KB HTML tool is not importable), product recommendation from `products.ts` αw, lead form → `/api/lead`.
- GA4 events `lead_quote`, `lead_sample`, `lead_pricelist`, `lead_calculator` with `locale` + `product_range`, consent-gated through the existing Consent Mode v2 defaults and lazy gtag loader; `isHtml: true` added to the contact/lead/pricelist webhook payloads.
- Live Power Automate test: **not run from the build environment** — the webhook URL exists only in Vercel; now that the sprint is live, one test per form is item A.4 of `docs/needs-michael.md`.

### §5 Schema
- Already in place and verified on the build: `price` + `UnitPriceSpecification` in every priced Offer, `hasMerchantReturnPolicy`, `ItemList` on `/products` and the hubs, `BreadcrumbList` on product/hub/blog pages, sitemap `lastmod` from git.
- Rich Results Test: **not reachable** from the sandbox; a local JSON-LD parse of one product, one hub, `/products` and one blog post is in the "Validation" section.

### §6 Performance
- Google reviews are build-time only (`content/google-reviews.json`); the weekly cron now triggers a redeploy through a Vercel Deploy Hook instead of calling the Places API at request time.
- gtag confirmed `lazyOnload` and consent-gated, no preload of the tag manager URL; hero image `sizes` matches the slot, one `priority` image, second hero image lazy; browserslist already modern.

### §7 Manufacturing pages
- `/en/manufacturing`, `/nl/productie`, `/fr/fabrication`, `/de/fertigung`, `/es/fabricacion`, `/pt/fabrico`: H1 with the market word, both plants, per-line origin table from `madeIn`, certifications from the data only, links to hubs/downloads/samples, Organization (parent STRETCH Group) + LocalBusiness ×2 + BreadcrumbList, footer link, sitemap entries.

## Validation (gate build and fix build, 12 September 2026)

Sequence run twice: on the gate build (the tree at the end of §8) and again on the fix build (after the pre-production review, the tree that went to production). Both: `npx --offline tsc --noEmit` (exit 0) → `rm -rf .next && npx --offline next build` (exit 0, no `MISSING_MESSAGE`, no error) → `node scripts/seo-check.mjs http://localhost:3999 --no-build --out docs/seo-check-after.txt` → `node scripts/verify-redirects.mjs --base http://localhost:3999 --host-header` → `node scripts/lighthouse-run.mjs after-sep12 http://localhost:3999 --runs 3`.

### SEO check — before vs after

| | Before (`docs/seo-check-before.txt`) | After (`docs/seo-check-after.txt`) |
|---|---|---|
| Pages crawled | 190 | 184 (the six 2024 placeholder posts left the sitemap; the new samples, calculator and manufacturing pages joined it) |
| Failures | 0 (the claim rules did not exist yet) | 0 |
| Forbidden-string hits (rule h) | 28 on the same pages when the new rule was first run | 0 |
| Spec mismatches (rule h) | 120 when the new rule was first run | 0 |
| Warnings | 44 | 40 (15 titles > 65 and 19 descriptions > 155 chars, mostly the hub pages and the localised guide/calculator descriptions; six single-locale blog pages without hreflang, by design) |
| English text on non-English pages | — | de 0.4 %, es 0.3 %, fr 0.4 %, nl 0.5 %, pt 0.3 % on the fix build (the /nl and /fr homepages carry two brand-like English segments each) |
| Internal links returning 404 | 0 | 0 of 282 distinct URLs |
| Fix build (after the review) | — | 184 pages, 0 failures, 0 forbidden strings, 0 spec mismatches, 40 warnings — `docs/seo-check-after.txt` is this run |
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

Re-run unchanged on the fix build: 619 / 619 (the blog-slug redirect, the exact public-file allow-list and the per-locale hub rules are covered by the inventory and junk groups).

The first run (before the layout and middleware fixes) failed three unprefixed asset-like junk paths with a 500 (`RangeError: Incorrect locale information provided` — a bogus first segment reached next-intl); the middleware now sends any unprefixed file outside the public prefixes to the home page and the layout validates the locale before `setRequestLocale`.

### Lighthouse — mobile, simulated slow 4G, three runs per page (median-LCP run reported)

| Page | Before: score (3 runs) · LCP · TBT | After: score (3 runs) · LCP · TBT · CLS | Score spread after |
|---|---|---|---|
| /en | 92 (88 / 92 / 92) · 3.26 s · 38 ms | 93 (88 / 95 / 93) · 3.18 s · 17 ms · 0.000 | 7 points |
| /nl | 92 (92 / 92 / 92) · 3.27 s · 44 ms | 93 (95 / 93 / 93) · 3.20 s · 7 ms · 0.000 | 2 points |
| /en/products/solo-flex | 94 (95 / 94 / 94) · 3.03 s · 6 ms | 94 (95 / 94 / 94) · 3.05 s · 28 ms · 0.000 | 1 points |
| /en/products/acoustic-phone-booths | 95 (95 / 96 / 95) · 2.83 s · 11 ms | 95 (95 / 95 / 95) · 2.85 s · 37 ms · 0.000 | 0 points |

Targets: LCP < 2.5 s, TBT < 200 ms, CLS < 0.01, three consecutive runs within 5 points. Score spread across the three runs: /en 7 points, /nl 2 points, /en/products/solo-flex 1 points, /en/products/acoustic-phone-booths 0 points. /en misses the five-point criterion (the hero image LCP swings between runs on the throttled simulation); the other pages are within 0–2 points. Worst median LCP 3.20 s, TBT 7–37 ms, CLS 0 in every run. LCP stays above the 2.5 s target in this simulated slow-4G lab run — the LCP element is the hero image on the two homepages and the intro paragraph on the product and hub pages, so the remaining gap is the throttled network, not a request-time dependency (the Places API call is gone from the render path). TBT and CLS meet the targets. Raw JSON for the median run of each page is in docs/lighthouse/ (force-added; the per-run files are gitignored). Measured on the gate build; the review fixes add one footer link and change middleware, API and message strings only, so the fix build was not re-measured.

### Structured data (local parse of the built HTML; the Rich Results Test is not reachable from the build environment)

- `/en/products/solo-flex`: Product with Offer {price 4118.75 EUR, InStock, priceValidUntil 2027-12-31, UnitPriceSpecification unitCode C62 "per booth", valueAddedTaxIncluded false}, MerchantReturnPolicy, countryOfOrigin PL; BreadcrumbList (4 items); FAQPage (6).
- `/en/products/interior`: Offer {price 387, unitCode SET "per set"}, countryOfOrigin BE; BreadcrumbList (3); FAQPage (5).
- `/en/products/acoustic-phone-booths`: CollectionPage + ItemList (4), BreadcrumbList (3), FAQPage (14). `/en/products`: ItemList (14).
- `/nl/blog/belcabine-kantoor-prijs-keuze-plaatsing`: BlogPosting {author Person "Michael Nicasens", jobTitle "CEO Stretch Group", worksFor #organization; inLanguage nl; publisher #organization; datePublished 2026-09-06; dateModified 2026-09-12}, FAQPage (4), BreadcrumbList (3); canonical to self, no hreflang, robots index.
- `/en/manufacturing`: Organization (parentOrganization STRETCH Group, location → #plant-be, #plant-pl), LocalBusiness ×2 (Beveren-Waas BE, Częstochowa PL), BreadcrumbList (2); hreflang for en/nl/fr/de/es/pt + x-default.
- `/en/samples`, `/en/acoustic-calculator`: FAQPage (3 each), canonical + hreflang, index.
- The four January-2024 posts: `robots: noindex, follow`, absent from the sitemap.

### Live form test

Not run from the build environment: the Power Automate webhook URL exists only in the Vercel project (the build sandbox cannot reach it). Verified instead: `/api/pricelist` answers 405 to GET, 400 to an invalid e-mail, and returns a 38 KB `application/pdf` (honeypot request → PDF served, lead not forwarded); the four payloads (`/api/contact`, `/api/lead`, `/api/pricelist`, the calculator via `/api/lead`) send HTML in `body`, plain text in `text` and `isHtml: true`, recipient `leads@stretchgroup.be` hardcoded in the lead routes. One test per form is item A.4 of `docs/needs-michael.md`.

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
- Intermediate commits are grouped by section and share a few files (the layout, `BoothPriceGuide.tsx`, `sitemap.ts`, `package.json`); only the final tree was gate-checked. `messages/en.json` is split by namespace across the section commits so each commit carries its own English copy.
- `scripts/pdf/fonts` adds Liberation Sans (SIL OFL, 828 KB) so the PDF can print "Częstochowa"; `src/data/generated/booth-price-list.json` (208 KB, four base64 PDFs) is committed and regenerated by `prebuild` on every build.

## Pre-production review (before the push to main)

A second pass on the final tree — three review lenses (routing/edge, API and data, i18n/content), every finding adversarially verified — returned 16 items, none blocking. All are fixed in the `fix:` commit that closes the sprint and were re-gated (see the fix-build rows in Validation):

- **Unknown blog slugs.** The middleware now answers a 301 to the locale's blog index from a generated per-locale slug list (`scripts/build-blog-slugs.mjs` → `src/data/generated/blog-slugs.json`, in `prebuild` and before `dev`). The page's `permanentRedirect` stays as a fallback; it is no longer the first line, because a redirect thrown during on-demand static generation is cached without its `Location` header, and opting out of the cache there is a 500.
- **Unprefixed asset-like misses.** The public-file allow-list matches files exactly and folders by prefix, so `/sitemap_index.xml` or `/wp-login.php` no longer prefix-match a real file and reach the `[locale]` tree with a bogus locale; they 301 to `/`.
- **English spec phrases on non-English pages.** "up to …", "(per pattern)" and "(base)" in the booth spec tables are message keys now (`productPage.specs.upTo`, `perPattern`, `baseUnit`) in all ten locales; the values themselves are unchanged.
- **Legacy hub URLs.** `/pet-akoestische-panelen`, `/houten-akoestische-panelen`, `/belcabines` and their locale-prefixed forms redirect straight to the localised hub slug (per-locale rules; 266 rules in total) instead of through an extra 307 hop on the English slug.
- **hreflang Link header.** next-intl's `alternateLinks` is off: it advertised every locale for pages that exist in some locales only (guide, manufacturing). The `<head>` alternates from `generateMetadata` are the only hreflang source.
- **API hardening.** `/api/lead` and `/api/pricelist` require a same-origin `Origin` (403 otherwise) and are rate-limited per instance (12 requests a minute per client, 429); a malformed JSON body is a 400 instead of a 500; the price-list gate only fires `lead_pricelist` when the lead was actually forwarded (`X-Lead-Forwarded` response header); `/api/legacy-fallback` sanitises the echoed path header; the reviews cron validates the deploy-hook URL and no longer echoes it in its error.
- **Calculator discoverability.** Linked from the footer in every locale and from BP-004; it was an orphan page.
- **Language switcher.** On the guide and manufacturing pages it goes to the target locale's home when that locale has no such page (browser-tested for da/es/fr/de/is targets); previously a 404-class miss for the Nordic and Iberian locales.
- **Smaller.** Testimonial ratings formatted per locale; the generated price-list JSON is deterministic (`generatedAt` = catalogue snapshot time), so a rebuild no longer produces a spurious diff in the committed file.

## Production deployment (12 September 2026, 14:23 UTC)

`main` was fast-forwarded from `6a9099f` to `a41f6d2` (ten commits) and pushed; Vercel built deployment `dpl_DjMiRf7zRejnDznE59VHM5kvoVz2` from it in 55 s (prebuild: reviews, catalogue snapshot, price-list PDF, blog slugs; no `MISSING_MESSAGE`, no error) and aliased it to re-sound.be and www.re-sound.be. Checked on the live site straight after:

| Request | Result |
|---|---|
| `/nl/productie` | 200, H1 "Fabrikant van akoestische panelen en belcabines: onze twee fabrieken", canonical `/nl/productie`, 7 hreflang links, Częstochowa named |
| `/en/product-page/solid` (legacy Wix URL) | lands on `/en/products/solid`, 200 |
| `/en/blog/unknown-slug-xyz` | lands on `/en/blog`, 200 (the middleware redirect) |
| `/en/samples` | 200, form present, `index, follow`, 7 hreflang |
| `/en/acoustic-calculator` | 200, FAQPage JSON-LD, linked from the footer |
| `/nl/products/solo-eco` | 200, "tot 4 m³/min" ×7 and no English spec phrase, Offer price 2740, countryOfOrigin PL, no "Made in Belgium" |
| `/api/health/catalogue` | first (cold) call served from the snapshot, second call `source: database`; 10 products, 186 articles, list `booths-2026` valid from 21 September |

Runtime errors before the deploy (Vercel, last 7 days): one group, `RangeError: Incorrect locale information provided` on `/[locale]`, 112 occurrences for 24 users, the last at 14:04 UTC, triggered by requests such as `/en_us-sitemap.xml` and `/sitemap-index.xml` — exactly the class the exact public-file allow-list and the layout's locale validation remove. No occurrence on the new deployment at the time of writing; worth re-checking after a day of traffic.

## Redirect map (`redirects.mjs`, 266 rules, in evaluation order)

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
| 95 | `/en/houten-akoestische-panelen` | `/en/products/wood-acoustic-panels` | 308 |  |
| 96 | `/nl/houten-akoestische-panelen` | `/nl/products/houten-akoestische-panelen` | 308 |  |
| 97 | `/fr/houten-akoestische-panelen` | `/fr/products/panneaux-acoustiques-bois` | 308 |  |
| 98 | `/de/houten-akoestische-panelen` | `/de/products/holz-akustikpaneele` | 308 |  |
| 99 | `/es/houten-akoestische-panelen` | `/es/products/wood-acoustic-panels` | 308 |  |
| 100 | `/pt/houten-akoestische-panelen` | `/pt/products/wood-acoustic-panels` | 308 |  |
| 101 | `/da/houten-akoestische-panelen` | `/da/products/wood-acoustic-panels` | 308 |  |
| 102 | `/sv/houten-akoestische-panelen` | `/sv/products/wood-acoustic-panels` | 308 |  |
| 103 | `/no/houten-akoestische-panelen` | `/no/products/wood-acoustic-panels` | 308 |  |
| 104 | `/is/houten-akoestische-panelen` | `/is/products/wood-acoustic-panels` | 308 |  |
| 105 | `/houten-akoestische-panelen` | `/nl/products/houten-akoestische-panelen` | 308 |  |
| 106 | `/copy-of-houten-akoestische-panelen` | `/nl/products/houten-akoestische-panelen` | 308 |  |
| 107 | `/en/pet-akoestische-panelen` | `/en/products/pet-acoustic-panels` | 308 |  |
| 108 | `/nl/pet-akoestische-panelen` | `/nl/products/pet-akoestische-panelen` | 308 |  |
| 109 | `/fr/pet-akoestische-panelen` | `/fr/products/panneaux-acoustiques-pet` | 308 |  |
| 110 | `/de/pet-akoestische-panelen` | `/de/products/pet-akustikpaneele` | 308 |  |
| 111 | `/es/pet-akoestische-panelen` | `/es/products/pet-acoustic-panels` | 308 |  |
| 112 | `/pt/pet-akoestische-panelen` | `/pt/products/pet-acoustic-panels` | 308 |  |
| 113 | `/da/pet-akoestische-panelen` | `/da/products/pet-acoustic-panels` | 308 |  |
| 114 | `/sv/pet-akoestische-panelen` | `/sv/products/pet-acoustic-panels` | 308 |  |
| 115 | `/no/pet-akoestische-panelen` | `/no/products/pet-acoustic-panels` | 308 |  |
| 116 | `/is/pet-akoestische-panelen` | `/is/products/pet-acoustic-panels` | 308 |  |
| 117 | `/pet-akoestische-panelen` | `/nl/products/pet-akoestische-panelen` | 308 |  |
| 118 | `/copy-of-pet-akoestische-panelen` | `/nl/products/pet-akoestische-panelen` | 308 |  |
| 119 | `/en/akoestische-belcabines` | `/en/products/acoustic-phone-booths` | 308 |  |
| 120 | `/nl/akoestische-belcabines` | `/nl/products/akoestische-belcabines` | 308 |  |
| 121 | `/fr/akoestische-belcabines` | `/fr/products/cabines-acoustiques` | 308 |  |
| 122 | `/de/akoestische-belcabines` | `/de/products/telefonboxen` | 308 |  |
| 123 | `/es/akoestische-belcabines` | `/es/products/acoustic-phone-booths` | 308 |  |
| 124 | `/pt/akoestische-belcabines` | `/pt/products/acoustic-phone-booths` | 308 |  |
| 125 | `/da/akoestische-belcabines` | `/da/products/acoustic-phone-booths` | 308 |  |
| 126 | `/sv/akoestische-belcabines` | `/sv/products/acoustic-phone-booths` | 308 |  |
| 127 | `/no/akoestische-belcabines` | `/no/products/acoustic-phone-booths` | 308 |  |
| 128 | `/is/akoestische-belcabines` | `/is/products/acoustic-phone-booths` | 308 |  |
| 129 | `/akoestische-belcabines` | `/nl/products/akoestische-belcabines` | 308 |  |
| 130 | `/copy-of-akoestische-belcabines` | `/nl/products/akoestische-belcabines` | 308 |  |
| 131 | `/en/belcabines` | `/en/products/acoustic-phone-booths` | 308 |  |
| 132 | `/nl/belcabines` | `/nl/products/akoestische-belcabines` | 308 |  |
| 133 | `/fr/belcabines` | `/fr/products/cabines-acoustiques` | 308 |  |
| 134 | `/de/belcabines` | `/de/products/telefonboxen` | 308 |  |
| 135 | `/es/belcabines` | `/es/products/acoustic-phone-booths` | 308 |  |
| 136 | `/pt/belcabines` | `/pt/products/acoustic-phone-booths` | 308 |  |
| 137 | `/da/belcabines` | `/da/products/acoustic-phone-booths` | 308 |  |
| 138 | `/sv/belcabines` | `/sv/products/acoustic-phone-booths` | 308 |  |
| 139 | `/no/belcabines` | `/no/products/acoustic-phone-booths` | 308 |  |
| 140 | `/is/belcabines` | `/is/products/acoustic-phone-booths` | 308 |  |
| 141 | `/belcabines` | `/nl/products/akoestische-belcabines` | 308 |  |
| 142 | `/copy-of-belcabines` | `/nl/products/akoestische-belcabines` | 308 |  |
| 143 | `/en/telefooncellen` | `/en/products/acoustic-phone-booths` | 308 |  |
| 144 | `/nl/telefooncellen` | `/nl/products/akoestische-belcabines` | 308 |  |
| 145 | `/fr/telefooncellen` | `/fr/products/cabines-acoustiques` | 308 |  |
| 146 | `/de/telefooncellen` | `/de/products/telefonboxen` | 308 |  |
| 147 | `/es/telefooncellen` | `/es/products/acoustic-phone-booths` | 308 |  |
| 148 | `/pt/telefooncellen` | `/pt/products/acoustic-phone-booths` | 308 |  |
| 149 | `/da/telefooncellen` | `/da/products/acoustic-phone-booths` | 308 |  |
| 150 | `/sv/telefooncellen` | `/sv/products/acoustic-phone-booths` | 308 |  |
| 151 | `/no/telefooncellen` | `/no/products/acoustic-phone-booths` | 308 |  |
| 152 | `/is/telefooncellen` | `/is/products/acoustic-phone-booths` | 308 |  |
| 153 | `/telefooncellen` | `/nl/products/akoestische-belcabines` | 308 |  |
| 154 | `/copy-of-telefooncellen` | `/nl/products/akoestische-belcabines` | 308 |  |
| 155 | `/en/vergaderpods` | `/en/products/acoustic-phone-booths` | 308 |  |
| 156 | `/nl/vergaderpods` | `/nl/products/akoestische-belcabines` | 308 |  |
| 157 | `/fr/vergaderpods` | `/fr/products/cabines-acoustiques` | 308 |  |
| 158 | `/de/vergaderpods` | `/de/products/telefonboxen` | 308 |  |
| 159 | `/es/vergaderpods` | `/es/products/acoustic-phone-booths` | 308 |  |
| 160 | `/pt/vergaderpods` | `/pt/products/acoustic-phone-booths` | 308 |  |
| 161 | `/da/vergaderpods` | `/da/products/acoustic-phone-booths` | 308 |  |
| 162 | `/sv/vergaderpods` | `/sv/products/acoustic-phone-booths` | 308 |  |
| 163 | `/no/vergaderpods` | `/no/products/acoustic-phone-booths` | 308 |  |
| 164 | `/is/vergaderpods` | `/is/products/acoustic-phone-booths` | 308 |  |
| 165 | `/vergaderpods` | `/nl/products/akoestische-belcabines` | 308 |  |
| 166 | `/copy-of-vergaderpods` | `/nl/products/akoestische-belcabines` | 308 |  |
| 167 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/over-ons` | `/:locale/about` | 308 |  |
| 168 | `/over-ons` | `/nl/about` | 308 |  |
| 169 | `/copy-of-over-ons` | `/nl/about` | 308 |  |
| 170 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/duurzaamheid` | `/:locale/sustainability` | 308 |  |
| 171 | `/duurzaamheid` | `/nl/sustainability` | 308 |  |
| 172 | `/copy-of-duurzaamheid` | `/nl/sustainability` | 308 |  |
| 173 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/circulair` | `/:locale/sustainability` | 308 |  |
| 174 | `/circulair` | `/nl/sustainability` | 308 |  |
| 175 | `/copy-of-circulair` | `/nl/sustainability` | 308 |  |
| 176 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/producten` | `/:locale/products` | 308 |  |
| 177 | `/producten` | `/nl/products` | 308 |  |
| 178 | `/copy-of-producten` | `/nl/products` | 308 |  |
| 179 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/downloads` | `/:locale/products` | 308 |  |
| 180 | `/downloads` | `/nl/products` | 308 |  |
| 181 | `/copy-of-downloads` | `/nl/products` | 308 |  |
| 182 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/projecten` | `/:locale/products` | 308 |  |
| 183 | `/projecten` | `/nl/products` | 308 |  |
| 184 | `/copy-of-projecten` | `/nl/products` | 308 |  |
| 185 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/realisaties` | `/:locale/products` | 308 |  |
| 186 | `/realisaties` | `/nl/products` | 308 |  |
| 187 | `/copy-of-realisaties` | `/nl/products` | 308 |  |
| 188 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/verkooppunten` | `/:locale/where-to-buy` | 308 |  |
| 189 | `/verkooppunten` | `/nl/where-to-buy` | 308 |  |
| 190 | `/copy-of-verkooppunten` | `/nl/where-to-buy` | 308 |  |
| 191 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/dealers` | `/:locale/where-to-buy` | 308 |  |
| 192 | `/dealers` | `/nl/where-to-buy` | 308 |  |
| 193 | `/copy-of-dealers` | `/nl/where-to-buy` | 308 |  |
| 194 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/showroom` | `/:locale/where-to-buy` | 308 |  |
| 195 | `/showroom` | `/nl/where-to-buy` | 308 |  |
| 196 | `/copy-of-showroom` | `/nl/where-to-buy` | 308 |  |
| 197 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/veelgestelde-vragen` | `/:locale/faq` | 308 |  |
| 198 | `/veelgestelde-vragen` | `/nl/faq` | 308 |  |
| 199 | `/copy-of-veelgestelde-vragen` | `/nl/faq` | 308 |  |
| 200 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/nieuws` | `/:locale/blog` | 308 |  |
| 201 | `/nieuws` | `/nl/blog` | 308 |  |
| 202 | `/copy-of-nieuws` | `/nl/blog` | 308 |  |
| 203 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/acoustic-panels` | `/:locale/products` | 308 |  |
| 204 | `/acoustic-panels` | `/nl/products` | 308 |  |
| 205 | `/copy-of-acoustic-panels` | `/nl/products` | 308 |  |
| 206 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/acoustic-dividers` | `/:locale/products/divide` | 308 |  |
| 207 | `/acoustic-dividers` | `/nl/products/divide` | 308 |  |
| 208 | `/copy-of-acoustic-dividers` | `/nl/products/divide` | 308 |  |
| 209 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/room-dividers` | `/:locale/products/divide` | 308 |  |
| 210 | `/room-dividers` | `/nl/products/divide` | 308 |  |
| 211 | `/copy-of-room-dividers` | `/nl/products/divide` | 308 |  |
| 212 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/acoustic-wall-panels` | `/:locale/products/interior` | 308 |  |
| 213 | `/acoustic-wall-panels` | `/nl/products/interior` | 308 |  |
| 214 | `/copy-of-acoustic-wall-panels` | `/nl/products/interior` | 308 |  |
| 215 | `/en/phone-booths` | `/en/products/acoustic-phone-booths` | 308 |  |
| 216 | `/nl/phone-booths` | `/nl/products/akoestische-belcabines` | 308 |  |
| 217 | `/fr/phone-booths` | `/fr/products/cabines-acoustiques` | 308 |  |
| 218 | `/de/phone-booths` | `/de/products/telefonboxen` | 308 |  |
| 219 | `/es/phone-booths` | `/es/products/acoustic-phone-booths` | 308 |  |
| 220 | `/pt/phone-booths` | `/pt/products/acoustic-phone-booths` | 308 |  |
| 221 | `/da/phone-booths` | `/da/products/acoustic-phone-booths` | 308 |  |
| 222 | `/sv/phone-booths` | `/sv/products/acoustic-phone-booths` | 308 |  |
| 223 | `/no/phone-booths` | `/no/products/acoustic-phone-booths` | 308 |  |
| 224 | `/is/phone-booths` | `/is/products/acoustic-phone-booths` | 308 |  |
| 225 | `/phone-booths` | `/nl/products/akoestische-belcabines` | 308 |  |
| 226 | `/copy-of-phone-booths` | `/nl/products/akoestische-belcabines` | 308 |  |
| 227 | `/en/office-pods` | `/en/products/acoustic-phone-booths` | 308 |  |
| 228 | `/nl/office-pods` | `/nl/products/akoestische-belcabines` | 308 |  |
| 229 | `/fr/office-pods` | `/fr/products/cabines-acoustiques` | 308 |  |
| 230 | `/de/office-pods` | `/de/products/telefonboxen` | 308 |  |
| 231 | `/es/office-pods` | `/es/products/acoustic-phone-booths` | 308 |  |
| 232 | `/pt/office-pods` | `/pt/products/acoustic-phone-booths` | 308 |  |
| 233 | `/da/office-pods` | `/da/products/acoustic-phone-booths` | 308 |  |
| 234 | `/sv/office-pods` | `/sv/products/acoustic-phone-booths` | 308 |  |
| 235 | `/no/office-pods` | `/no/products/acoustic-phone-booths` | 308 |  |
| 236 | `/is/office-pods` | `/is/products/acoustic-phone-booths` | 308 |  |
| 237 | `/office-pods` | `/nl/products/akoestische-belcabines` | 308 |  |
| 238 | `/copy-of-office-pods` | `/nl/products/akoestische-belcabines` | 308 |  |
| 239 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/about-us` | `/:locale/about` | 308 |  |
| 240 | `/about-us` | `/nl/about` | 308 |  |
| 241 | `/copy-of-about-us` | `/nl/about` | 308 |  |
| 242 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/about-1` | `/:locale/about` | 308 |  |
| 243 | `/about-1` | `/nl/about` | 308 |  |
| 244 | `/copy-of-about-1` | `/nl/about` | 308 |  |
| 245 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/contact-1` | `/:locale/contact` | 308 |  |
| 246 | `/contact-1` | `/nl/contact` | 308 |  |
| 247 | `/copy-of-contact-1` | `/nl/contact` | 308 |  |
| 248 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/shop` | `/:locale/products` | 308 |  |
| 249 | `/shop` | `/nl/products` | 308 |  |
| 250 | `/copy-of-shop` | `/nl/products` | 308 |  |
| 251 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/news` | `/:locale/blog` | 308 |  |
| 252 | `/news` | `/nl/blog` | 308 |  |
| 253 | `/copy-of-news` | `/nl/blog` | 308 |  |
| 254 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/blog-1` | `/:locale/blog` | 308 |  |
| 255 | `/blog-1` | `/nl/blog` | 308 |  |
| 256 | `/copy-of-blog-1` | `/nl/blog` | 308 |  |
| 257 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/product-page/:path*` | `/:locale/products` | 308 |  |
| 258 | `/product-page/:path*` | `/en/products` | 308 |  |
| 259 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/post/:path*` | `/:locale/blog` | 308 |  |
| 260 | `/post/:path*` | `/nl/blog` | 308 |  |
| 261 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/blog-1/:path*` | `/:locale/blog` | 308 |  |
| 262 | `/blog-1/:path*` | `/nl/blog` | 308 |  |
| 263 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/copy-of-:path*` | `/:locale` | 308 |  |
| 264 | `/copy-of-:path*` | `/nl` | 308 |  |
| 265 | `/:locale(en|nl|fr|de|es|pt|da|sv|no|is)/shop/:path*` | `/:locale/products` | 308 |  |
| 266 | `/shop/:path*` | `/en/products` | 308 |  |
