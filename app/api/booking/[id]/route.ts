import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/adminToken';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token') ?? '';

  if (!verifyAdminToken(id, token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    const rows = await sql<{
      id: string; guest_name: string; email: string; phone: string;
      unit_name: string; check_in: string; check_out: string;
      nights: number; guests: number; total_usd: number;
      lock_code: string; status: string; created_at: string;
    }[]>`
      SELECT id::text, guest_name, email, phone, unit_name,
             check_in::date::text AS check_in, check_out::date::text AS check_out,
             nights, guests, total_usd, lock_code, status,
             created_at::text AS created_at
      FROM bookings
      WHERE id = ${id}::uuid
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking: rows[0] });
  } catch (err) {
    console.error('[Booking GET]', err);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
