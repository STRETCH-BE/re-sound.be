# Documents

One folder per product slug, one file per document id, so every product's
downloads block and the sitemap can be generated from `src/data/products.ts`:

```
public/documents/<product-slug>/<document-id>.pdf
```

Document ids (see `DocumentId` in `src/data/products.ts`):

| id                          | shown as (productPage.downloads.*) |
|-----------------------------|------------------------------------|
| datasheet                   | Product data sheet                 |
| installation-guide          | Installation guide (panels)        |
| installation-manual         | Installation manual (booths)       |
| acoustic-test-report        | Acoustic test report               |
| colour-finish-guide         | Colour & finish guide              |
| fire-certificate            | Fire certificate                   |
| sustainability-declaration  | Sustainability declaration         |
| warranty                    | Warranty certificate (booths)      |
| cad-drawing                 | CAD drawing (.dwg, lead-gated)     |

Run `node scripts/missing-documents.mjs` to regenerate
`docs/missing-documents.md` — the list of files referenced by product data
that are not in the repository yet.
