import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json() as Record<string, string>;
  const { name, email, nationality, phone, unitName, monthlyMxn, monthlyUsd, refName, refAffiliation, refContact, notes } = body;

  if (!name?.trim() || !email?.trim() || !refName?.trim() || !refAffiliation?.trim() || !refContact?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  try {
    const { error } = await resend.emails.send({
      from: 'La Casa Oaxaca <onboarding@resend.dev>',
      to: ['ebm22david@gmail.com'],
      replyTo: email,
      subject: `🏠 Lease Application: ${name} — ${unitName}`,
      html: `
        <div style="font-family:sans-serif;max-width:640px;margin:0 auto;">
          <h2 style="color:#8d4a3f;margin-bottom:4px;">New Lease Application</h2>
          <p style="color:#888;margin-top:0;font-size:13px;">Submitted via lacasaoaxaca.mx</p>

          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;">Applicant</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td style="padding:6px 0;font-weight:bold;">${name}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email</td><td style="padding:6px 0;">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Nationality</td><td style="padding:6px 0;">${nationality || '<em style="color:#999">Not provided</em>'}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${phone || '<em style="color:#999">Not provided</em>'}</td></tr>
          </table>

          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px;">Unit of Interest</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Unit</td><td style="padding:6px 0;font-weight:bold;">${unitName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Monthly Rent</td><td style="padding:6px 0;">$${monthlyUsd} USD / $${monthlyMxn} MXN</td></tr>
          </table>

          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px;">Reference</h3>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#666;width:140px;">Name</td><td style="padding:6px 0;">${refName}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Affiliation</td><td style="padding:6px 0;">${refAffiliation}</td></tr>
            <tr><td style="padding:6px 0;color:#666;">Email / Phone</td><td style="padding:6px 0;">${refContact}</td></tr>
          </table>

          ${notes ? `
          <h3 style="color:#444;border-bottom:1px solid #eee;padding-bottom:6px;margin-top:20px;">Additional Notes</h3>
          <p style="color:#444;white-space:pre-wrap;">${notes}</p>
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
