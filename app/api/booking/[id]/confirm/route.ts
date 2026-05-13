import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { verifyAdminToken } from '@/lib/adminToken';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendSms(to: string, message: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !authToken || !from) return;

  const e164 = to.replace(/\s/g, '');
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${sid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: e164, From: from, Body: message }).toString(),
    },
  );
  if (!res.ok) {
    console.error('[SMS error]', await res.text());
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json() as { action?: string; token?: string };
    const { action, token } = body;

    if (action !== 'confirm' && action !== 'deny') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (!verifyAdminToken(id, token ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    const rows = await sql<{
      guest_name: string; email: string; phone: string; unit_name: string;
      check_in: string; check_out: string; nights: number; guests: number;
      total_usd: number; lock_code: string; status: string;
    }[]>`
      SELECT guest_name, email, phone, unit_name,
             check_in::date::text AS check_in, check_out::date::text AS check_out,
             nights, guests, total_usd, lock_code, status
      FROM bookings
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = rows[0];

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 409 },
      );
    }

    const newStatus = action === 'confirm' ? 'confirmed' : 'denied';
    const [firstName] = booking.guest_name.trim().split(' ');

    // Update bookings table
    await sql`UPDATE bookings SET status = ${newStatus} WHERE id = ${id}::uuid`;

    // Try to mirror into reservations table
    await sql`
      UPDATE reservations SET status = ${newStatus}
      WHERE digital_key = ${booking.lock_code}
    `.catch(() => null);

    // Guest email
    if (booking.email && process.env.RESEND_API_KEY) {
      if (action === 'confirm') {
        await resend.emails.send({
          from: 'La Casa Oaxaca <onboarding@resend.dev>',
          to: [booking.email],
          replyTo: 'ebm22david@gmail.com',
          subject: '🎉 Your Stay is Confirmed – La Casa Oaxaca',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#8d4a3f;">Your stay is confirmed!</h2>
              <p>Hi ${firstName},</p>
              <p>Great news — your booking at <strong>${booking.unit_name}, La Casa Oaxaca</strong> has been confirmed.</p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr><td style="padding:8px;color:#555;">Check-in</td><td style="padding:8px;font-weight:bold;">${booking.check_in}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;font-weight:bold;">${booking.check_out}</td></tr>
                <tr><td style="padding:8px;color:#555;">Nights</td><td style="padding:8px;font-weight:bold;">${booking.nights}</td></tr>
                <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Guests</td><td style="padding:8px;font-weight:bold;">${booking.guests}</td></tr>
              </table>
              <div style="background:#fdf3f0;border-left:4px solid #8d4a3f;padding:20px;margin:24px 0;border-radius:8px;">
                <p style="margin:0 0 8px;font-size:14px;color:#8d4a3f;text-transform:uppercase;letter-spacing:0.1em;">🔑 Your Lock Code</p>
                <p style="margin:0;font-size:3rem;font-weight:bold;letter-spacing:0.4em;color:#1a1008;">${booking.lock_code}</p>
                <p style="margin:8px 0 0;font-size:13px;color:#666;">Use this code to unlock your unit door. Keep it safe.</p>
              </div>
              <p>Access the <a href="https://oaxaca-rental.com/portal" style="color:#8d4a3f;">Guest Portal</a> with your lock code, email, or phone number.</p>
              <p style="color:#888;font-size:13px;margin-top:32px;">Questions? Reply to this email or message us on WhatsApp.<br>— La Casa Oaxaca</p>
            </div>
          `,
        }).catch((err: unknown) => console.error('[Confirm email]', err));
      } else {
        await resend.emails.send({
          from: 'La Casa Oaxaca <onboarding@resend.dev>',
          to: [booking.email],
          replyTo: 'ebm22david@gmail.com',
          subject: 'Update on Your Booking Request – La Casa Oaxaca',
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2 style="color:#8d4a3f;">Booking Update</h2>
              <p>Hi ${firstName},</p>
              <p>Unfortunately, we're unable to accommodate your booking request for <strong>${booking.unit_name}</strong> from <strong>${booking.check_in}</strong> to <strong>${booking.check_out}</strong>.</p>
              <p>This may be due to a scheduling conflict. Please feel free to select different dates or contact us directly — we'd love to find an option that works.</p>
              <p style="color:#888;font-size:13px;margin-top:32px;">Questions? Reply to this email or message us on WhatsApp.<br>— La Casa Oaxaca</p>
            </div>
          `,
        }).catch((err: unknown) => console.error('[Deny email]', err));
      }
    }

    // Guest SMS (requires Twilio env vars)
    if (booking.phone) {
      const smsText =
        action === 'confirm'
          ? `La Casa Oaxaca: Your stay is confirmed! Check-in: ${booking.check_in}. Lock code: ${booking.lock_code}. See you soon!`
          : `La Casa Oaxaca: We're unable to accommodate your booking request (${booking.check_in}–${booking.check_out}). Please contact us for alternatives.`;
      await sendSms(booking.phone, smsText).catch((err: unknown) =>
        console.error('[SMS]', err instanceof Error ? err.message : err),
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('[Booking confirm]', err);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
