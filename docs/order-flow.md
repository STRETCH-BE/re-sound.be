# Online ordering — how it works

Added 6 September 2026; moved to the database catalogue on 8 September 2026.
Buyers configure and order a product straight from its page. Every price
comes from the catalogue (Supabase, else the committed snapshot — see
`docs/database.md`), every order is stored in the database before the e-mails
go out, and the e-mails list the article numbers the factory orders by. There
is no payment gateway: the order is a binding order request that Re-Sound
confirms by e-mail. Since 12 September 2026 transport within mainland Europe
and installation by Re-Sound are priced lines for the booths sold online (see
"Transport and installation lines" below).

## What a buyer sees

1. **Order online** on the product page (Solo ECO, Solo Flex, Duo, Modular XL, Interior,
   Divide). Products without a confirmed price keep "Request a quote".
2. **Step 1 — Options.** Quantity plus the options for that product. Prices
   that Re-Sound has confirmed are added to a running total; options without a
   confirmed price are marked "On request" and are quoted before the order is
   accepted. Only the chooseable categories are shown: transport and the
   installation of extra elements are `auto` categories that the site adds by
   rule, never offered as a choice.
3. **Step 2 — Your details.** Business or private, company name and VAT number,
   contact name, e-mail, phone, delivery address and country, free-text notes.
   The VAT line in the total updates as the buyer types.
4. **Step 3 — Review.** Line items (article code, label, `qty × unit price`
   and the line total, so a total never reads as a unit price; fire
   protection says where its `booths × segments` quantity comes from, the
   installation of extra elements where its `booths × extra elements` comes
   from), the transport line and, with installation on Modular XL, the
   extra-element installation line as ordinary lines, delivery address, links
   to the terms and the privacy policy, and a checkbox confirming this is a
   binding order — Re-Sound confirms it by e-mail, including anything still
   priced on request.
5. **Confirmation.** The order reference assigned by the database
   (`RS-2026-0001`, sequential per year), a copy by e-mail to the buyer, and
   the order to `info@re-sound.be`. When the database could not confirm the
   order the reference has the older shape `RS-YYMMDD-XXXX`, so the two are
   told apart at a glance.

The product page is static for up to an hour (ISR) while the route prices
from the live catalogue, so the submit carries the amounts the buyer saw
(`expected.netCents` / `grossCents`). When the route's net differs it answers
`409 price_changed` with a fresh catalogue slice **before** anything is stored
or mailed; the dialog swaps in the slice, shows the new total and asks the
buyer to tick the consent box again. An article that went inactive since the
page was rendered answers `400 selection_outdated` the same way, and the
dialog repairs the configuration (choices that still exist stay, the rest
default) and returns to step 1. Only the VAT part of the total may still
differ at confirmation time (VIES answering differently at submit than while
typing); the confirmation screen then says which way it went.

## Transport and installation lines

Rules 7 and 8 in `src/lib/catalogue/types.ts`, implemented by
`canonicalSelection()` in `src/lib/catalogue/select.ts`; the figures come from
Michael (12 September 2026) and live only in the catalogue.

- The five booths sold online (Solo ECO, Solo Flex, Duo Work, Duo Flex,
  Modular XL) have two transport articles in the `auto` category `transport`:
  `WEB-<PRODUCT>-TRANSPORT-EU`, a flat rate per unit within mainland Europe,
  and `WEB-<PRODUCT>-TRANSPORT-XX`, on request. The dialog and the route pick
  one by delivery country: every country of the order form is mainland Europe
  except the islands in `NON_MAINLAND_EUROPE` — GB, XI (Northern Ireland),
  IE, MT, CY and IS — which get the on-request line (and so the on-request
  note and `hasOnRequestItems`). An empty or unknown country counts as
  mainland; before the buyer touches the country the form is on Belgium.
  Products without transport articles (panels; Solo Stand and Modular 4 are
  not sold online) get no transport line and keep the older "never included"
  note.
- Installation by Re-Sound stays a chooseable option (`WEB-…-INST`, category
  `installation`). On Modular XL, choosing it together with an extension
  (`RS-MX-AS1/2/3`) adds `WEB-MODULAR-XL-INST-EXT` from the `auto` category
  `installation_extension`, charged `quantity × extension segments` (rule 7:
  AS1 = 1, AS2 = 2, AS3 = 3). Without installation, or without an extension,
  the line is absent.
