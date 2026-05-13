import { NextRequest, NextResponse } from 'next/server';

export interface BlockedRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD (inclusive last blocked day)
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { unitSlug: string } },
) {
  const { unitSlug } = params;

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    // Own bookings
    const bookings = await sql<{ check_in: string; check_out: string }[]>`
      SELECT check_in::date::text AS check_in, check_out::date::text AS check_out
      FROM bookings
      WHERE unit_slug = ${unitSlug}
        AND status IN ('pending', 'confirmed', 'checked_in')
      UNION ALL
      SELECT check_in::date::text, check_out::date::text
      FROM reservations
      WHERE unit_id = ${unitSlug}
        AND status IN ('pending', 'confirmed', 'checked_in')
    `.catch(() => []);

    // External platform blocks (iCal imports)
    const external = await sql<{ start_date: string; end_date: string }[]>`
      SELECT start_date::text, end_date::text
      FROM external_blocks
      WHERE unit_slug = ${unitSlug}
    `.catch(() => []);

    const blocked: BlockedRange[] = [
      // Own bookings: block check-in through day-after-checkout (cleaning day)
      ...bookings.map((b) => ({
        start: b.check_in,
        end: addDays(b.check_out, 1),
      })),
      // External blocks
      ...external.map((e) => ({
        start: e.start_date,
        end: addDays(e.end_date, 1),
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
