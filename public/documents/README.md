# Documents

One folder per product slug. Every document is offered on the product page's
"Downloads" block behind the lead form: the visitor leaves their details,
`/api/document` e-mails them a link to the file and forwards the lead to
leads@stretchgroup.be. No PDF is linked openly, none is in the sitemap, and
`/documents/*` is served with `X-Robots-Tag: noindex`.

```
public/documents/<product-slug>/re-sound-<product or family>-<document-id>-<locale>.pdf   (uploads, preferred)
public/documents/<product-slug>/<document-id>.pdf                                          (legacy name)
```

The card for a document appears only when a file exists. For each document
the site takes, in this order: the upload named for the page's locale
(`…-nl.pdf` on the Dutch page), the English upload (`…-en.pdf`), the legacy
file. The part between `re-sound-` and the document id is free: the product
(`re-sound-rwood-groove-datasheet-en.pdf`) or the family
(`re-sound-rwood-colour-finish-guide-en.pdf`, the same file in every rWood
folder). Resolution lives in `src/lib/documents.ts`; the list of documents per
product in `src/data/products.ts`.

Document ids (see `DocumentId` in `src/data/products.ts`):

| id                          | shown as (productPage.downloads.*)                   |
|-----------------------------|------------------------------------------------------|
| datasheet                   | Product data sheet                                   |
| material-datasheet          | rPET Panel data sheet — on rPET Groove and rPET Flex Groove, which are cut from it (points at rpet-panel/) |
| installation-guide          | Installation guide (panels)                          |
| installation-manual         | Installation manual (booths)                         |
| acoustic-test-report        | Acoustic test report                                 |
| colour-finish-guide         | Colour & finish guide                                |
| fire-certificate            | Fire certificate                                     |
| sustainability-declaration  | Sustainability declaration                           |
| warranty                    | Warranty certificate (booths)                        |
| cad-drawing                 | CAD drawing (.dwg)                                   |

Adding a document: drop the PDF in the product's folder under the upload
name above; it is on the page after the next deploy (the file list is read at
build/request time on the server). Replacing one: upload the new file and
delete the old one — the site prefers the upload name over the legacy name,
so a leftover `datasheet.pdf` next to `re-sound-…-datasheet-en.pdf` is simply
ignored.

The flow itself (form, e-mail, fallback, analytics) is described in
`docs/documents.md`.

Run `node scripts/missing-documents.mjs` to regenerate
`docs/missing-documents.md` — the list of documents per product that have no
file yet.
