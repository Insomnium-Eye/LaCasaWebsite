import { createClient } from '@supabase/supabase-js';
import {
  Reservation,
  GuestSession,
  CleaningRequest,
  TransportRequest,
  StayExtension,
  CancellationRequest,
  Review,
  ReviewImage,
} from '@/types/guest-portal';

// Server-side admin client (uses service role key)
export const createAdminSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Client-side client (uses anon key)
export const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(url, anonKey);
};

// ============ RESERVATION QUERIES ============

export const findReservationByIdentifier = async (
  identifier: string,
  type: 'email' | 'phone' | 'digital_key'
): Promise<Reservation | null> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq(type, identifier)
    .eq('status', 'confirmed')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    throw error;
  }

  return data as Reservation;
};

export const getReservationById = async (
  reservationId: string
): Promise<Reservation | null> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data as Reservation;
};

export const calculateNightsRemaining = (reservation: Reservation): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkOut = new Date(reservation.check_out);
  checkOut.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.max(0, daysRemaining);
};

export const createGuestSession = (
  reservation: Reservation,
  token: string
): GuestSession => {
  return {
    reservationId: reservation.id,
    guestName: reservation.guest_first_name,
    email: reservation.email,
    phone: reservation.phone,
    unitName: reservation.unit_name,
    checkIn: reservation.check_in,
    checkOut: reservation.check_out,
    nightsRemaining: calculateNightsRemaining(reservation),
    nightlyRate: reservation.nightly_rate,
    token,
  };
};

// ============ CLEANING REQUESTS ============

export const createCleaningRequest = async (
  reservationId: string,
  date: string,
  notes?: string
): Promise<CleaningRequest> => {
  const supabase = createAdminSupabaseClient();
  const fee = parseFloat(process.env.NEXT_PUBLIC_CLEANING_FEE || '15');

  const { data, error } = await supabase
    .from('cleaning_requests')
    .insert([
      {
        reservation_id: reservationId,
        scheduled_date: date,
        notes: notes || null,
        fee,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as CleaningRequest;
};

export const getCleaningRequests = async (
  reservationId: string
): Promise<CleaningRequest[]> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('cleaning_requests')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('scheduled_date', { ascending: false });

  if (error) throw error;

  return (data || []) as CleaningRequest[];
};

// ============ TRANSPORT REQUESTS ============

export const createTransportRequest = async (
  reservationId: string,
  destination: string,
  customDestination: string | undefined,
  datetime: string,
  passengers: number,
  roundTrip: boolean,
  price: number,
  notes?: string
): Promise<TransportRequest> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('transport_requests')
    .insert([
      {
        reservation_id: reservationId,
        destination,
        custom_destination: customDestination || null,
        scheduled_at: datetime,
        passengers,
        round_trip: roundTrip,
        price,
        notes: notes || null,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as TransportRequest;
};

export const getTransportDestinations = async () => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('transport_destinations')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;

  return (data || []) as any[];
};

export const getTransportRequests = async (
  reservationId: string
): Promise<TransportRequest[]> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('transport_requests')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('scheduled_at', { ascending: false });

  if (error) throw error;

  return (data || []) as TransportRequest[];
};

// ============ STAY EXTENSIONS ============

export const createStayExtension = async (
  reservationId: string,
  requestedCheckout: string,
  extraNights: number,
  estimatedCost: number
): Promise<StayExtension> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('stay_extensions')
    .insert([
      {
        reservation_id: reservationId,
        requested_checkout: requestedCheckout,
        extra_nights: extraNights,
        estimated_cost: estimatedCost,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as StayExtension;
};

export const getStayExtensions = async (
  reservationId: string
): Promise<StayExtension[]> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('stay_extensions')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []) as StayExtension[];
};

// ============ CANCELLATIONS ============

export const createCancellationRequest = async (
  reservationId: string,
  reason: string,
  explanation?: string
): Promise<CancellationRequest> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('cancellation_requests')
    .insert([
      {
        reservation_id: reservationId,
        reason,
        explanation: explanation || null,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data as CancellationRequest;
};

export const getCancellationRequests = async (
  reservationId: string
): Promise<CancellationRequest[]> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('cancellation_requests')
    .select('*')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []) as CancellationRequest[];
};

// ============ REVIEWS ============

export const createReview = async (
  reservationId: string,
  stars: number,
  headline: string,
  body: string,
  anonymous: boolean
): Promise<Review> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('reviews')
    .insert([
      {
        reservation_id: reservationId,
        stars,
        headline,
        body,
        anonymous,
        status: 'pending',
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return { ...data, images: [] } as Review;
};

export const addReviewImage = async (
  reviewId: string,
  imageUrl: string
): Promise<ReviewImage> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('review_images')
    .insert([{ review_id: reviewId, url: imageUrl }])
    .select()
    .single();

  if (error) throw error;

  return data as ReviewImage;
};

export const getPendingReviews = async (limit = 50): Promise<Review[]> => {
  const supabase = createAdminSupabaseClient();

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (reviewsError) throw reviewsError;

  // Fetch images for each review
  const reviewsWithImages = await Promise.all(
    (reviews || []).map(async (review) => {
      const { data: images } = await supabase
        .from('review_images')
        .select('*')
        .eq('review_id', review.id);

      return {
        ...review,
        images: (images || []) as ReviewImage[],
      };
    })
  );

  return reviewsWithImages as Review[];
};

export const getApprovedReviews = async (limit = 20): Promise<Review[]> => {
  const supabase = createAdminSupabaseClient();

  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (reviewsError) throw reviewsError;

  // Fetch images for each review
  const reviewsWithImages = await Promise.all(
    (reviews || []).map(async (review) => {
      const { data: images } = await supabase
        .from('review_images')
        .select('*')
        .eq('review_id', review.id);

      return {
        ...review,
        images: (images || []) as ReviewImage[],
      };
    })
  );

  return reviewsWithImages as Review[];
};

export const approveReview = async (reviewId: string): Promise<Review> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('reviews')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;

  const { data: images } = await supabase
    .from('review_images')
    .select('*')
    .eq('review_id', reviewId);

  return { ...data, images: images || [] } as Review;
};

export const rejectReview = async (reviewId: string): Promise<Review> => {
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from('reviews')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;

  const { data: images } = await supabase
    .from('review_images')
    .select('*')
    .eq('review_id', reviewId);

  return { ...data, images: images || [] } as Review;
};
