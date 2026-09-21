# Uniqueness gate

Every page of every locale must be its own page: its own title, description
and H1, and its own text. `scripts/uniqueness-check.mjs` enforces that on a
built site and is part of the release checks next to `scripts/seo-check.mjs`.

```
npm run build && npx next start -p 3999 &
npm run verify:unique                      # http://localhost:3999, threshold 0.3
node scripts/uniqueness-check.mjs https://re-sound.be --threshold 0.3 --out docs/uniqueness-check.txt
```

What it checks

- **Pages**: every sitemap URL, the same path under all ten locales (the
  Nordic locales are noindex and not in the sitemap, but they are pages), and
  every published editorial post of every locale (`content/blog/<locale>`).
  Paths that do not answer 200 for a locale are skipped.
- **Metadata**: within a locale no two pages may share a title, a meta
  description or an H1, and every page needs an H1.
- **Text**: the main content (`<main>`, or the body without header, nav and
  footer) is cut into 8-word shingles. Shingles present on more than half of
  a locale's pages are site chrome (cookie banner, newsletter, footer claims)
  and are removed. Two pages of one locale fail when they share more than
  30 % of their remaining shingles (Jaccard). Two pages of different locales
  fail when they are more than 80 % identical (an untranslated copy).
- **Thin pages** (fewer than 60 own shingles) are warnings.

The report is written to `docs/uniqueness-check.txt`; the exit code is 1 on
any failure. Blog posts also pass a per-file validator before they are
committed (front matter, links against the route table, price tokens,
forbidden claims); translations of one topic share a `translationKey` and
reference each other as hreflang alternates, so they are alternates to
search engines, not duplicates.
