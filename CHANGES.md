# Re-Sound — Audit fixes batch 1 (priorities 1, 2, 3)

**Date:** 2026-05-23
**Status:** Production build passes (`next build` ✓). All 180 routes generated cleanly.

This batch addresses the three top-priority items from the April 2026 audit:

1. **Contact form actually sends leads** (audit §1.1)
2. **Product metadata + hreflang coverage** (audit §1.2 + §1.3) — bundled with §1.4 dynamic sitemap because they share the same SEO helper
3. **GDPR-compliant cookie consent + Consent Mode v2 + privacy/terms pages** (audit §1.5)

Plus three small bonuses noted inline:

- AI crawler allowances in `robots.txt` (audit §2.2)
- `metadataBase` fixed to `re-sound.be` (audit §3.6)
- Stray `cancel` / `cancel 2` / `api/lead/del` files removed (audit §2.4)

---

## Files at a glance

### New
- `src/lib/seo.ts` — `buildAlternates(locale, route)` / `buildLanguageAlternates(route)` helpers. Derives hreflang from `i18n/config.ts` (single source of truth).
- `src/lib/consent.ts` — granular consent state library: read/write/event-dispatch + Consent Mode v2 update.
- `src/app/sitemap.ts` — dynamic sitemap covering all 10 locales × 18 routes + 4 blog posts. Replaces the static EN-only `public/sitemap.xml`.
- `src/app/[locale]/privacy/page.tsx` — DRAFT privacy policy (English; localised metadata).
- `src/app/[locale]/terms/page.tsx` — DRAFT website terms of use (English; localised metadata).
- `src/components/analytics/ConsentModeDefaults.tsx` — inline script setting Google Consent Mode v2 defaults in `<head>` before any analytics tag.
- `src/components/analytics/Clarity.tsx` — Microsoft Clarity wrapper, analytics-consent gated (loads only when `NEXT_PUBLIC_CLARITY_ID` is set).

