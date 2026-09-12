# Needs Michael — lead sprint, 12 September 2026

Everything the sprint could not settle from the repository's product data
(`src/data/products.ts`), the catalogue in the database, the workbook or the
brief. The governing rule of the sprint was *never invent a fact*: where a
value was unknown the site now shows nothing, "on request" or "measurement
pending" rather than a number. Each item names what is shown today and what
changes once you answer.

Booth origin is **not** open: the four booths are manufactured in
Częstochowa and the site states that as fact throughout (spec tables,
hub, price guide, blog posts, manufacturing page).

## A. Decisions before the next deploy

1. **Competitor names are back in the Dutch booth post.** On 6 September you
   asked for no competitor brand names; the 12 September brief asked for a
   named market table in BP-001 (`/nl/blog/belcabine-kantoor-prijs-keuze-plaatsing`).
   The brief is the newer instruction, so the table now names mute-labs SOLO
   (€ 2 990 net), Bosselino Uno (€ 2 999), Work With Island Island Solo
   (€ 3 990 excl. VAT), Berlin Acoustics Focus (from € 4 299), VOX S
   (€ 5 092), Quadra (€ 6 237), Hush Phone (€ 9 000), Brand New Office BNO
   Booth (€ 9 320 excl. VAT) and HUSHFREE S (€ 11 660), all "September 2026,
   as published". If you want the anonymous version back, say so and the
   table becomes three price bands again. Re-check the figures quarterly.
2. **www or apex.** The canonical host is the apex, `https://re-sound.be`
   (every canonical tag, hreflang and sitemap URL already uses it). The code
   now 308s `www.re-sound.be` to the apex. Two account actions remain
   (`docs/legacy-urls.md`): set the www domain to "Redirect to re-sound.be"
   in Vercel → Domains, and move the DNS zone from Wix to Combell (copy every
   MX/TXT/DKIM record first) so the domain no longer depends on the Wix
   subscription.
3. **GA4 key events.** The site now fires `lead_quote`, `lead_sample`,
   `lead_pricelist` and `lead_calculator` with `locale` and `product_range`.
   Marking them as key events (conversions) is done in GA4 Admin → Events;
   it cannot be done from the repository. The old `sample_request` /
   `generate_lead` events are no longer fired by the sample flow.
4. **Live form test.** No test lead could be sent from the build environment
   (the Power Automate URL exists only in Vercel and nothing was deployed).
   After the deploy, submit one test on each of the four forms (contact,
   sample kit, price-list download, calculator) and check
   leads@stretchgroup.be. All payloads send HTML in `body`, plain text in
   `text` and `isHtml: true`.
5. **Weekly review refresh.** Google reviews are fetched at build time only
   now. The Monday cron calls a Vercel Deploy Hook so the build re-fetches
   them: create the hook (Vercel → Settings → Git → Deploy Hooks) and store
   its URL as `VERCEL_DEPLOY_HOOK_URL`. Without it the cron does nothing and
   the committed `content/google-reviews.json` stays as it is.
6. **The four January-2024 blog posts** (circular economy, office acoustic
   solutions, recycled materials, sound absorption) are `noindex`, out of
   the sitemap and off the Dutch blog index. They still show on the other
   locales' blog index because those locales have no published post yet
   (the FR/DE/EN drafts BP-007 to BP-018 are still "Review"). Say whether to
   rewrite the four to current facts, publish the drafts after a price
   sweep, or hide the placeholders everywhere.
7. **Sample-kit form.** Company is now required (the lead API rejects a lead
   without a company); the delivery address is optional. Tell us if private
   buyers should be able to order a kit, and whether "shipped within three
   working days in the EU" (from the brief) is the promise you want printed.

## B. Confirmed price list (per model)

Every price on the site comes from the catalogue in the database
(`docs/database.md`); the 2026 list is loaded and valid from 21 September
2026. Confirm:

