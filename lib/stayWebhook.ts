import type Stripe from 'stripe';
import { Resend } from 'resend';
import { units } from '@/data/units';
import { confirmStay } from '@/lib/bookingAction';
import { nightsBetween } from '@/lib/date';
import { quoteStay } from '@/lib/hospitable';
import { ADMIN_EMAIL, emailRow as row, escapeHtml } from '@/lib/rent';
import { generateUniquePin, getReturningGuestInfo } from '@/lib/reservation-helpers';
import { recordPaidStay } from '@/lib/supabase-helpers';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'La Casa Oaxaca <onboarding@resend.dev>';

const money = (amount: number, currency: string) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

/**
 * A direct stay was paid (`checkout.session.completed`, metadata.kind = 'stay').
 * Records it as a confirmed reservation, or refunds it in full if the dates
 * were taken (on our calendar or on Airbnb/Vrbo) while the guest was paying.
 * Idempotent: a repeated event finds the reservation already recorded and stops.
 * Throws on database errors so the webhook returns 500 and Stripe retries.
 */
export async function handleStayPaid(stripe: Stripe, session: Stripe.Checkout.Session) {
  const m = session.metadata ?? {};
  const unit = units.find((u) => u.slug === m.unitSlug);
  if (!unit) {
    console.error(`Stay payment ${session.id} has an unknown unit`);
    return;
  }

  const totalPaid = (session.amount_total ?? 0) / 100;
  const currency = (session.currency ?? 'usd').toUpperCase();
  const nights = nightsBetween(m.checkIn, m.checkOut);
  const guests = parseInt(m.guests, 10) || 1;
  const [firstName, ...rest] = m.guestName.trim().split(/\s+/);
  const lastName = rest.join(' ');
  const es = m.language === 'es';

  // Did Airbnb or Vrbo take any of these nights while the guest was paying?
  let takenElsewhere = false;
  try {
    const quote = await quoteStay(unit.slug, m.checkIn, m.checkOut);
    takenElsewhere = !quote.ok && quote.error === 'unavailable';
  } catch (error) {
    // Hospitable unreachable: our own calendar check below still applies.
    console.error('Hospitable re-check failed for paid stay:', error);
  }

  const { pin: returningPin, bookingCount } = await getReturningGuestInfo(m.guestEmail, firstName, lastName);
  const pin = returningPin ?? (await generateUniquePin());

  const result = await recordPaidStay(
    {
      stripeSessionId: session.id,
      unitSlug: unit.slug,
      unitName: unit.name,
      checkIn: m.checkIn,
      checkOut: m.checkOut,
      guests,
      firstName,
      lastName,
      email: m.guestEmail,
      phone: m.guestPhone,
      totalPaid,
      currency,
      nightlyRate: nights > 0 ? Math.round((totalPaid / nights) * 100) / 100 : totalPaid,
      pin,
      bookingCount,
    },
    takenElsewhere,
  );
  if (result === 'exists') return;

  const details = [
    row('Unit', unit.name),
    row('Check-in', m.checkIn),
    row('Check-out', m.checkOut),
    row('Nights', String(nights)),
    row('Guests', String(guests)),
    row('Paid', money(totalPaid, currency)),
  ].join('');

  if (result === 'conflict') {
    await stripe.refunds.create(
      { payment_intent: session.payment_intent as string },
      { idempotencyKey: `stay-refund-${session.id}` },
    );
    if (!process.env.RESEND_API_KEY) return;
    await Promise.all([
      resend.emails.send({
        from: FROM,
        to: [m.guestEmail],
        subject: es ? 'Tu reserva no pudo completarse — reembolso total' : "We couldn't complete your booking — full refund",
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8d4a3f;">${es ? 'Lo sentimos' : "We're sorry"}</h2>
          <p>${es
            ? `Hola ${escapeHtml(firstName)}, esas fechas se reservaron mientras completabas el pago. Te reembolsamos el total; tu banco lo mostrará en 5–10 días hábiles.`
            : `Hi ${escapeHtml(firstName)}, those dates were booked by someone else while you were paying. We've refunded you in full; your bank will show it within 5–10 business days.`}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${details}</table>
        </div>`,
      }),
      resend.emails.send({
        from: FROM,
        to: [ADMIN_EMAIL],
        subject: `↩️ Direct booking refunded (dates taken): ${m.guestName} — ${unit.name}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8d4a3f;">Paid booking refunded automatically</h2>
          <p>The dates were taken ${takenElsewhere ? 'on Airbnb/Vrbo' : 'by another booking'} while the guest was paying. Stripe refund issued.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${row('Guest', m.guestName)}${row('Email', m.guestEmail)}${details}${row('Stripe session', session.id)}</table>
        </div>`,
      }),
    ]).catch((error) => console.error('Stay refund emails failed:', error));
    return;
  }

  // Confirmed: door code + guest email/SMS, then tell the admin to block the dates in Hospitable.
  try {
    const { lockSet } = await confirmStay({
      guest_name: m.guestName,
      email: m.guestEmail,
      phone: m.guestPhone,
      unit_name: unit.name,
      check_in: m.checkIn,
      check_out: m.checkOut,
      nights,
      guests,
      lock_code: pin,
    });
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: FROM,
        to: [ADMIN_EMAIL],
        subject: `${lockSet ? '💳' : '⚠️'} New paid direct booking: ${m.guestName} — ${unit.name} (${m.checkIn})${lockSet ? '' : ' — set the door code'}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#8d4a3f;">💳 New paid direct booking</h2>
          ${lockSet
            ? `<p>Door PIN <strong>${escapeHtml(pin)}</strong> is set on the front gate for this stay.</p>`
            : `<div style="background:#fde2e1;border-left:4px solid #b42318;padding:12px 16px;border-radius:8px;margin-bottom:12px;">
                <strong>Action needed: the door code could not be set automatically.</strong> In the TTLock app, add PIN <strong>${escapeHtml(pin)}</strong> on the front gate, valid ${escapeHtml(m.checkIn)} → ${escapeHtml(m.checkOut)}. The guest has already been sent this PIN.
              </div>`}
          <div style="background:#fff3cd;border-left:4px solid #c36a4f;padding:12px 16px;border-radius:8px;">
            Airbnb and Vrbo are blocked automatically once this unit's calendar feed is imported into Hospitable. If it isn't yet, block ${escapeHtml(m.checkIn)} → ${escapeHtml(m.checkOut)} for ${escapeHtml(unit.name)} in Hospitable by hand.
          </div>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            ${row('Guest', m.guestName)}${row('Email', m.guestEmail)}${row('Phone', m.guestPhone)}
            ${details}${row('Notes', m.notes)}${row('Door PIN', pin)}${row('Stripe session', session.id)}
          </table>
        </div>`,
      });
    }
  } catch (error) {
    // The reservation is saved; don't make Stripe retry over a notification failure.
    console.error('Paid stay notifications failed:', error);
  }
}