- The selection is kept in canonical form: the dialog re-runs
  `canonicalSelection(selection, slice, country)` after every change (model
  switch, option toggle, delivery country, the fresh slice after a 409); the
  route runs it again on what it receives, with the country it validated, and
  prices, stores and e-mails that canonical form. Every auto line the client
  sent is dropped first, so a stale or tampered transport line never sets the
  price; a mismatch with the amount the buyer consented to still answers
  `409 price_changed`. Since 12 September the 409 body also carries
  `selection` — the canonical codes the route priced — and the dialog adopts
  them (through the same canonicalisation) before asking for consent again,
  so a dialog whose rules lag behind the route's converges after one round
  trip.
- Deploy window: a product-page tab opened **before** the 12 September deploy
  runs the old dialog bundle, which never adds the transport line and ignores
  `selection`; its submit answers `409 price_changed` every time (nothing is
  stored or mailed) until the buyer reloads the page. Later deploys do not
  have this: the dialog now follows the route's `selection`.
- Under the totals, on the confirmation screen and in both e-mails a product
  with transport articles shows `order.summary.transportMainlandNote`
  ("Transport within mainland Europe is included at the flat rate per unit
  shown above. For the United Kingdom, Ireland, Malta, Cyprus and Iceland we
  quote transport when we confirm the order."); the others keep
  `order.summary.transportNote`.

All of this rests on four readings Michael has to confirm (prices excl. VAT,
per unit, the mainland definition above, "Solo" = Solo Flex) — listed in
`docs/needs-michael.md`.

## VAT

The goods ship from the plant in Częstochowa, so Poland is the country of
departure and Polish VAT rules decide the rate (`src/lib/order/vat.ts`):

| Delivery | Buyer | Rate | Wording on the order |
|---|---|---|---|
| Poland | anyone | 23 % | Polish VAT |
| Another EU country | business with a VIES-confirmed EU VAT number issued outside Poland | 0 % | reverse charge, Art. 138 EU VAT Directive |
| Another EU country | private person, or business without a valid number | 23 % | Polish VAT |
| Outside the EU | anyone | 0 % | export |

The VAT number is checked twice: the format against the per-country pattern,
then against the European Commission's VIES service
(`src/lib/order/vies.ts`). **Zero-rating requires a positive VIES answer.** A
number VIES rejects, and a number VIES could not answer for, are both invoiced
at 23 % — the buyer is told so in the dialog and in the order e-mail, and the
VAT is credited once the number is confirmed by hand. This is deliberate: an
unverified zero-rated supply leaves Re-Sound owing the VAT.

A VAT number issued by a country other than the delivery country still zero-rates,
because a business may be registered in one member state and take delivery in
another, but the order e-mail carries a **CHECK BY HAND** row so the mismatch is
seen before the invoice goes out.

Two things the code does not decide:

- **Proof of export/dispatch.** Zero-rating an intra-Community supply or an
  export is only valid with transport evidence on file. The order flow does not
  collect it; it comes with the shipment.
- **EU territories outside the VAT area** (Canary Islands, Ceuta and Melilla,
  the French overseas departments, Åland, Büsingen, Livigno, Mount Athos and
  the rest). The country list treats those postcodes as their member state, so
  an order to one is invoiced at 23 % and has to be corrected by hand.

The delivery-country list is closed: only the EU 27, Northern Ireland (XI) and
the named non-EU countries can be chosen. There is no "other country" option,
because a country the rules cannot classify cannot be priced.

## Prices

Every amount the route charges comes from the catalogue (`getCatalogue()` in
`src/lib/catalogue/load.ts`: the database when it answers within 4 s, the
committed `src/data/catalogue.snapshot.json` otherwise). Nothing is priced
from code or copy.

The request carries a `selection`: `{ productId, quantity, articles: string[] }`
— the product and the article codes the buyer picked (one per required
single-choice category such as construction, colour, door or socket; any
number from the multi-choice ones such as accessories and fire protection).
`validateSelection()` (`src/lib/catalogue/select.ts`) checks it against the
catalogue: unknown product or article, an article of another product, a
duplicate, a missing or doubled required category, a product without a page
(Solo Stand, Modular 4) or a quantity outside 1..`max_qty` all answer
`400 invalid_product`. Nothing is clamped or dropped silently: a tampered
selection is refused, not repaired.

The route then takes the canonical form of the selection
(`canonicalSelection()`, rule 8 — see "Transport and installation lines"),
checks that it still validates (it does unless the catalogue itself carries
two auto articles in one category, which answers `400 pricing_failed`), and
`priceSelection()` (`src/lib/catalogue/pricing.ts`) applies the rules
documented in `src/lib/catalogue/types.ts`: one line per article at its
catalogue price, line quantity = order quantity (× the booth's 0.9 m segments
for Modular XL fire protection, × the extension segments for the installation
of extra elements), credits negative, on-request articles (`price_cents`
null) without an amount and the order flagged `hasOnRequestItems`, included
articles (colour, door, socket …) as €0 lines so the factory gets their
article numbers. VAT is applied to the net exactly as before.

## How the money is protected

The browser computes the same totals only to show them. The API route
(`src/app/api/order/route.ts`) ignores every amount in the request: it loads
the catalogue, validates the selection against it, prices every line from it,
resolves the VAT itself, stores the result and builds both e-mails from those
numbers. Amounts are handled in whole cents and formatted per locale with
`Intl.NumberFormat` (two decimals unless the amount is a whole euro; never
rounded).

Also on the route: honeypot field, required consent, per-address rate limit
(5 orders per 10 minutes), field-length limits, control characters stripped,
HTML-escaping of every buyer-supplied string in the e-mails, a same-origin
check, and `GET` refused.

Two limits worth knowing:

- **The rate limit is per warm instance.** It runs in memory, so a serverless
  platform that keeps several instances warm allows several buckets. It stops
  a simple loop, not a distributed one. Move it to a shared store if abuse ever
  becomes real.
- **Delivery is confirmed only as far as the webhook.** A 2xx from Power
  Automate means the flow accepted the message, not that the mailbox received
  it. If orders ever go missing, check the flow's own run history first.

## What the route does with an order

In this order, after validation, pricing and VAT:

1. **Database first.** `placeOrder()` (`src/lib/db/orders.ts`) calls the
   `place_order()` function with the columns of `orders` and one row per
   priced line, the auto lines included (`article_code`, `category_key`,
   `description`, `price_type`, `qty`, `unit_price_cents`, `line_total_cents`,
   `note` — "4 segments x 1" on a per-segment line, "2 extra elements x 1" on
   the extra-element installation line). The function assigns
   the reference from a sequence. The call has one 4 s deadline and never
   throws: any failure returns null and is logged once per distinct reason,
   with addresses redacted.
   - `idempotency_key` = sha256 of e-mail + selection (article codes sorted)
     + gross + the sanitised customer block (name, company, VAT number,
     address, notes) + the UTC hour, so a double click or a retry after a
     timeout stores one order, while the same configuration for another
     address, or an hour later, is a new one. A row that already existed
     when the request arrived is flagged `replayed` in the response and the
     internal e-mail says DUPLICATE SUBMISSION.
   - `placeOrder()` answers `stored`, `refused` (the database answered and
     rolled back: the order is not in the table) or `unknown` (no usable
     answer: deadline, network, gateway 5xx — a late commit is possible). A
     transport failure, and the duplicate-key race inside `place_order()`
     (23505), are retried once with a fresh deadline; the key makes that
     safe.
   - `client_hash` = sha256 of the client address; the address itself is
     never stored. `config` is the sanitised selection in canonical form
     (auto lines included), never the raw body.
   - `vat_number_status`: `valid` / `invalid` (VIES or format) / `unverified`
     (VIES silent) / `not_eligible` (not checked: private buyer, or delivery
     inside Poland); empty when no number was given.
2. **E-mails second**, both from the same numbers, sent together. Every line
   shows its article code, the label in the buyer's language (`lineLabel()`
   from the catalogue `labels`, English for the internal copy), quantity,
   unit price and line total; included articles read "Included", on-request
   ones "On request", credits are negative. A **Model** row gives the product
   and the base article code, and Modular XL adds the **segment count**. The
   VAT rows, the CHECK BY HAND row and the reference are unchanged; the
   transport note is the mainland one for a product with transport articles,
   the older one otherwise.
