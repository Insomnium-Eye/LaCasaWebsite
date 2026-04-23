import { NextRequest, NextResponse } from 'next/server';
import {
  createCancellationRequest,
  getReservationById,
} from '@/lib/supabase-helpers';
import { verifyGuestJWT } from '@/lib/guest-auth';
import { CANCELLATION_REASONS } from '@/types/guest-portal';

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

    const { reason, explanation } = await request.json();

    // Validate reason
    if (!reason || !CANCELLATION_REASONS.includes(reason)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid cancellation reason. Please select a valid option.',
        },
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

    // Create cancellation request
    const cancellationRequest = await createCancellationRequest(
      session.reservationId,
      reason,
      explanation
    );

    // TODO: Send notification emails to property manager and guest

    return NextResponse.json(
      {
        success: true,
        data: cancellationRequest,
        message: 'Cancellation request submitted. We will review your request and contact you within 24 hours.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Cancellation request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred creating the cancellation request.',
      },
      { status: 500 }
    );
  }
}
