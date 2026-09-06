# Needs Michael — content sprint 2

## Answers received on 6 September 2026 (applied)

| # | Answer | What changed |
|---|---|---|
| 1 | "Wide step-free door" | Modular XL, Duo and Solo Flex door copy reworded in all ten locales (`modularXlPage.overview.feature4`, `*.features.accessibility`, `meta.modularXlDescription`, booths hub FAQ q4); no accessibility promise anywhere |
| 2 | Duo € 7 615 excl. VAT | `src/data/products.ts` (`fromPrice` → Product Offer), `src/lib/content/boothGuide.ts`, `content/booth-guide.json`, FAQ-003 in ten locales, the four booth posts; installation price for Duo still unknown → "on request" in the guide table |
| 3 | "Can we try a booth before we order?" → Yes | FAQ-007 rewritten in ten locales; no leasing/trial wording left |
| 4 | Today's date is fine | no change |
| 5 | ok | Google reviews stay as shown |
| 6 | ok | made-in confirmed |
| 7 | B-s1,d0 | rWood Groove fire class set to B-s1,d0 (page, hub table, JSON-LD); the 60 % recycled content stays open |
| 8 | PER_SET | Interior back to "€387 per set" |
| 9 | no dB level yet | FAQ-005 unchanged |
| 10 | ok | FAQ wording confirmed |
| 11 | no competitor brand names | the four booth posts (nl/fr/de/en) now say "competitors ask …" with the same three figures; brand names and their domains removed from bodies, tables, FAQ answers and Sources lines (mirrored in the importer so a re-import keeps it) |
| 12 | Częstochowa address + phones | +48 730 700 333 (PL/EN) and +48 455 444 475 (PL/UA) on `/where-to-buy` and in the office LocalBusiness `telephone` |
| 13 | confirmed | no change |

## Online ordering — open points (added 6 September 2026)

The order flow is live on Solo Flex, Duo, Modular XL, Interior and Divide
(`docs/order-flow.md` explains it). These need a decision before the first
real order arrives:

26. **Set the e-mail plumbing.** Orders use the same Power Automate webhook as
    the contact form (`POWER_AUTOMATE_WEBHOOK_URL`). Confirm it is set in
    Vercel production, and set `ORDER_EMAIL` if orders should go somewhere
    other than `info@re-sound.be`. Without it the buyer is told to contact you
    directly, but you do not receive the order automatically.

27. **Consumer withdrawal right.** A private buyer ordering at distance in the
    EU normally has 14 days to withdraw, unless the goods are made to their
    specification. The terms page does not mention this. Ask your lawyer what
    the terms should say for booths and for panels made to a chosen colour or
    size, and add it; the order dialog already links to the terms page.

28. **VAT on cross-border sales to private buyers.** The flow charges 23 %
    Polish VAT to private buyers everywhere, as you instructed. Once
    cross-border B2C sales pass the EU one-stop-shop threshold (€ 10 000 a
    year across the EU), the rate of the buyer's own country applies instead.
    Confirm with your accountant when that switch is needed; it is one table
    in `src/lib/order/vat.ts`.

29. **Installation price for Duo and Interior.** Both are offered as "on
    request" because no price is confirmed. Give the figures and they become
    part of the online total.

30. **Add-on prices.** Every add-on on the booth pages (sit-stand desk,
    monitor arm, display, whiteboard, extra seating, fabric panel, and so on)
    is currently "on request", so any order containing one is not a final
    amount. A price list would make those orders self-service.

31. **Order handling.** Decide who confirms orders and how fast; the buyer's
    confirmation e-mail promises an answer with the transport cost "within one
    working day". Change that sentence (`order.email.nextSteps` in
    `messages/*.json`) if another promise fits better.

32. **VIES verification.** VAT numbers are verified against the European
    Commission's VIES service. When VIES is unreachable the order e-mail says
    "CHECK BY HAND" — those orders must be verified before invoicing without
    VAT.

Still open: items 14–25 below (hero images, Google API key and place id, planned application pages, rWood Groove 60 % recycled content, translation notes) and the Google Business Profile checklist.

Everything below is a fact, asset or decision the sprint could not settle from
the workbook (`content/re-sound-content-data-templates.xlsx`), from
`src/data/products.ts` or from the sprint brief. Where a value was missing the
site shows a neutral placeholder ("on request", a product hero instead of a
blog image) rather than an invented figure. Items are grouped by what they
block; each names the file to change once the answer is known.