| Model | Shown today | Open |
|---|---|---|
| Solo ECO | from € 2 740 excl. VAT (closed back wall; glass back wall € 3 015) | ISO 23351-1 value (none published) |
| Solo Flex | from € 4 118,75 excl. VAT | installation price (was € 865, now "on request") |
| Duo | from € 7 612,50 excl. VAT (Duo Work and Duo Flex equal) | **is Duo still price-on-request anywhere?** No — the list price is shown on the page, the hub, the guide, the PDF and in BP-001; confirm that is intended. ISO 23351-1 value (none on file; the old "26 dB(A)" was unsourced and is gone) |
| Modular XL | from € 13 781,25 excl. VAT base; +€ 5 118,75 / € 10 237,50 / € 15 356,25 for one, two, three elements | installation price (was € 2 990); capacity wording (list: base 4, up to 10; page hero: "6–10") |
| Interior | € 387 per set | — |
| Solid | € 407 per panel (website line, unconfirmed) | confirm or deactivate |
| Divide | catalogue | — |

The PDF price list on the booth guide is generated from the same catalogue
snapshot at every build, in EN/NL/FR/DE.

## C. Recycled content per line (data: `recycledContentPct`)

| Product | Shown | Open |
|---|---|---|
| Interior, Solid, Divide | 80 % (spec sheet says "≥ 80 %") | confirm; say if "at least 80 %" should be printed |
| rPET Panel, rPET Flex Groove | 100 % ("made entirely from recycled PET") | confirm |
| rPET Groove | nothing (the old "100 %" had no source) | give the figure |
| rWood Groove | nothing (the 60 % was a Backlog row) | give the figure |
| rWood Perf | 17 % (page badge, unconfirmed) | confirm or it goes |
| rWood Micro, rWood Panel | nothing | give the figures if known |
| Booths | nothing | any figure? |

## D. αw, NRC and fire class per product (data: `specs`)

| Product | αw | NRC | Fire class (EN 13501-1) | Open |
|---|---|---|---|---|
| Interior | 1.0 | 0.95 | B-s1,d0 | — |
| Solid | 1.0 | 0.90 | B-s1,d0 | old page said αw 0.95 / NRC 0.95 — confirm from the test report |
| Divide | 1.0 | — | B-s1,d0 | old page said 0.85 per side — per side or overall? |
| rWood Groove | 0.90 | — | B-s1,d0 | old table listed D-s2,d2 for a standard MDF core — is a non-FR core still sold? confirm 0.90 |
| rWood Micro | 0.90 | — | B-s1,d0 | old table said "up to 1.00 with 50 mm mineral wool" and per-pattern Class A — confirm |
| rWood Perf | 0.35–0.85 per pattern | — | B-s1,d0 | old cards listed PD8 0.85 / PH10 0.75 / PH8 0.55 / PH5 0.35 and NRC 0.90 — send the per-pattern table |
| rWood Panel | none | — | B-s1,d0 (FR MDF) / D-s2,d0 | αw/NRC if tested |
| rPET Panel | up to 1.00 | — | B-s2,d0 | the page used to say 0.95 (24 mm on frame) and the FAQ B-s1,d0 — which is on the certificate? |
| rPET Groove | none | 0.55 / 0.75 / 0.90 (12/24/36 mm) | B-s1,d0 | αw (needed for any "Class A"), ASTM E84 rating (the "US Class A" row was removed) |
| rPET Flex Groove | none | — | B-s1,d0 | αw |
| Solo ECO | ISO 23351-1: none | | none | measurement pending on the page |
| Solo Flex | 24 dB(A), class C | | none (the "B-s2,d0" on the safety card was unsourced and removed) | fire classification per booth, CE/IEC 60598 certificates |
| Duo | ISO 23351-1: none | | none | measurement pending |
| Modular XL | 25.9 dB(A) | | none | fire classification |

