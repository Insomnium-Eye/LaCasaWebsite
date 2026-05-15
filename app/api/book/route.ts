import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateAdminToken } from '@/lib/adminToken';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateLockCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function saveToSupabase(data: {
  name: string; email: string; phone: string;
  unitSlug: string; unitName: string;
  checkIn: string; checkOut: string;
  nights: number; guests: number;
  totalUsd: number; depositUsd: number;
  lockCode: string;
}) {
  const { getSql } = await import('@/lib/db');
  const sql = getSql();

  const [booking] = await sql<{ id: string }[]>`
    INSERT INTO bookings
      (guest_name, email, phone, unit_slug, unit_name, check_in, check_out, nights, guests, total_usd, deposit_usd, lock_code, status)
    VALUES
      (${data.name}, ${data.email || null}, ${data.phone || null},
       ${data.unitSlug}, ${data.unitName}, ${data.checkIn}, ${data.checkOut},
       ${data.nights}, ${data.guests || 1}, ${data.totalUsd || 0}, ${data.depositUsd || 0},
       ${data.lockCode}, 'pending')
    RETURNING id`;

  const [firstName, ...rest] = data.name.trim().split(' ');
  const nightlyRate = data.nights > 0 ? data.totalUsd / data.nights : 0;

  try {
    await sql`
      INSERT INTO reservations
        (guest_first_name, guest_last_name, email, phone, digital_key, unit_id, unit_name, check_in, check_out, nightly_rate, status)
      VALUES
        (${firstName}, ${rest.join(' ') || ''}, ${data.email || ''}, ${data.phone || null},
         ${data.lockCode}, ${data.unitSlug}, ${data.unitName}, ${data.checkIn}, ${data.checkOut},
         ${parseFloat(nightlyRate.toFixed(2))}, 'pending')`;
  } catch (err) {
    console.warn('[Booking] Reservation insert error:', err instanceof Error ? err.message : err);
  }

  return booking.id as string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, email, phone,
      unitSlug, unitName,
      checkIn, checkOut, nights, guests,
      totalUsd, depositUsd,
    } = body;

    if (!name || !unitSlug || !checkIn || !checkOut || !nights) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lockCode = generateLockCode();
    const [firstName] = name.trim().split(' ');

    // Try to save to Supabase — non-fatal if it fails (paused project, missing creds, etc.)
    let bookingId = `offline-${Date.now()}`;
    let dbSaved = false;
    let dbError: string | undefined;
    try {
      bookingId = await saveToSupabase({
        name, email, phone, unitSlug, unitName,
        checkIn, checkOut, nights, guests,
        totalUsd, depositUsd, lockCode,
      });
      dbSaved = true;
    } catch (dbErr) {
      dbError = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.warn('[Booking] DB save skipped:', dbError);
    }

    // Guest pending email (lock code withheld until admin confirms)
    if (email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: [email],
        replyTo: 'ebm22david@gmail.com',
        subject: '📩 Booking Request Received – La Casa Oaxaca',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8d4a3f;">We've received your booking request!</h2>
            <p>Hi ${firstName},</p>
            <p>Thanks for choosing <strong>${unitName}, La Casa Oaxaca</strong>. Your request is under review and you'll receive a confirmation or update shortly.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:8px;color:#555;">Check-in</td><td style="padding:8px;font-weight:bold;">${checkIn}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;font-weight:bold;">${checkOut}</td></tr>
              <tr><td style="padding:8px;color:#555;">Nights</td><td style="padding:8px;font-weight:bold;">${nights}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Guests</td><td style="padding:8px;font-weight:bold;">${guests}</td></tr>
            </table>
            <p style="color:#888;font-size:13px;margin-top:32px;">Questions? Reply to this email or message us on WhatsApp.<br>— La Casa Oaxaca</p>
          </div>
        `,
      }).catch((err: unknown) => console.error('[Guest pending email]', err));
    }

    // Admin notification with Confirm / Deny buttons
    if (process.env.RESEND_API_KEY) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://oaxaca-rental.com';
      const adminToken = dbSaved ? generateAdminToken(bookingId) : null;
      const confirmUrl = adminToken ? `${baseUrl}/api/booking/${bookingId}/action?token=${adminToken}&amp;action=confirm` : null;
      const denyUrl    = adminToken ? `${baseUrl}/api/booking/${bookingId}/action?token=${adminToken}&amp;action=deny`    : null;

      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        subject: `⏳ New Booking Request: ${name} – ${unitName} (${checkIn})`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8d4a3f;">New Booking Request</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;color:#555;width:140px;">Guest</td><td style="padding:8px;font-weight:bold;">${name}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Email</td><td style="padding:8px;">${email || 'N/A'}</td></tr>
              <tr><td style="padding:8px;color:#555;">Phone</td><td style="padding:8px;">${phone || 'N/A'}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Unit</td><td style="padding:8px;">${unitName}</td></tr>
              <tr><td style="padding:8px;color:#555;">Check-in</td><td style="padding:8px;font-weight:bold;">${checkIn}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;font-weight:bold;">${checkOut}</td></tr>
              <tr><td style="padding:8px;color:#555;">Nights</td><td style="padding:8px;">${nights}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Guests</td><td style="padding:8px;">${guests}</td></tr>
              <tr><td style="padding:8px;color:#555;">Total</td><td style="padding:8px;font-weight:bold;">$${(totalUsd || 0).toFixed(2)} USD</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Lock Code</td><td style="padding:8px;font-size:1.3em;font-weight:bold;letter-spacing:0.2em;">${lockCode}</td></tr>
            </table>
            ${confirmUrl && denyUrl ? `
            <div style="margin-top:24px;text-align:center;">
              <a href="${confirmUrl}" style="display:inline-block;background:#4a7c3f;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;margin-right:12px;">✓ Confirm Booking</a>
              <a href="${denyUrl}" style="display:inline-block;background:#c0392b;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">✗ Deny Booking</a>
            </div>
            <p style="color:#aaa;font-size:12px;text-align:center;margin-top:8px;">One click — no login required. Each button acts immediately.</p>
            ` : '<p style="color:#c0392b;font-size:13px;">⚠️ DB save failed — manual action required.</p>'}
          </div>
        `,
      }).catch((err: unknown) => console.error('[Admin email]', err));
    }

    return NextResponse.json({ success: true, bookingId, lockCode, dbSaved, dbError });

  } catch (error) {
    const msg =
      error instanceof Error ? error.message :
      typeof error === 'object' && error !== null ? JSON.stringify(error) :
      String(error);
    console.error('[Book API error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
