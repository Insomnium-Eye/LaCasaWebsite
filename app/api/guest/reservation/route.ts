import { NextRequest, NextResponse } from 'next/server';
import { getReservationById, createGuestSession } from '@/lib/supabase-helpers';
import { verifyGuestJWT, generateGuestJWT } from '@/lib/guest-auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = verifyGuestJWT(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch updated reservation details
    const reservation = await getReservationById(session.reservationId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Create updated session with fresh JWT
    const newToken = generateGuestJWT({
      reservationId: reservation.id,
      guestName: reservation.guest_first_name,
      email: reservation.email,
      phone: reservation.phone,
      unitName: reservation.unit_name,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      nightsRemaining: 0,
      nightlyRate: reservation.nightly_rate,
    });

    const updatedSession = createGuestSession(reservation, newToken);

    return NextResponse.json(
      {
        success: true,
        data: updatedSession,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reservation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred fetching reservation details.',
      },
      { status: 500 }
    );
  }
}
