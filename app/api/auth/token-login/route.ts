import { NextRequest, NextResponse } from 'next/server';
import { verifyGuestJWT } from '@/lib/guest-auth';
import { getReservationById, calculateNightsRemaining, createGuestSession } from '@/lib/supabase-helpers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

    const decoded = verifyGuestJWT(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const reservation = await getReservationById(decoded.reservationId);
    if (!reservation) return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });

    const session = createGuestSession(reservation, token);
    return NextResponse.json({ success: true, data: session });
  } catch (error) {
    console.error('[token-login]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
