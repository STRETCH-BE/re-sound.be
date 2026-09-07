import { NextRequest, NextResponse } from 'next/server';

import { PRODUCTS } from '@/data/products';
import { productNamespace } from '@/lib/order/catalogue';
import { loadMessages, makeTranslator, type Translator } from '@/lib/order/messages';
import { formatCents, priceOrder, sanitiseSelection, type PricedOrder, type PricedLine } from '@/lib/order/pricing';
import {
  findCountry,
  isEuCountry,
  isVatNumberFormatValid,
  normaliseVatNumber,
  splitVatNumber,
  vatNumberCountryDiffers,
  SHIP_FROM_COUNTRY,
} from '@/lib/order/vat';
import { checkVatNumber, type ViesResult } from '@/lib/order/vies';
import { defaultLocale, locales, localeFullCodes, type Locale } from '@/i18n/config';

/**
 * Order endpoint.
 *
 * The browser sends what the buyer selected and typed; this route decides
 * everything that matters: it re-reads the catalogue, recomputes every amount,
 * resolves the VAT treatment (goods ship from Częstochowa, so Polish VAT rules
 * apply) and verifies the VAT number with VIES. Both e-mails are built from
 * those server-side numbers, never from the request body. There is no payment
 * step: Re-Sound confirms the order and adds transport, which is never
 * included in the listed prices.
 */

export const runtime = 'nodejs';

interface OrderRequest {
  locale?: string;
  selection?: unknown;
  customer?: {
    type?: string;
    companyName?: string;
    vatNumber?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    notes?: string;
  };
  consent?: boolean;
  /** Honeypot — the form never renders it */
  website?: string;
}

