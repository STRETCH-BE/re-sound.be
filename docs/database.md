# The database — catalogue, prices and orders

Added 8 September 2026. The site has its own Supabase project, next to the
STRETCH one:

| | |
|---|---|
| Project | `re-sound.be` — ref `toroqgofzsanxcisdbkn`, region eu-central-1 (Frankfurt) |
| Organisation | STRETCH-BE's Org (the same one as the stretch-website project) |
| Dashboard | https://supabase.com/dashboard/project/toroqgofzsanxcisdbkn |
| Schema | `supabase/migrations/0001_catalogue_and_orders.sql`, `0002_place_order_conflict_safe.sql` (both applied) |
| Data | `supabase/seed/booths-2026.sql` (applied) — generated from the 2026 booth price list |

Two things live there: **the catalogue** (every product, option and price the
site shows or charges) and **the orders** (one row per order placed online,
with a frozen copy of its lines). The stretch-website keeps its portal orders
the same way; this mirrors that pattern with the site's own tables.

---

## What the site reads and writes

| Table | What it holds | Who may read | Who may write |
|---|---|---|---|
| `price_lists` | one row per published list: name, currency, valid-from date, commercial terms, packaging table, contacts | anyone with the anon key | Michael, in the dashboard |
| `products` | the 7 booth models from the list plus Interior, Divide and Solid (priced from the site, not the list); which product page sells each (`website_slug`) | anyone | Michael |
| `categories` | the 12 configurator sections (construction, colours, table, door, socket, accessories, fire protection, installation) and whether each is single- or multi-choice | anyone | Michael |
| `articles` | one row per article number: description, price in cents, price type, defaults, translations | anyone | Michael |
| `supplier_articles` | **internal** — purchase prices and margins from the supplier cross-reference | nobody but the service role | never from the site |
| `orders` | one row per order: buyer, delivery address, VAT treatment, totals, status, whether the e-mails went out | nobody but the service role | the site, through `place_order()` |
| `order_lines` | the lines of each order as they were shown to the buyer, with article codes | nobody but the service role | the site, through `place_order()` |

Row-level security is on for every table. The anon key can read the four
catalogue tables and nothing else. Orders are written by the database function
`place_order()`, which the site calls with the anon key: it assigns the
reference `RS-2026-0001, 0002 …` from a sequence and writes the lines in the
same transaction. The same submission sent twice (a retry after a timeout)
becomes one order, not two.

**The repository is public.** The workbook and anything from
`supplier_articles` must never be committed; `.gitignore` refuses both.

---

## How a price reaches a page

```
Supabase (source of truth)
   │  getCatalogue()  — 60 s in-memory cache, 4 s timeout
   ▼
src/lib/catalogue/load.ts ──fallback──▶ src/data/catalogue.snapshot.json (committed)
   │
   ├─ product pages: hero "from" price, the order dialog's options and prices
   ├─ range hub tables: "from" column
   ├─ JSON-LD Offers (what Google reads)
   ├─ booth price guide
   └─ /api/order: the amounts an order is priced at
```

The snapshot is a copy of the catalogue that ships with the code, so the site
builds and renders even when the database is unreachable. `npm run build`
refreshes it from the database first when the environment variables are set
and otherwise keeps the committed copy. Product, hub and guide pages
regenerate at most once an hour (ISR), so an edit in the dashboard is live on
the pages within the hour and in the order dialog on the next page load.

`GET /api/health/catalogue` says which source the running site is using and
how many products and articles it sees. No prices, no secrets.

### Prices inside sentences

Copy that mentions a price does not carry a figure. It carries a token, filled
in from the catalogue when the page renders:

| Token | Renders as |
|---|---|
| `{{price:solo-flex}}` | the lowest base price of the models sold from that page — "€ 4.118,75" in Dutch, "€4,118.75" in English |
| `{{price:product:duo-flex}}` | the lowest base price of one product |
| `{{price:article:RS-MX-AS1}}` | one article's price |

They work in the FAQ answers (`content/faq/*.json`), in the blog posts
(`content/blog/**`, body and front matter) and are resolved by
`src/lib/catalogue/tokens.ts`. The guide's intro and the Interior meta
description use ICU arguments instead (`{soloFlex}`, `{modularXl}`,
`{fromPrice}`) because `messages/*.json` strings are ICU messages. Either
way: editing a price in the dashboard changes every sentence that quotes it.

---

## Changing a price or an option

Everything below is done in the Supabase dashboard, **Table editor**. No
deploy is needed.

| Want to … | Do |
|---|---|
| Change a price | `articles` → find the row by `code` → edit `price_cents` (integer cents: € 4 118,75 = 411875). Negative for a credit. Empty = on request. |
| Take an option off the site | `articles` → set `active` to false. Never delete a row: old orders refer to it. |
| Add an option | `articles` → insert a row with the next article code, its `product_id`, `category_key`, `description`, `price_cents`, `price_type` (`base`, `included`, `option` or `credit`) and a `sort` value. |
| Change which choice is pre-selected | `articles` → `is_default` (one per product and single-choice category). |
| Sell a model from a product page | `products` → set `website_slug` to the page (`solo-eco`, `solo-flex`, `duo`, `modular-xl`, `interior`, `divide`, `solid`). Solo Stand and Modular 4 are in the catalogue but have no page yet, so they carry no slug. |
| Change the installation price | `articles` → the `WEB-…-INST` row of that product → `price_cents`. It is on request today. |
| Translate a label | `articles.labels` / `categories.labels`: a JSON object keyed by locale, e.g. `{"nl": "Gesloten achterwand", "fr": "Paroi arrière pleine"}`. A missing locale falls back to the English `description`. Every article on the 2026 list is translated into the nine other site languages already; the source of those translations is `content/catalogue-labels.json` (keyed by the English text, so a new list that keeps the descriptions keeps the translations). |
| Price a page add-on | The three booth pages advertise add-ons that are not on the 2026 list (wall-mounted display, whiteboard, cable management …). They are in `articles` as `WEB-<model>-<addon>` rows in the "Page add-ons" group, on request. Give them a `price_cents`, or set `active` false to stop offering them. Two are inactive already because the list covers them (the Solo Flex sit-stand table, the Duo desk). |