## A. Decisions that affect live copy

1. **Modular XL accessibility claim (contradiction on the page).** The brief
   states that wheelchair access is not standard on any booth and can only be
   modified on request; FAQ-009 now says exactly that and is rendered on the
   Modular XL page. The same page still carries the older copy
   "Full A/V provisions and accessible-by-design entry"
   (`messages/*.json` → `modularXlPage.overview.feature4`, in en/nl/fr/de) and a
   "Wheelchair-accessible: 110 cm clear door width and flat threshold…" feature
   card (`modularXlPage.features.accessibility`). Duo carries "100 cm clear door
   width — meets European accessibility guidance and accommodates wheelchairs"
   (`duoPage.features.accessibility`). Per the brief the claim was not repeated
   anywhere new and `scripts/seo-check.mjs` now flags "accessible-by-design"
   as a forbidden string, so the after-report shows one expected hit on
   `/en/products/modular-xl`. Decide: remove the three claims, or confirm the
   door widths and reword them as "wide step-free door" without the
   accessibility promise.

2. **Duo price.** Booth_Guide has no price for Duo. The price guide, the
   booths hub and FAQ-003 say "on request"; the Duo Product JSON-LD carries no
   `Offer`. Add the excl.-VAT price (with and without installation) to
   `src/lib/content/boothGuide.ts` (`BOOTH_PRICES.duo`) and to Products_Data /
   `src/data/products.ts` (`fromPrice`) and the page updates itself.

3. **FAQ-007 wording.** The visitor's question in the FAQ sheet is "Can we
   lease or trial a booth?". The answer no longer uses the words leasing or
   trial ("No, not at the moment" + showroom by appointment), but the question
   still does, in all six languages (`content/faq/*.json`). If you prefer the
   question not to mention leasing at all, a neutral alternative is "Can we try
   a booth before we order?".

4. **Blog publication timing.** Content_Calendar plans the six Dutch posts
   between 6 October and 15 December 2026. The brief asked to publish them
   now, so every post carries `datePublished: 2026-09-06` (the real date; a
   future date is an invalid `BlogPosting` date) and keeps the calendar date
   as `plannedDate`. If you want the staggered release instead, set
   `draft: true` in the six files under `content/blog/nl/` and flip it on the
   planned day (`npm run content:import` keeps the first live date in
   `content/blog-status.json`).

5. **Google reviews and the consent column.** The Testimonials sheet marks all
   four Google reviews "Consent to publish: N". The site shows the one review
   with text (JustNicolas) and the three star-only reviews as rating rows, each
   attributed "via Google" and linked to the listing, which is how Google's
   Places display rules allow public reviews to be shown. If you want written
   consent before any review is shown, set `consent` to `true` per review in
   `content/google-reviews.json` and change the filter in
   `src/lib/content/testimonials.ts` (one line).

## B. Facts to confirm

6. **Where each range is made (FAQ-017).** The FAQ sheet note said "produced
   in Poland"; the published answer follows the brief: Interior, Solid and
   Divide in Beveren-Waas; rWood, rPET and all booths in Częstochowa; raw
   materials sourced in the EU. `src/data/products.ts` now carries
   `madeIn: 'PL'` for rWood and the booths (Product JSON-LD `countryOfOrigin`).
   Confirm both.

7. **rWood Groove recycled content and fire class.** Products_Data lists 60 %
   recycled content with status Backlog; the page and JSON-LD now show 60 %.
   The old JSON-LD said B-s2,d0; the page says B-s1,d0 (fire-retardant core) /
   D-s2,d2 (standard core). Confirm the 60 % and which fire class applies to
   the standard product.

8. **Interior price unit.** The site copy says "from €387 per set"; the
   workbook says prices are per piece ("per stuk"). The hub table now reads
   "from €387 per piece" (`hubs.shared.units.piece`, translated per locale).
   Confirm that €387 is indeed the per-piece price; if it is per set, revert
   `priceUnit` for Interior in `src/data/products.ts` to `PER_SET`.

9. **Fan noise level (FAQ-005).** The question asks "how loud is it?"; no
   dB(A) value exists in the workbook, so the answer only says "silent EC-fan
   system, 4.6 m³/min on Solo Flex". Provide the measured value and it can be
   added to FAQ-005 and the price guide.

