import { NextRequest, NextResponse } from 'next/server';
import { createCleaningRequest, getReservationById } from '@/lib/supabase-helpers';
import { verifyGuestJWT } from '@/lib/guest-auth';

export async function POST(request: NextRequest) {
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

    const { date, notes } = await request.json();

    // Validate date
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    // Get reservation to validate dates
    const reservation = await getReservationById(session.reservationId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Validate date is within stay
    const scheduledDate = new Date(date);
    const checkIn = new Date(reservation.check_in);
    const checkOut = new Date(reservation.check_out);
    const today = new Date();

    if (scheduledDate < checkIn || scheduledDate > checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cleaning date must be within your stay.',
        },
        { status: 400 }
      );
    }

    if (scheduledDate < today) {
      return NextResponse.json(
        { success: false, error: 'Cannot schedule cleaning for past dates.' },
        { status: 400 }
      );
    }

    // Create cleaning request
    const cleaningRequest = await createCleaningRequest(
      session.reservationId,
      date,
      notes
    );

    // TODO: Send notification email/SMS to property management

    return NextResponse.json(
      {
        success: true,
        data: cleaningRequest,
        message: `Cleaning scheduled for ${date}. A $${cleaningRequest.fee} fee will be added to your account.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Cleaning request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred creating the cleaning request.',
      },
      { status: 500 }
    );
  }
}
