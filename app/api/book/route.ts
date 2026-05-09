import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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
  const { createAdminSupabaseClient } = await import('@/lib/supabase-helpers');
  const supabase = createAdminSupabaseClient();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert([{
      guest_name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      unit_slug: data.unitSlug,
      unit_name: data.unitName,
      check_in: data.checkIn,
      check_out: data.checkOut,
      nights: data.nights,
      guests: data.guests || 1,
      total_usd: data.totalUsd || 0,
      deposit_usd: data.depositUsd || 0,
      lock_code: data.lockCode,
      status: 'confirmed',
    }])
    .select()
    .single();

  if (bookingError) throw new Error(bookingError.message);

  const [firstName, ...rest] = data.name.trim().split(' ');
  const nightlyRate = data.nights > 0 ? data.totalUsd / data.nights : 0;

  const { error: reservationError } = await supabase
    .from('reservations')
    .insert([{
      guest_first_name: firstName,
      guest_last_name: rest.join(' ') || '',
      email: data.email || '',
      phone: data.phone || null,
      digital_key: data.lockCode,
      unit_id: data.unitSlug,
      unit_name: data.unitName,
      check_in: data.checkIn,
      check_out: data.checkOut,
      nightly_rate: parseFloat(nightlyRate.toFixed(2)),
      status: 'confirmed',
    }]);

  if (reservationError) {
    console.warn('[Booking] Reservation creation error:', reservationError.message);
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

    // Send guest confirmation email
    if (email && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: [email],
        replyTo: 'ebm22david@gmail.com',
        subject: '🎉 Booking Confirmed – La Casa Oaxaca',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8d4a3f;">Your stay is confirmed!</h2>
            <p>Hi ${firstName},</p>
            <p>Your booking at <strong>${unitName}, La Casa Oaxaca</strong> is confirmed.</p>
            <table style="width:100%; border-collapse:collapse; margin: 20px 0;">
              <tr><td style="padding:8px; color:#555;">Check-in</td><td style="padding:8px; font-weight:bold;">${checkIn}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px; color:#555;">Check-out</td><td style="padding:8px; font-weight:bold;">${checkOut}</td></tr>
              <tr><td style="padding:8px; color:#555;">Nights</td><td style="padding:8px; font-weight:bold;">${nights}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px; color:#555;">Guests</td><td style="padding:8px; font-weight:bold;">${guests}</td></tr>
            </table>
            <div style="background:#fdf3f0; border-left:4px solid #8d4a3f; padding:20px; margin:24px 0; border-radius:8px;">
              <p style="margin:0 0 8px; font-size:14px; color:#8d4a3f; text-transform:uppercase; letter-spacing:0.1em;">🔑 Your Lock Code</p>
              <p style="margin:0; font-size:3rem; font-weight:bold; letter-spacing:0.4em; color:#1a1008;">${lockCode}</p>
              <p style="margin:8px 0 0; font-size:13px; color:#666;">Use this code to unlock your unit door. Keep it safe.</p>
            </div>
            <p>You can also use this code — or your email/phone — to access the <a href="https://oaxaca-rental.com/portal" style="color:#8d4a3f;">Guest Portal</a>.</p>
            <p style="color:#888; font-size:13px; margin-top:32px;">Questions? Reply to this email or message us on WhatsApp.<br>— La Casa Oaxaca</p>
          </div>
        `,
      });
    }

    // Notify admin
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        subject: `New Booking: ${name} – ${unitName} (${checkIn})`,
        html: `
          <h3>New Booking Confirmed</h3>
          <ul>
            <li><strong>Guest:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email || 'N/A'}</li>
            <li><strong>Phone:</strong> ${phone || 'N/A'}</li>
            <li><strong>Unit:</strong> ${unitName}</li>
            <li><strong>Check-in:</strong> ${checkIn}</li>
            <li><strong>Check-out:</strong> ${checkOut}</li>
            <li><strong>Nights:</strong> ${nights}</li>
            <li><strong>Guests:</strong> ${guests}</li>
            <li><strong>Total:</strong> $${(totalUsd || 0).toFixed(2)} USD</li>
            <li><strong>Lock Code:</strong> <strong style="font-size:1.2em;">${lockCode}</strong></li>
          </ul>
        `,
      });
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
