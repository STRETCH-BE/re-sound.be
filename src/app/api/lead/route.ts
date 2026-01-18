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

    // Format position and company type for readability
    const formatLabel = (value: string): string => {
      const labels: Record<string, string> = {
        // Positions
        'owner': 'Owner / CEO',
        'director': 'Director / Manager',
        'architect': 'Architect',
        'designer': 'Designer',
        'engineer': 'Engineer',
        'project-manager': 'Project Manager',
        'procurement': 'Procurement / Purchasing',
        'consultant': 'Consultant',
        // Company Types
        'interior-designer': 'Interior Designer',
        'contractor': 'General Contractor',
        'acoustic-consultant': 'Acoustic Consultant',
        'facility-manager': 'Facility Manager',
        'real-estate': 'Real Estate Developer',
        'manufacturer': 'Manufacturer / Distributor',
        'corporate': 'Corporate / End User',
        'other': 'Other',
      };
      return labels[value] || value;
    };

    // Create email content
    const emailSubject = `🎯 New Lead: ${firstName} ${lastName} from ${companyName}`;
    
    const emailBody = `
NEW LEAD FROM RE-SOUND WEBSITE
================================

Source: ${source || 'Website Download'}
Downloaded File: ${downloadedFile || 'N/A'}
Date: ${new Date().toLocaleString('en-BE', { timeZone: 'Europe/Brussels' })}

CONTACT INFORMATION
-------------------
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}

COMPANY INFORMATION
-------------------
Company: ${companyName}
Position: ${formatLabel(position)}
Company Type: ${formatLabel(companyType)}

---
This lead was automatically generated from the Re-Sound website.
    `.trim();

    let emailSent = false;

    // Option 1: Microsoft Power Automate Webhook (Primary)
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
              position: formatLabel(position),
              companyType: formatLabel(companyType),
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

    // Option 2: Resend (Fallback)
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

    // Option 3: SendGrid (Fallback)
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

    // Always log the lead (useful for debugging and as backup)
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
