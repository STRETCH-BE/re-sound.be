# Prices we still need

Rewritten 8 September 2026, after the 2026 booth price list went into the
database. The list answered most of the earlier questions: every booth
construction, colour, table, door, socket, accessory and fire-protection
article now has a price, and the order dialog charges exactly those. What is
left is below. Fill in the right-hand column and send it back in any form.
All prices **excluding VAT**, in euro, **ex works** — transport is always
quoted separately.

Where a price goes once you give it: the `articles` table in the Supabase
dashboard (`docs/database.md`, "Changing a price or an option"). No deploy is
needed; the site reads it within the hour.

---

## A. Installation — 9 prices, or one rule

The list says "delivery and installation: optional, quoted separately", so
installation is **on request** on every product today. Any order with
installation ticked arrives without a final amount.

| Product | Your installation price (excl. VAT) |
|---|---|
| Solo ECO | |
| Solo Flex | |
| Solo Stand | |
| Duo Work | |
| Duo Flex | |
| Modular 4 | |
| Modular XL — base module | |
| Modular XL — per extra 90 cm element | |
| Interior (per set, or a flat visit fee?) | |

If it is one rule ("x % of the booth price" or "a flat fee per visit plus y
per booth"), say the rule instead and we build it in.

The earlier figures (€ 865 for Solo Flex, € 2 990 for Modular XL) were
derived from the old guide's installation-inclusive prices, whose € 2 740
base turned out to be the Solo ECO price. They are not on the 2026 list and
were retired.

---

## B. Add-ons the product pages advertise that are not on the list

The three booth pages describe add-ons in their own words. The 2026 list
prices a different set (Moving-Kit, monitor bracket, Ethernet, balance stool,
sofa, fire protection, desks, segments). The page add-ons below have no
article on the list, so the dialog offers them **on request**. Either give a
price, or tell us which list article they are, or say they should come off
the page.

| Page | Add-on on the page | Possibly the same as | Your answer |
|---|---|---|---|
| Solo Flex | Electric sit-stand desk | included: the Solo Flex table is 73/103 cm sitting or standing | |
| Solo Flex | Monitor arm | RS-SF-OMB Monitor bracket, € 156,25 | |
| Solo Flex | Cable management upgrade | — | |
| Solo Flex | Above-desk shelf | — | |
| Solo Flex | Boosted ventilation | — | |
| Solo Flex | Custom fabric panel | — | |
| Duo | Memory-preset desk | RS-DW-TW / TA Work desk, height adjustable, € 787,50 | |
| Duo | Monitor arms (single or dual) | — (no monitor bracket on Duo in the list) | |
| Duo | Wall-mounted display | — | |
| Duo | Cable management upgrade | — | |
| Duo | Integrated stools | RS-DW/DF-OBS Balance stool, € 193,75? | |
| Duo | Custom fabric panel | — | |
| Modular XL | Meeting table | — (the list delivers Modular XL without furniture) | |
| Modular XL | Wall-mounted display 55" / 65" / 75" | — | |
| Modular XL | Conferencing kit | — | |
| Modular XL | Cable management upgrade | — | |
| Modular XL | Wall whiteboard | — | |
| Modular XL | Custom fabric panel | — | |

For each: **per booth** (charged once per booth ordered) or **per item**?
We treat them as per booth.

---

## C. Panels and screens — 7 products with no price, 1 to confirm

Unchanged from the earlier list except Solid. The seven have no price
anywhere on the site and cannot be ordered online.

| Product | Format | Sold by | Your price (excl. VAT) |
|---|---|---|---|
| **Solid** | 1200 × 600 mm, 50 mm | per piece | the page has said "from € 407 per panel" since before this work; now catalogue article `WEB-SOLID-PIECE`, marked unconfirmed — confirm or correct |
| **rWood Groove** | 300 × 2400 / 2780 mm, 19 mm | per m² | |
| **rWood Micro** | custom, 8–19 mm | per m² | |
| **rWood Perf** | custom, 8–19 mm | per m² | |
| **rWood Panel** | 1220 × 2800 / 3050 mm, 12 / 19 mm | per m² | |
| **rPET Panel** | 1200 × 2750 mm, 12 / 18 / 24 mm | per m² | |
| **rPET Groove** | 600 / 1200 mm wide, 12 / 24 / 36 mm | per m² | |
| **rPET Flex Groove** | 1130 × 2880 mm, 9 mm | per m² | |

Three questions: does thickness change the price, does the finish, and is
there a minimum order? Per-m² ordering also needs a decision on whether panels
should be orderable online at all or only carry a price (see the earlier
version of this file: a price on the page is worth having for search on its
own).

---

## D. Questions the list itself raises

Also in `docs/needs-michael.md`, items 38–47.

| Question | Where it bites |
|---|---|
| The list is valid from **21 September 2026**; the site shows it now | every price |
| Modular XL: base module **seats 4** on the list, page copy says six | the page hero, in ten locales |
| Modular XL fire protection: is the base module **2 segments** (180 cm ÷ 90)? | the fire-protection line on every Modular XL order |
| Ethernet costs **€ 156,25 on Duo Work and € 143,75 on Duo Flex** — intended? | the Duo dialog |
| Sofa fabric codes are not fixed | sofa lines on orders |
| Solo Stand and Modular 4 have no page — want them? | two models that cannot be ordered (Solo ECO has a page since 8 September) |

---

## Already in the database — do not send again

Everything on the 2026 list: 7 booth models, 152 articles, of which 35 priced
options. Plus Interior € 387 per set and Divide € 1 238 per piece from the
site. The supplier cross-reference is stored too, invisible to the site.
