# STRETCH — Marketing Website

Production marketing site for **STRETCH** (Stretch Productions BV) — a Belgian manufacturer of seamless stretch ceilings and walls. Built with Next.js 14 (App Router), TypeScript and `next-intl`, deployed on Vercel.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure environment
cp .env.example .env.local      # then fill in what you need — all vars are optional

# 3. Run the dev server
npm run dev                      # http://localhost:3000  (redirects to /en)
```

The site runs with **zero configuration**: with no env vars, analytics no-op and form submissions are logged to the server console instead of emailed. Add env vars to enable real behaviour (see below).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` — must pass clean |

---

## Environment variables

Every variable is **optional**. See `.env.example` for the full annotated list. Summary:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Absolute production URL (canonical, sitemap, OG, JSON-LD `@id`). |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 ID (`G-…`). Consent-gated. |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID. Consent-gated. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Pixel ID. Off by default per brief. |
| `NEXT_PUBLIC_BING_UET_ID` | Bing UET tag ID. Off by default per brief. |
| `LEAD_DESTINATION` | Address all form submissions are delivered to. |
| `RESEND_API_KEY` + `LEAD_FROM_EMAIL` | Deliver leads via [Resend](https://resend.com). |
| `LEAD_WEBHOOK_URL` | Or POST each lead as JSON to a webhook. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` / `SMTP_FROM` | Or send via SMTP (Nodemailer). |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client portal auth + database ([Supabase](https://supabase.com)). Without them `/portal` runs in demo mode. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — powers the portal's admin API (pricelist sync, account management). |

**Lead delivery** auto-selects a method at runtime, in priority order: Resend → webhook → SMTP → log-only. The first one whose env vars are present wins. `resend` and `nodemailer` are *optional* dependencies, imported dynamically only when configured.

---

## Client portal

`/portal` is a login-gated client area serving the **trade pricelist**, kept
in sync with the *Alto Pricing System* Excel: upload the workbook on
`/portal/admin` (or run `node scripts/seed-pricebook.mjs <file.xlsx>`) and
every client sees current prices for **their markets only** — enforced by
Postgres row-level security. Margins/costs are never imported. With no
Supabase env vars the portal runs in a zero-config **demo mode** (sample
data + demo logins, listed on the login page). Full setup & data model:
**[`docs/PORTAL.md`](docs/PORTAL.md)**.

---

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel — the framework preset (Next.js) is detected automatically. No build-command changes needed.
3. Set environment variables in **Project → Settings → Environment Variables** (at minimum `NEXT_PUBLIC_SITE_URL`; add analytics + a lead-delivery method for production).
4. Deploy.

### Post-deploy checklist

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain (no trailing slash).
- [ ] Configure a lead-delivery method (`RESEND_API_KEY` + `LEAD_FROM_EMAIL` recommended) and verify the sender domain.
- [ ] Submit each form once and confirm the email arrives at `LEAD_DESTINATION`.
- [ ] Add `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_CLARITY_ID`; accept cookies and confirm tags fire.
- [ ] Verify `/sitemap.xml` and `/robots.txt` resolve on the live domain.
- [ ] Submit the sitemap in Google Search Console.
- [ ] Spot-check OG images: `/api/og` and e.g. `/api/og/polyester-stretch-ceiling`.
- [ ] Replace placeholder imagery (see "Image placeholders" below).
- [ ] Replace drafted copy flagged in `CHANGES.md` (reviews, FAQ, blog, legal pages).
- [ ] Run Lighthouse and confirm targets (Perf ≥ 90 / A11y ≥ 95 / BP ≥ 95 / SEO 100).

---

## Project structure

```
src/
  app/
    layout.tsx              # Root <html lang="en-BE"> + font variable + global CSS
    globals.css             # Design tokens (CSS vars) + utility classes
    fonts.ts                # Self-hosted Archivo (variable: weight + width axes)
    sitemap.ts              # Dynamic sitemap (locales × routes + hreflang)
    [locale]/
      layout.tsx            # Locale provider, header/footer chrome, analytics, modal
      page.tsx              # Home (10 sections)
      products/             # Solutions overview + 5 product routes (one folder each)
      contact/  partners/  installer-training/  inspiration/
      samples/  faq/  blog/  blog/[slug]/  about/  privacy/  terms/
      not-found.tsx
    api/
      lead/    contact/     # Form endpoints → graceful multi-method delivery
      og/  og/[slug]/       # Dynamic Open Graph images (next/og, edge)
  components/
    layout/                 # Header, Footer, MobileMenu, CookieConsent, LanguageSwitcher
    sections/               # Page section sets (home/*, SolutionPage, forms, grids)
    analytics/              # GA4, Clarity, Meta, Bing, consent mode, scroll tracker
    seo/                    # JsonLd renderer
    ui/                     # Reveal, Eyebrow, Placeholder, ModalButton
    LeadGenModal.tsx        # The conversion modal (7 form types) + provider/hook
  lib/                      # site-config, products, content, forms-config, seo,
                            # structured-data, analytics, consent, email, deliver, page-meta
  i18n/                     # config (single source of truth), navigation, request
  messages/en.json         # Reusable UI/meta/forms/cookies copy
public/                     # robots.txt, llms.txt, favicons, og logo
```

---

## Key conventions

- **Internationalisation.** English-only at launch, but `next-intl` is fully wired. Adding `nl` / `fr` / `de` is a one-line change to `locales` in `src/i18n/config.ts` plus a message file — middleware, `<html lang>`, hreflang, sitemap and OG locales all derive from there. Long-form page body copy currently lives in the section components in English (earmarked for extraction when more locales are added).
- **Styling.** `styled-jsx` + a token-driven `globals.css`. No Tailwind. Colours, type, spacing and breakpoints are CSS variables.
- **Images.** Only `next/image` is used for real photography. During the build, visual slots render as branded diagonal-hatch **placeholders** (`components/ui/Placeholder`) — search for `Placeholder` to find every slot to fill.
- **Navigation.** Always import `Link` from `@/i18n/navigation` (never `next/link`) so locale prefixing is automatic.
- **Structured data.** Organization, WebSite, LocalBusiness, Product, BreadcrumbList, FAQPage, Article and Course JSON-LD are emitted via `components/seo/JsonLd`. No ratings/prices are fabricated.
- **Consent.** A custom banner writes consent to `localStorage`; Google Consent Mode v2 defaults to denied and analytics load only after acceptance.

---

## Notes

- Building locally fetches the Archivo font from Google at build time. On Vercel this is automatic; in a network-restricted environment the build step that downloads fonts will fail (the rest of the app is unaffected). `npm run typecheck` does not require network.
- See **`CHANGES.md`** for build decisions, documented deviations from the original brief, and the list of drafted content to review before launch.
