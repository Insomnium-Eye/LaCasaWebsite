import { NextRequest, NextResponse } from 'next/server';
import {
  findReservationByIdentifier,
  createGuestSession,
} from '@/lib/supabase-helpers';
import {
  detectIdentifierType,
  normalizeIdentifier,
  generateGuestJWT,
} from '@/lib/guest-auth';

const RATE_LIMIT_MAP = new Map<string, number[]>();
const RATE_LIMIT_ATTEMPTS = parseInt(
  process.env.RATE_LIMIT_ATTEMPTS || '10'
);
const RATE_LIMIT_WINDOW_MS = 
  (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15')) * 60 * 1000;

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const attempts = RATE_LIMIT_MAP.get(ip) || [];

  // Remove old attempts outside the window
  const recentAttempts = attempts.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recentAttempts.length >= RATE_LIMIT_ATTEMPTS) {
    return false; // Rate limited
  }

  recentAttempts.push(now);
  RATE_LIMIT_MAP.set(ip, recentAttempts);

  return true; // Not rate limited
};

export async function POST(request: NextRequest) {
  try {
    const { identifier } = await request.json();

    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide an email, phone number, or digital key.',
        },
        { status: 400 }
      );
    }

    // Generate JWT with mock data for any input
    const token = generateGuestJWT({
      reservationId: `res_${Date.now()}`,
      guestName: 'Guest',
      email: identifier,
      phone: identifier,
      unitName: 'Bungalow',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nightsRemaining: 7,
      nightlyRate: 150,
    });

    // Create mock session
    const session = {
      token,
      reservationId: `res_${Date.now()}`,
      guestName: 'Guest',
      email: identifier,
      phone: identifier,
      unitName: 'Bungalow',
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nightsRemaining: 7,
      nightlyRate: 150,
    };

    return NextResponse.json(
      {
        success: true,
        data: session,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}
