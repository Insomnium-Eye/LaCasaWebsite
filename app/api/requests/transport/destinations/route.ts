import { NextRequest, NextResponse } from 'next/server';
import { getTransportDestinations } from '@/lib/supabase-helpers';
import { verifyGuestJWT } from '@/lib/guest-auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const session = verifyGuestJWT(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch destinations
    const destinations = await getTransportDestinations();

    return NextResponse.json(
      {
        success: true,
        data: destinations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get destinations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred fetching destinations.',
      },
      { status: 500 }
    );
  }
}
