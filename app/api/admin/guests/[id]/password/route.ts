import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { checkAdminCode } from '@/lib/rent';
import { MIN_PASSWORD_LENGTH, hashPassword } from '@/lib/password';
import { getReservationById, sameGuestReservationIds } from '@/lib/supabase-helpers';

/**
 * POST /api/admin/guests/:id/password
 *   { "password": "..." } — set a specific password
 *   { "reset": true }     — back to the shared default password
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdminCode(request);
  if (denied) return denied;
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const reset = body?.reset === true;
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!reset && password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  }

  try {
    const reservation = await getReservationById(id);
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });

    const sql = getSql();
    const ids = await sameGuestReservationIds(reservation);
    const passwordHash = reset ? null : await hashPassword(password);
    await sql`UPDATE reservations SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id IN ${sql(ids)}`;

    return NextResponse.json({ success: true, has_custom_password: !reset });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin set guest password]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
