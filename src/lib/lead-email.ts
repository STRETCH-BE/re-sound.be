/**
 * Lead e-mail rendering shared by /api/lead and /api/pricelist: the lead
 * shape, the field limits, the HTML template and its plain-text alternative,
 * both posted to the Power Automate webhook. Moved here unchanged from
 * src/app/api/lead/route.ts so the two routes cannot drift apart.
 */

export interface LeadData {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyType: string;
  source: string;
  downloadedFile: string;
  // Extra fields supplied by sample-kit form (shippingAddress, samples, notes).
  // Other lead-gen entry points don't send this; treated as optional everywhere.
  extraFields?: {
    shippingAddress?: string;
    requestedSamples?: string;
    notes?: string;
  };
}

export const MAX_FIELD_LENGTH = 500;
export const MAX_NOTES_LENGTH = 5000;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Basic HTML escape for user-provided fields rendered into the email template.
export function escHtml(s: string | undefined | null): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** "12 Sept 2026, 14:05" in Brussels time — the stamp both e-mail bodies carry. */
export function leadTimestamp(now: Date = new Date()): string {
  return now.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Brussels',
  });
}

// ==========================================
// HTML EMAIL TEMPLATE
// ==========================================
export function generateEmailHTML(data: LeadData, timestamp: string): string {
  const {
    firstName,
    lastName,
    email,
    phone,
    companyName,
    position,
    companyType,
    source,
    downloadedFile,
    extraFields,
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead from Re-Sound</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #197FC7 0%, #1565a0 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                🎯 New Lead
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Re-Sound Website
              </p>
            </td>
          </tr>

          <!-- Source Badge -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #e8f4fc; border-radius: 8px; padding: 16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%">
                          <p style="margin: 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Source</p>
                          <p style="margin: 4px 0 0 0; color: #197FC7; font-size: 14px; font-weight: 600;">${source}</p>
                        </td>
                        <td width="50%">
                          <p style="margin: 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Downloaded</p>
                          <p style="margin: 4px 0 0 0; color: #197FC7; font-size: 14px; font-weight: 600;">${downloadedFile}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Section -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <h2 style="margin: 0 0 16px 0; color: #333; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 2px solid #197FC7; padding-bottom: 8px; display: inline-block;">
                Contact
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Name</td>
                        <td style="color: #333; font-size: 15px; font-weight: 500;">${firstName} ${lastName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Email</td>
                        <td style="color: #197FC7; font-size: 15px;">
                          <a href="mailto:${email}" style="color: #197FC7; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Phone</td>
                        <td style="color: #333; font-size: 15px;">
                          <a href="tel:${phone}" style="color: #333; text-decoration: none;">${phone}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Company Section -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <h2 style="margin: 0 0 16px 0; color: #333; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 2px solid #197FC7; padding-bottom: 8px; display: inline-block;">
                Company
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Company</td>
                        <td style="color: #333; font-size: 15px; font-weight: 500;">${companyName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Position</td>
                        <td style="color: #333; font-size: 15px;">${position}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Type</td>
                        <td style="color: #333; font-size: 15px;">${companyType}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            extraFields && (extraFields.shippingAddress || extraFields.requestedSamples || extraFields.notes)
              ? `
          <!-- Sample Request Details (only present for sample kit requests) -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <h2 style="margin: 0 0 16px 0; color: #333; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 2px solid #197FC7; padding-bottom: 8px; display: inline-block;">
                Sample Request
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${
                  extraFields.requestedSamples
                    ? `<tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="140" style="color: #888; font-size: 13px; vertical-align: top;">Samples</td>
                        <td style="color: #333; font-size: 15px;">${extraFields.requestedSamples}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
                ${
                  extraFields.shippingAddress
                    ? `<tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="140" style="color: #888; font-size: 13px; vertical-align: top;">Shipping to</td>
                        <td style="color: #333; font-size: 15px; white-space: pre-line;">${extraFields.shippingAddress}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
                ${
                  extraFields.notes
                    ? `<tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="140" style="color: #888; font-size: 13px; vertical-align: top;">Notes</td>
                        <td style="color: #333; font-size: 15px; font-style: italic; white-space: pre-wrap;">${extraFields.notes}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>
          `
              : ''
          }

          <!-- CTA Button -->
          <tr>
            <td style="padding: 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re-Sound%20-%20Following%20up%20on%20your%20inquiry&body=Dear%20${firstName},%0A%0AThank%20you%20for%20your%20interest%20in%20Re-Sound..." 
                       style="display: inline-block; background: #197FC7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Reply to ${firstName} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 40px; border-top: 1px solid #eee;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="color: #999; font-size: 12px;">
                    ${timestamp}
                  </td>
                  <td align="right" style="color: #999; font-size: 12px;">
                    Automated lead from re-sound.be
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ==========================================
// PLAIN TEXT FALLBACK
// ==========================================
export function generatePlainText(data: LeadData, timestamp: string): string {
  const {
    firstName,
    lastName,
    email,
    phone,
    companyName,
    position,
    companyType,
    source,
    downloadedFile,
    extraFields,
  } = data;

  const sampleSection =
    extraFields && (extraFields.shippingAddress || extraFields.requestedSamples || extraFields.notes)
      ? `

SAMPLE REQUEST
--------------
${extraFields.requestedSamples ? `Samples:      ${extraFields.requestedSamples}\n` : ''}${extraFields.shippingAddress ? `Shipping to:  ${extraFields.shippingAddress}\n` : ''}${extraFields.notes ? `Notes:        ${extraFields.notes}\n` : ''}`.trimEnd()
      : '';

  return `
NEW LEAD FROM RE-SOUND WEBSITE
==============================

Source: ${source}
Downloaded: ${downloadedFile}
Date: ${timestamp}

CONTACT
-------
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}

COMPANY
-------
Company: ${companyName}
Position: ${position}
Type: ${companyType}${sampleSection}

---
Automated lead from re-sound.be
  `.trim();
}
