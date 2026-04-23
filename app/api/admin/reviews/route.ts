import { NextRequest, NextResponse } from 'next/server';
import { getPendingReviews, approveReview, rejectReview } from '@/lib/supabase-helpers';

// Basic auth middleware for admin routes
const verifyAdminAuth = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const credentials = Buffer.from(authHeader.substring(6), 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'change_me_in_production';

  return username === expectedUsername && password === expectedPassword;
};

// GET /api/admin/reviews - Fetch pending reviews
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reviews = await getPendingReviews();

    return NextResponse.json(
      {
        success: true,
        data: reviews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch pending reviews error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred fetching reviews.',
      },
      { status: 500 }
    );
  }
}
