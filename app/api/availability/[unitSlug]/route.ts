import { NextRequest, NextResponse } from 'next/server';
import { CLEANING_BUFFER_DAYS, addDays } from '@/lib/date';

export interface BlockedRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD (inclusive last blocked day)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ unitSlug: string }> },
) {
  const { unitSlug } = await params;

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    const slugsToCheck = [unitSlug];

    const bookings = await sql<{ check_in: string; check_out: string }[]>`
      SELECT check_in::date::text AS check_in, check_out::date::text AS check_out
      FROM bookings
      WHERE unit_slug = ANY(${slugsToCheck})
        AND status IN ('pending', 'confirmed', 'checked_in')
      UNION ALL
      SELECT check_in::date::text, check_out::date::text
      FROM reservations
      WHERE unit_id = ANY(${slugsToCheck})
        AND status IN ('pending', 'confirmed', 'checked_in')
    `.catch(() => []);

    // External platform blocks (iCal imports)
    const external = await sql<{ start_date: string; end_date: string }[]>`
      SELECT start_date::text, end_date::text
      FROM external_blocks
      WHERE unit_slug = ANY(${slugsToCheck})
    `.catch(() => []);

    const blocked: BlockedRange[] = [
      // Own bookings: block check-in through 2 days after checkout (cleaning + maintenance buffer)
      ...bookings.map((b) => ({
        start: b.check_in,
        end: addDays(b.check_out, CLEANING_BUFFER_DAYS),
      })),
      // External blocks: same 2-day buffer
      ...external.map((e) => ({
        start: e.start_date,
        end: addDays(e.end_date, CLEANING_BUFFER_DAYS),
      })),
    ];

    return NextResponse.json({ blocked }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    // DB unavailable — return empty so bookings still work
    return NextResponse.json({ blocked: [] });
  }
}
