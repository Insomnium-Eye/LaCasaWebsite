import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { Tenant, firstChargeAt, formatMoney, monthLabel, tenantLink, verifyTenantToken } from '@/lib/rent';

/**
 * GET /api/rent/setup/:id/:token — the tenant's permanent rent link.
 *  - Before setup: opens Stripe Checkout (setup mode) to save a card for autopay.
 *  - While the lease runs: opens the Stripe billing portal so they can update their card.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string; token: string }> }) {
  const { id, token } = await params;
  const origin = new URL(request.url).origin;
  const status = (state: string) => NextResponse.redirect(`${origin}/rent/status?state=${state}`, 303);

  if (!/^[0-9a-f-]{36}$/i.test(id) || !verifyTenantToken(id, token)) return status('invalid');

  const stripe = getStripe();
  if (!stripe) return status('error');

  try {
    const sql = getSql();
    const [tenant] = await sql<Tenant[]>`SELECT * FROM tenants WHERE id = ${id} LIMIT 1`;
    if (!tenant) return status('invalid');

    if (tenant.status === 'completed' || tenant.status === 'cancelled') return status('ended');

    if (tenant.status !== 'pending_setup') {
      if (!tenant.stripe_customer_id) return status('active');
      try {
        const portal = await stripe.billingPortal.sessions.create({
          customer: tenant.stripe_customer_id,
          locale: tenant.language,
          return_url: `${origin}/rent/status?state=active`,
        });
        return NextResponse.redirect(portal.url, 303);
      } catch (error) {
        // Most likely the customer portal hasn't been activated in the Stripe dashboard.
        console.error('[rent portal]', error);
        return status('active');
      }
    }

    // Leave at least an hour before the first charge so the subscription can still start on time.
    if (firstChargeAt(tenant.first_rent_date) - Date.now() / 1000 < 3600) return status('expired');

    let customerId = tenant.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create(
        {
          name: `${tenant.first_name} ${tenant.last_name}`.trim(),
          email: tenant.email,
          phone: tenant.phone ?? undefined,
          preferred_locales: [tenant.language],
          metadata: { tenantId: tenant.id, unit: tenant.unit_id },
        },
        { idempotencyKey: `rent-customer-${tenant.id}` },
      );
      customerId = customer.id;
      await sql`UPDATE tenants SET stripe_customer_id = ${customerId}, updated_at = NOW() WHERE id = ${id}`;
    }

    const es = tenant.language === 'es';
    const rent = formatMoney(tenant.monthly_rent, tenant.currency);
    const from = monthLabel(tenant.first_rent_date, tenant.language);
    const to = monthLabel(tenant.first_rent_date, tenant.language, tenant.months - 1);
    const unit = tenant.unit_name ?? tenant.unit_id;

    const checkout = await stripe.checkout.sessions.create({
      mode: 'setup',
      currency: tenant.currency,
      allowed_payment_method_types: ['card'],
      customer: customerId,
      locale: tenant.language,
      custom_text: {
        submit: {
          message: es
            ? `Tu tarjeta se cargará automáticamente ${rent} el día 1 de cada mes por ${unit}, de ${from} a ${to} (${tenant.months} pagos). No se cobra nada hoy.`
            : `Your card will be charged ${rent} automatically on the 1st of each month for ${unit}, from ${from} through ${to} (${tenant.months} payments). Nothing is charged today.`,
        },
      },
      // Read back by the Stripe webhook, which then creates the rent subscription.
      metadata: { kind: 'rent_setup', tenantId: tenant.id },
      success_url: `${origin}/rent/status?state=success`,
      cancel_url: `${origin}/rent/status?state=setup_cancelled&retry=${encodeURIComponent(tenantLink('', tenant.id))}`,
    });

    return NextResponse.redirect(checkout.url!, 303);
  } catch (error) {
    console.error('[rent setup]', error);
    return status('error');
  }
}
