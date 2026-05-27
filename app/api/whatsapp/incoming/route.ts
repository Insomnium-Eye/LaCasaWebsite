import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TWIML_EMPTY = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();

    const from        = body.get('From')?.toString() ?? '';          // whatsapp:+15551234567
    const msgBody     = body.get('Body')?.toString() ?? '(no text)';
    const profileName = body.get('ProfileName')?.toString() ?? '';
    const mediaUrl    = body.get('MediaUrl0')?.toString() ?? '';
    const mediaType   = body.get('MediaContentType0')?.toString() ?? '';
    const numMedia    = parseInt(body.get('NumMedia')?.toString() ?? '0', 10);

    const cleanNumber = from.replace('whatsapp:', '');
    const senderLabel = profileName ? `${profileName} (${cleanNumber})` : cleanNumber;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        subject: `💬 WhatsApp: ${profileName || cleanNumber}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#075E54;margin-bottom:4px;">New WhatsApp Message</h2>
            <p style="color:#555;margin-top:0;font-size:13px;">Received on La Casa Oaxaca WhatsApp</p>
            <p style="margin:0;"><strong>From:</strong> ${senderLabel}</p>
            <div style="background:#f0fdf4;border-left:4px solid #25D366;padding:12px 16px;margin:16px 0;border-radius:0 8px 8px 0;">
              <p style="margin:0;white-space:pre-wrap;font-size:15px;">${msgBody}</p>
            </div>
            ${numMedia > 0 && mediaUrl ? `
            <p style="margin:8px 0;"><strong>Attachment (${mediaType}):</strong><br/>
              <a href="${mediaUrl}" style="color:#25D366;">${mediaUrl}</a>
            </p>` : ''}
            <p style="color:#aaa;font-size:12px;margin-top:24px;">
              To reply, open WhatsApp and message ${cleanNumber}
            </p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error('[WhatsApp incoming]', err);
  }

  // Always return empty TwiML — Twilio requires a valid XML response
  return new NextResponse(TWIML_EMPTY, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
