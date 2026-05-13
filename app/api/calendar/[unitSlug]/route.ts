import { NextRequest, NextResponse } from 'next/server';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

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

    const bookings = await sql<{ id: string; check_in: string; check_out: string }[]>`
      SELECT id::text, check_in::date::text AS check_in, check_out::date::text AS check_out
      FROM bookings
      WHERE unit_slug = ${unitSlug}
        AND status IN ('confirmed', 'checked_in')
    `.catch(() => []);

    const events = bookings.map((b) => ({
      uid: `booking-${b.id}@oaxaca-rental.com`,
      start: b.check_in,
      end: addDays(b.check_out, 1), // include cleaning day
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
