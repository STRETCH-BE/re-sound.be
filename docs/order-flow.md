# Online ordering — how it works

Added 6 September 2026. Buyers can order the products whose price Re-Sound has
confirmed, straight from the product page. There is no payment gateway: the
order is a binding order request that Re-Sound confirms by e-mail with the
transport cost.

## What a buyer sees

1. **Order online** on the product page (Solo Flex, Duo, Modular XL, Interior,
   Divide). Products without a confirmed price keep "Request a quote".
2. **Step 1 — Options.** Quantity plus the options for that product. Prices
   that Re-Sound has confirmed are added to a running total; options without a
   confirmed price are marked "On request" and are quoted before the order is
   accepted.
3. **Step 2 — Your details.** Business or private, company name and VAT number,
   contact name, e-mail, phone, delivery address and country, free-text notes.
   The VAT line in the total updates as the buyer types.
4. **Step 3 — Review.** Line items, delivery address, links to the terms and
   the privacy policy, and a checkbox confirming this is a binding order.
5. **Confirmation.** An order reference (`RS-YYMMDD-XXXX`), a copy by e-mail to
   the buyer, and the order to `info@re-sound.be`.

Transport is stated as excluded at every step and in both e-mails.

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

Only prices confirmed by Re-Sound are used (`src/lib/order/catalogue.ts`):

| Product | Price excl. VAT | Options with a confirmed price |
|---|---|---|
| Solo Flex | € 2 740 per booth | installation + € 865 per booth |
| Duo | € 7 615 per booth | installation: on request |
| Modular XL | € 15 000 per pod | installation + € 2 990 per pod; extra 90 cm element + € 7 264 (installation included) |
| Interior | € 387 per set | installation: on request |
| Divide | € 1 238 per piece | — |

Every other add-on shown on the product pages is offered as "on request".
`getOrderable()` refuses to price a product whose catalogue price no longer
matches `src/data/products.ts`, so the two can never drift apart silently.

## How the money is protected

The browser computes the same totals only to show them. The API route
(`src/app/api/order/route.ts`) ignores every amount in the request: it re-reads
the catalogue, clamps quantities to the allowed range, drops unknown options,
recomputes the net, resolves the VAT itself and builds both e-mails from those
numbers. Amounts are handled in whole cents.

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

## Configuration

| Variable | Purpose |
|---|---|
| `POWER_AUTOMATE_WEBHOOK_URL` | already used by the contact and lead forms; the order e-mails go through the same flow |
| `ORDER_EMAIL` | optional; where orders are sent. Defaults to `info@re-sound.be` |

**Orders are not stored anywhere.** The e-mail to `info@re-sound.be` is the
only record, so if it cannot be delivered the API answers HTTP 502 and the
dialog tells the buyer the order did not reach Re-Sound and nothing has been
registered. The buyer is never shown a confirmation for an order that does not
exist. The buyer's own copy failing is not fatal: the order is accepted and the
confirmation says the copy could not be sent.

**The webhook must be configured in production**, or no order can be placed.

The route answers with a machine-readable `code` on every failure
(`rate_limited`, `invalid_product`, `invalid_country`, `invalid_details`,
`company_required`, `consent_required`, `pricing_failed`, `not_delivered`,
`server_error`), which the dialog turns into a translated message.

`POST /api/vat-check` verifies a VAT number on its own (used while the buyer
types) and answers `empty`, `format_invalid`, `not_eligible` (a Polish number),
`unverified` (VIES silent), `invalid` or `valid`.

## Changing a price or an option

1. Price of a product: `src/data/products.ts` (`fromPrice`) **and**
   `src/lib/order/catalogue.ts` (`unitPriceExclVat`) — they are checked against
   each other.
2. Price of an option: `src/lib/order/catalogue.ts`. `priceExclVat: null` means
   "on request".
3. A new orderable product: add an entry to `ORDERABLE` and drop
   `<OrderButton slug="…" namespace="…" />` into its hero.
4. The VAT rate or the country list: `src/lib/order/vat.ts`.
