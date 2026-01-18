import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const {
      companyName,
      firstName,
      lastName,
      email,
      phone,
      position,
      companyType,
      downloadedFile,
      source,
    } = data;

    // Validate required fields
    if (!firstName || !lastName || !email || !companyName || !phone || !position || !companyType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create email content
    const emailSubject = `New Lead: ${firstName} ${lastName} from ${companyName}`;
    
    const emailBody = `
New Lead from Re-Sound Website
================================

Source: ${source || 'Website'}
Downloaded File: ${downloadedFile || 'N/A'}
Date: ${new Date().toLocaleString('en-BE', { timeZone: 'Europe/Brussels' })}

Contact Information
-------------------
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}

Company Information
-------------------
Company: ${companyName}
Position: ${position}
Company Type: ${companyType}

---
This lead was automatically generated from the Re-Sound website.
    `.trim();

    let emailSent = false;

    // Option 1: Microsoft Power Automate Webhook (Recommended for Microsoft 365)
    if (process.env.POWER_AUTOMATE_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: process.env.LEADS_EMAIL || 'leads@stretchgroup.be',
            subject: emailSubject,
            body: emailBody,
            // Also send structured data for Power Automate
            leadData: {
              firstName,
              lastName,
              email,
              phone,
              companyName,
              position,
              companyType,
              downloadedFile,
              source,
              timestamp: new Date().toISOString(),
            }
          }),
        });
        emailSent = response.ok;
        if (!response.ok) {
          console.error('Power Automate webhook failed:', await response.text());
        }
      } catch (error) {
        console.error('Power Automate error:', error);
      }
    }

    // Option 2: Resend
    else if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Re-Sound Website <noreply@re-sound.be>',
            to: [process.env.LEADS_EMAIL || 'leads@stretchgroup.be'],
            subject: emailSubject,
            text: emailBody,
          }),
        });
        emailSent = response.ok;
      } catch (error) {
        console.error('Resend error:', error);
      }
    }
    
    // Option 3: SendGrid
    else if (process.env.SENDGRID_API_KEY) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: process.env.LEADS_EMAIL || 'leads@stretchgroup.be' }] }],
            from: { email: 'noreply@re-sound.be', name: 'Re-Sound Website' },
            subject: emailSubject,
            content: [{ type: 'text/plain', value: emailBody }],
          }),
        });
        emailSent = response.ok;
      } catch (error) {
        console.error('SendGrid error:', error);
      }
    }

    // Fallback: Log the lead
    console.log('=== NEW LEAD ===');
    console.log(emailBody);
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
