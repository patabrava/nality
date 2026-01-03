import { NextRequest, NextResponse } from 'next/server'

/**
 * Contact Form API Endpoint
 * Handles sending contact form emails to tobias.gberger@gmail.com
 * 
 * Note: This is a placeholder implementation that logs the contact request.
 * In production, integrate with an email service like:
 * - Resend (https://resend.com)
 * - SendGrid (https://sendgrid.com)
 * - AWS SES
 * - Postmark
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subject, message, userEmail, userName, topic } = body

    // Validate required fields
    if (!message || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For now, we'll log the contact request
    // TODO: Integrate with email service in production
    console.log('[Contact API] New contact form submission:', {
      to: 'tobias.gberger@gmail.com',
      subject: subject,
      from: userEmail,
      userName: userName,
      topic: topic,
      message: message,
      timestamp: new Date().toISOString()
    })

    // Simulate email sending
    // In production, replace this with actual email service integration:
    /*
    const emailResponse = await resend.emails.send({
      from: 'noreply@nality.com',
      to: 'tobias.gberger@gmail.com',
      subject: subject,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${userName} (${userEmail})</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    })
    */

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully. We will get back to you soon!' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[Contact API] Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Failed to process contact form submission' },
      { status: 500 }
    )
  }
}