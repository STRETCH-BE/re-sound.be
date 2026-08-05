// ============================================================================
// LEAD DELIVERY — graceful, zero-config multi-method send.
// Tries, in order: Resend (RESEND_API_KEY) → generic webhook (LEAD_WEBHOOK_URL)
// → SMTP/Nodemailer (SMTP_HOST) → log-only. The site works with no env vars at
// all (log-only), so it never hard-fails. PII is never logged — only the lead
// source, the destination and the submitter's email domain.
// ============================================================================
import { buildLeadEmail, type LeadPayload } from '@/lib/email';
import { contact } from '@/lib/site-config';

export type DeliveryResult = { ok: true; method: 'resend' | 'webhook' | 'smtp' | 'log' };

function emailDomain(payload: LeadPayload): string {
  const e = typeof payload.email === 'string' ? payload.email : '';
  const at = e.lastIndexOf('@');
  return at > -1 ? e.slice(at + 1) : 'n/a';
}

function logIssue(method: string, err: unknown) {
  // Log the failure WITHOUT any submitted personal data.
  console.error(`[lead] ${method} delivery failed: ${err instanceof Error ? err.message : 'unknown error'}`);
}

export async function deliverLead(payload: LeadPayload): Promise<DeliveryResult> {
  const built = buildLeadEmail(payload);
  const to = contact.leadDestination;
  const from =
    process.env.LEAD_FROM_EMAIL ||
    `STRETCH Website <website@${contact.email.split('@')[1] || 'stretchplafond.be'}>`;
  const replyTo = typeof payload.email === 'string' && payload.email ? payload.email : undefined;

  // 1) Resend ---------------------------------------------------------------
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from,
        to,
        reply_to: replyTo,
        subject: built.subject,
        html: built.html,
        text: built.text,
      });
      return { ok: true, method: 'resend' };
    } catch (err) {
      logIssue('resend', err);
    }
  }

  // 2) Generic webhook ------------------------------------------------------
  if (process.env.LEAD_WEBHOOK_URL) {
    try {
      const res = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: built.subject,
          body: built.html,
          text: built.text,
          isHtml: true,
          to,
          meta: payload,
        }),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
      return { ok: true, method: 'webhook' };
    } catch (err) {
      logIssue('webhook', err);
    }
  }

  // 3) SMTP via Nodemailer --------------------------------------------------
  if (process.env.SMTP_HOST) {
    try {
      const nodemailer = await import('nodemailer');
      const port = Number(process.env.SMTP_PORT || 587);
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
        auth:
          process.env.SMTP_USER && process.env.SMTP_PASS
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM || from,
        to,
        replyTo,
        subject: built.subject,
        html: built.html,
        text: built.text,
      });
      return { ok: true, method: 'smtp' };
    } catch (err) {
      logIssue('smtp', err);
    }
  }

  // 4) Log-only -------------------------------------------------------------
  console.info(
    `[lead] received "${String(payload.source)}" → ${to} (no delivery method configured; submitter domain: ${emailDomain(payload)})`,
  );
  return { ok: true, method: 'log' };
}
