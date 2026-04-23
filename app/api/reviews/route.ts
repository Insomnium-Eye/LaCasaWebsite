import { NextRequest, NextResponse } from 'next/server';
import {
  createReview,
  addReviewImage,
  getReservationById,
} from '@/lib/supabase-helpers';
import { verifyGuestJWT } from '@/lib/guest-auth';

// Store uploaded images (in-memory for now; use Cloudinary in production)
const uploadReviewImage = async (file: File): Promise<string> => {
  // TODO: Upload to Cloudinary or S3
  // For now, return a placeholder URL
  return `https://example.com/images/${Date.now()}-${Math.random().toString(36).substring(7)}`;
};

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const stars = parseInt(formData.get('stars') as string);
    const headline = formData.get('headline') as string;
    const body = formData.get('body') as string;
    const anonymous = formData.get('anonymous') === 'true';
    const images = formData.getAll('images') as File[];

    // Validate inputs
    if (!stars || stars < 1 || stars > 5) {
      return NextResponse.json(
        { success: false, error: 'Star rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!headline || headline.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Headline is required.' },
        { status: 400 }
      );
    }

    if (!body || body.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Review body is required.' },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum 5 images allowed.' },
        { status: 400 }
      );
    }

    // Validate image sizes
    for (const image of images) {
      if (image.size > 5 * 1024 * 1024) {
        // 5 MB
        return NextResponse.json(
          { success: false, error: 'Each image must be smaller than 5 MB.' },
          { status: 400 }
        );
      }
    }

    // Get reservation
    const reservation = await getReservationById(session.reservationId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Create review
    const review = await createReview(
      session.reservationId,
      stars,
      headline,
      body,
      anonymous
    );

    // Upload images
    for (const image of images) {
      const imageUrl = await uploadReviewImage(image);
      await addReviewImage(review.id, imageUrl);
    }

    // TODO: Send notification to admin about pending review

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Thank you! Your review is awaiting approval and will appear on our site soon.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred submitting your review.',
      },
      { status: 500 }
    );
  }
}
