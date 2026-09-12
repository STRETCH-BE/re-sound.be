import { NextRequest, NextResponse } from 'next/server';

import {
  EMAIL_RE,
  MAX_FIELD_LENGTH,
  MAX_NOTES_LENGTH,
  escHtml,
  generateEmailHTML,
  generatePlainText,
  leadTimestamp,
  type LeadData,
} from '@/lib/lead-email';

// The e-mail templates, the LeadData shape and the field limits live in
// src/lib/lead-email.ts, shared with /api/pricelist.

// ==========================================
// API ROUTE HANDLER
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const raw: LeadData & { website?: string } = await request.json();

    // Honeypot — same pattern as /api/contact. Real forms never render a
    // `website` field; if it's filled, a bot did it. Respond 200 so the bot
    // doesn't learn anything.
    if (raw.website && raw.website.trim().length > 0) {
      return NextResponse.json({ success: true });
    }

    const {
      companyName,
      firstName,
      lastName,
      email,
      phone,
      position,
      companyType,
      source,
      downloadedFile,
    } = raw;

    // Validate required fields
    if (!companyName || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const tooLong = [companyName, firstName, lastName, email, phone, position, companyType, source, downloadedFile]
      .some((v) => (v ?? '').length > MAX_FIELD_LENGTH);
    if (
      tooLong ||
      (raw.extraFields?.notes ?? '').length > MAX_NOTES_LENGTH ||
      (raw.extraFields?.shippingAddress ?? '').length > MAX_NOTES_LENGTH ||
      (raw.extraFields?.requestedSamples ?? '').length > MAX_FIELD_LENGTH
    ) {
      return NextResponse.json(
        { error: 'Field too long' },
        { status: 400 }
      );
    }

    // Escape every user-controlled field once, up front — the HTML template
    // interpolates these directly.
    const data: LeadData = {
      companyName: escHtml(companyName),
      firstName: escHtml(firstName),
      lastName: escHtml(lastName),
      email: escHtml(email),
      phone: escHtml(phone),
      position: escHtml(position),
      companyType: escHtml(companyType),
      source: escHtml(source),
      downloadedFile: escHtml(downloadedFile),
      extraFields: raw.extraFields
        ? {
            shippingAddress: escHtml(raw.extraFields.shippingAddress),
            requestedSamples: escHtml(raw.extraFields.requestedSamples),
            notes: escHtml(raw.extraFields.notes),
          }
        : undefined,
    };

    // Format timestamp
    const timestamp = leadTimestamp(new Date());

    // Generate email content
    const htmlBody = generateEmailHTML(data, timestamp);
    // Plain-text body needs no HTML escaping — use the raw values so the
    // text alternative stays readable (no &amp; entities).
    const textBody = generatePlainText(raw, timestamp);

    // Send to Power Automate webhook
    const webhookUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;
    let emailSent = false;

    if (webhookUrl) {
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: 'leads@stretchgroup.be',
            subject: `New Lead: ${firstName} ${lastName} from ${companyName}`,
            // `body` holds the HTML — Power Automate's "Send an email (V2)"
            // action with Is HTML = Yes should map its Body input to this field.
            // `text` is the plain-text alternative if a non-HTML flow is used.
            body: htmlBody,
            text: textBody,
            // Power Automate "Send an email (V2)" must have Is HTML = Yes; the flag
            // travels with the payload so a flow can read it instead of hardcoding it.
            isHtml: true,
            // Individual fields for Power Automate flexibility
            leadData: {
              firstName,
              lastName,
              email,
              phone,
              companyName,
              position,
              companyType,
              source,
              downloadedFile,
              extraFields: data.extraFields ?? null,
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
    }

    // Log the lead
    console.log('=== NEW LEAD ===');
    console.log('Name:', firstName, lastName);
    console.log('Company:', companyName);
    console.log('Email:', email);
    console.log('Phone:', phone);
    console.log('Source:', source);
    console.log('Downloaded:', downloadedFile);
    console.log('Email sent:', emailSent);
    console.log('================');

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      emailSent,
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    );
  }
}
