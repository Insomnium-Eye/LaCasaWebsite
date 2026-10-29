import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { verifyGuestJWT } from '@/lib/guest-auth';
import { getReservationById } from '@/lib/supabase-helpers';
import { MAX_PASSENGERS, getDestination, tripPriceMxn } from '@/lib/transportPricing';

// Oaxaca has been on fixed UTC-6 since Mexico dropped DST in 2022.
const OAXACA_UTC_OFFSET = '-06:00';

const schema = z.object({
  destinationId: z.string(),
  datetime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  passengers: z.number().int().min(1).max(MAX_PASSENGERS),
  roundTrip: z.boolean(),
  notes: z.string().max(450).optional(),
  language: z.enum(['en', 'es']).default('en'),
  // Required for public bookings; portal guests use their reservation details.
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(5).max(30).optional(),
});

const toDateOnly = (value: string | Date) => new Date(value).toISOString().slice(0, 10);

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Online payments are not configured yet. Please contact us to book.' },
      { status: 503 }
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Please check the booking details and try again.' }, { status: 400 });
  }
  const body = parsed.data;

  const destination = getDestination(body.destinationId);
  if (!destination) {
    return NextResponse.json({ success: false, error: 'Invalid destination selected.' }, { status: 400 });
  }

  const scheduledAt = new Date(`${body.datetime}:00${OAXACA_UTC_OFFSET}`);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() < Date.now()) {
    return NextResponse.json({ success: false, error: 'Please choose a future date and time.' }, { status: 400 });
  }

  // Portal guests are identified by their JWT; everyone else must give contact details.
  let guest: { name: string; email: string; phone: string; reservationId: string };
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const session = verifyGuestJWT(authHeader.substring(7));
    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session. Please log in again.' }, { status: 401 });
    }
    const reservation = await getReservationById(session.reservationId);
    if (!reservation) {
      return NextResponse.json({ success: false, error: 'Reservation not found.' }, { status: 404 });
    }
    const day = body.datetime.slice(0, 10);
    if (day < toDateOnly(reservation.check_in) || day > toDateOnly(reservation.check_out)) {
      return NextResponse.json({ success: false, error: 'Transport must be scheduled within your stay.' }, { status: 400 });
    }
    guest = {
      name: session.guestName,
      email: session.email,
      phone: reservation.phone ?? '',
      reservationId: session.reservationId,
    };
  } else {
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json({ success: false, error: 'Name, email, and phone are required.' }, { status: 400 });
    }
    guest = { name: body.name, email: body.email, phone: body.phone, reservationId: '' };
  }

  const priceMxn = tripPriceMxn(destination, body.roundTrip);
  const tripLabel = body.roundTrip ? 'Round trip' : 'One way';
  const origin = new URL(request.url).origin;

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      allowed_payment_method_types: ['card'],
      customer_email: guest.email,
      locale: body.language,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'mxn',
            unit_amount: priceMxn * 100,
            product_data: {
              name: `Private transport – ${destination.name.en}`,
              description: `${tripLabel} · ${body.datetime.replace('T', ' ')} (Oaxaca time) · ${body.passengers} passenger(s)`,
            },
          },
        },
      ],
      // Read back by the Stripe webhook once payment succeeds.
      metadata: {
        kind: 'transport',
        destinationId: destination.id,
        destinationName: destination.name.en,
        datetime: body.datetime,
        passengers: String(body.passengers),
        roundTrip: String(body.roundTrip),
        priceMxn: String(priceMxn),
        guestName: guest.name,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        reservationId: guest.reservationId,
        notes: body.notes ?? '',
        language: body.language,
      },
      success_url: `${origin}/transport/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${guest.reservationId ? '/portal?tab=transport&' : '/transport?'}payment=cancelled`,
    });

    return NextResponse.json({ success: true, url: checkout.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ success: false, error: 'Could not start payment. Please try again.' }, { status: 500 });
  }
}
