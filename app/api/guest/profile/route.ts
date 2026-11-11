import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSql } from '@/lib/db';
import { USERNAME_PATTERN, generateGuestJWT, verifyGuestJWT } from '@/lib/guest-auth';
import { MIN_PASSWORD_LENGTH, hashPassword, verifyGuestPassword } from '@/lib/password';
import { createGuestSession, getReservationById } from '@/lib/supabase-helpers';
import { GuestSession, Reservation } from '@/types/guest-portal';

// Retired-key sentinel set at checkout; shared by many past reservations, so never group by it.
const RETIRED_CODE = '0000';

async function authenticate(request: NextRequest): Promise<{ session: GuestSession } | { error: NextResponse }> {
  const auth = request.headers.get('authorization');
  const session = auth?.startsWith('Bearer ') ? verifyGuestJWT(auth.substring(7)) : null;
  if (!session) return { error: NextResponse.json({ success: false, error: 'Please log in again.' }, { status: 401 }) };
  if (session.isAdmin) {
    return { error: NextResponse.json({ success: false, error: 'The admin login has no profile.' }, { status: 403 }) };
  }
  return { session };
}

const profileOf = (r: Reservation) => ({
  firstName: r.guest_first_name,
  lastName: r.guest_last_name ?? '',
  email: r.email ?? '',
  phone: r.phone ?? '',
  username: r.username ?? '',
  lockCode: r.digital_key ?? '',
  usingDefaultPassword: !r.password_hash,
});

// GET /api/guest/profile
export async function GET(request: NextRequest) {
  const auth = await authenticate(request);
  if ('error' in auth) return auth.error;

  const reservation = await getReservationById(auth.session.reservationId);
  if (!reservation) return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
  return NextResponse.json({ success: true, data: profileOf(reservation) });
}

const emptyToNull = (v: string) => (v.trim() === '' ? null : v.trim());

const updateSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password to save changes.'),
  firstName: z.string().trim().min(1, 'First name is required.').max(100),
  lastName: z.string().trim().max(100),
  email: z.string().trim().toLowerCase().max(255)
    .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address.')
    .transform(emptyToNull),
  phone: z.string().trim().max(20).transform(emptyToNull),
  username: z.string().trim()
    .refine((v) => v === '' || USERNAME_PATTERN.test(v),
      'Usernames are 3–30 characters, start with a letter, and use only letters, numbers, dots, dashes, or underscores.')
    .transform((v) => emptyToNull(v)?.toLowerCase() ?? null),
  newPassword: z.string().max(200).optional()
    .refine((v) => !v || v.length >= MIN_PASSWORD_LENGTH, `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`),
});

// PATCH /api/guest/profile — update name, contact details, username and/or password
export async function PATCH(request: NextRequest) {
  const auth = await authenticate(request);
  if ('error' in auth) return auth.error;

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }
  const body = parsed.data;

  try {
    const reservation = await getReservationById(auth.session.reservationId);
    if (!reservation) return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });

    if (!(await verifyGuestPassword(body.currentPassword, reservation.password_hash))) {
      return NextResponse.json({ success: false, error: 'Your current password is incorrect.' }, { status: 401 });
    }

    const sql = getSql();

    // A returning guest can have several active reservations sharing one lock code.
    // Keep their login details identical across them, whichever one the login finds.
    const key = reservation.digital_key && reservation.digital_key !== RETIRED_CODE ? reservation.digital_key : null;
    const sameGuest = await sql<{ id: string }[]>`
      SELECT id FROM reservations
      WHERE id = ${reservation.id}
         OR (${key}::text IS NOT NULL AND digital_key = ${key} AND status IN ('confirmed', 'checked_in'))
    `;
    const ids = sameGuest.map((r) => r.id);

    // Usernames and emails are login identifiers, so another current guest can't share them.
    if (body.username) {
      const [taken] = await sql`
        SELECT 1 FROM reservations
        WHERE LOWER(username) = ${body.username} AND id NOT IN ${sql(ids)} AND status IN ('confirmed', 'checked_in') LIMIT 1`;
      if (taken) return NextResponse.json({ success: false, error: 'That username is already taken.' }, { status: 409 });
    }
    if (body.email) {
      const [taken] = await sql`
        SELECT 1 FROM reservations
        WHERE LOWER(email) = ${body.email} AND id NOT IN ${sql(ids)} AND status IN ('confirmed', 'checked_in') LIMIT 1`;
      if (taken) return NextResponse.json({ success: false, error: 'That email is already used by another guest.' }, { status: 409 });
    }

    const passwordHash = body.newPassword ? await hashPassword(body.newPassword) : reservation.password_hash ?? null;

    await sql`
      UPDATE reservations SET
        guest_first_name = ${body.firstName},
        guest_last_name = ${body.lastName},
        email = ${body.email},
        phone = ${body.phone},
        username = ${body.username},
        password_hash = ${passwordHash},
        updated_at = NOW()
      WHERE id IN ${sql(ids)}
    `;

    // Names/email live in the JWT, so hand back a fresh session.
    const updated = (await getReservationById(reservation.id))!;
    const token = generateGuestJWT({
      reservationId: updated.id,
      guestName: updated.guest_first_name,
      email: updated.email,
      unitName: updated.unit_name,
      checkIn: updated.check_in,
      checkOut: updated.check_out,
      nightsRemaining: 0,
      nightlyRate: updated.nightly_rate,
    });

    return NextResponse.json({
      success: true,
      data: { profile: profileOf(updated), session: createGuestSession(updated, token) },
    });
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json({ success: false, error: 'That email or username is already in use.' }, { status: 409 });
    }
    console.error('[guest profile update]', error);
    return NextResponse.json({ success: false, error: 'Could not save your changes. Please try again.' }, { status: 500 });
  }
}
