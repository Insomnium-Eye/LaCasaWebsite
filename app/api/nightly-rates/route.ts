import { NextResponse } from 'next/server';
import { NIGHTLY_RATES_REVALIDATE_SECONDS, getAllNightlyRates } from '@/lib/hospitable';

// Rendered per request (the Hospitable calls themselves are cached for an hour),
// so a failure is retried within a minute instead of being cached for an hour.
export const dynamic = 'force-dynamic';

export async function GET() {
  const rates = await getAllNightlyRates();
  const live = Object.values(rates).every((r) => r.source === 'hospitable');
  const maxAge = live ? NIGHTLY_RATES_REVALIDATE_SECONDS : 60;
  return NextResponse.json(rates, {
    headers: { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge}` },
  });
}
