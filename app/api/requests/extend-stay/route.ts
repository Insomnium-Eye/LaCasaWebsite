import { NextRequest, NextResponse } from 'next/server';
import { createStayExtension, getReservationById } from '@/lib/supabase-helpers';
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

    const { requestedCheckout } = await request.json();

    if (!requestedCheckout) {
      return NextResponse.json(
        { success: false, error: 'New checkout date is required' },
        { status: 400 }
      );
    }

    // Get reservation
    const reservation = await getReservationById(session.reservationId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Validate new checkout is after current checkout
    const currentCheckout = new Date(reservation.check_out);
    const newCheckout = new Date(requestedCheckout);

    if (newCheckout <= currentCheckout) {
      return NextResponse.json(
        { success: false, error: 'New checkout date must be after current checkout.' },
        { status: 400 }
      );
    }

    // Calculate extra nights and cost
    const extraNights = Math.ceil(
      (newCheckout.getTime() - currentCheckout.getTime()) / (1000 * 60 * 60 * 24)
    );

    const estimatedCost = extraNights * reservation.nightly_rate;

    // Create extension request
    const extension = await createStayExtension(
      session.reservationId,
      requestedCheckout,
      extraNights,
      estimatedCost
    );

    // TODO: Send notification to property manager

    return NextResponse.json(
      {
        success: true,
        data: extension,
        message: `Extension request submitted for ${extraNights} additional night(s). Estimated cost: $${estimatedCost.toFixed(2)}. We'll confirm within 24 hours.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Stay extension error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred creating the extension request.',
      },
      { status: 500 }
    );
  }
}
