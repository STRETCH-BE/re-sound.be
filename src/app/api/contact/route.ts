import { NextRequest, NextResponse } from 'next/server';

// Contact form submission handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, company, phone, message, locale } = body;

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

    // Here you would typically:
    // 1. Send email notification
    // 2. Save to database/CRM
    // 3. Send to third-party service (e.g., HubSpot, Mailchimp)

    // Example: Send email via a service like Resend, SendGrid, etc.
    // const { data, error } = await resend.emails.send({
    //   from: 'Re-Sound <noreply@resound.be>',
    //   to: ['info@re-sound.be'],
    //   subject: `New contact form submission from ${name}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Company:</strong> ${company || 'Not provided'}</p>
    //     <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //     <p><strong>Locale:</strong> ${locale}</p>
    //   `,
    // });

    // For now, just log and return success
    console.log('Contact form submission:', {
      name,
      email,
      company,
      phone,
      message,
      locale,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message. We will get back to you soon.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
