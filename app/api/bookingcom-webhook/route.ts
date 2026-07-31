import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { Resend } from 'resend';
import { generateUniquePin, getReturningGuestInfo } from '@/lib/reservation-helpers';

const resend = new Resend(process.env.RESEND_API_KEY);

function xmlExtract(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}

interface Reservation {
  firstName: string;
  lastName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  totalPaid: number | null;
  currency: string;
  resId: string;
  status: string;
}

function parseXml(xml: string): Reservation | null {
  const resId = xmlExtract(xml, 'res_id') || xmlExtract(xml, 'ID') || xmlExtract(xml, 'reservation_id');
  const status = xmlExtract(xml, 'res_status') || xmlExtract(xml, 'status') || 'new';

  // Only process new bookings (ignore modifications/cancellations for now)
  if (status && !['new', 'modified', '1'].includes(status.toLowerCase())) return null;

  const firstName = xmlExtract(xml, 'first_name') || xmlExtract(xml, 'GivenName');
  const lastName = xmlExtract(xml, 'last_name') || xmlExtract(xml, 'Surname');
  const email = xmlExtract(xml, 'email') || xmlExtract(xml, 'Email');
  const checkIn = xmlExtract(xml, 'arrival') || xmlExtract(xml, 'Start') || xmlExtract(xml, 'checkin');
  const checkOut = xmlExtract(xml, 'departure') || xmlExtract(xml, 'End') || xmlExtract(xml, 'checkout');
  const totalStr = xmlExtract(xml, 'total') || xmlExtract(xml, 'AmountAfterTax') || xmlExtract(xml, 'price');
  const currency = xmlExtract(xml, 'currency') || xmlExtract(xml, 'CurrencyCode') || 'USD';

  if (!firstName || !checkIn || !checkOut) return null;

  return {
    firstName,
    lastName,
    email,
    checkIn,
    checkOut,
    totalPaid: totalStr ? parseFloat(totalStr) : null,
    currency,
    resId,
    status,
  };
}