10. **FAQ editorial choices to confirm** (all in `content/faq/*.json`):
    FAQ-004 explains Class C as "a normal conversation turns into distant
    murmuring: clearly quieter, but not inaudible" (mirrors your Dutch
    FAQ-001); FAQ-016 adds "this applies to the whole rWood range, grooved
    and micro-perforated" (inferred from "only FSC-certified veneers");
    FAQ-012 says "check with your acoustician or fire-safety adviser";
    FAQ-013 keeps "even a ceramic kitchen knife"; FAQ-015 says "mineral wool
    (rock wool or glass wool)" without the Isover/Knauf brand names.

11. **Competitor prices** cited in the blog posts and the price guide FAQ
    (mute-labs SOLO € 2 990 net, Work With Island Island Solo € 3 990 excl.
    VAT, Brand New Office BNO Booth € 9 320 excl. VAT) are the September 2026
    figures from the brief. Re-check them quarterly; they live in the post
    bodies and in `content/faq/*.json` (FAQ-003 does not cite them).

12. **Częstochowa production office.** Dealers_Showrooms gives the address
    (ul. Legionów 59, 42-200 Częstochowa), hours Mon–Fri 08:00–16:30 and the
    languages nl/pl/uk/ru/en, but no phone number and no coordinates. It is
    now public on `/where-to-buy` and as a second `LocalBusiness` in the
    JSON-LD (`src/lib/structured-data.ts`, `productionOfficeSchema`). Confirm
    the office may be listed publicly, add a phone number if there is one
    (`src/config/site.ts` → `PRODUCTION_OFFICE`), and confirm the spelling
    with diacritics.

13. **Solo Flex included equipment.** The price guide says every booth ships
    with shell, door, dimmable LED lighting and power, and Solo Flex with the
    manual sit-stand desk (electric desk is an add-on on the product page).
    Confirm this matches the standard delivery for Duo and Modular XL.

## C. Assets and accounts to provide

14. **Blog hero images (18 files).** No image exists under
    `public/images/blog/`; each post uses a product hero as a fallback and
    records the requested path in its front matter (`heroImageMissing`).
    Dutch posts:
    `akoestiek-open-kantoor.jpg`, `akoestische-panelen-restaurant.jpg`,
    `belcabine-kantoor-prijs.jpg`, `hoeveel-panelen-nodig.jpg`,
    `nagalmtijd-klaslokaal.jpg`, `pet-vilt-of-hout.jpg`. The twelve FR/DE/EN
    drafts are listed in section G. Drop a 1600 × 900 (or larger, 16:9)
    image at the path, then either re-run `npm run content:import` (Dutch
    posts) or set `heroImage` in the draft's front matter.

15. **Google Places API key and cron secret.** Set `GOOGLE_PLACES_API_KEY`
    (Places API (New) enabled, key restricted to that API) and `CRON_SECRET`
    as Vercel environment variables. Without the key the site keeps the four
    reviews captured on 6 September 2026 (`content/google-reviews.json`);
    with it, `npm run build` refreshes them and the weekly cron
    (`vercel.json`, Mondays 06:00 UTC, `/api/cron/google-reviews`) revalidates
    the cached reviews. The key is never committed.

16. **Google place id.** Only the listing's CID (14056110879742525405) is
    known. The first run of `scripts/fetch-google-reviews.mjs` with a key
    stores the place id; then set `writeReviewUrl` in `src/config/site.ts`
    (`GOOGLE_LISTING`) to
    `https://search.google.com/local/writereview?placeid=<id>` so "Review us
    on Google" opens the review form instead of the Maps listing.

17. **Fourth Google reviewer.** The listing shows four reviews but only three
    names could be read on 6 September; the fourth is stored as a
    placeholder rating row and is replaced automatically by the live fetch.

## D. Planned pages referenced by the workbook

