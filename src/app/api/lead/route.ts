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

    // Send via Power Automate Webhook
    if (process.env.POWER_AUTOMATE_WEBHOOK_URL) {
      try {
        console.log('Sending to Power Automate...');
        
        const response = await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Email fields for Power Automate
            to: 'leads@stretchgroup.be',
            subject: emailSubject,
            body: emailBody,
            
            // Structured data for Power Automate dynamic content
            firstName,
            lastName,
            email,
            phone,
            companyName,
            position: formatLabel(position),
            companyType: formatLabel(companyType),
            downloadedFile: downloadedFile || 'N/A',
            source: source || 'Website Download',
            timestamp: new Date().toISOString(),
          }),
        });

        emailSent = response.ok;
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Power Automate webhook failed:', response.status, errorText);
        } else {
          console.log('Power Automate webhook succeeded');
        }
      } catch (error) {
        console.error('Power Automate error:', error);
      }
    } else {
      console.warn('POWER_AUTOMATE_WEBHOOK_URL not configured');
    }

    // Always log the lead (useful for debugging)
    console.log('=== NEW LEAD ===');
    console.log('Name:', firstName, lastName);
    console.log('Company:', companyName);
    console.log('Email:', email);
    console.log('Email sent via Power Automate:', emailSent);
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
