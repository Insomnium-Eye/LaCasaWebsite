import { NextRequest, NextResponse } from 'next/server';
import { approveReview, rejectReview } from '@/lib/supabase-helpers';

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

// PATCH /api/admin/reviews/[id]/approve
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, action } = params;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Review ID and action are required.' },
        { status: 400 }
      );
    }

    let review;

    if (action === 'approve') {
      review = await approveReview(id);
    } else if (action === 'reject') {
      review = await rejectReview(id);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "approve" or "reject".' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: `Review ${action}ed successfully.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Review action error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred processing the review.',
      },
      { status: 500 }
    );
  }
}
