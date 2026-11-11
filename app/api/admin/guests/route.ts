import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { checkAdminCode } from '@/lib/rent';

// GET /api/admin/guests — current and upcoming guests with their portal login details
export async function GET(request: NextRequest) {
  const denied = checkAdminCode(request);
  if (denied) return denied;

  try {
    const sql = getSql();
    const guests = await sql`
      SELECT id, guest_first_name, guest_last_name, email, unit_name,
             check_in::date::text AS check_in, check_out::date::text AS check_out,
             digital_key, username, status,
             (password_hash IS NOT NULL) AS has_custom_password
      FROM reservations
      WHERE status IN ('confirmed', 'checked_in')
      ORDER BY check_in
    `;
    return NextResponse.json({ guests });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin guests list]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
