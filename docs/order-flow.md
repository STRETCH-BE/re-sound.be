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
| Another EU country | business with a valid EU VAT number issued by the delivery country | 0 % | reverse charge, Art. 138 and 196 EU VAT Directive |
| Another EU country | private person, or business without a valid number | 23 % | Polish VAT |
| Outside the EU | anyone | 0 % | export |

The VAT number is checked twice: the format against the per-country pattern,
then against the European Commission's VIES service
(`src/lib/order/vies.ts`). A number VIES rejects is treated as invalid and the
order is taxed at 23 %. If VIES cannot be reached, the format decides and the
order e-mail says the number still has to be verified by hand.

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
HTML-escaping of every buyer-supplied string in the e-mails, and `GET` refused.

## Configuration

| Variable | Purpose |
|---|---|
| `POWER_AUTOMATE_WEBHOOK_URL` | already used by the contact and lead forms; the order e-mails go through the same flow |
| `ORDER_EMAIL` | optional; where orders are sent. Defaults to `info@re-sound.be` |

If the webhook is missing or fails, the buyer still gets their reference and is
told to contact `info@re-sound.be` quoting it, and the failure is logged — an
order is never silently dropped, but **the webhook must be configured in
production**.

## Changing a price or an option

1. Price of a product: `src/data/products.ts` (`fromPrice`) **and**
   `src/lib/order/catalogue.ts` (`unitPriceExclVat`) — they are checked against
   each other.
2. Price of an option: `src/lib/order/catalogue.ts`. `priceExclVat: null` means
   "on request".
3. A new orderable product: add an entry to `ORDERABLE` and drop
   `<OrderButton slug="…" namespace="…" />` into its hero.
4. The VAT rate or the country list: `src/lib/order/vat.ts`.