3. **`mark_order_mailed()`** records on the stored row which e-mails went out.

**When the database did not confirm the order** the route falls back to the
older `RS-YYMMDD-XXXX` reference and the internal e-mail says so in its first
line, in one of two ways: `NOT IN DATABASE` (subject suffix `- NOT IN
DATABASE`) when the database refused the order — enter it by hand; `NOT
CONFIRMED IN THE DATABASE` (suffix `- DATABASE NOT CONFIRMED`) when it did not
answer — look for the idempotency key printed in the e-mail (or the buyer's
address in the last hour) in the `orders` table before entering it by hand,
because the row may well be there. Every internal e-mail also carries a
**Priced from** row (`database` or `snapshot`, with the read time) and the
stored `config` keeps the same under `pricedFrom`, so an order priced from
the snapshot during an outage is recognisable later. **The order exists when
it is in the database or the internal e-mail was delivered.** Only when both
failed does the route answer `502 not_delivered` and the dialog tell the
buyer nothing was registered. The buyer's own copy failing is never fatal.

The response on success:

```json
{ "success": true, "reference": "RS-2026-0007", "stored": true, "replayed": false,
  "emailSent": true, "confirmationSent": true,
  "totals": { "netCents": 855000, "vatCents": 196650, "grossCents": 1051650,
              "vatRate": 0.23, "vatMode": "domestic", "hasOnRequestItems": false } }
```