Prices are read again within a minute by the order dialog and within an hour
by the pages.

---

## Importing a new price list

When a new workbook arrives (same sheet layout as the 2026 one):

```bash
node scripts/db/price-list-to-sql.mjs ~/Downloads/resound_booths_price_list_2027.xlsx \
     --out supabase/seed --internal ~/re-sound-internal
```

The script refuses to write anything if its own totals do not match the
totals printed on the workbook (article count, priced-option count, base and
option sales totals). It produces:

- `supabase/seed/<list>.sql` — the public catalogue. Run it in the dashboard
  (**SQL editor**). Every statement is an upsert: existing article codes are
  updated in place, new ones added. Rows that vanished from the workbook are
  **not** deleted; set them inactive by hand.
- `~/re-sound-internal/supplier-<year>.sql` — purchase prices and margins.
  Run it in the SQL editor too, and keep the file out of the repository.

The importer also reads `content/catalogue-labels.json` (translations) and
the page add-ons from `messages/*.json`, so the seed and the snapshot carry
them too. New English descriptions on a new list have no translation until
the file gains them: `node scripts/db/labels-to-sql.mjs` turns the file into
`supabase/seed/catalogue-labels.sql` to apply in the SQL editor.

Then commit the public seed and the refreshed `src/data/catalogue.snapshot.json`
(`npm run catalogue:snapshot` regenerates it from the database).

---

## Orders

Every order placed on the site is one row in `orders` and its lines in
`order_lines`, written before the e-mails go out. What the buyer saw is what
is stored; a later price change never rewrites an old order.

| Column | Meaning |
|---|---|
| `reference` | `RS-2026-0001`, sequential per year |
| `status` | `received` → `confirmed` → `in_production` → `shipped`, or `cancelled`. Michael moves it in the dashboard. |
| `config` | the exact selection submitted: product, quantity, article codes |
| `vat_mode`, `vat_rate`, `net_cents`, `vat_cents`, `gross_cents` | the VAT treatment and totals as priced by the server |
| `vat_number_status` | `valid` (VIES confirmed), `invalid`, `unverified` (VIES did not answer), `not_eligible` |
| `has_on_request_items` | at least one line without a price — the total is not final |
| `internal_email_sent`, `customer_email_sent` | which of the two e-mails went out; an order with `internal_email_sent` false was stored but not mailed and needs a look |
| `internal_note` | free text for the office, never mailed |
| `client_hash` | a hash of the buyer's connection, for abuse triage; the raw address is never stored |

A quick view of open orders in the SQL editor:

```sql
select reference, created_at::date, status, company_name, email, country,
       gross_cents / 100.0 as gross_eur, has_on_request_items, internal_email_sent
from orders
where status = 'received'
order by created_at desc;
```

If the database cannot be reached when an order is placed, the site still
e-mails the order (with the older `RS-YYMMDD-XXXX` reference) and the e-mail
says in its first line whether the database refused the order (not stored)
or did not answer (not confirmed — check the `orders` table for the
idempotency key printed in the e-mail before entering it by hand, since a
late commit is possible). Only when both the database and the e-mail fail is
the buyer told the order did not arrive.

---

## Environment variables (Vercel)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | `https://toroqgofzsanxcisdbkn.supabase.co` |
| `SUPABASE_ANON_KEY` | the project's anon key (Dashboard → Project settings → API). Server-side only: no `NEXT_PUBLIC_` prefix, and the modules that read it (`src/lib/db/supabase.ts`, `src/lib/catalogue/load.ts`) start with `import 'server-only'`, so a client-component import fails the build instead of shipping the key. The older `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` names are still read as a fallback. |
| `SUPABASE_SERVICE_ROLE_KEY` | optional. When set, the server uses it instead of the anon key. Recommended in production, so `execute` on `place_order()` / `mark_order_mailed()` can be revoked from `anon`. Never `NEXT_PUBLIC_`. |
| `POWER_AUTOMATE_WEBHOOK_URL`, `ORDER_EMAIL` | unchanged, see `docs/order-flow.md` |

Without the two Supabase variables the site runs entirely on the committed
snapshot and orders are e-mail-only. `/api/health/catalogue` shows
`"source": "snapshot"` in that state and `"database"` once they are set.

---

## Things the price list left open

These are carried in `docs/needs-michael.md` as well:

- The list is **valid from 21 September 2026** (`price_lists.valid_from`). The
  site shows it now, as instructed.
- **Installation** is "optional, quoted separately" on the list, so every
  installation option is on request. The earlier figures (€ 865 for Solo Flex,
  € 2 990 for Modular XL) came from the booth guide, whose € 2 740 base price
  turns out to be the Solo ECO price; they are not in the 2026 list.
- **Modular XL fire protection** is priced per 0.9 m segment. The site counts
  the base module as two segments (it is 180 cm deep) plus the chosen
  extension; confirm that reading.
- **Ethernet on Duo Work vs Duo Flex** is priced differently on the list
  (€ 156,25 vs € 143,75), as the list itself flags.
- **Sofa fabric codes** are not fixed; the site orders the sofa article and
  leaves the fabric to the confirmation.
