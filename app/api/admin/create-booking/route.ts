import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { Resend } from 'resend';
import { generateUniquePin, getReturningGuestInfo } from '@/lib/reservation-helpers';

const resend = new Resend(process.env.RESEND_API_KEY);

const UNITS: Record<string, string> = {
  'bungalow-1':    'Bungalow 1',
  'bungalow-2':    'Bungalow 2',
  'main-bedroom':  'Main Residence Bedroom',
};

export async function POST(request: NextRequest) {
  const adminCode = process.env.ADMIN_PORTAL_CODE;
  if (!adminCode) {
    return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.admin_code !== adminCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { guest_first_name, guest_last_name, unit_id, check_in, check_out, total_paid, source } = body;

  if (!guest_first_name || !unit_id || !check_in || !check_out) {
    return NextResponse.json(
      { error: 'Missing required fields: guest_first_name, unit_id, check_in, check_out' },
      { status: 400 },
    );
  }

  if (!UNITS[unit_id]) {
    return NextResponse.json({ error: 'Unknown unit_id' }, { status: 400 });
  }

  try {
    const sql = getSql();
    const unitName = UNITS[unit_id];

    const { pin: returningPin, bookingCount } = await getReturningGuestInfo(null, guest_first_name, guest_last_name || '');
    const pin = returningPin ?? await generateUniquePin();
    const isReturning = bookingCount > 1;

    const nights = Math.round(
      (new Date(check_out).getTime() - new Date(check_in).getTime()) / (1000 * 60 * 60 * 24),
    );
    const paidNum = total_paid ? parseFloat(total_paid) : null;
    const nightlyRate = paidNum && nights > 0 ? parseFloat((paidNum / nights).toFixed(2)) : 0;

    const sourceLabel =
      source === 'airbnb' ? 'Airbnb' :
      source === 'vrbo' ? 'Vrbo' :
      source === 'booking_com' ? 'Booking.com' : 'Direct';

    const [row] = await sql<{ id: string; digital_key: string }[]>`
      INSERT INTO reservations
        (guest_first_name, guest_last_name, email, digital_key,
         unit_id, unit_name, check_in, check_out,
         nightly_rate, total_paid, source, status, booking_count)
      VALUES
        (${guest_first_name},
         ${guest_last_name || ''},
         ${null},
         ${pin},
         ${unit_id},
         ${unitName},
         ${check_in},
         ${check_out},
         ${nightlyRate},
         ${paidNum},
         ${source || 'direct'},
         'confirmed',
         ${bookingCount})
      RETURNING id, digital_key
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        subject: `🏠 New ${sourceLabel} Booking: ${guest_first_name} ${guest_last_name || ''} (${check_in})`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8d4a3f;">New Booking Added${isReturning ? ' — Returning Guest 🎉' : ''}</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;color:#555;width:160px;">Guest</td><td style="padding:8px;font-weight:bold;">${guest_first_name} ${guest_last_name || ''}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Unit</td><td style="padding:8px;">${unitName}</td></tr>
              <tr><td style="padding:8px;color:#555;">Check-in</td><td style="padding:8px;font-weight:bold;">${check_in}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;font-weight:bold;">${check_out}</td></tr>
              <tr><td style="padding:8px;color:#555;">Nights</td><td style="padding:8px;">${nights}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Total Paid</td><td style="padding:8px;">${paidNum != null ? `$${paidNum.toFixed(2)} USD` : 'N/A'}</td></tr>
              <tr><td style="padding:8px;color:#555;">Source</td><td style="padding:8px;">${sourceLabel}</td></tr>
              <tr><td style="padding:8px;color:#555;">Stay #</td><td style="padding:8px;">${bookingCount === 1 ? 'First visit' : `Visit #${bookingCount}`}</td></tr>
              <tr style="background:#fff3cd;"><td style="padding:8px;color:#555;">🔑 Door PIN</td><td style="padding:8px;font-size:1.5em;font-weight:bold;letter-spacing:0.3em;">${pin}${isReturning ? ' (same as before)' : ''}</td></tr>
            </table>
            <p style="color:#888;font-size:13px;">Added manually via admin form.</p>
          </div>
        `,
      }).catch((err: unknown) => console.error('[create-booking email]', err));
    }

    return NextResponse.json({ success: true, pin: row.digital_key, reservation_id: row.id, returning: isReturning });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[create-booking]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