Two of the four booths are sold without a measured ISO 23351-1 class.
German competitors market the test as a badge ("Geprüfte Sprachschalldämmung
nach ISO 23351-1:2020", "Schallschutz Klasse A"); a measured value for Solo
ECO and Duo is worth having before the next campaign.

## E. Countries of manufacture

- rWood, rPET and the four booths: Częstochowa (PL) — stated as fact.
- Textile lines: Beveren-Waas (BE).
- The manufacturing page uses the head-office/showroom address for the
  Belgian plant and the production-office address (ul. Legionów 59) for the
  Polish one. Confirm both are the production sites.

## F. Assets and facts still missing

- **Plant photos** (both plants, exterior and production floor): none in
  the repo; the manufacturing page shows neutral placeholders, the booth
  pages have no plant photo.
- **Founding year**: unknown; omitted from the manufacturing page and the
  Organization schema.
- **Plant surface, headcount, capacity, machinery**: not written.
- **Blog hero images** (18 files, see the earlier list): still missing;
  BP-001 now uses the Solo ECO photo.
- **Missing PDFs**: see `docs/missing-documents.md` (datasheets, test
  reports, fire certificates, installation guides per product).
- **Solo ECO**: glass-back-wall photo; clear door width; fan count; lighting;
  occupancy sensor; fire class; certifications.
- **Google Places API key, cron secret, deploy hook** as Vercel env vars.
- **Certifications with numbers**: FSC chain-of-custody certificate number
  and scope; OEKO-TEX certificate number; the EPD for rWood Panel (file).
  The manufacturing page lists only what the data holds.

## G. Smaller open points from the accuracy pass

(full raw list in the sprint report)

- "50+ colours" (homepage) is not derivable from the data; left.
- Sustainability page stats ("50+ tons textiles saved", "10K+ m² panels
  produced", "0 % waste to landfill") are unverified; still shown.
- rWood core described as "compressed recycled textile fibres — the same
  material as Interior": unverified.
- rWood Panel veneer count: page/meta say 10, hub/collection 8.
- rWood Perf density "0.45 kg/m³" / "48,40 kg/m³" look like unit errors.
- rPET Groove "~60 bottles per panel": not in the data.
- Free take-back stated range-wide (incl. booths and the Polish lines):
  confirm the programme's scope and countries (BE/NL/FR/DE/LU).
- "Franse VOC-klasse A+" for rPET in the Dutch posts: not in the data.
- rPET Groove standard panel length (posts no longer cite 2 400 × 600 mm).
- Interior EPD ("available on request") was removed — does one exist?
- Sample kit: none of this is a price question, but the kit contents
  (A4 swatches of every range and finish) come from the brief.

## H. Carried over from the earlier lists (still open, verbatim)

Numbering below is the earlier list's own. Items answered on 6 and 8 September are not repeated.

### Online ordering (added 6 September 2026)

The order flow is live on Solo Flex, Duo, Modular XL, Interior and Divide
(`docs/order-flow.md` explains it). These need a decision before the first
real order arrives:

26. **Set the e-mail plumbing — blocking.** Orders use the same Power
    Automate webhook as the contact form (`POWER_AUTOMATE_WEBHOOK_URL`).
    Confirm it is set in Vercel production, and set `ORDER_EMAIL` if orders
    should go somewhere other than `info@re-sound.be`. Orders are not stored
    anywhere: the e-mail is the only record, so while the webhook is missing
    **no order can be placed at all** — the buyer is told the order did not
    reach you and nothing was registered.

27. **Consumer withdrawal right.** A private buyer ordering at distance in the
    EU normally has 14 days to withdraw, unless the goods are made to their
    specification. The terms page does not mention this. Ask your lawyer what
    the terms should say for booths and for panels made to a chosen colour or
    size, and add it; the order dialog already links to the terms page.

28. **VAT on cross-border sales to private buyers — ask your accountant
    before the first one.** The flow charges 23 % Polish VAT to private
    buyers everywhere, as you instructed. That is correct only below the EU
    one-stop-shop threshold of € 10 000 a year across all cross-border B2C
    sales. Above it, an intra-Community distance sale must carry the rate of
    the buyer's own country (21 % in Belgium, 20 % in France, 19 % in
    Germany) and be declared through OSS. With booths at € 2 740 to
    € 15 000 that threshold is passed by the second or third consumer order
    of the year, and the dialog takes binding orders on the Polish rate. If
    your accountant says OSS applies, tell us and we add a per-country rate
    table; until then a cross-border consumer order needs a manual check
    before the invoice goes out.

36. **Your Polish VAT registration.** Nothing in the order flow names the
    Polish VAT number the 23 % is charged under. It has to appear on the
    invoice. Give us the number if you also want it in the order
    confirmation e-mail.

37. **Transport is quoted separately and is taxed the same way.** The
    confirmation says transport is not included. When you add it to the
    invoice it carries the same VAT treatment as the goods, so the invoiced
    VAT will be higher than the amount the buyer saw. Say if the
    confirmation should spell that out.

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
    Commission's VIES service, and a business is invoiced without VAT only
    when VIES confirms the number. When VIES does not answer, the order is
    invoiced at 23 % and the buyer is told the VAT is credited once the number
    is confirmed — so those orders need a manual check and a credit note. If
    you would rather zero-rate on the format alone and carry the risk, say so
    and it is one line in `src/lib/order/vat.ts`.

33. **Proof of dispatch.** Zero-rating an intra-Community supply or an export
    is only valid with transport evidence on file. The order flow does not
    collect it; make sure the carrier documents are kept with the invoice.

34. **EU territories outside the VAT area.** Canary Islands, Ceuta and
    Melilla, the French overseas departments, Åland, Büsingen, Livigno, Mount
    Athos and the rest are treated as their member state, so an order there is
    invoiced at 23 % and has to be corrected by hand. Tell us if these are
    common enough to code a postcode rule.

35. **Delivery countries.** The dialog offers the EU 27, Northern Ireland and
    the United Kingdom, Switzerland, Norway, Iceland, Liechtenstein, Serbia
    and Ukraine. There is deliberately no "other country" option. Name any
    country you want added.

### The 2026 price list and the database (added 8 September 2026)

The booth price list is in the site's own database (`docs/database.md`); every
price on the site comes from it. These came out of the import:

38. **Solo Flex was priced as Solo ECO.** The booth guide, FAQ-003 and the
    four "phone booth prices" blog posts said Solo Flex starts at € 2 740.
    On the 2026 list € 2 740 is the **Solo ECO** closed-backwall price;
    Solo Flex is € 4 118,75 (the page's specs — 102 × 102 × 226 cm, sit-stand
    table, 4.6 m³/min — are the Solo Flex ones, so the page was right and the
    price was wrong). The site now shows the list price everywhere. The blog
    posts compared Solo Flex to competitors at € 2 990, € 3 990 and € 9 320;
    at € 4 118,75 it is no longer the cheapest, and the sentences that said
    so were rewritten to state where the price sits. Read those four posts
    once (nl, en, fr, de) and tell us if you want a different argument.

39. **Installation prices are gone.** The list says "delivery and
    installation: optional, quoted separately", so installation is "on
    request" on every product. The € 865 (Solo Flex) and € 2 990 (Modular XL)
    figures were derived from the guide's installation-inclusive prices,
    which no longer exist. If you want installation priced online again,
    give a figure per model and it is one cell in the `articles` table
    (the `WEB-…-INST` rows).

40. **Valid from 21 September 2026.** The list carries that date
    (`price_lists.valid_from`). The site shows the list now, as instructed.
    If the old prices should hold until the 21st, say so.

41. **Modular XL capacity.** The list says the base module seats up to 4,
    +1 element 6, +2 elements 8, +3 elements 10. The page hero says
    "6–10 persons" and "the base unit comfortably seats six". The order
    dialog follows the list; the page copy still says six. Confirm which is
    right and the copy is changed in ten locales.

42. **Modular XL fire protection** is priced per 0.9 m segment on the list
    ("multiply by the number of segments"). The site counts the 180 cm base
    module as two segments plus the chosen extension (so 2, 3, 4 or 5).
    Confirm that reading; if the base counts as one, it is one number in
    `articles.segments`.

43. **Duo Work vs Duo Flex.** The Duo page now sells both models (a picker
    at the top of the order dialog). The list flags that Ethernet is priced
    differently on the two (€ 156,25 vs € 143,75); it is left as listed.

44. **Solo Stand and Modular 4** are in the catalogue with all their
    options but have no product page, so they cannot be ordered online. Say
    if you want pages for them. (Solo ECO has a page since 8 September, see
    items 51–53.)

45. **Sofa fabrics** have no article codes on the list. The dialog orders
    the sofa article as is; the fabric is settled in the confirmation.

46. **Vercel environment variables — blocking for the database.** Add
    `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the re-sound-be project in
    Vercel (values in `docs/database.md` and the Supabase dashboard, Project
    settings → API) and redeploy. Until then the
    site runs on the committed snapshot of the catalogue (identical prices)
    and orders are e-mailed but not stored. `/api/health/catalogue` shows
    which state the site is in.

47. **Nothing from the supplier sheet is on the site** and nothing from it
    may enter the repository, which is public. The purchase prices and
    margins are in the `supplier_articles` table, readable only with the
    service role. The workbook itself stays with you.

48. **Solid at € 407 per panel.** The Solid page has said "Starting from
    €407 excl. VAT per panel" since before this work, while the earlier price
    request listed Solid as unpriced. The figure is now the catalogue article
    `WEB-SOLID-PIECE` (source "website", so the page keeps showing what it
    showed) and its note says it is unconfirmed. Confirm it, correct it, or
    set the article inactive in the dashboard to take the price off the page.
    Solid has no order button; say if it should get one.

49. **Hardening once the database is live.** Two changes are documented but
    not applied, because both need the service-role key in Vercel first:
    revoking `execute` on `place_order()` / `mark_order_mailed()` from the
    anon role (the anon key never leaves the server, so this is belt and
    braces), and a scheduled check that mails a digest of stored orders whose
    internal e-mail did not go out. Say when the service-role key is set.

50. **Model descriptions in the order dialog.** The Duo dialog's model
    picker shows each model's one-line description in English in every
    language (the `products` table has no translated labels, unlike
    `articles`). Nine short sentences to translate once you confirm the
    English ones.

51. **Solo ECO photos — done 9 September.** The four scene photos you sent
    are on the page (hero, overview, product card, stool option) and on the
    hub cards and social preview; file metadata was stripped and none carries
    a logo. The plywood texture you sent with them is not used: there is no
    material swatch on the booth pages. Still missing: a photo of the glass
    back-wall version (that option card has no image).

52. **Solo ECO facts the list does not give.** The page states only what
    the 2026 price list states: dimensions, standing table, weight, 8 mm
    enamelled glass, ventilation up to 4 m³/min, 2 W / 22 W, 5-year spare-
    part warranty, 4 weeks production, white exterior, beige felt, door
    hinged left, closed or glass back wall, stool option. Missing, and so
    not on the page: the ISO 23351-1 speech reduction (the acoustics
    section and the hub's ISO column are blank for ECO), clear door width,
    fan count, lighting, occupancy sensor, fire class and certifications,
    installation time (the price guide says "on request"), and which plant
    builds it (the page says Częstochowa like the other booths; the list
    names no plant). Send the figures and they go into `soloEcoPage.specs`
    and `src/data/products.ts`.

53. **Solo ECO copy to read once.** Hero, overview, six features, two
    options and six FAQ answers were written from the list and translated
    into the nine other languages; the "difference to Solo Flex" answer
    compares the two models on the list's figures. Tell us if the
    positioning ("entry model", "kept simple") is not how you sell it.

### Assets and accounts (earlier items 14–17)

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

### Planned pages referenced by the workbook (18–19)

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

### Google Business Profile checklist (earlier version — superseded by section I below)

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

### Flags from the earlier translation passes (20–25)

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

### FR/DE/EN drafts — findings the writers could not settle

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

## I. Google Business Profile (not code)

Update the listing before any of this goes live:

- Address: Gentseweg 309 A3, 9120 Beveren-Waas (the listing still shows
  Industriepark-West 75, Sint-Niklaas, category "Hoofdkantoor", no phone,
  no hours).
- Primary category **Fabrikant**; secondary "Akoestisch adviseur",
  "Kantoormeubelwinkel", "Bouwmaterialenwinkel".
- Phone +32 3 284 68 18; hours Mon–Fri 08:00–16:30, by appointment.
- 10+ photos (showroom, both plants, the booths, the panels; landscape, no
  text overlays); the products with prices, each linked to its page.
- A description that uses "akoestische panelen", "belcabines" and
  "fabrikant" and starts with the manufacturer sentence.
- Reply to the four existing reviews (about four years old), then send the
  review link to the last 20 customers — recency counts.
