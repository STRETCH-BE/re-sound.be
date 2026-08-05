# STRETCH website + Client Portal — integrated codebase (9 Jul 2026)

This archive is your full codebase (identical to the `stretch_website-main 2`
copy you provided / GitHub main) **with the client portal fully integrated**,
now **including the ceiling designer** at `/portal/designer` (2026-07-09 entry
in CHANGES.md).

## What's inside vs. what's not

- ALL source code, messages (12 locales), config, docs, scripts — ready to
  `npm install` + deploy.
- `public/images/` is **excluded only to keep the download small**: the portal
  changes nothing in it. Keep the `public/images` folder you already have
  (it's in your GitHub repo). Everything else in `public/` IS included,
  including the updated `robots.txt`.
  (Note: the zip you uploaded was missing the whole `public/` folder — if your
  local copy also lacks it, restore it from the GitHub repository.)

## What the portal adds (full details: docs/PORTAL.md and CHANGES.md)

- `/portal` — client login, dashboard, live pricelist (per-market, EUR/PLN,
  search, print, CSV), admin page (Excel sync + client accounts).
- `/portal/designer` — the ABC Floorplan ceiling designer (measure → draw →
  seams → quote → order). Served ONLY to signed-in users via
  `/api/portal/designer` because it contains the foil price matrix — never
  put it in `public/`. Orders download files + open an email draft (no
  database yet, as agreed). Update workflow: `scripts/update-designer.md`.
- `supabase/schema.sql` — database schema with row-level security.
- `scripts/seed-pricebook.mjs` + `scripts/create-portal-admin.mjs` — CLI setup.
- Header / mobile menu / footer now link to the portal ("Client login").
- New deps in package.json: @supabase/supabase-js, @supabase/ssr, xlsx.

## Try it right now (demo mode, no setup)

```bash
npm install
npm run dev        # open http://localhost:3000/portal
```
Demo logins (shown on the login page): admin@stretch.be / stretch2026 (sees
everything + admin), demo@stretch.be (West Europe client),
klient@stretch.pl (East Europe client).

## Go live for real clients (~15 min)

Follow **docs/PORTAL.md**: create a free Supabase project → run
supabase/schema.sql → set the 3 env vars in Vercel → seed the pricelist from
your Alto Pricing System .xlsx → create your admin login → redeploy.

Margins and costs are never imported from the Excel — clients only ever see
their own markets' sales prices.
