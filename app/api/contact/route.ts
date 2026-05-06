import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  if (!process.env.RESEND_API_KEY) {
    console.error('[Contact] RESEND_API_KEY is not set');
    return NextResponse.json({ error: 'Server misconfiguration: missing API key' }, { status: 500 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: ['ebm22david@gmail.com'],
      replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    if (error) {
      console.error('[Resend error]', JSON.stringify(error));
      return NextResponse.json({ error: error.message, detail: error }, { status: 500 });
    }

    console.log('[Resend success]', data?.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Contact route error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
