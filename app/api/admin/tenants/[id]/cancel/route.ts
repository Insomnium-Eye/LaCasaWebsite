import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import { getStripe } from '@/lib/stripe';
import { Tenant, checkAdminCode } from '@/lib/rent';

// POST /api/admin/tenants/:id/cancel — stop future rent charges immediately (e.g. early move-out)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdminCode(request);
  if (denied) return denied;
  const { id } = await params;

  try {
    const sql = getSql();
    const [tenant] = await sql<Tenant[]>`SELECT * FROM tenants WHERE id = ${id} LIMIT 1`;
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    if (tenant.status === 'completed' || tenant.status === 'cancelled') {
      return NextResponse.json({ error: 'This lease has already ended.' }, { status: 400 });
    }

    // Mark first so the subscription.deleted webhook keeps the 'cancelled' status.
    await sql`UPDATE tenants SET status = 'cancelled', updated_at = NOW() WHERE id = ${id}`;

    if (tenant.stripe_subscription_id) {
      const stripe = getStripe();
      if (!stripe) return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
      try {
        await stripe.subscriptions.cancel(tenant.stripe_subscription_id);
      } catch (error) {
        // Already cancelled in Stripe is fine; anything else should be retried.
        const code = (error as { code?: string }).code;
        if (code !== 'resource_missing') {
          await sql`UPDATE tenants SET status = ${tenant.status}, updated_at = NOW() WHERE id = ${id}`;
          throw error;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin cancel tenant]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
