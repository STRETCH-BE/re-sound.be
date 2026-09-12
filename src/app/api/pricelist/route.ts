/**
 * POST /api/pricelist — the e-mail-gated booth price list PDF.
 *
 * The PDFs are generated at build time by scripts/build-price-list-pdf.mjs
 * from the catalogue snapshot and src/data/products.ts (prebuild, after the
 * snapshot refresh) and imported here base64-encoded from
 * src/data/generated/booth-price-list.json — no filesystem access, no PDF
 * library at request time, and the figures can never drift from the guide
 * page because both render the same data.
 *
 * REQUEST — JSON body
 *   {
 *     firstName: string;   required, 1–500 characters
 *     lastName:  string;   required, 1–500 characters
 *     email:     string;   required, must match /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *     company:   string;   required, 1–500 characters
 *     locale?:   string;   'en' | 'nl' | 'fr' | 'de' — anything else serves 'en'
 *     phone?:    string;   optional, ≤ 500 characters
 *     website?:  string;   HONEYPOT — never render this field; when filled,
 *                          the lead is dropped silently and the PDF is still
 *                          returned so a bot learns nothing
 *   }
 *
 * RESPONSES
 *   200  application/pdf — the PDF bytes for the locale
 *        Content-Disposition: attachment; filename="re-sound-booth-price-list-<locale>.pdf"
 *        Cache-Control: private, no-store
 *        X-Pricelist-Locale: <locale actually served>
 *        X-Pricelist-Valid-From: <ISO date the price list applies from>
 *   400  application/json { error: string } — bad JSON, missing field,
 *        invalid e-mail address or a field over the length cap
 *   405  empty, Allow: POST — GET (and every other method)
 *   500  application/json { error: string } — unexpected failure
 *
 * SIDE EFFECT — the lead is forwarded to the Power Automate webhook
 * (POWER_AUTOMATE_WEBHOOK_URL) with the /api/lead payload shape (to, subject,
 * body = HTML, text = plain text, leadData) plus isHtml: true,
 * source: 'Booth price list download' and downloadedFile:
 * 'booth-price-list-<locale>.pdf'. A missing webhook logs a warning and a
 * failing one logs an error; the PDF is returned either way.
 *
 * CLIENT EXAMPLE
 *   const res = await fetch('/api/pricelist', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ firstName, lastName, email, company, locale }),
 *   });
 *   if (!res.ok) { const { error } = await res.json(); … }
 *   const url = URL.createObjectURL(await res.blob());
 *   // <a href={url} download="re-sound-booth-price-list-nl.pdf"> or window.open(url)
 */
import { NextRequest, NextResponse } from 'next/server';

import { clientKey, rateLimited, sameOrigin } from '@/lib/rate-limit';

import priceList from '@/data/generated/booth-price-list.json';
import {
  EMAIL_RE,
  MAX_FIELD_LENGTH,
  escHtml,
  generateEmailHTML,
  generatePlainText,
  leadTimestamp,
  type LeadData,
} from '@/lib/lead-email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = ['en', 'nl', 'fr', 'de'] as const;
type PriceListLocale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: PriceListLocale = 'en';
const SOURCE = 'Booth price list download';
const LEAD_TO = 'leads@stretchgroup.be';

interface PricelistRequest {
  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;
  company?: unknown;
  locale?: unknown;
  phone?: unknown;
  website?: unknown;
}

const pdfCache = new Map<PriceListLocale, ArrayBuffer>();

/**
 * Decoded once per locale per process. A standalone ArrayBuffer is a valid
 * BodyInit; a Node Buffer may sit in a shared pool, which the type rejects.
 */
function pdfBytes(locale: PriceListLocale): ArrayBuffer {
  let bytes = pdfCache.get(locale);
  if (!bytes) {
    const decoded = Buffer.from(priceList.files[locale], 'base64');
    bytes = new ArrayBuffer(decoded.byteLength);
    new Uint8Array(bytes).set(decoded);
    pdfCache.set(locale, bytes);
  }
  return bytes;
}

function pickLocale(value: unknown): PriceListLocale {
  const v = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return (LOCALES as readonly string[]).includes(v) ? (v as PriceListLocale) : DEFAULT_LOCALE;
}

