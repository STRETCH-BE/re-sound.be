# STRETCH Client Portal

A login-gated client area at **`/portal`** where clients see their **trade
pricelist** — always in sync with the *Alto Pricing System* Excel — with room
to grow (documents, order history are staged on the dashboard).

---

## How it works

```
Alto Pricing System.xlsx ──(admin upload / CLI)──▶ Supabase Postgres ──▶ /portal/pricelist
        │                                              │
        │  Only the client-safe PriceBook columns      │  Row-level security:
        │  (Category, Code, Product, Unit, Market,     │  each account sees ONLY
        │  Price EUR, Price PLN) are ever read.        │  its assigned markets.
        │  Margin % and cost build-up NEVER leave      │
        │  the Excel file.                             ▼
        └──────────────────────────────────── portal pages (Next.js, styled to site)
```

- **Excel stays the master.** Update prices in the workbook, upload it on
  `/portal/admin` (or run the CLI script) — every client instantly sees the
  new prices. The sync reports added/changed/removed rows.
- **Per-client market visibility** (an explicit business decision): a client
  granted `West Europe` can never query `USA` or `Key account` rows — this is
  enforced by Postgres row-level security, not just UI code.
- **Two roles.** `client` (sees pricelist for assigned markets) and `admin`
  (sees everything + admin page: pricelist sync, account management).
- **Zero-config demo mode.** Without Supabase env vars the whole portal runs
  on bundled sample data with demo logins (listed on the login page). Demo
  mode is a preview feature — do **not** treat it as private.

## Pages

| Route | What it is |
| --- | --- |
| `/portal/login` | Login (split brand panel + form; lists demo accounts in demo mode) |
| `/portal` | Dashboard — pricelist tile (live) + documents & orders (staged) |
| `/portal/pricelist` | Category tabs, search, market filter, EUR/PLN switch, print, CSV export |
| `/portal/admin` | Admins only — Excel upload sync + client-account manager |

All portal routes are `noindex` and disallowed in `robots.txt`.

## Going live (≈ 15 minutes)

1. **Create a Supabase project** (free tier is fine): https://supabase.com →
   New project. Pick the EU (Frankfurt) region.
2. **Create the tables**: Supabase → SQL Editor → paste the contents of
   [`supabase/schema.sql`](../supabase/schema.sql) → Run.
3. **Set the env vars** (Vercel → Project → Settings → Environment Variables,
   and locally in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL` — Settings → API → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings → API → `anon public`
   - `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → `service_role` (server-only secret)
4. **Load the pricelist**:
   ```bash
   node scripts/seed-pricebook.mjs "path/to/Alto Pricing System.xlsx"
   ```
5. **Create your admin account**:
   ```bash
   node scripts/create-portal-admin.mjs michael@stretchplafonds.be "ChooseAStrongPassword" "STRETCH HQ"
   ```
6. **Redeploy** (so the env vars take effect), sign in at `/portal/login`,
   and create client accounts from `/portal/admin` (e-mail + temporary
   password + markets).

From then on, updating prices = save the Excel → upload it on
`/portal/admin`. Done.

## Updating the pricelist

- **Portal (recommended):** `/portal/admin` → *Pricelist sync* → choose the
  workbook → Sync. You get a report: rows added / price changes / removed /
  skipped (e.g. rows with a missing Price EUR are listed by name).
- **CLI:** `node scripts/seed-pricebook.mjs <file.xlsx>` does the same from a
  terminal.
- Rows are keyed on **Category + Product + Market** — renaming a product in
  the Excel therefore shows up as `removed + added`, which is expected.

## Account & market model

`portal_users` (one row per login):

| Field | Meaning |
| --- | --- |
| `role` | `client` or `admin` |
| `markets` | Price groups this account sees, e.g. `{"West Europe","Standard","Tier: Export"}` |
| `all_markets` | `true` → sees every price group (admins are always all-markets) |
| `active` | `false` → account keeps existing but cannot use the portal |

Price groups present in the PriceBook: `East Europe`, `West Europe`, `USA`,
`UAE`, `Key account`, `Producers`, `Standard` (foil cut-to-length + profile
accessories), `Tier: Budget` / `Tier: Mid` / `Tier: Export` (PVC rolls).
A typical client gets their region **plus** `Standard` and one rolls tier.

## Security notes

- The database never contains margins or costs — the sync **does not read**
  those columns, so they cannot leak.
- Market visibility is enforced with Postgres RLS using the caller's own JWT;
  the browser only ever receives rows the account is allowed to see.
- Writes require the `service_role` key, which exists only server-side and is
  used strictly after an admin-session check.
- Demo mode (no Supabase env) is intentionally public — configure Supabase
  before announcing the portal to clients.

## Extending the platform

The dashboard already stages the next data sources (documents, orders). To
add one: create a table + RLS policy in Supabase mirroring `pricebook`'s
pattern, a data helper in `src/lib/portal/`, and a page under
`src/app/[locale]/portal/(app)/`. The session/auth plumbing is shared.
