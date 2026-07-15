import { NextRequest, NextResponse } from 'next/server';

// Sentinel lock code meaning "guest has checked out — code retired".
// Never collides with real codes, which are generated in the 1000-9999 range.
const RETIRED_CODE = '0000';

export async function GET(request: NextRequest) {
  // Allow Vercel cron (Authorization header) or manual trigger with ?secret=
  const authHeader = request.headers.get('authorization') ?? '';
  const querySecret = new URL(request.url).searchParams.get('secret') ?? '';
  const cronSecret = process.env.CRON_SECRET ?? '';
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { getSql } = await import('@/lib/db');
    const sql = getSql();

    // Once a reservation's checkout date has passed, retire its digital key so
    // it can no longer be used to log into the guest portal.
    const expired = await sql<{ id: string }[]>`
      UPDATE reservations
      SET status = 'checked_out', digital_key = ${RETIRED_CODE}
      WHERE check_out::date < CURRENT_DATE
        AND status IN ('confirmed', 'checked_in')
      RETURNING id
    `;

    return NextResponse.json({ expired: expired.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[expire-checkouts cron]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
