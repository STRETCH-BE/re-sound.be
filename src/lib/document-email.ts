/**
 * The e-mail that carries a requested product document to the visitor
 * (/api/document). One branded HTML body and its plain-text twin, worded
 * from messages/<locale>.json under `documentEmail` (English fallback), with
 * the document as a link: the mail flow (Power Automate, see docs/order-flow.md)
 * sends whatever `body` it is given and does not attach files, so the link is
 * the delivery.
 */
import { escHtml as esc } from '@/lib/lead-email';
import type { Translator } from '@/lib/order/messages';

export interface DocumentEmailInput {
  firstName: string;
  productName: string;
  /** Translated document name, e.g. "Product data sheet" */
  documentLabel: string;
  /** Absolute URL of the file */
  url: string;
  /** File name shown under the button, e.g. re-sound-rwood-groove-datasheet-en.pdf */
  fileName: string;
  /** Absolute URL of the product page, for the "back to the page" line */
  pageUrl: string;
}

export function documentEmail(input: DocumentEmailInput, t: Translator): { subject: string; html: string; text: string } {
  const values = { name: input.firstName, product: input.productName, document: input.documentLabel };
  const subject = t('documentEmail.subject', values);
  const heading = t('documentEmail.heading', values);
  const greeting = t('documentEmail.greeting', values);
  const intro = t('documentEmail.intro', values);
  const button = t('documentEmail.button', values);
  const linkNote = t('documentEmail.linkNote', values);
  const nextSteps = t('documentEmail.nextSteps', values);
  const signature = t('documentEmail.signature', values);

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f5f5f5;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f5;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#197FC7 0%,#1565a0 100%);padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.5px;">${esc(heading)}</h1>
<p style="margin:8px 0 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${esc(input.productName)}</p>
</td></tr>
<tr><td style="padding:32px 40px 8px;color:#333;font-size:15px;line-height:1.6;">
<p style="margin:0 0 12px;">${esc(greeting)}</p>
<p style="margin:0;">${esc(intro)}</p>
</td></tr>
<tr><td style="padding:16px 40px 8px;text-align:center;">
<a href="${esc(input.url)}" style="display:inline-block;background:#197FC7;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:10px;">${esc(button)}</a>
<p style="margin:12px 0 0;color:#888;font-size:12px;font-family:Menlo,Consolas,monospace;">${esc(input.fileName)}</p>
</td></tr>
<tr><td style="padding:8px 40px 28px;color:#666;font-size:13px;line-height:1.6;">
<p style="margin:0 0 12px;">${esc(linkNote)}<br><a href="${esc(input.url)}" style="color:#197FC7;word-break:break-all;">${esc(input.url)}</a></p>
<p style="margin:0 0 12px;">${esc(nextSteps)} <a href="${esc(input.pageUrl)}" style="color:#197FC7;">${esc(input.pageUrl)}</a></p>
<p style="margin:0;white-space:pre-line;">${esc(signature)}</p>
</td></tr>
<tr><td style="background-color:#f8f9fa;padding:20px 40px;border-top:1px solid #eee;color:#999;font-size:12px;">
Re-Sound &middot; Gentseweg 309 A3, 9120 Beveren-Waas (BE) &middot; info@re-sound.be &middot; re-sound.be
</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    heading,
    '',
    greeting,
    '',
    intro,
    '',
    `${button}: ${input.url}`,
    input.fileName,
    '',
    `${nextSteps} ${input.pageUrl}`,
    '',
    signature,
    '',
    'Re-Sound · Gentseweg 309 A3, 9120 Beveren-Waas (BE) · info@re-sound.be · re-sound.be',
  ].join('\n');

  return { subject, html, text };
}