`stored` says whether the row was confirmed; the dialog reconciles its own
total against `totals` (the net cannot differ — see `409 price_changed`
above — so a different gross is the VAT treatment).

## Configuration

| Variable | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | the catalogue and `place_order()`; server-side only (`src/lib/db/supabase.ts` and `src/lib/catalogue/load.ts` start with `import 'server-only'`, so a client import fails the build). The older `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` names are still read as a fallback (`docs/database.md`) |
| `SUPABASE_SERVICE_ROLE_KEY` | optional; used instead of the anon key when set. Never `NEXT_PUBLIC_` |
| `POWER_AUTOMATE_WEBHOOK_URL` | already used by the contact and lead forms; the order e-mails go through the same flow |
| `ORDER_EMAIL` | optional; where orders are sent. Defaults to `info@re-sound.be` |

Without the Supabase variables the site prices from the snapshot and orders
are e-mail-only (every internal e-mail then says NOT CONFIRMED IN THE
DATABASE, with the reason `SUPABASE_URL / SUPABASE_ANON_KEY not set`). Without the
webhook, orders are still stored but nobody is mailed; the `orders` table
shows them with `internal_email_sent` false.

`GET /api/health/catalogue` answers `{ source, configured, products,
articles, priceList: { id, validFrom }, loadedAt }` with `Cache-Control:
no-store` — no prices, no keys. After a deploy, `"source": "database"` is the
proof the site reaches Supabase; `"snapshot"` with `"configured": true` means
the host did not answer in time, `"configured": false` that the variables are
missing.

The route answers with a machine-readable `error` on every failure
(`rate_limited`, `invalid_product`, `selection_outdated`, `invalid_country`,
`invalid_details`, `company_required`, `consent_required`, `pricing_failed`,
`price_changed` (409), `not_delivered`, `server_error`), which the dialog
turns into a translated message.

`POST /api/vat-check` verifies a VAT number on its own (used while the buyer
types) and answers `empty`, `format_invalid`, `not_eligible` (a Polish number),
`unverified` (VIES silent), `invalid` or `valid`.

## Changing a price or an option

Prices and options live in the database, not in code: see "Changing a price
or an option" in `docs/database.md` (Supabase dashboard, `articles` table; the
order dialog reads the change within a minute, the pages within an hour).

1. A new orderable product: give it a `website_slug` in `products` and drop
   `<OrderButton />` into the page's hero.
2. The VAT rate or the country list: `src/lib/order/vat.ts`.
3. The e-mail wording: `messages/<locale>.json` under `order.email` and
   `order.summary`, in all ten locales.

Two things worth doing on the database side (not done from the sandbox,
which cannot reach Supabase): set `SUPABASE_SERVICE_ROLE_KEY` in production
and revoke `execute` on `place_order()` / `mark_order_mailed()` from `anon`,
so a leaked anon key cannot insert orders past the route's checks; and, if
gap-free numbering matters, rewrite `place_order()` with
`insert … on conflict (idempotency_key) do nothing` so the concurrent race no
longer burns a sequence value (the route already retries it).
