/**
 * POST /api/document — a product document (datasheet, colour guide …)
 * requested through the lead form on a product page.
 *
 * What it does, in order:
 *   1. validates the lead (same fields and limits as /api/lead; honeypot
 *      `website` filled → 200 without doing anything, so a bot learns nothing);
 *   2. resolves the document with src/lib/documents.ts — only a (slug,
 *      documentId) pair that exists under public/documents is ever mailed;
 *   3. forwards the lead to leads@stretchgroup.be through the Power Automate
 *      webhook (the /api/lead payload shape, source "<product> product page",
 *      downloadedFile = the file name);
 *   4. e-mails the visitor a branded message in the page locale with a link to
 *      the file (src/lib/document-email.ts); the payload also carries
 *      documentUrl / documentName so the flow can attach the file one day.
 *
 * REQUEST — JSON body: the LeadFormData fields (companyName, firstName,
 * lastName, email, phone, position, companyType, website = honeypot) plus
 *   slug: string        product slug, e.g. 'rwood-groove'
 *   documentId: string  'datasheet' | 'colour-finish-guide' | 'material-datasheet' …
 *   locale?: string     site locale; anything unknown → 'en'
 *
 * RESPONSES
 *   200 { success: true, emailSent, leadForwarded, file?, fileName? }
 *       `file` (the document's root-relative URL) is included only when the
 *       visitor's e-mail could NOT be sent, so the page can offer a direct
 *       download instead of leaving them empty-handed.
 *   400 { error }  bad JSON, missing field, invalid e-mail, field too long
 *   403 { error }  cross-origin
 *   404 { error }  unknown product, document, or no file on disk
 *   429 { error }  rate limited (src/lib/rate-limit.ts)
 */
import { NextRequest, NextResponse } from 'next/server';

import { SITE_URL } from '@/config/site';
import { defaultLocale, locales } from '@/i18n/config';
import { documentEmail } from '@/lib/document-email';
import { findDocument } from '@/lib/documents';
import {
  EMAIL_RE,
  MAX_FIELD_LENGTH,
  escHtml,
  generateEmailHTML,
  generatePlainText,
  leadTimestamp,
  type LeadData,
} from '@/lib/lead-email';
import { loadMessages, makeTranslator } from '@/lib/order/messages';
import { clientKey, rateLimited, sameOrigin } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEAD_TO = 'leads@stretchgroup.be';

/** productPage.downloads.<key> per document id — the label the visitor saw on the card. */
const LABEL_KEY: Record<string, string> = {
  datasheet: 'productDataSheet',
  'material-datasheet': 'materialDatasheet',
  'installation-guide': 'installationGuide',
  'installation-manual': 'installationManual',
  'acoustic-test-report': 'acousticTestReport',
  'colour-finish-guide': 'colourFinishGuide',
  'fire-certificate': 'fireCertificate',
  'sustainability-declaration': 'sustainabilityDeclaration',
  warranty: 'warranty',
  'cad-drawing': 'cadDrawing',
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

async function postToWebhook(payload: Record<string, unknown>, what: string): Promise<boolean> {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(`[document] POWER_AUTOMATE_WEBHOOK_URL is not set — ${what} not sent`);
    return false;
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) console.error(`[document] webhook failed for ${what}:`, response.status);
    return response.ok;
  } catch (error) {
    console.error(`[document] webhook error for ${what}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!sameOrigin(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (rateLimited(clientKey(request))) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    let raw: Record<string, unknown>;
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!raw || typeof raw !== 'object') return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    // Honeypot — a filled `website` field means a bot; answer as if all went well.
    if (str(raw.website).length > 0) return NextResponse.json({ success: true, emailSent: true, leadForwarded: false });

    const companyName = str(raw.companyName);
    const firstName = str(raw.firstName);
    const lastName = str(raw.lastName);
    const email = str(raw.email);
    const phone = str(raw.phone);
    const position = str(raw.position);
    const companyType = str(raw.companyType);
    const slug = str(raw.slug);
    const documentId = str(raw.documentId);
    const requested = str(raw.locale).toLowerCase();
    const locale = (locales as readonly string[]).includes(requested) ? requested : defaultLocale;

    if (!companyName || !firstName || !lastName || !email || !slug || !documentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    if ([companyName, firstName, lastName, email, phone, position, companyType, slug, documentId].some((v) => v.length > MAX_FIELD_LENGTH)) {
      return NextResponse.json({ error: 'Field too long' }, { status: 400 });
    }

    const found = findDocument(slug, documentId, locale);
    if (!found) return NextResponse.json({ error: 'Unknown document' }, { status: 404 });
    const { product, document } = found;
    const fileName = document.file.split('/').pop() ?? 'document.pdf';
    const url = `${SITE_URL}${document.file}`;
    const pageUrl = `${SITE_URL}/${locale}/products/${product.slug}`;

    const [localeMessages, englishMessages] = await Promise.all([loadMessages(locale), loadMessages('en')]);
    const t = makeTranslator(localeMessages, englishMessages);
    const documentLabel = t(`productPage.downloads.${LABEL_KEY[documentId] ?? 'productDataSheet'}`);

    // 1. The lead, to Re-Sound — the /api/lead template and payload shape.
    const source = `${product.name} product page`;
    const lead: LeadData = { companyName, firstName, lastName, email, phone, position, companyType, source, downloadedFile: fileName };
    const escaped: LeadData = {
      ...lead,
      companyName: escHtml(companyName),
      firstName: escHtml(firstName),
      lastName: escHtml(lastName),
      email: escHtml(email),
      phone: escHtml(phone),
      position: escHtml(position),
      companyType: escHtml(companyType),
      source: escHtml(source),
      downloadedFile: escHtml(fileName),
    };
    const timestamp = leadTimestamp(new Date());
    const leadForwarded = await postToWebhook(
      {
        to: LEAD_TO,
        subject: `New Lead: ${firstName} ${lastName} from ${companyName} (${documentLabel}, ${product.name})`,
        body: generateEmailHTML(escaped, timestamp),
        text: generatePlainText(lead, timestamp),
        isHtml: true,
        source,
        downloadedFile: fileName,
        locale,
        leadData: {
          firstName,
          lastName,
          email,
          phone,
          companyName,
          position,
          companyType,
          source,
          downloadedFile: fileName,
          documentUrl: url,
          extraFields: null,
          timestamp,
        },
      },
      'the lead'
    );

    // 2. The document, to the visitor, in the page locale.
    const mail = documentEmail({ firstName, productName: product.name, documentLabel, url, fileName, pageUrl }, t);
    const emailSent = await postToWebhook(
      {
        to: email,
        subject: mail.subject,
        body: mail.html,
        text: mail.text,
        isHtml: true,
        source,
        locale,
        documentUrl: url,
        documentName: fileName,
      },
      'the document e-mail'
    );

    console.log('[document]', product.slug, documentId, fileName, 'locale', locale, 'lead forwarded', leadForwarded, 'e-mail sent', emailSent);

    return NextResponse.json({
      success: true,
      emailSent,
      leadForwarded,
      ...(emailSent ? {} : { file: document.file, fileName }),
    });
  } catch (error) {
    console.error('[document] error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
