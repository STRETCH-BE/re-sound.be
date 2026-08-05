// ============================================================================
// EMAIL — builds the lead-notification email (HTML + plain text) from a
// submitted payload. All values are HTML-escaped before interpolation.
// ============================================================================
import { brand } from '@/lib/site-config';

export type LeadPayload = {
  source: string;
  // Free-form: different forms submit different field sets. We render whatever
  // is present, in a stable order, with friendly labels.
  [key: string]: unknown;
};

/** Minimal HTML escaping for any string rendered into the email body. */
export function escapeHtml(input: unknown): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Human labels for known field keys (anything else is title-cased).
const FIELD_LABELS: Record<string, string> = {
  companyName: 'Company',
  company: 'Company',
  firstName: 'First name',
  lastName: 'Last name',
  name: 'Name',
  contactName: 'Contact name',
  email: 'Email',
  phone: 'Phone',
  position: 'Position',
  companyType: 'Company type',
  country: 'Country',
  address: 'Address',
  shippingAddress: 'Shipping address',
  subject: 'Subject',
  rooms: 'Rooms',
  timeline: 'Timeline',
  preferredTime: 'Preferred time',
  preferredDate: 'Preferred date',
  attendees: 'Attendees',
  experience: 'Experience level',
  activity: 'Activity',
  productLine: 'Product line',
  colours: 'Colours of interest',
  topic: 'Topic',
  bestTime: 'Best time',
  message: 'Message',
  notes: 'Notes',
  product: 'Product',
  downloadedFile: 'Requested file',
};

const SOURCE_LABELS: Record<string, string> = {
  quote: 'Quote request',
  survey: 'Site survey request',
  training: 'Training booking',
  dates: 'Training booking',
  partner: 'Partner application',
  call: 'Call-back request',
  samples: 'Sample request',
  contact: 'Contact form',
  pdf_download: 'Spec-sheet download',
};

function labelFor(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// Render in a sensible order: known keys first, then the rest.
const ORDER = Object.keys(FIELD_LABELS);

function orderedEntries(payload: LeadPayload): [string, unknown][] {
  const skip = new Set(['source']);
  const keys = Object.keys(payload).filter((k) => !skip.has(k));
  keys.sort((a, b) => {
    const ia = ORDER.indexOf(a);
    const ib = ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return keys
    .map((k) => [k, payload[k]] as [string, unknown])
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
}

export type BuiltEmail = { subject: string; html: string; text: string };

export function buildLeadEmail(payload: LeadPayload): BuiltEmail {
  const sourceLabel = SOURCE_LABELS[payload.source as string] || 'Website lead';
  const entries = orderedEntries(payload);

  const subject = `New ${sourceLabel} — ${brand.name} website`;

  const rows = entries
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #ECEAE6;font:600 12px Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#6E6B66;white-space:nowrap;vertical-align:top;">${escapeHtml(
            labelFor(k),
          )}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #ECEAE6;font:400 15px Arial,sans-serif;color:#0A0A0A;">${escapeHtml(
            v,
          ).replace(/\n/g, '<br>')}</td>
        </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html><body style="margin:0;background:#F4F3F1;padding:24px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #ECEAE6;">
    <tr><td style="background:#0A0A0A;padding:20px 24px;">
      <span style="font:900 22px Arial,sans-serif;letter-spacing:-.02em;color:#fff;">${brand.name}</span><span style="color:#FF0000;font:900 14px Arial;">&reg;</span>
      <div style="font:600 11px Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#FF0000;margin-top:6px;">${escapeHtml(
        sourceLabel,
      )}</div>
    </td></tr>
    <tr><td style="padding:24px;">
      <p style="font:400 15px Arial,sans-serif;color:#54514B;margin:0 0 18px;">A new lead was submitted from the ${brand.name} website.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ECEAE6;border-collapse:collapse;">${rows}</table>
      <p style="font:400 12px Arial,sans-serif;color:#9A968F;margin:18px 0 0;">Source: ${escapeHtml(
        String(payload.source ?? 'unknown'),
      )} · Sent automatically by the website.</p>
    </td></tr>
  </table>
</body></html>`;

  const text =
    `New ${sourceLabel} — ${brand.name} website\n\n` +
    entries.map(([k, v]) => `${labelFor(k)}: ${String(v)}`).join('\n') +
    `\n\nSource: ${String(payload.source ?? 'unknown')}`;

  return { subject, html, text };
}
