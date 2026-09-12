# Legacy Wix URLs, redirects and the canonical host

Re-Sound moved from Wix to this Next.js site. Every URL the old site ever
served must keep answering — a dead backlink is lost link equity and a
crawler-visible 404. This document describes the five layers that guarantee
it, how to prove they work, and the domain/DNS decisions behind the
canonical host.

## The five layers

| Layer | Where | What |
|---|---|---|
| 1 | `legacy/wix-urls.txt` | The URL inventory (input to the gate). One URL per line; `# …` is provenance. |
| 2 | `redirects.mjs` → `next.config.mjs` `redirects()` | Explicit map: every known Wix URL → its live page, locale-preserving (308). |
| 3 | `redirects.mjs` (after the explicit rules) | Prefix catch-alls: `/product-page/*` → products, `/post/*` and `/blog-1/*` → blog, `/copy-of-*` → home, `/shop/*` → products. |
| 4 | `src/middleware.ts` + `src/lib/routes.ts` | Any page-like path that is not one of the site's routes 301s to the closest live index (products / guides / blog) or the locale home. Asset-like misses (a file extension) end on the locale home through the `[locale]` catch-all page; unknown `/api/*` paths through the `fallback` rewrite → `/api/legacy-fallback`. |
| 5 | `scripts/verify-redirects.mjs` | The gate: requests every inventory URL, follows ≤ 5 hops, fails on any 4xx/5xx or non-canonical final URL. |

Order matters: `next.config` redirects run before the filesystem, so there is
deliberately **no** blanket `/:path*` rule there — it would hijack the
site's own pages. The middleware is the only place that knows which paths
are real routes (`STATIC_ROUTES`, product/hub/guide/manufacturing slugs in
`src/lib/routes.ts`; keep it in step with `src/app/[locale]/*`).

Unknown blog slugs (`/nl/blog/oud-artikel`) are rendered on demand and
answer a permanent redirect to the blog index instead of a hard 404
(`dynamicParams = true` in `src/app/[locale]/blog/[slug]/page.tsx`).

## Running the gate

```bash
# against a local production build
npm run build && npx next start -p 3999 &
npm run verify:redirects -- --base http://localhost:3999 --host-header

# against a Vercel preview (Deployment Protection bypass from the project settings)
npm run verify:redirects -- --base https://<preview>.vercel.app --bypass <secret>

# production, after DNS — URLs exactly as listed, including www/http variants
npm run verify:redirects
```

`--host-header` sends the original `Host` (www.re-sound.be) to the local
server so the www → apex host rule is exercised; never use it against a
Vercel preview. The script exits non-zero on the first failure and prints
every chain, so it can run in CI once a production build is available in
the pipeline.

Add observed URLs from Search Console (Pages → Not found, and the Links
report) to the top of `legacy/wix-urls.txt` as they appear; each needs an
explicit rule in `redirects.mjs` if the prefix rules do not already send it
to the right page.

## Canonical host: `https://re-sound.be` (apex)

Every canonical tag, hreflang alternate, sitemap entry and JSON-LD `url`
already uses the apex (`NEXT_PUBLIC_SITE_URL`, default `https://re-sound.be`).
The old Wix site answered on both hosts, so both are kept alive:

1. **In code** — `redirects.mjs` carries a host rule: any request whose
   `Host` is `www.re-sound.be` gets a 308 to the same path on
   `https://re-sound.be`. This holds even before the platform-level redirect
   is configured.
2. **On Vercel** — both `re-sound.be` and `www.re-sound.be` are attached to
   the project. In *Project → Settings → Domains*, set `www.re-sound.be` to
   *Redirect to re-sound.be* (308) so the platform answers the redirect before
   a function is invoked.
3. **DNS** — the registrar is Combell, but the nameservers still point at Wix,
   i.e. the DNS zone is managed inside the Wix account. That is fragile: if
   the Wix subscription lapses, the zone disappears and the site (and the
   domain's e-mail records) go dark. Move the zone to Combell (or Vercel DNS):
   copy every existing record from the Wix zone first (MX, TXT/SPF, DKIM,
   verification records), then recreate the two Vercel records with the
   values Vercel shows under *Domains* (an `A` record for the apex and a
   `CNAME` for `www`), then switch the nameservers at Combell. Verify with the
   production `npm run verify:redirects` run once the change has propagated.

Item 2 and item 3 are account actions, not code — listed for Michael in
`docs/needs-michael.md`.
