import { NextRequest, NextResponse } from 'next/server';

// ==========================================
// TYPES
// ==========================================
interface ContactData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject?: string;
  message: string;
  locale?: string;
  // Honeypot — must be empty
  website?: string;
}

// ==========================================
// HTML EMAIL TEMPLATE
// ==========================================
function generateEmailHTML(data: ContactData, timestamp: string): string {
  const { name, email, company, phone, subject, message, locale } = data;
  // Basic HTML-escape for user-provided fields
  const esc = (s: string | undefined) =>
    (s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New contact message from Re-Sound</title>
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
                ✉️ New Contact Message
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Re-Sound Website · Contact Form
              </p>
            </td>
          </tr>

          <!-- Meta Badge -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background-color: #e8f4fc; border-radius: 8px; padding: 16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%">
                          <p style="margin: 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                          <p style="margin: 4px 0 0 0; color: #197FC7; font-size: 14px; font-weight: 600;">${esc(subject) || 'General inquiry'}</p>
                        </td>
                        <td width="50%">
                          <p style="margin: 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Language</p>
                          <p style="margin: 4px 0 0 0; color: #197FC7; font-size: 14px; font-weight: 600;">${esc(locale) || '—'}</p>
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
                        <td style="color: #333; font-size: 15px; font-weight: 500;">${esc(name)}</td>
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
                          <a href="mailto:${esc(email)}" style="color: #197FC7; text-decoration: none;">${esc(email)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${
                  phone
                    ? `<tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Phone</td>
                        <td style="color: #333; font-size: 15px;">
                          <a href="tel:${esc(phone)}" style="color: #333; text-decoration: none;">${esc(phone)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
                ${
                  company
                    ? `<tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="100" style="color: #888; font-size: 13px;">Company</td>
                        <td style="color: #333; font-size: 15px;">${esc(company)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Message Section -->
          <tr>
            <td style="padding: 24px 40px 0 40px;">
              <h2 style="margin: 0 0 16px 0; color: #333; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; border-bottom: 2px solid #197FC7; padding-bottom: 8px; display: inline-block;">
                Message
              </h2>
              <div style="background-color: #fafafa; border-left: 3px solid #197FC7; padding: 16px 20px; border-radius: 4px;">
                <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${esc(message)}</p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 32px 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${esc(email)}?subject=Re%3A%20Your%20message%20to%20Re-Sound"
                       style="display: inline-block; background: #197FC7; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Reply to ${esc(name)} →
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
                    Automated message from re-sound.be
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
function generatePlainText(data: ContactData, timestamp: string): string {
  const { name, email, company, phone, subject, message, locale } = data;
  return `
NEW CONTACT MESSAGE — RE-SOUND WEBSITE
======================================

Subject:  ${subject || 'General inquiry'}
Language: ${locale || '—'}
Date:     ${timestamp}

CONTACT
-------
Name:    ${name}
Email:   ${email}
Phone:   ${phone || '—'}
Company: ${company || '—'}

MESSAGE
-------
${message}

---
Automated message from re-sound.be
  `.trim();
}

// ==========================================
// API ROUTE HANDLER
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const data: ContactData = await request.json();
    const { name, email, company, phone, subject, message, locale, website } = data;

    // Honeypot: bots typically fill every field they see.
    // The form should NOT render a `website` field; if it's filled, drop silently.
    if (website && website.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Length guards (defence against pasted-document spam)
    if (name.length > 200 || email.length > 200 || message.length > 10000) {
      return NextResponse.json(
        { error: 'Field too long' },
        { status: 400 }
      );
    }

    // Format timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Brussels',
    });

    // Generate email content
    const htmlBody = generateEmailHTML(data, timestamp);
    const textBody = generatePlainText(data, timestamp);

    // Send to Power Automate webhook
    const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
    const recipient = process.env.CONTACT_EMAIL || 'info@re-sound.be';
    let emailSent = false;

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            subject: `Contact form: ${subject || 'General inquiry'} — ${name}`,
            body: textBody,
            htmlBody: htmlBody,
            // Individual fields for Power Automate flexibility
            contactData: {
              name,
              email,
              company: company || '',
              phone: phone || '',
              subject: subject || '',
              message,
              locale: locale || '',
              timestamp,
            },
          }),
        });

        emailSent = response.ok;

        if (!response.ok) {
          console.error('Power Automate webhook failed:', response.status);
        }
      } catch (webhookError) {
        console.error('Failed to call Power Automate webhook:', webhookError);
      }
    } else {
      console.warn(
        'POWER_AUTOMATE_WEBHOOK_URL not configured — contact form submission not emailed'
      );
    }

    // Log the contact submission
    console.log('=== NEW CONTACT MESSAGE ===');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Company:', company || '—');
    console.log('Subject:', subject || '—');
    console.log('Email sent:', emailSent);
    console.log('===========================');

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
      emailSent,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Disallow other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