const MAX_FIELD = 200;
const MAX_NOTES = 2000;
/** Every control character (single-line fields). */
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
/** Control characters except newline and tab (the notes field keeps its shape). */
const CONTROL_KEEP_BREAKS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const esc = (s: string | undefined | null): string =>
  (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const clean = (value: unknown, max = MAX_FIELD): string =>
  typeof value === 'string' ? value.replace(CONTROL_CHARS, ' ').trim().slice(0, max) : '';

const cleanMultiline = (value: unknown, max = MAX_NOTES): string =>
  typeof value === 'string' ? value.replace(CONTROL_KEEP_BREAKS, ' ').trim().slice(0, max) : '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------------------------------------------------------------------------
// Rate limiting (best effort: per warm instance)
// ---------------------------------------------------------------------------

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/**
 * Client address for the rate limiter. `x-forwarded-for` is set by the
 * platform, but a client can prepend its own value, so the leftmost entry is
 * not trustworthy: prefer the platform's own fields and otherwise take the
 * last hop.
 */
function clientKey(request: NextRequest): string {
  const direct = (request as NextRequest & { ip?: string }).ip;
  if (direct) return direct;
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    Array.from(hits.keys()).forEach((key) => {
      const times = hits.get(key) ?? [];
      if (times.every((time: number) => now - time >= WINDOW_MS)) hits.delete(key);
    });
  }
  return recent.length > MAX_PER_WINDOW;
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function orderReference(now: Date): string {
  const stamp = now.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Array.from(
    { length: 4 },
    () => REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
  ).join('');
  return `RS-${stamp}-${random}`;
}

// ---------------------------------------------------------------------------
// Labels: built on the server from the locale's own message file
// ---------------------------------------------------------------------------

function lineLabel(line: PricedLine, slug: string, t: Translator): string {
  if (line.labelFrom === 'product') return PRODUCTS[slug]?.name ?? slug;
  if (line.labelFrom === 'order') return t(`order.options.${line.id}.label`);
  return t(`${productNamespace(slug)}.addons.${line.id}.title`);
}

interface RenderedLine {
  label: string;
  quantity: number;
  amount: string;
}

function renderLines(order: PricedOrder, t: Translator, localeTag: string): RenderedLine[] {
  return order.lines.map((line) => ({
    label: lineLabel(line, order.slug, t),
    quantity: line.quantity,
    amount: line.totalCents === null ? t('order.summary.onRequest') : formatCents(line.totalCents, localeTag),
  }));
}

interface Customer {
  type: 'company' | 'private';
  companyName: string;
  vatNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  countryName: string;
  notes: string;
}

interface EmailContext {
  reference: string;
  timestamp: string;
  order: PricedOrder;
  lines: RenderedLine[];
  customer: Customer;
  productName: string;
  vatLabel: string;
  vies: ViesResult;
  vatFormatValid: boolean;
  locale: string;
  localeTag: string;
}

const shell = (title: string, heading: string, subtitle: string, inner: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f5f5f5;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#197FC7 0%,#1565a0 100%);padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.5px;">${esc(heading)}</h1>
<p style="margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${esc(subtitle)}</p>
</td></tr>
${inner}
<tr><td style="background-color:#f8f9fa;padding:20px 40px;border-top:1px solid #eee;color:#999;font-size:12px;">
Re-Sound &middot; Gentseweg 309 A3, 9120 Beveren-Waas (BE) &middot; info@re-sound.be &middot; re-sound.be
</td></tr>
</table></td></tr></table></body></html>`;

const lineRows = (lines: RenderedLine[]) =>
  lines
    .map(
      (l) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;font-size:14px;">${esc(l.label)}</td>
<td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:14px;text-align:center;width:60px;">${l.quantity}&times;</td>
<td style="padding:10px 0;border-bottom:1px solid #eee;color:#333;font-size:14px;text-align:right;white-space:nowrap;">${esc(l.amount)}</td>
</tr>`
    )
    .join('');

function totalsRows(ctx: EmailContext, t: Translator): string {
  const { order, localeTag } = ctx;
  return `<tr><td colspan="2" style="padding:12px 0 4px;color:#666;font-size:14px;">${esc(t('order.summary.net'))}</td>
<td style="padding:12px 0 4px;text-align:right;color:#333;font-size:14px;white-space:nowrap;">${esc(formatCents(order.netCents, localeTag))}</td></tr>
<tr><td colspan="2" style="padding:4px 0;color:#666;font-size:14px;">${esc(ctx.vatLabel)}</td>
<td style="padding:4px 0;text-align:right;color:#333;font-size:14px;white-space:nowrap;">${esc(formatCents(order.vatCents, localeTag))}</td></tr>
<tr><td colspan="2" style="padding:10px 0 0;color:#0d3a5c;font-size:16px;font-weight:700;">${esc(t('order.summary.total'))}</td>
<td style="padding:10px 0 0;text-align:right;color:#0d3a5c;font-size:16px;font-weight:700;white-space:nowrap;">${esc(formatCents(order.grossCents, localeTag))}</td></tr>`;
}

function noticeBlock(text: string): string {
  return `<tr><td style="padding:16px 40px 0;">
<div style="background-color:#e8f4fc;border-left:3px solid #197FC7;padding:14px 18px;border-radius:4px;color:#0d3a5c;font-size:13px;line-height:1.6;">${esc(text)}</div>
</td></tr>`;
}

/** Copy for Re-Sound: everything needed to confirm and invoice the order. */
function internalEmail(ctx: EmailContext, t: Translator): { html: string; text: string } {
  const { customer, order, reference, vies, vatFormatValid } = ctx;
  // A number only needs a manual check when verifying it would have changed
  // the rate: an EU delivery outside Poland, with a non-Polish EU number that
  // is well formed. Anywhere else the order is already correct without it, so
  // flagging it would send Michael chasing nothing.
  const numberCountry = customer.vatNumber.slice(0, 2).toUpperCase();
  const verificationWouldMatter =
    vatFormatValid &&
    order.vatMode === 'domestic' &&
    customer.country !== SHIP_FROM_COUNTRY &&
    isEuCountry(customer.country) &&
    numberCountry !== SHIP_FROM_COUNTRY &&
    isEuCountry(numberCountry);
  const vatStatus = !customer.vatNumber
    ? '-'
    : vies.checked
      ? vies.valid
        ? `VALID (VIES${vies.name ? `: ${vies.name}` : ''})`
        : 'INVALID per VIES - charged 23 % Polish VAT'
      : verificationWouldMatter
        ? 'NOT VERIFIED (VIES unreachable) - format valid, CHECK BY HAND: if the number is good, credit the 23 % VAT'
        : `NOT VERIFIED (VIES unreachable) - format ${vatFormatValid ? 'valid' : 'invalid'}, no effect on this order`;

  const rows: Array<[string, string]> = [
    ['Reference', reference],
    ['Date', ctx.timestamp],
    ['Language', ctx.locale],
    ['Customer type', customer.type === 'company' ? 'Business' : 'Private person'],
    ['Company', customer.companyName || '-'],
    ['VAT number', customer.vatNumber || '-'],
    ['VAT check', vatStatus],
    ['Contact', `${customer.firstName} ${customer.lastName}`],
    ['E-mail', customer.email],
    ['Phone', customer.phone || '-'],
    [
      'Delivery',
      `${customer.street}, ${customer.postalCode} ${customer.city}, ${customer.countryName} (${customer.country})`,
    ],
    ['VAT treatment', `${ctx.vatLabel} (${order.vatMode})`],
  ];

  if (order.vatMode === 'reverse-charge' && vatNumberCountryDiffers(customer.country, customer.vatNumber.slice(0, 2))) {
    rows.push([
      'CHECK',
      'VAT number issued by a country other than the delivery country - prepare the intra-Community paperwork accordingly',
    ]);
  }

  const inner = `
<tr><td style="padding:24px 40px 0;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
${rows
  .map(
    ([label, value]) => `<tr>
<td width="140" style="padding:6px 0;color:#888;font-size:13px;vertical-align:top;">${esc(label)}</td>
<td style="padding:6px 0;color:#333;font-size:14px;">${esc(value)}</td></tr>`
  )
  .join('')}
</table></td></tr>
<tr><td style="padding:24px 40px 0;">
<h2 style="margin:0 0 12px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #197FC7;padding-bottom:8px;display:inline-block;">${esc(ctx.productName)}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${lineRows(ctx.lines)}${totalsRows(ctx, t)}</table>
</td></tr>
${noticeBlock(t('order.summary.transportNote'))}
${order.hasOnRequestItems ? noticeBlock(t('order.summary.onRequestNote')) : ''}
${
  customer.notes
    ? `<tr><td style="padding:20px 40px 0;">
<h2 style="margin:0 0 10px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Notes</h2>
<div style="background-color:#fafafa;border-left:3px solid #197FC7;padding:14px 18px;border-radius:4px;color:#333;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(customer.notes)}</div></td></tr>`
    : ''
}
<tr><td style="padding:28px 40px;"><a href="mailto:${esc(customer.email)}?subject=${encodeURIComponent(`Re-Sound order ${reference}`)}"
style="display:inline-block;background:#197FC7;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">Reply to ${esc(customer.firstName)} &rarr;</a></td></tr>`;

  const text = [
    `NEW ORDER - ${reference}`,
    '========================================',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    ctx.productName,
    ...ctx.lines.map((l) => `  ${l.quantity}x ${l.label} - ${l.amount}`),
    `  Net: ${formatCents(order.netCents, ctx.localeTag)}`,
    `  ${ctx.vatLabel}: ${formatCents(order.vatCents, ctx.localeTag)}`,
    `  Total: ${formatCents(order.grossCents, ctx.localeTag)}`,
    '',
    t('order.summary.transportNote'),
    order.hasOnRequestItems ? t('order.summary.onRequestNote') : '',
    customer.notes ? `\nNotes:\n${customer.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return { html: shell(`Order ${reference}`, t('order.email.internalHeading'), reference, inner), text };
}

/** Copy for the buyer, in the language they ordered in. */
function customerEmail(ctx: EmailContext, t: Translator): { html: string; text: string } {
  const { customer, order, reference } = ctx;
  const inner = `
<tr><td style="padding:28px 40px 0;">
<p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.7;">${esc(t('order.email.greeting', { name: customer.firstName }))}</p>
<p style="margin:0 0 8px;color:#333;font-size:15px;line-height:1.7;">${esc(t('order.email.intro'))}</p>
<p style="margin:0;color:#0d3a5c;font-size:15px;"><strong>${esc(t('order.email.referenceLabel'))}: ${esc(reference)}</strong></p>
</td></tr>
<tr><td style="padding:24px 40px 0;">
<h2 style="margin:0 0 12px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #197FC7;padding-bottom:8px;display:inline-block;">${esc(ctx.productName)}</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${lineRows(ctx.lines)}${totalsRows(ctx, t)}</table>
</td></tr>
${noticeBlock(t('order.summary.transportNote'))}
${order.hasOnRequestItems ? noticeBlock(t('order.summary.onRequestNote')) : ''}
${order.vatMode === 'reverse-charge' ? noticeBlock(t('order.vat.reverseChargeNote')) : ''}
${order.vatMode === 'export' ? noticeBlock(t('order.vat.exportNote')) : ''}
<tr><td style="padding:20px 40px 0;">
<h2 style="margin:0 0 10px;color:#333;font-size:13px;text-transform:uppercase;letter-spacing:1px;">${esc(t('order.email.deliveryHeading'))}</h2>
<p style="margin:0;color:#333;font-size:14px;line-height:1.6;">
${customer.companyName ? `${esc(customer.companyName)}<br>` : ''}${esc(`${customer.firstName} ${customer.lastName}`)}<br>
${esc(customer.street)}<br>${esc(`${customer.postalCode} ${customer.city}`)}<br>${esc(customer.countryName)}
</p></td></tr>
<tr><td style="padding:24px 40px 32px;">
<p style="margin:0;color:#666;font-size:14px;line-height:1.7;">${esc(t('order.email.nextSteps'))}</p>
</td></tr>`;

  const text = [
    t('order.email.greeting', { name: customer.firstName }),
    '',
    t('order.email.intro'),
    `${t('order.email.referenceLabel')}: ${reference}`,
    '',
    ctx.productName,
    ...ctx.lines.map((l) => `  ${l.quantity}x ${l.label} - ${l.amount}`),
    `  ${t('order.summary.net')}: ${formatCents(order.netCents, ctx.localeTag)}`,
    `  ${ctx.vatLabel}: ${formatCents(order.vatCents, ctx.localeTag)}`,
    `  ${t('order.summary.total')}: ${formatCents(order.grossCents, ctx.localeTag)}`,
    '',
    t('order.summary.transportNote'),
    order.hasOnRequestItems ? t('order.summary.onRequestNote') : '',
    '',
    t('order.email.nextSteps'),
  ]
    .filter(Boolean)
    .join('\n');

  return {
    html: shell(t('order.email.customerSubject', { reference }), t('order.email.customerHeading'), reference, inner),
    text,
  };
}

const MAIL_TIMEOUT_MS = 8000;

async function sendMail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('[order] POWER_AUTOMATE_WEBHOOK_URL not configured - e-mail not sent to', to);
    return false;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MAIL_TIMEOUT_MS);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body: html, text }),
      signal: controller.signal,
    });
    // Log the domain only: an order log is not the place for buyer addresses.
    const audience = to.includes('@') ? `…@${to.split('@')[1]}` : to;
    if (!response.ok) console.error('[order] webhook failed', response.status, 'for', audience);
    return response.ok;
  } catch (error) {
    console.error('[order] webhook error for', to.includes('@') ? `…@${to.split('@')[1]}` : to, error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequest;

    // Same-origin only: a binding order may not be placed by a third-party page
    // riding on a visitor's session.
    const origin = request.headers.get('origin');
    if (origin) {
      const host = request.headers.get('host');
      let originHost = '';
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = '';
      }
      if (!host || originHost !== host) {
        return NextResponse.json({ error: 'server_error' }, { status: 403 });
      }
    }

    // Honeypot: accept and drop.
    if (clean(body.website)) return NextResponse.json({ success: true, reference: null });

    if (rateLimited(clientKey(request))) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    const selection = sanitiseSelection(body.selection);
    if (!selection) return NextResponse.json({ error: 'invalid_product' }, { status: 400 });

    const raw = body.customer ?? {};
    const type = raw.type === 'company' ? 'company' : 'private';
    const countryCode = clean(raw.country, 8).toUpperCase();
    const country = findCountry(countryCode);
    if (!country) return NextResponse.json({ error: 'invalid_country' }, { status: 400 });

    const email = clean(raw.email);
    const firstName = clean(raw.firstName);
    const lastName = clean(raw.lastName);
    const street = clean(raw.street);
    const postalCode = clean(raw.postalCode, 20);
    const city = clean(raw.city);
    const companyName = clean(raw.companyName);
    const vatNumber = raw.vatNumber ? normaliseVatNumber(clean(raw.vatNumber, 20)) : '';

    if (!firstName || !lastName || !EMAIL_RE.test(email) || !street || !postalCode || !city) {
      return NextResponse.json({ error: 'invalid_details' }, { status: 400 });
    }
    if (type === 'company' && !companyName) {
      return NextResponse.json({ error: 'company_required' }, { status: 400 });
    }
    if (body.consent !== true) {
      return NextResponse.json({ error: 'consent_required' }, { status: 400 });
    }

    // VAT: format first, then VIES. An unreachable VIES falls back to the
    // format check and is flagged for a manual check in the internal e-mail.
    const vatFormatValid = vatNumber ? isVatNumberFormatValid(vatNumber) : false;
    let vies: ViesResult = { checked: false, valid: null };
    if (vatNumber && vatFormatValid && type === 'company' && countryCode !== SHIP_FROM_COUNTRY) {
      vies = await checkVatNumber(vatNumber);
    }
    // A number VIES could not answer for is NOT valid: zero-rating it would
    // leave Re-Sound owing the 23 % if the number turns out to be wrong. The
    // buyer is told the reverse charge is applied once the number is verified.
    const vatNumberValid = vatFormatValid && vies.checked && vies.valid === true;
    const vatNumberCountry = vatNumber ? splitVatNumber(vatNumber)?.country ?? null : null;

    const order = priceOrder(selection, {
      customerType: type,
      deliveryCountry: countryCode,
      vatNumberValid,
      vatNumberCountry,
    });
    if (!order) return NextResponse.json({ error: 'pricing_failed' }, { status: 400 });

    const submittedLocale = clean(body.locale, 8);
    const locale = (locales as readonly string[]).includes(submittedLocale) ? submittedLocale : defaultLocale;
    const localeTag = localeFullCodes[locale as Locale] ?? 'en-BE';
    const [localeMessages, englishMessages] = await Promise.all([loadMessages(locale), loadMessages('en')]);
    const t = makeTranslator(localeMessages, englishMessages);
    const tEn = makeTranslator(englishMessages, englishMessages);

    const now = new Date();
    const reference = orderReference(now);
    const timestamp = now.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Brussels',
    });

    const countryName =
      countryCode === 'OTHER'
        ? country.name
        : new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ?? country.name;

    const customer: Customer = {
      type,
      companyName,
      vatNumber,
      firstName,
      lastName,
      email,
      phone: clean(raw.phone, 40),
      street,
      postalCode,
      city,
      country: countryCode,
      countryName,
      notes: cleanMultiline(raw.notes),
    };

    const vatLabelIn = (tr: Translator) =>
      order.vatMode === 'reverse-charge'
        ? tr('order.vat.reverseCharge')
        : order.vatMode === 'export'
          ? tr('order.vat.export')
          : tr('order.vat.domestic', { rate: Math.round(order.vatRate * 100) });

    const productName = PRODUCTS[selection.slug]?.name ?? selection.slug;
    const ctx: EmailContext = {
      reference,
      timestamp,
      order,
      lines: renderLines(order, t, localeTag),
      customer,
      productName,
      vatLabel: vatLabelIn(t),
      vies,
      vatFormatValid,
      locale,
      localeTag,
    };
    const internalCtx: EmailContext = {
      ...ctx,
      lines: renderLines(order, tEn, 'en-BE'),
      localeTag: 'en-BE',
      vatLabel: vatLabelIn(tEn),
    };

    const recipient = process.env.ORDER_EMAIL || 'info@re-sound.be';
    const internal = internalEmail(internalCtx, tEn);
    const confirmation = customerEmail(ctx, t);

    // Both messages go out together: the buyer's copy must not be hostage to
    // the internal one, and neither may stall the request.
    const [notifiedResult, confirmedResult] = await Promise.allSettled([
      sendMail(
        recipient,
        `New order ${reference} - ${productName} x${selection.quantity} - ${customer.companyName || `${firstName} ${lastName}`}`,
        internal.html,
        internal.text
      ),
      sendMail(email, t('order.email.customerSubject', { reference }), confirmation.html, confirmation.text),
    ]);
    const notified = notifiedResult.status === 'fulfilled' && notifiedResult.value;
    const confirmed = confirmedResult.status === 'fulfilled' && confirmedResult.value;

    console.log(
      '=== NEW ORDER ===',
      reference,
      selection.slug,
      `x${selection.quantity}`,
      customer.country,
      order.vatMode,
      'notified:',
      notified,
      'confirmed:',
      confirmed
    );

    // There is no order database: the notification e-mail IS the record. If it
    // did not go out, the order does not exist, so say so instead of handing
    // the buyer a reference for an order nobody received.
    if (!notified) {
      return NextResponse.json({ error: 'not_delivered', reference }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      reference,
      emailSent: notified,
      confirmationSent: confirmed,
      totals: {
        netCents: order.netCents,
        vatCents: order.vatCents,
        grossCents: order.grossCents,
        vatRate: order.vatRate,
        vatMode: order.vatMode,
        hasOnRequestItems: order.hasOnRequestItems,
      },
    });
  } catch (error) {
    console.error('[order] failed:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
