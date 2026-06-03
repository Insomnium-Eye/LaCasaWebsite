import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';

const resend = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'change-me-in-production';
const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://oaxaca-rental.com').replace(/^﻿/, '');

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export async function GET(request: NextRequest) {
  // Allow Vercel cron (Authorization header) or manual trigger with ?secret=
  const authHeader = request.headers.get('authorization') ?? '';
  const querySecret = new URL(request.url).searchParams.get('secret') ?? '';
  const cronSecret = process.env.CRON_SECRET ?? '';
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    const tomorrow = addDays(new Date().toISOString().slice(0, 10), 1);
    const twoDaysAfterTomorrow = addDays(tomorrow, 2);

    // All confirmed/checked-in reservations checking out tomorrow with an email
    const reservations = await sql<{
      id: string;
      guest_first_name: string;
      email: string;
      unit_id: string;
      unit_name: string;
      check_in: string;
      check_out: string;
      nightly_rate: number;
    }[]>`
      SELECT id, guest_first_name, email, unit_id, unit_name,
             check_in::date::text AS check_in, check_out::date::text AS check_out,
             nightly_rate
      FROM reservations
      WHERE check_out::date::text = ${tomorrow}
        AND status IN ('confirmed', 'checked_in')
        AND email IS NOT NULL AND email <> ''
    `;

    if (reservations.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No checkouts tomorrow' });
    }

    let sent = 0;

    for (const r of reservations) {
      // Check if another booking occupies the unit within the 2-day cleanup buffer.
      // Gap of ≤2 days = no room to extend (need 2 clean days between stays).
      // Uses >= and <= so same-day turnovers and exact 2-day gaps are caught.
      const [nextBooking] = await sql<{ check_in: string }[]>`
        SELECT check_in::date::text AS check_in FROM bookings
        WHERE unit_slug = ${r.unit_id}
          AND status IN ('pending', 'confirmed', 'checked_in')
          AND check_in::date >= ${tomorrow}
          AND check_in::date::text <= ${twoDaysAfterTomorrow}
        UNION ALL
        SELECT check_in::date::text AS check_in FROM reservations
        WHERE unit_id = ${r.unit_id}
          AND id <> ${r.id}
          AND status IN ('confirmed', 'checked_in')
          AND check_in::date >= ${tomorrow}
          AND check_in::date::text <= ${twoDaysAfterTomorrow}
        LIMIT 1
      `;

      const isOccupied = !!nextBooking;

      // 48h token so the link stays valid through checkout day
      const token = jwt.sign(
        {
          reservationId: r.id,
          guestName: r.guest_first_name,
          email: r.email,
          unitName: r.unit_name,
        },
        JWT_SECRET,
        { expiresIn: '48h' }
      );

      const reviewUrl  = `${BASE_URL}/portal?token=${token}&tab=review`;
      const extendUrl  = `${BASE_URL}/portal?token=${token}&tab=extend`;

      const btnGreen = 'display:inline-block;background:#4a7c3f;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;';
      const btnBlue  = 'display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;';

      await resend.emails.send({
        from: 'La Casa Oaxaca <onboarding@resend.dev>',
        to: [r.email],
        replyTo: 'ebm22david@gmail.com',
        subject: `🏡 Check-out reminder — ${r.unit_name} (tomorrow)`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#8d4a3f;">Your check-out is tomorrow</h2>
            <p>Hi ${r.guest_first_name},</p>
            <p>Just a reminder that your stay at <strong>${r.unit_name}</strong> ends tomorrow, <strong>${fmtDate(tomorrow)}</strong>. We hope you had a wonderful time!</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr><td style="padding:8px;color:#555;">Unit</td><td style="padding:8px;font-weight:bold;">${r.unit_name}</td></tr>
              <tr style="background:#f9f9f9;"><td style="padding:8px;color:#555;">Check-out</td><td style="padding:8px;font-weight:bold;">${fmtDate(tomorrow)}</td></tr>
            </table>
            ${isOccupied ? `
            <p>We'd love to hear about your experience. Please take a moment to share your thoughts!</p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${reviewUrl}" style="${btnGreen}">⭐ Leave a Review</a>
            </div>
            ` : `
            <p>Great news — the unit is available for a few more days if you'd like to extend your stay!</p>
            <div style="text-align:center;margin:28px 0;display:flex;gap:12px;justify-content:center;">
              <a href="${extendUrl}" style="${btnBlue}">📅 Extend Your Stay</a>
              &nbsp;&nbsp;
              <a href="${reviewUrl}" style="${btnGreen}">⭐ Leave a Review</a>
            </div>
            `}
            <p style="color:#888;font-size:13px;margin-top:32px;">Questions? Reply to this email or contact us on WhatsApp.<br>— La Casa Oaxaca</p>
          </div>
        `,
      }).catch((err: unknown) => console.error('[checkout-reminder email]', err));

      sent++;
    }

    return NextResponse.json({ sent, tomorrow });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[checkout-reminder cron]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