18. The "Internal links" column of Blog_Posts points to application pages
    that do not exist yet (Content_Calendar CC-012 to CC-016, phase P2):
    `/nl/applications/kantoor` (BP-002), `/nl/applications/onderwijs`
    (BP-005), `/nl/applications/horeca` (BP-006). The importer skips them and
    links the products, ranges and pages that do exist instead; when the
    application pages are built, add an anchor phrase for them in
    `scripts/content/import-workbook.mjs` (`LINK_NAMES`) and re-import.
    Anchor phrases not found in the Dutch bodies (so the link was not
    placed): BP-002 rPET hub, BP-003 rWood hub and where-to-buy, BP-004 both
    hubs, FAQ and where-to-buy, BP-006 rWood hub. Add a sentence that names
    the range if you want those links.

19. **Case studies, technical pages, dealer list** (CC-005 to CC-011) are
    still Backlog in the workbook; nothing on the site links to them.

## E. Google Business Profile checklist (not code)

Do this in the Google Business Profile manager for the "Re-Sound" listing;
the site links to it from the footer and the reviews block.

- Address: Gentseweg 309 A3, 9120 Beveren-Waas (the listing still shows
  Industriepark-West 75, Sint-Niklaas). Request the move, then verify.
- Primary category: Fabrikant (Manufacturer), not Hoofdkantoor; secondary
  categories: Akoestisch adviesbureau / Kantoormeubelwinkel if available.
- Phone: +32 3 284 68 18. Website: https://re-sound.be/nl (add
  `?utm_source=google&utm_medium=organic&utm_campaign=gbp` if you want it
  separated in analytics).
- Opening hours: Monday to Friday 08:00–16:30; mark visits "by appointment".
- Description: start with the manufacturer sentence ("Re-Sound is a Stretch
  Group brand. We manufacture in our own plants in Beveren-Waas (Belgium) and
  Częstochowa (Poland).") and name the three ranges and the booths.
- Photos: showroom exterior and interior, Solo Flex / Duo / Modular XL, rPET
  and rWood panels, the Beveren-Waas plant; at least ten, landscape, no
  text overlays.
- Products: add Solo Flex (from € 2 740 excl. VAT), Modular XL (from
  € 15 000), Duo (price on request), rPET Groove, rWood Groove, Interior,
  each linking to its product page.
- Service area: Belgium, Netherlands, France, Germany, Luxembourg.
- Reply to the four existing reviews (they are about four years old).
- Review campaign: after each delivery, send the "Review us on Google" link
  (see item 16) to the buyer and the installer's contact; aim for one review
  per week for the first quarter. Never offer anything in return.

## F. Flags from the translation pass

The sprint-2 UI keys (price guide, reviews block, production office, FAQ
group headings, price units, blog labels) were translated into nl, fr, de,
es, pt, da, sv, no and is and the nl/fr/de sets were reviewed by a native
editor. Points the translators raised for you:

20. **Meta descriptions at 155 characters.** To stay within the limit the
    French and Spanish descriptions of the price guide drop "lead time" (es
    also "ventilation") and the Spanish drops "from the manufacturer"; the
    German keeps "vom Hersteller" by using "netto" instead of "zzgl. MwSt.".
    Adjust `boothGuide.description` in `messages/<locale>.json` if you prefer
    another trade-off.

21. **Keyword order in the French and Spanish titles.** French reads "Prix
    cabine téléphonique de bureau : classes ISO 2026 | Re-Sound" (a
    keyword-first variant exceeds 65 characters); Spanish reads "Cabinas
    telefónicas de oficina: precios e ISO 2026 | Re-Sound" ("clases ISO" did
    not fit).

22. **Decimal separators.** The German guide texts use the German comma
    (4,6 m³/min, 25,9 dB(A)) while the specification cells taken from
    `src/data/products.ts` keep the point (4.6 m³/min) in every locale, as
    on the range hubs. Say whether the whole site should localise decimals;
    that is a data-layer change, not a translation.

23. **"Reviews" as the Dutch section label** (`testimonials.tag`) is a
    common loanword; "Beoordelingen" is the alternative. The nl CTA texts use
    "Offerte aanvragen" (sentence case) where older keys use "Offerte
    Aanvragen".

24. **Belgian Dutch** ("recyclage", "recycleerbaar") is used in the new
    Dutch strings to match the rest of nl.json; readers in the Netherlands
    would expect "recycling" / "recyclebaar".

25. The wheelchair sentence that sat under the price guide's "End of life"
    heading was moved out of the text; the guide now shows FAQ-009
    ("Is the booth wheelchair accessible?") instead, in every language.

## G. FR/DE/EN drafts — findings the writers could not settle

