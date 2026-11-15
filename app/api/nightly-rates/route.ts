import { NextResponse } from 'next/server';
import { getAllNightlyRates } from '@/lib/hospitable';

// Cache the response for 6 hours (matches NIGHTLY_RATES_REVALIDATE_SECONDS).
export const revalidate = 21600;

export async function GET() {
  return NextResponse.json(await getAllNightlyRates());
}
