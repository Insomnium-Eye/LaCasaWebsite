import { NextRequest, NextResponse } from 'next/server';
import { CLEANING_BUFFER_DAYS, addDays } from '@/lib/date';

function toICalDate(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

function buildIcal(
  unitName: string,
  events: Array<{ uid: string; start: string; end: string }>,
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//La Casa Oaxaca//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:La Casa Oaxaca – ${unitName}`,
  ];

  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${toICalDate(e.start)}`,
      // iCal DTEND for all-day events is exclusive — add 1 so the last night is blocked
      `DTEND;VALUE=DATE:${toICalDate(addDays(e.end, 1))}`,
      'SUMMARY:Booked',
      `UID:${e.uid}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ unitSlug: string }> },
) {
  const { unitSlug } = await params;

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    // Our own stays: paid direct bookings, admin/portal bookings and booking requests.
    // Airbnb and Vrbo stays are left out: they're already on those calendars.
    const stays = await sql<{ uid: string; check_in: string; check_out: string }[]>`
      SELECT 'reservation-' || id::text AS uid, check_in::date::text AS check_in, check_out::date::text AS check_out
      FROM reservations
      WHERE unit_id = ${unitSlug}
        AND status IN ('confirmed', 'checked_in')
        AND COALESCE(source, 'direct') NOT IN ('airbnb', 'vrbo')
      UNION ALL
      SELECT 'booking-' || id::text, check_in::date::text, check_out::date::text
      FROM bookings
      WHERE unit_slug = ${unitSlug}
        AND status IN ('confirmed', 'checked_in')
    `.catch((error) => {
      console.error('iCal export query failed:', error);
      return [];
    });

    // Block the stay plus the cleaning days after check-out (buildIcal adds 1 more for the exclusive DTEND).
    const events = stays.map((s) => ({
      uid: `${s.uid}@oaxaca-rental.com`,
      start: s.check_in,
      end: addDays(s.check_out, CLEANING_BUFFER_DAYS - 1),
    }));

    const ical = buildIcal(unitSlug, events);

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${unitSlug}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch {
    const empty = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//La Casa Oaxaca//EN\r\nEND:VCALENDAR';
    return new NextResponse(empty, {
      headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
    });
  }
}
