import { NextRequest, NextResponse } from 'next/server';
import {
  createTransportRequest,
  getReservationById,
  getTransportDestinations,
} from '@/lib/supabase-helpers';
import { verifyGuestJWT } from '@/lib/guest-auth';

// Calculate transport price based on destination and options
const calculateTransportPrice = (
  basePrice: number,
  roundTrip: boolean
): number => {
  let total = basePrice;

  if (roundTrip) {
    // Apply 10% discount on round-trip
    total = basePrice * 2 * 0.9;
  }

  return parseFloat(total.toFixed(2));
};

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

    const {
      destination,
      customDestination,
      datetime,
      passengers,
      roundTrip,
      notes,
    } = await request.json();

    // Validate inputs
    if (!destination || !datetime || !passengers) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destination, datetime, and number of passengers are required.',
        },
        { status: 400 }
      );
    }

    if (passengers < 1 || passengers > 8) {
      return NextResponse.json(
        { success: false, error: 'Passengers must be between 1 and 8.' },
        { status: 400 }
      );
    }

    // Validate date is within stay
    const scheduledDate = new Date(datetime);
    const reservation = await getReservationById(session.reservationId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    const checkIn = new Date(reservation.check_in);
    const checkOut = new Date(reservation.check_out);

    if (scheduledDate < checkIn || scheduledDate > checkOut) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transport must be scheduled within your stay.',
        },
        { status: 400 }
      );
    }

    // Get destination pricing
    let basePrice = 0;

    if (destination !== 'custom') {
      const destinations = await getTransportDestinations();
      const dest = destinations.find((d) => d.name === destination);

      if (!dest) {
        return NextResponse.json(
          { success: false, error: 'Invalid destination selected.' },
          { status: 400 }
        );
      }

      basePrice = dest.base_price;
    } else {
      if (!customDestination) {
        return NextResponse.json(
          { success: false, error: 'Custom destination address is required.' },
          { status: 400 }
        );
      }
      // For custom destinations, require admin to quote
      basePrice = 0; // Will be quoted by admin
    }

    // Calculate price
    const price = calculateTransportPrice(basePrice, roundTrip);

    // Create transport request
    const transportRequest = await createTransportRequest(
      session.reservationId,
      destination === 'custom' ? 'Custom Destination' : destination,
      customDestination,
      datetime,
      passengers,
      roundTrip,
      price,
      notes
    );

    // TODO: Send notification to property manager

    return NextResponse.json(
      {
        success: true,
        data: transportRequest,
        message: `Transport booked for ${new Date(datetime).toLocaleDateString()}. ${customDestination ? 'A quote will be provided.' : `Estimated price: $${price.toFixed(2)}`}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Transport request error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred creating the transport request.',
      },
      { status: 500 }
    );
  }
}
