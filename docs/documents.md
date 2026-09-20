# Product documents — the lead form and the e-mail

Added 20 September 2026. Every document on a product page (datasheet, colour
and finish guide, certificates …) is requested through the lead form and
delivered by e-mail. Nothing under `/documents` is linked openly any more.

## What a visitor sees

1. The "Downloads" block lists one card per document that has a file
   (`public/documents/README.md` explains the file names). The card says
   "PDF · sent by e-mail".
2. The card opens the lead form (company, name, e-mail, phone, role, company
   type, consent). The submit button reads "Send me the document".
3. On success the form is replaced by a confirmation: "Check your inbox — we
   have sent “Product data sheet” to name@company.com", with the note that it
   can take a minute and to look in the spam folder.
4. If the mail service does not answer, the same panel says so and offers a
   direct download link instead, so nobody leaves empty-handed.

## What happens behind it (`POST /api/document`)

`src/app/api/document/route.ts`, in this order:

1. Validates the lead like `/api/lead` (required fields, e-mail syntax, 500
   character cap, honeypot `website`, same-origin, 12 requests per minute per
   address).
2. Resolves the document with `src/lib/documents.ts` from the `slug` and
   `documentId` the card sent — only a document that exists on disk for that
   product is ever mailed, never a free path.
3. Forwards the lead to leads@stretchgroup.be through the Power Automate
   webhook (`POWER_AUTOMATE_WEBHOOK_URL`), with the `/api/lead` payload shape:
   `source` = "<product> product page", `downloadedFile` = the file name,
   `leadData.documentUrl` = the absolute URL.
4. Sends the visitor an e-mail in the page's language (`documentEmail.*` in
   `messages/<locale>.json`, English fallback) through the same webhook:
   `to` = the visitor's address, `subject` "Your Product data sheet for
   rWood Groove", a button linking to the file, the plain URL under it, the
   product-page link and the phone number. The payload also carries
   `documentUrl` and `documentName`.
5. Answers `{ success, emailSent, leadForwarded }`; when `emailSent` is false
   it adds `file` and `fileName` so the page can offer the direct download.

The flow sends whatever `to`, `subject` and `body` it receives (the order
confirmation e-mails already use it this way), so the visitor's copy needs no
change in Power Automate. The file travels as a link, not as an attachment:
attaching it would need an extra step in the flow (an HTTP GET on
`documentUrl`, then the attachment field of "Send an email (V2)"). The link
stays valid as long as the file is in the repository.

## Analytics

- `generate_lead` (source `document_request`) when the lead reached the
  webhook;
- `document_request` with `product`, `document` and `delivery` (`email` or
  `download`);
- enhanced-conversions user data and the Clarity lead tags as before.

## Crawling

`/documents/*` is served with `X-Robots-Tag: noindex` (`next.config.mjs`) and
is no longer in the sitemap. Google drops the PDFs it had indexed on its next
crawl of each file; robots.txt still allows the crawl so the header is seen.

## Files

| Where | What |
|---|---|
| `src/data/products.ts` | the documents each product offers (`documents`), `material-datasheet` for the rPET panels cut from the rPET Panel |
| `src/lib/documents.ts` | which file a document resolves to (upload name per locale, English, legacy) |
| `src/components/product/ProductDownloads.tsx` | the block (server) |
| `src/components/product/GatedDownloadButton.tsx` | the card and the request (client island) |
| `src/components/sections/LeadGenModal.tsx` | the form and the confirmation |
| `src/app/api/document/route.ts` | the route |
| `src/lib/document-email.ts` | the visitor's e-mail |
| `messages/*.json` | `leadModal.*`, `documentEmail.*`, `productPage.downloads.*` |
| `scripts/missing-documents.mjs` → `docs/missing-documents.md` | which documents still have no file |
