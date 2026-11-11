import type Stripe from 'stripe';
import { Resend } from 'resend';
import { getSql } from '@/lib/db';
import { ADMIN_EMAIL, Tenant, escapeHtml, firstChargeAt, formatMoney, leaseEndAt, monthLabel } from '@/lib/rent';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'La Casa Oaxaca <onboarding@resend.dev>';

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!process.env.RESEND_API_KEY || !to) return;
  const { error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">${html}</div>`,
  });
  if (error) console.error('[rent email]', error);
};

const tenantName = (t: Tenant) => `${t.first_name} ${t.last_name}`.trim();
const leaseRange = (t: Tenant) =>
  `${monthLabel(t.first_rent_date, t.language)} – ${monthLabel(t.first_rent_date, t.language, t.months - 1)}`;

/**
 * checkout.session.completed (mode=setup, kind=rent_setup): the tenant saved a card,
 * so create the subscription that charges rent on the 1st of each month for the lease.
 */
export async function handleRentSetupCompleted(stripe: Stripe, session: Stripe.Checkout.Session) {
  const tenantId = session.metadata?.tenantId;
  if (!tenantId || !session.setup_intent || !session.customer) return;
  const sql = getSql();

  // Atomically claim the tenant so webhook retries can't create a second subscription.
  const [tenant] = await sql<Tenant[]>`
    UPDATE tenants SET status = 'activating', updated_at = NOW()
    WHERE id = ${tenantId} AND status = 'pending_setup' AND stripe_subscription_id IS NULL
    RETURNING *
  `;
  if (!tenant) return;

  const start = firstChargeAt(tenant.first_rent_date);
  const end = leaseEndAt(tenant.first_rent_date, tenant.months);
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
  const unit = tenant.unit_name ?? tenant.unit_id;
  const rent = formatMoney(tenant.monthly_rent, tenant.currency);

  if (start <= Date.now() / 1000 + 60) {
    // The first rent date passed before setup finished — needs a human to pick new dates.
    await sql`UPDATE tenants SET status = 'pending_setup', updated_at = NOW() WHERE id = ${tenantId}`;
    await sendEmail(
      ADMIN_EMAIL,
      `⚠️ Rent autopay not started: ${tenantName(tenant)}`,
      `<p>${escapeHtml(tenantName(tenant))} saved a card, but the first rent date (${monthLabel(tenant.first_rent_date)}) has already passed,
       so no subscription was created. Add the tenant again with a new start month.</p>`,
    );
    return;
  }

  try {
    const setupIntent =
      typeof session.setup_intent === 'string' ? await stripe.setupIntents.retrieve(session.setup_intent) : session.setup_intent;
    const paymentMethod =
      typeof setupIntent.payment_method === 'string' ? setupIntent.payment_method : setupIntent.payment_method?.id;
    if (!paymentMethod) throw new Error(`SetupIntent ${setupIntent.id} has no payment method`);

    // Customer default (not subscription default) so card updates in the billing portal apply to rent.
    await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethod } });

    const product = await stripe.products.create(
      { name: `Monthly rent – ${unit}`, metadata: { tenantId } },
      { idempotencyKey: `rent-product-${tenantId}` },
    );

    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        description: `Rent – ${unit} – ${tenantName(tenant)}`,
        items: [
          {
            price_data: {
              currency: tenant.currency,
              product: product.id,
              unit_amount: Math.round(Number(tenant.monthly_rent) * 100),
              recurring: { interval: 'month' },
            },
          },
        ],
        // No charge until the first rent date, which also becomes the monthly billing anchor…
        trial_end: start,
        // …and the subscription ends exactly when the charge after the last month would happen.
        cancel_at: end,
        proration_behavior: 'none',
        metadata: { kind: 'rent', tenantId },
      },
      { idempotencyKey: `rent-sub-${tenantId}` },
    );

    await sql`
      UPDATE tenants
      SET status = 'active', stripe_customer_id = ${customerId}, stripe_subscription_id = ${subscription.id}, updated_at = NOW()
      WHERE id = ${tenantId}
    `;
  } catch (error) {
    // Release the claim so Stripe's webhook retry can try again.
    await sql`UPDATE tenants SET status = 'pending_setup', updated_at = NOW() WHERE id = ${tenantId} AND status = 'activating'`;
    throw error;
  }

  const es = tenant.language === 'es';
  await sendEmail(
    ADMIN_EMAIL,
    `🏠 Rent autopay set up: ${tenantName(tenant)} — ${unit}`,
    `<h2 style="color:#8d4a3f;">Rent autopay is active</h2>
     <p><strong>${escapeHtml(tenantName(tenant))}</strong> (${escapeHtml(tenant.email)}) saved a card for <strong>${escapeHtml(unit)}</strong>.</p>
     <p>${rent} will be charged on the 1st of each month, ${leaseRange({ ...tenant, language: 'en' })} (${tenant.months} payments).</p>`,
  );
  await sendEmail(
    tenant.email,
    es ? '✓ Pago automático de renta activado — La Casa Oaxaca' : '✓ Rent autopay is set up — La Casa Oaxaca',
    es
      ? `<h2 style="color:#8d4a3f;">¡Listo, ${escapeHtml(tenant.first_name)}!</h2>
         <p>Se cobrarán ${rent} el día 1 de cada mes por ${escapeHtml(unit)}, ${leaseRange(tenant)} (${tenant.months} pagos).</p>`
      : `<h2 style="color:#8d4a3f;">You're all set, ${escapeHtml(tenant.first_name)}!</h2>
         <p>${rent} will be charged on the 1st of each month for ${escapeHtml(unit)}, ${leaseRange(tenant)} (${tenant.months} payments).</p>`,
  );
}

