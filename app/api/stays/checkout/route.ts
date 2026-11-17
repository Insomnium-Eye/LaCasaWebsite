import { NextRequest, NextResponse } from 'next/server';
import { units } from '@/data/units';
import { getStripe } from '@/lib/stripe';
import { checkStay, stayCheckoutSchema } from '@/lib/stayBooking';

/**
 * Deliberately public: starts payment for a direct stay. The stay is checked
 * and priced again here on the server; the booking itself is only recorded
 * by the Stripe webhook once payment succeeds.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const parsed = stayCheckoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_details' }, { status: 400 });
  }
  const body = parsed.data;
  const unit = units.find((u) => u.slug === body.unitSlug)!;

  try {
    const quote = await checkStay(body.unitSlug, body.checkIn, body.checkOut, body.guests);
    if (!quote.ok) {
      return NextResponse.json(quote, { status: 409 });
    }

    const nights = quote.nights.length;
    const origin = new URL(request.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      ui_mode: 'embedded_page',
      allowed_payment_method_types: ['card'],
      customer_email: body.email,
      locale: body.language,
      // Stripe's minimum; the dates aren't held, so keep the window short.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: quote.currency.toLowerCase(),
            unit_amount: Math.round(quote.total * 100),
            product_data: {
              name: `${unit.name} – ${nights} night${nights === 1 ? '' : 's'}`,
              description: `${body.checkIn} → ${body.checkOut} · ${body.guests} guest${body.guests === 1 ? '' : 's'} · La Casa Oaxaca`,
            },
          },
        },
      ],
      // Read back by the Stripe webhook once payment succeeds.
      metadata: {
        kind: 'stay',
        unitSlug: unit.slug,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        guests: String(body.guests),
        guestName: body.name,
        guestEmail: body.email,
        guestPhone: body.phone,
        notes: body.notes ?? '',
        language: body.language,
      },
      return_url: `${origin}/stay/confirmed?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ ok: true, clientSecret: session.client_secret });
  } catch (error) {
    console.error('Stay checkout error:', error);
    return NextResponse.json({ ok: false, error: 'payment_error' }, { status: 500 });
  }
}