function downloadedFileFor(locale: PriceListLocale): string {
  return `booth-price-list-${locale}.pdf`;
}

function pdfResponse(locale: PriceListLocale, leadForwarded = false): NextResponse {
  const bytes = pdfBytes(locale);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      // "1" when the lead reached the Power Automate flow, "0" otherwise
      // (webhook unset or failing, honeypot) — the gate skips its lead
      // event on "0" so GA4 never counts a lead the inbox did not get.
      'X-Lead-Forwarded': leadForwarded ? '1' : '0',
      'Content-Type': 'application/pdf',
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': `attachment; filename="re-sound-booth-price-list-${locale}.pdf"`,
      'Cache-Control': 'private, no-store',
      'X-Pricelist-Locale': locale,
      'X-Pricelist-Valid-From': String(priceList.validFrom ?? ''),
    },
  });
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (rateLimited(clientKey(request))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    let raw: PricelistRequest;
    try {
      raw = (await request.json()) as PricelistRequest;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const locale = pickLocale(raw.locale);
    const downloadedFile = downloadedFileFor(locale);

    // Honeypot — same posture as /api/lead and /api/contact: a filled
    // `website` field means a bot. Serve the PDF without forwarding a lead.
    if (str(raw.website).length > 0) {
      return pdfResponse(locale);
    }

    const firstName = str(raw.firstName);
    const lastName = str(raw.lastName);
    const email = str(raw.email);
    const companyName = str(raw.company);
    const phone = str(raw.phone);

    if (!companyName || !firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    if ([companyName, firstName, lastName, email, phone].some((v) => v.length > MAX_FIELD_LENGTH)) {
      return NextResponse.json({ error: 'Field too long' }, { status: 400 });
    }

    const lead: LeadData = {
      companyName,
      firstName,
      lastName,
      email,
      phone,
      position: '',
      companyType: '',
      source: SOURCE,
      downloadedFile,
    };
    // Escape every user-controlled field once, up front — the HTML template
    // interpolates these directly. The plain-text body uses the raw values.
    const escaped: LeadData = {
      ...lead,
      companyName: escHtml(companyName),
      firstName: escHtml(firstName),
      lastName: escHtml(lastName),
      email: escHtml(email),
      phone: escHtml(phone),
    };

    const timestamp = leadTimestamp(new Date());
    const htmlBody = generateEmailHTML(escaped, timestamp);
    const textBody = generatePlainText(lead, timestamp);

    const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
    let emailSent = false;

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: LEAD_TO,
            subject: `New Lead: ${firstName} ${lastName} from ${companyName} (booth price list)`,
            // `body` holds the HTML — Power Automate's "Send an email (V2)"
            // action with Is HTML = Yes should map its Body input to this field.
            // `text` is the plain-text alternative if a non-HTML flow is used.
            body: htmlBody,
            text: textBody,
            isHtml: true,
            source: SOURCE,
            downloadedFile,
            locale,
            // Individual fields for Power Automate flexibility — same shape as /api/lead.
            leadData: {
              firstName,
              lastName,
              email,
              phone,
              companyName,
              position: '',
              companyType: '',
              source: SOURCE,
              downloadedFile,
              extraFields: null,
              timestamp,
            },
          }),
        });
        emailSent = response.ok;
        if (!response.ok) {
          console.error('[pricelist] Power Automate webhook failed:', response.status);
        }
      } catch (webhookError) {
        console.error('[pricelist] Failed to call Power Automate webhook:', webhookError);
      }
    } else {
      console.warn('[pricelist] POWER_AUTOMATE_WEBHOOK_URL is not set — lead not forwarded, PDF served anyway');
    }

    console.log('=== NEW LEAD (price list) ===');
    console.log('Name:', firstName, lastName);
    console.log('Company:', companyName);
    console.log('Email:', email);
    console.log('Locale:', locale);
    console.log('Downloaded:', downloadedFile);
    console.log('Email sent:', emailSent);
    console.log('=============================');

    return pdfResponse(locale, emailSent);
  } catch (error) {
    console.error('[pricelist] Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: 'POST' } });
}