/** invoice.paid / invoice.payment_failed for a rent subscription: record it and notify. */
export async function handleRentInvoice(invoice: Stripe.Invoice, outcome: 'paid' | 'failed') {
  const details = invoice.parent?.subscription_details;
  const tenantId = details?.metadata?.tenantId;
  if (details?.metadata?.kind !== 'rent' || !tenantId || !invoice.id) return;

  const amountCents = outcome === 'paid' ? invoice.amount_paid : invoice.amount_due;
  if (amountCents <= 0) return; // the $0 invoice Stripe issues when the subscription starts

  const sql = getSql();
  const [tenant] = await sql<Tenant[]>`SELECT * FROM tenants WHERE id = ${tenantId} LIMIT 1`;
  if (!tenant) return;

  const periodStart = new Date((invoice.lines.data[0]?.period.start ?? invoice.period_end) * 1000).toISOString().slice(0, 10);
  const amount = amountCents / 100;

  // Insert, or move failed → paid. Never downgrade a paid invoice; returns nothing for duplicate events.
  const changed = await sql`
    INSERT INTO rent_payments (tenant_id, stripe_invoice_id, amount, currency, period_start, status, hosted_invoice_url)
    VALUES (${tenantId}, ${invoice.id}, ${amount}, ${invoice.currency}, ${periodStart}, ${outcome}, ${invoice.hosted_invoice_url ?? null})
    ON CONFLICT (stripe_invoice_id) DO UPDATE
      SET status = EXCLUDED.status, amount = EXCLUDED.amount, updated_at = NOW()
      WHERE rent_payments.status = 'failed' AND EXCLUDED.status = 'paid'
    RETURNING id
  `;

  if (outcome === 'paid') {
    await sql`UPDATE tenants SET status = 'active', updated_at = NOW() WHERE id = ${tenantId} AND status IN ('past_due', 'activating')`;
  } else {
    await sql`UPDATE tenants SET status = 'past_due', updated_at = NOW() WHERE id = ${tenantId} AND status IN ('active', 'activating')`;
  }

  if (changed.length === 0) return; // already handled this event

  const es = tenant.language === 'es';
  const money = formatMoney(amount, invoice.currency);
  const month = monthLabel(periodStart, tenant.language);
  const unit = tenant.unit_name ?? tenant.unit_id;

  if (outcome === 'paid') {
    await sendEmail(
      ADMIN_EMAIL,
      `💰 Rent paid: ${tenantName(tenant)} — ${money} (${monthLabel(periodStart)})`,
      `<p>${escapeHtml(tenantName(tenant))} paid ${money} rent for ${escapeHtml(unit)}, ${monthLabel(periodStart)}.</p>`,
    );
    await sendEmail(
      tenant.email,
      es ? `Recibo de renta — ${month}` : `Rent receipt — ${month}`,
      es
        ? `<p>Hola ${escapeHtml(tenant.first_name)}, recibimos tu pago de ${money} por la renta de ${month}. ¡Gracias!</p>`
        : `<p>Hi ${escapeHtml(tenant.first_name)}, we received your ${money} rent payment for ${month}. Thank you!</p>`,
    );
  } else {
    const payLink = invoice.hosted_invoice_url
      ? `<p><a href="${invoice.hosted_invoice_url}">${es ? 'Pagar o actualizar tarjeta' : 'Pay now or update your card'}</a></p>`
      : '';
    await sendEmail(
      ADMIN_EMAIL,
      `⚠️ Rent payment FAILED: ${tenantName(tenant)} — ${money} (${monthLabel(periodStart)})`,
      `<p>The ${money} rent charge for ${escapeHtml(tenantName(tenant))} (${escapeHtml(unit)}, ${monthLabel(periodStart)}) failed.
       Stripe will retry automatically according to your retry settings.</p>${payLink}`,
    );
    await sendEmail(
      tenant.email,
      es ? `⚠️ No pudimos cobrar tu renta de ${month}` : `⚠️ Your ${month} rent payment didn't go through`,
      (es
        ? `<p>Hola ${escapeHtml(tenant.first_name)}, no pudimos cobrar ${money} a tu tarjeta. Lo intentaremos de nuevo; también puedes pagar ahora:</p>`
        : `<p>Hi ${escapeHtml(tenant.first_name)}, we couldn't charge ${money} to your card. We'll retry automatically, or you can pay now:</p>`) + payLink,
    );
  }
}

/** customer.subscription.deleted for a rent subscription: the lease finished or was ended early. */
export async function handleRentSubscriptionEnded(subscription: Stripe.Subscription) {
  const tenantId = subscription.metadata?.tenantId;
  if (subscription.metadata?.kind !== 'rent' || !tenantId) return;
  const sql = getSql();

  const [tenant] = await sql<Tenant[]>`SELECT * FROM tenants WHERE id = ${tenantId} LIMIT 1`;
  if (!tenant || tenant.status === 'completed' || tenant.status === 'cancelled') return;

  const endedAt = subscription.ended_at ?? Math.floor(Date.now() / 1000);
  const ranFullTerm = endedAt >= leaseEndAt(tenant.first_rent_date, tenant.months) - 86400;
  const status = ranFullTerm ? 'completed' : 'cancelled';
  await sql`UPDATE tenants SET status = ${status}, updated_at = NOW() WHERE id = ${tenantId}`;

  await sendEmail(
    ADMIN_EMAIL,
    `🏁 Lease ${ranFullTerm ? 'completed' : 'ended early'}: ${tenantName(tenant)} — ${tenant.unit_name ?? tenant.unit_id}`,
    `<p>Automatic rent for ${escapeHtml(tenantName(tenant))} has stopped (${ranFullTerm ? 'full term finished' : 'subscription cancelled in Stripe'}).</p>`,
  );
}