Each draft went through a write pass, a verify-and-fix pass and a read-only
final check against the facts list. What the final check still flagged, and
what was done:

- **BP-007 (fr)** describes Modular XL as "une salle de réunion déplaçable"
  and says a booth "se démonte pour suivre vers un autre étage ou bâtiment".
  That follows FAQ-006 (flat-pack construction, can be demounted and rebuilt
  on another floor) rather than a stated Modular XL relocation service;
  soften to "démontable" if you prefer.
- **BP-008 (fr)**: the meta description was trimmed to 144 characters; two
  qualitative claims without a source were removed ("toute la surface
  travaille, bords et face arrière compris"; clip-mounted panels come off
  "sans dégât"); the acoustician wording was added next to ISO 11654.
- **ISO 23351-1** is cited in every booth post although the market norm
  lists in the brief do not name it; it is the standard behind the Class C
  statement the brief requires, and the acoustician wording accompanies it.
- **BP-013 (de, DIN 18041)**: the checker could not trace the norm's
  category details to the workbook. The A1–A5 enumeration, the tolerance-band
  sentence and the ISO 3382-3 parameter names were removed; ISO 3382-2/-3
  (not on the German norm list of the brief) were dropped from the body and
  the Quellen line in favour of VDI 2569 and ISO 22955. What remains
  (category A: target reverberation time per use, A3 formula; category B:
  absorption relative to room volume) is general DIN 18041:2016 content —
  have your acoustician confirm the wording before publishing.
- **BP-012 (de)**: "OEKO-TEX … in Kitas, Schulen und Praxen regelmäßig
  abgefragt" was unsourced and removed. "Schwesterunternehmen STRETCH" mirrors
  the Dutch classroom post (kept).
- **BP-011 (de)**: the air-exchange figure ("2,35 m³ … rund alle
  30 Sekunden") is derived from the Solo Flex dimensions and 4,6 m³/min, as
  in the Dutch model post (kept).
- **BP-014 (de)** states "Klasse B nach ISO 11654" for rWood Groove, derived
  from its αw 0,85 (the workbook names class B explicitly only for rPET);
  confirm against the rWood Groove datasheet.
- **Titles with a colon** (BP-011 "Telefonbox Büro: Kosten und Klassen 2026",
  BP-013 "DIN 18041: Nachhallzeit im Büro richtig planen") keep the keyword
  words first but not as one literal string — the literal strings are not
  grammatical German.
- **BP-017 (en)**: "0.6 s, the range BB93 works in" attributed a limit to
  BB93 that is not in the workbook; reworded to Re-Sound's own guide value
  with BB93 as a pointer only.
- **BP-018 (en)**: the ISO 11654 Class D and E ranges were removed (the
  workbook supports A/B/C only). The post keeps two general statements about
  NRC (rounded to 0.05; lab edge effects can push it above 1.00) that are
  standard practice but not in the workbook — delete if you want the post to
  contain workbook facts only.
- **ASTM C423** (NRC) is cited in BP-016 and BP-018 although it is not on the
  English norm list of the brief; it is the standard NRC is defined by and the
  brief's BP-018 topic names it.
- **BP-015 (en)** now says the market range runs "€2,740 to €9,320 excl. VAT
  (mute-labs quotes net)".
- **Word counts** in the front matter use the project's own metric
  (whitespace tokens of the markdown body, as in the importer); `wc -w`
  gives 20–50 fewer words per post because of table pipes and symbols. All
  bodies are within 1 000–1 400 on both counts.

Hero images for the twelve drafts (item 14): `cabine-acoustique-bureau-prix.jpg`,
`panneaux-acoustiques-pet-recycle.jpg`, `combien-de-panneaux-acoustiques.jpg`,
`panneau-acoustique-bois-microperfore.jpg`, `telefonbox-buero-kosten.jpg`,
`akustikpaneele-recyceltes-pet.jpg`, `din-18041-nachhallzeit-buero.jpg`,
`holz-akustikpaneele-mikroperforiert-oder-genutet.jpg`,
`office-phone-booth-prices.jpg`, `pet-acoustic-panels-vs-wood.jpg`,
`how-many-acoustic-panels-do-i-need.jpg`,
`specifying-acoustic-panels-aw-nrc-class-a.jpg` under `public/images/blog/`.