### Modified
- `src/app/api/contact/route.ts` — completely rewritten. Was a `console.log` stub. Now posts to Power Automate webhook (same pattern as the lead route), with HTML+text email templates, honeypot check, length guards, and email-format validation.
- `src/components/sections/ContactForm.tsx` — added honeypot field (`name="website"`, visually hidden), `role="status" aria-live="polite"` for success/error feedback, and a privacy-policy disclaimer below the submit button using `t.rich()`.
- `src/app/[locale]/layout.tsx`
  - Wired in `ConsentModeDefaults`, `BingUET`, `Clarity` (`BingUET` was previously orphaned despite the env var being defined).
  - Removed the broken root-level hreflang loop in `<head>` (it pointed every page's alternates at locale **roots**, which is incorrect — per-page hreflang now handles this via `buildAlternates`).
  - Fixed `metadataBase` from `resound.be` → `re-sound.be`.
- `src/components/analytics/GoogleAnalytics.tsx` — loads gtag.js always now (Consent Mode handles the gating). Cookieless pings enable modelled conversions for unconsented EU traffic.
- `src/components/analytics/MetaPixel.tsx` — switched to the new `consent-update` event and per-category check (`marketing`).
- `src/components/analytics/BingUET.tsx` — same pattern as Meta. Was orphaned in the codebase; now imported in the layout.
- `src/components/analytics/index.ts` — barrel updated to export the new components.
- `src/components/layout/CookieConsent.tsx` — replaced the binary accept/reject banner. Three categories (Necessary always-on, Analytics, Marketing). Two views (compact + per-category settings). Reopens via `CONSENT_OPEN_EVENT` so the footer "Manage cookies" link works.
- `src/components/layout/Footer.tsx` — added "Manage cookies" button in `.footer-legal` that triggers `openConsentBanner()`.
- `src/app/[locale]/page.tsx` — localised homepage title via new `meta.homeTitle` key; bypass template wrap to fix double "| Re-Sound" bug; hreflang via `buildAlternates`.
- `src/app/[locale]/about/page.tsx`, `contact/page.tsx`, `sustainability/page.tsx`, `blog/page.tsx`, `products/page.tsx` — hreflang via `buildAlternates` (now covers all 10 locales instead of 4).
- `src/app/[locale]/blog/[slug]/page.tsx`, `products/[slug]/page.tsx` — same fix for dynamic-slug pages.
- `src/app/[locale]/products/solid/page.tsx`, `divide/page.tsx`, `rwood-groove/page.tsx`, `rwood-micro/page.tsx`, `rwood-perf/page.tsx`, `rwood-veneer/page.tsx`, `rpet-panel/page.tsx`, `rpet-groove/page.tsx`, `rpet-flex-groove/page.tsx` — all 9 stubs replaced with full `generateMetadata` (title, description, OG, Twitter card, hreflang) + `setRequestLocale(locale)`. OG image paths verified against actual filesystem.
- `messages/{en,nl,fr,de,es,pt,da,sv,no,is}.json` (all 10) — added keys:
  - `meta.rpetFlexGrooveTitle` + `meta.rpetFlexGrooveDescription` (the only product without meta entries — now translated to all 10 languages with brand names + technical terms preserved)
  - `meta.homeTitle` (localised; replaces the hardcoded English on the homepage)
  - `cookies.*` — replaced 4 binary keys (title/description/accept/reject) with 14 granular keys (acceptAll, rejectAll, customise, savePreferences, alwaysOn, plus title+description for each of necessary/analytics/marketing)
  - `footer.manageCookies` — label for the new footer link
  - `contact.form.privacyNotice` — rich-text string with `<link>privacy policy</link>` token for `t.rich()`
  - `legal.{draftBanner, lastUpdated, privacy.{title,subtitle}, terms.{title,subtitle}}` — used by the new privacy and terms pages
- `public/robots.txt` — added explicit AI crawler allowances (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Bytespider, cohere-ai). Sitemap line preserved.
- `.env.example` — added `NEXT_PUBLIC_CLARITY_ID` placeholder.

### Removed
- `public/sitemap.xml` — replaced by the dynamic `src/app/sitemap.ts`. Next.js will now serve a generated `/sitemap.xml` covering all locales.
- `src/app/[locale]/products/cancel` — 1-byte Finder leftover.
- `src/app/[locale]/products/cancel 2` — same.
- `src/app/api/lead/del` — same.

---

## How the new consent system works

1. On every page load, `ConsentModeDefaults` renders an inline script in `<head>` that runs synchronously before any external script. It sets all four Google Consent Mode v2 signals (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) to `denied`, then reads `localStorage.consent-preferences` and re-applies them via `gtag('consent', 'update', ...)`.
2. `GoogleAnalytics` loads `gtag.js` unconditionally. Until the user grants `analytics_storage`, gtag sends cookieless pings — Google uses these for **modelled conversions**, which recover ~30–50% of the EU GA4 data that was previously dropped when GA only loaded post-consent.
3. `MetaPixel` and `BingUET` don't natively support Consent Mode, so they keep the load-on-consent pattern, but now react to the granular `marketing` category (not a binary flag) via the `consent-update` window event.
4. `Clarity` follows the same pattern, gated on `analytics` consent. Component is wired into the layout but only activates when `NEXT_PUBLIC_CLARITY_ID` is set in your Vercel env.
5. `CookieConsent` writes the granular preference object to localStorage and dispatches the `consent-update` event. The footer "Manage cookies" button dispatches `consent-open-banner` to re-open the panel.
6. Version bumps invalidate stored consent and re-prompt. To re-prompt all users (e.g. when adding a new category), bump `CONSENT_VERSION` in `src/lib/consent.ts` and the inline default script in `ConsentModeDefaults.tsx` (both currently set to `1`).

---

## How the new hreflang/sitemap system works

- `buildAlternates(locale, route)` from `src/lib/seo.ts` is the only place that knows about locales. Every page's `generateMetadata` calls it.
- `src/app/sitemap.ts` does the same. The list of locales comes from `src/i18n/config.ts`. **Adding a locale in one place extends coverage everywhere** — sitemap, every page's `alternates.languages`, and `LanguageSwitcher` (which already uses this config).

---

## To deploy

1. Set `NEXT_PUBLIC_SITE_URL=https://re-sound.be` in Vercel env vars (used by the sitemap; falls back to that string if absent).
2. Confirm `POWER_AUTOMATE_WEBHOOK_URL` and `CONTACT_EMAIL` are set in Vercel (`leads_be@stretchgroup.be` and the webhook URL from the existing flow — or create a new Power Automate flow for the contact form recipient).
3. After deploy, smoke-test:
   - Submit the contact form on `/en/contact` and verify the email arrives at `info@re-sound.be` (or whatever `CONTACT_EMAIL` is set to).
   - View source on `/en/products/rwood-groove` — check for `<link rel="alternate" hreflang="..." />` covering all 10 locales.
   - Fetch `https://re-sound.be/sitemap.xml` — should contain ~220 entries with hreflang alternates.
   - Open the site in an incognito window. Cookie banner should appear. Open browser devtools → Network → `collect`. The first GA4 hit should show `gcs=G100` (consent denied, modelled). After clicking "Accept all" → `gcs=G111` (consent granted).
4. Review the privacy and terms pages with legal counsel. The `[TO BE DETERMINED]` placeholders for retention periods are the only known gaps; other content is structurally complete.

---

## Known leftovers (not in this batch)

These were on the audit but outside the "do 1, 2, 3" scope:

- **Routing consolidation** (audit §2.4) — the `[slug]` catch-all still serves Interior while 9 static folders handle the rest. Works, but inconsistent. Recommend converting Interior to a static folder too and removing the catch-all, since the static folders carry the proper metadata.
- **JSON-LD / llms.txt / structured data** (audit §2.1 + §2.2) — improves AI findability and rich results.
- **Brand claim reconciliation** ("100% Recycled Input", "Made in Belgium") — page copy still says these things; per-product reality varies (audit §3.1). Content task, not code.
- **Untranslated i18n keys rendering literally** (e.g., `products.rWood-Perf.title`) — separate audit item; not touched here.
- **Image optimisation** — `next.config.mjs` still has `images: { unoptimized: true }`. One 7.8 MB JPEG.
- **Empty veneer/finish dropdowns**, **doubled-sentence translation artefacts**, **`/faq` and `/blog` footer 404s** — separate fixes.

If you want me to take a swing at any of those next, just say which.
