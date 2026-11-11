import { NextRequest, NextResponse } from 'next/server';
import {
  findReservationByIdentifier,
  createGuestSession,
} from '@/lib/supabase-helpers';
import {
  detectIdentifierType,
  normalizeIdentifier,
  generateGuestJWT,
  USERNAME_PATTERN,
} from '@/lib/guest-auth';
import { verifyGuestPassword } from '@/lib/password';
import { getAdminPasswordHash } from '@/lib/adminCredentials';

const RATE_LIMIT_MAP = new Map<string, number[]>();
const RATE_LIMIT_ATTEMPTS = parseInt(process.env.RATE_LIMIT_ATTEMPTS || '10');
const RATE_LIMIT_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15') * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (RATE_LIMIT_MAP.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_ATTEMPTS) return false;
  recent.push(now);
  RATE_LIMIT_MAP.set(ip, recent);
  return true;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { identifier, password } = await request.json();

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter your lock code, email, or username.' },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isLockCode = /^\d{4}$/.test(trimmed);
    const isUsername = USERNAME_PATTERN.test(trimmed);
    const phoneDigits = trimmed.replace(/\D/g, '');
    const isPhone = !isLockCode && phoneDigits.length >= 7 && phoneDigits.length <= 15
      && /^\+?[\d\s\-(). ]+$/.test(trimmed);

    if (!isEmail && !isLockCode && !isPhone && !isUsername) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 4-digit lock code, email address, phone number, or username.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter your password.' },
        { status: 400 }
      );
    }

    // Admin login — the admin code plus the admin password (shared default until changed)
    const adminCode = process.env.ADMIN_PORTAL_CODE;
    if (adminCode && trimmed === adminCode) {
      let adminHash: string | null;
      try {
        adminHash = await getAdminPasswordHash();
      } catch (dbErr) {
        console.error('[Guest login] admin credentials DB error:', dbErr);
        return NextResponse.json(
          { success: false, error: 'Unable to reach the reservation system. Please try again shortly.' },
          { status: 503 }
        );
      }
      if (!(await verifyGuestPassword(password, adminHash))) {
        return NextResponse.json(
          { success: false, error: 'Incorrect lock code or password.' },
          { status: 401 }
        );
      }

      const token = generateGuestJWT({
        reservationId: 'admin',
        guestName: 'Admin',
        email: '',
        unitName: '',
        checkIn: '',
        checkOut: '',
        nightsRemaining: 0,
        nightlyRate: 0,
        isAdmin: true,
      });
      return NextResponse.json({
        success: true,
        data: {
          reservationId: 'admin',
          guestName: 'Admin',
          email: '',
          unitName: '',
          checkIn: '',
          checkOut: '',
          nightsRemaining: 0,
          nightlyRate: 0,
          isAdmin: true,
          usingDefaultPassword: !adminHash,
          token,
        },
      }, { status: 200 });
    }

    const type = detectIdentifierType(trimmed);
    const normalized = normalizeIdentifier(trimmed, type);

    let reservation = null;
    try {
      reservation = await findReservationByIdentifier(normalized, type);

      // For phone, also try the raw trimmed value in case it was stored without normalization
      if (!reservation && type === 'phone' && normalized !== trimmed) {
        reservation = await findReservationByIdentifier(trimmed, type);
      }
    } catch (dbErr) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error('[Guest login] DB error:', msg);
      return NextResponse.json(
        { success: false, error: 'Unable to reach the reservation system. Please try again shortly.' },
        { status: 503 }
      );
    }

    // Same message either way so the form doesn't reveal which lock codes exist.
    if (!reservation || !(await verifyGuestPassword(password, reservation.password_hash))) {
      return NextResponse.json(
        { success: false, error: 'Incorrect lock code or password.' },
        { status: 401 }
      );
    }

    const token = generateGuestJWT({
      reservationId: reservation.id,
      guestName: reservation.guest_first_name,
      email: reservation.email,
      phone: reservation.phone,
      unitName: reservation.unit_name,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      nightsRemaining: 0, // recalculated client-side via session
      nightlyRate: reservation.nightly_rate,
    });

    const session = createGuestSession(reservation, token);

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error) {
    console.error('[Guest login] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
