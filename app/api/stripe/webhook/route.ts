import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { Resend } from 'resend';
import { getStripe } from '@/lib/stripe';
import { createPaidTransportRequest } from '@/lib/supabase-helpers';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'ebm22david@gmail.com';

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const row = (label: string, value: string) =>
  value
    ? `<tr><td style="padding:6px 12px;color:#555;width:160px;">${label}</td><td style="padding:6px 12px;font-weight:600;">${escapeHtml(value)}</td></tr>`
    : '';

async function handleTransportPaid(session: Stripe.Checkout.Session) {
  const m = session.metadata ?? {};
  const passengers = parseInt(m.passengers, 10) || 1;
  const roundTrip = m.roundTrip === 'true';
  const priceMxn = Number(m.priceMxn) || (session.amount_total ?? 0) / 100;
  const when = m.datetime.replace('T', ' ');
  const es = m.language === 'es';

  // Portal guests get the trip recorded against their reservation.
  let duplicate = false;
  if (m.reservationId) {
    try {
      duplicate =
        (await createPaidTransportRequest(m.reservationId, m.destinationName, m.datetime, passengers, roundTrip, priceMxn, m.notes || undefined)) === null;
    } catch (error) {
      console.error('Failed to record paid transport request:', error);
    }
  }
  if (duplicate || !process.env.RESEND_API_KEY) return;

  const details = [
    row('Destination', m.destinationName),
    row('Date & time', `${when} (Oaxaca time)`),
    row('Trip', roundTrip ? 'Round trip' : 'One way'),
    row('Passengers', String(passengers)),
    row('Paid', `$${priceMxn.toLocaleString('en-US')} MXN`),
    row('Notes', m.notes),
  ].join('');

  await resend.emails.send({
    from: 'La Casa Oaxaca <onboarding@resend.dev>',
    to: [ADMIN_EMAIL],
    subject: `🚗 Paid Transport Booking: ${m.guestName} — ${m.destinationName} (${when})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#8d4a3f;">🚗 New paid transport booking</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          ${row('Guest', m.guestName)}
          ${row('Email', m.guestEmail)}
          ${row('Phone', m.guestPhone)}
          ${row('Booked via', m.reservationId ? 'Guest portal' : 'Public transport page')}
          ${details}
          ${row('Stripe session', session.id)}
        </table>
      </div>`,
  });

  if (m.guestEmail) {
    await resend.emails.send({
      from: 'La Casa Oaxaca <onboarding@resend.dev>',
      to: [m.guestEmail],
      subject: es ? '🚗 Tu transporte está confirmado — La Casa Oaxaca' : '🚗 Your transport is booked — La Casa Oaxaca',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8d4a3f;">${es ? '¡Pago recibido!' : 'Payment received!'}</h2>
          <p>${es
            ? `Hola ${escapeHtml(m.guestName)}, tu transporte privado está confirmado. Te contactaremos antes del viaje.`
            : `Hi ${escapeHtml(m.guestName)}, your private transport is booked. We'll be in touch before your trip.`}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${details}</table>
        </div>`,
    });
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!stripe || !secret || !signature) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.payment_status === 'paid' && session.metadata?.kind === 'transport') {
      try {
        await handleTransportPaid(session);
      } catch (error) {
        // Payment already succeeded; log and acknowledge so Stripe doesn't resend duplicate emails.
        console.error('Transport payment follow-up failed:', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}
