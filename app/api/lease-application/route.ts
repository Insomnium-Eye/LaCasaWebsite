import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { escapeHtml } from '@/lib/rent';
import { ADMIN_EMAIL, EMAIL_FROM } from '@/lib/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json() as Record<string, string>;
  const { name, email, nationality, phone, unitName, monthlyMxn, monthlyUsd, notes } = body;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  try {
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `🏠 Lease Application: ${name} — ${unitName}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
          <h2 style="color:#8d4a3f;margin-bottom:4px;">New Lease Application</h2>
          <p style="color:#888;margin-top:0;font-size:13px;">Submitted via lacasaoaxaca.mx</p>

          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;">Applicant</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(String(name))}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${escapeHtml(String(email))}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Nationality</td><td style="padding:6px 0;">${(nationality && escapeHtml(String(nationality))) || '<em style="color:#999">Not provided</em>'}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${(phone && escapeHtml(String(phone))) || '<em style="color:#999">Not provided</em>'}</td></tr>
          </table>

          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px;">Unit of Interest</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Unit</td><td style="padding:6px 0;font-weight:bold;">${escapeHtml(String(unitName))}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Monthly Rent</td><td style="padding:6px 0;">$${escapeHtml(String(monthlyUsd))} USD / $${escapeHtml(String(monthlyMxn))} MXN</td></tr>
          </table>

          ${notes ? `
          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px;">Additional Notes</h3>
          <p style="color:#444;white-space:pre-wrap;">${escapeHtml(String(notes))}</p>
          ` : ''}
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
