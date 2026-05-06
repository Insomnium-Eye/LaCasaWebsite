import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  try {
    const { data, error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: ['ebm22david@gmail.com', 'rosaelenadura325@gmail.com'],
      replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    if (error) {
      console.error('[Resend error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Resend success]', data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Contact route error]', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
