import { NextRequest } from 'next/server';
import { handleBookingAction } from '@/lib/bookingAction';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; token: string }> },
) {
  const { id, token } = await params;
  return handleBookingAction(id, token, 'deny');
}
