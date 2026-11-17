import { NextRequest, NextResponse } from 'next/server';
import { checkStay, stayDatesSchema } from '@/lib/stayBooking';

/**
 * Deliberately public: anyone can price a stay before booking.
 * The price comes from Hospitable's live calendar, never from the browser.
 */
export async function POST(request: NextRequest) {
  const parsed = stayDatesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_dates' }, { status: 400 });
  }

  try {
    const { unitSlug, checkIn, checkOut } = parsed.data;
    return NextResponse.json(await checkStay(unitSlug, checkIn, checkOut), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Stay quote error:', error);
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }
}