function parseJson(body: Record<string, unknown>): Reservation | null {
  const firstName =
    (body.guest_first_name as string) ||
    (body.first_name as string) ||
    ((body.guest as Record<string, string>)?.first_name) || '';
  const lastName =
    (body.guest_last_name as string) ||
    (body.last_name as string) ||
    ((body.guest as Record<string, string>)?.last_name) || '';
  const email =
    (body.email as string) ||
    (body.guest_email as string) ||
    ((body.guest as Record<string, string>)?.email) || '';
  const checkIn =
    (body.check_in as string) ||
    (body.arrival as string) ||
    (body.checkin as string) || '';
  const checkOut =
    (body.check_out as string) ||
    (body.departure as string) ||
    (body.checkout as string) || '';
  const totalPaid =
    body.total_paid != null ? parseFloat(String(body.total_paid)) :
    body.total != null ? parseFloat(String(body.total)) : null;

  if (!firstName || !checkIn || !checkOut) return null;

  return {
    firstName,
    lastName,
    email,
    checkIn,
    checkOut,
    totalPaid: isNaN(totalPaid as number) ? null : totalPaid,
    currency: (body.currency as string) || 'USD',
    resId: (body.res_id as string) || (body.reservation_id as string) || '',
    status: (body.status as string) || 'new',
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const contentType = request.headers.get('content-type') || '';

  let parsed: Reservation | null = null;
  let parseError = '';

  if (contentType.includes('xml') || rawBody.trim().startsWith('<')) {
    parsed = parseXml(rawBody);
    if (!parsed) parseError = 'XML received but could not extract required fields';
  } else {
    try {
      const json = JSON.parse(rawBody) as Record<string, unknown>;
      parsed = parseJson(json);
      if (!parsed) parseError = 'JSON received but could not extract required fields';
    } catch {
      parseError = `Could not parse body as XML or JSON`;
    }
  }

  // Always email admin with raw payload for debugging (first 30 days or when parse fails)
  if (process.env.RESEND_API_KEY) {
    const subject = parsed
      ? `📥 Booking.com booking: ${parsed.firstName} ${parsed.lastName} (${parsed.checkIn})`
      : `⚠️ Booking.com webhook received — parse ${parseError ? 'failed' : 'ok'}`;

    await resend.emails.send({
      from: 'La Casa Oaxaca <onboarding@resend.dev>',
      to: ['ebm22david@gmail.com'],
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:700px;">
          <h2 style="color:#8d4a3f;">Booking.com Webhook Received</h2>
          ${parsed ? `
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;color:#555;width:140px;">Guest</td><td style="padding:8px;font-weight:bold;">${parsed.firstName} ${parsed.lastName}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Email</td><td style="padding:8px;">${parsed.email || 'N/A'}</td></tr>
            <tr><td style="padding:8px;color:#555;">Check-in</td><td style="padding:8px;">${parsed.checkIn}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;">${parsed.checkOut}</td></tr>
            <tr><td style="padding:8px;color:#555;">Total</td><td style="padding:8px;">${parsed.totalPaid != null ? `${parsed.totalPaid.toFixed(2)} ${parsed.currency}` : 'N/A'}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Booking ID</td><td style="padding:8px;">${parsed.resId || 'N/A'}</td></tr>
          </table>
          ` : `<p style="color:#c00;">Parse failed: ${parseError}</p>`}
          <details>
            <summary style="cursor:pointer;color:#555;">Raw payload (click to expand)</summary>
            <pre style="background:#f5f5f5;padding:12px;border-radius:4px;font-size:11px;overflow-x:auto;white-space:pre-wrap;">${rawBody.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </details>
        </div>
      `,
    }).catch((err: unknown) => console.error('[bookingcom email]', err));
  }

  if (!parsed) {
    // Return 200 so Booking.com doesn't keep retrying; log the issue
    console.error('[bookingcom-webhook] Parse failed:', parseError, rawBody.slice(0, 500));
    return new NextResponse('OK', { status: 200 });
  }

  try {
    const sql = getSql();
    const emailVal = parsed.email || null;
    const { pin: returningPin, bookingCount } = await getReturningGuestInfo(emailVal, parsed.firstName, parsed.lastName);
    const pin = returningPin ?? await generateUniquePin();
    const isReturning = bookingCount > 1;

    const nights = Math.round(
      (new Date(parsed.checkOut).getTime() - new Date(parsed.checkIn).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const nightlyRate = parsed.totalPaid && nights > 0
      ? parseFloat((parsed.totalPaid / nights).toFixed(2))
      : 0;

    await sql`
      INSERT INTO reservations
        (guest_first_name, guest_last_name, email, digital_key,
         unit_id, unit_name, check_in, check_out,
         nightly_rate, total_paid, source, status, booking_count)
      VALUES
        (${parsed.firstName},
         ${parsed.lastName || ''},
         ${emailVal},
         ${pin},
         'unknown',
         'La Casa Oaxaca',
         ${parsed.checkIn},
         ${parsed.checkOut},
         ${nightlyRate},
         ${parsed.totalPaid},
         'booking_com',
         'confirmed',
         ${bookingCount})
    `;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: ['ebm22david@gmail.com'],
        subject: `🔑 PIN assigned: ${parsed.firstName} ${parsed.lastName} (${parsed.checkIn})`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;">
            <h2 style="color:#8d4a3f;">Booking.com Reservation — PIN Assigned${isReturning ? ' 🎉 Returning Guest' : ''}</h2>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;color:#555;width:160px;">Guest</td><td style="padding:8px;font-weight:bold;">${parsed.firstName} ${parsed.lastName}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-in</td><td style="padding:8px;">${parsed.checkIn}</td></tr>
              <tr><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;">${parsed.checkOut}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Stay #</td><td style="padding:8px;">${bookingCount === 1 ? 'First visit' : `Visit #${bookingCount}`}</td></tr>
              <tr style="background:#fff3cd;"><td style="padding:8px;color:#555;">🔑 Door PIN</td><td style="padding:8px;font-size:1.5em;font-weight:bold;letter-spacing:0.3em;">${pin}${isReturning ? ' (same as before)' : ''}</td></tr>
            </table>
          </div>
        `,
      }).catch((err: unknown) => console.error('[bookingcom PIN email]', err));
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[bookingcom-webhook] DB error:', msg);
    // Still return 200 to prevent Booking.com retries; email already sent with details
    return new NextResponse('OK', { status: 200 });
  }
}
