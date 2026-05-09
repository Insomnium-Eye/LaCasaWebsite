import { getSql } from './db';
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

// ============ RESERVATION QUERIES ============

export const findReservationByIdentifier = async (
  identifier: string,
  type: 'email' | 'phone' | 'digital_key'
): Promise<Reservation | null> => {
  const sql = getSql();
  let rows: Reservation[];

  if (type === 'email') {
    rows = await sql<Reservation[]>`
      SELECT * FROM reservations WHERE email = ${identifier} AND status = 'confirmed' LIMIT 1`;
  } else if (type === 'phone') {
    rows = await sql<Reservation[]>`
      SELECT * FROM reservations WHERE phone = ${identifier} AND status = 'confirmed' LIMIT 1`;
  } else {
    rows = await sql<Reservation[]>`
      SELECT * FROM reservations WHERE digital_key = ${identifier} AND status = 'confirmed' LIMIT 1`;
  }

  return rows[0] ?? null;
};

export const getReservationById = async (
  reservationId: string
): Promise<Reservation | null> => {
  const sql = getSql();
  const rows = await sql<Reservation[]>`
    SELECT * FROM reservations WHERE id = ${reservationId} LIMIT 1`;
  return rows[0] ?? null;
};

export const calculateNightsRemaining = (reservation: Reservation): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkOut = new Date(reservation.check_out);
  checkOut.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
};

export const createGuestSession = (
  reservation: Reservation,
  token: string
): GuestSession => ({
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
});

// ============ CLEANING REQUESTS ============

export const createCleaningRequest = async (
  reservationId: string,
  date: string,
  notes?: string
): Promise<CleaningRequest> => {
  const sql = getSql();
  const fee = parseFloat(process.env.NEXT_PUBLIC_CLEANING_FEE || '15');
  const [row] = await sql<CleaningRequest[]>`
    INSERT INTO cleaning_requests (reservation_id, scheduled_date, notes, fee, status)
    VALUES (${reservationId}, ${date}, ${notes ?? null}, ${fee}, 'pending')
    RETURNING *`;
  return row;
};

export const getCleaningRequests = async (
  reservationId: string
): Promise<CleaningRequest[]> => {
  const sql = getSql();
  return sql<CleaningRequest[]>`
    SELECT * FROM cleaning_requests WHERE reservation_id = ${reservationId}
    ORDER BY scheduled_date DESC`;
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
  const sql = getSql();
  const [row] = await sql<TransportRequest[]>`
    INSERT INTO transport_requests
      (reservation_id, destination, custom_destination, scheduled_at, passengers, round_trip, price, notes, status)
    VALUES
      (${reservationId}, ${destination}, ${customDestination ?? null}, ${datetime},
       ${passengers}, ${roundTrip}, ${price}, ${notes ?? null}, 'pending')
    RETURNING *`;
  return row;
};

export const getTransportDestinations = async () => {
  const sql = getSql();
  return sql`SELECT * FROM transport_destinations WHERE is_active = true ORDER BY name`;
};

export const getTransportRequests = async (
  reservationId: string
): Promise<TransportRequest[]> => {
  const sql = getSql();
  return sql<TransportRequest[]>`
    SELECT * FROM transport_requests WHERE reservation_id = ${reservationId}
    ORDER BY scheduled_at DESC`;
};

// ============ STAY EXTENSIONS ============

export const createStayExtension = async (
  reservationId: string,
  requestedCheckout: string,
  extraNights: number,
  estimatedCost: number
): Promise<StayExtension> => {
  const sql = getSql();
  const [row] = await sql<StayExtension[]>`
    INSERT INTO stay_extensions (reservation_id, requested_checkout, extra_nights, estimated_cost, status)
    VALUES (${reservationId}, ${requestedCheckout}, ${extraNights}, ${estimatedCost}, 'pending')
    RETURNING *`;
  return row;
};

export const getStayExtensions = async (
  reservationId: string
): Promise<StayExtension[]> => {
  const sql = getSql();
  return sql<StayExtension[]>`
    SELECT * FROM stay_extensions WHERE reservation_id = ${reservationId}
    ORDER BY created_at DESC`;
};

// ============ CANCELLATIONS ============

export const createCancellationRequest = async (
  reservationId: string,
  reason: string,
  explanation?: string
): Promise<CancellationRequest> => {
  const sql = getSql();
  const [row] = await sql<CancellationRequest[]>`
    INSERT INTO cancellation_requests (reservation_id, reason, explanation, status)
    VALUES (${reservationId}, ${reason}, ${explanation ?? null}, 'pending')
    RETURNING *`;
  return row;
};

export const getCancellationRequests = async (
  reservationId: string
): Promise<CancellationRequest[]> => {
  const sql = getSql();
  return sql<CancellationRequest[]>`
    SELECT * FROM cancellation_requests WHERE reservation_id = ${reservationId}
    ORDER BY created_at DESC`;
};

// ============ REVIEWS ============

export const createReview = async (
  reservationId: string,
  stars: number,
  headline: string,
  body: string,
  anonymous: boolean
): Promise<Review> => {
  const sql = getSql();
  const [row] = await sql<Review[]>`
    INSERT INTO reviews (reservation_id, stars, headline, body, anonymous, status)
    VALUES (${reservationId}, ${stars}, ${headline}, ${body}, ${anonymous}, 'pending')
    RETURNING *`;
  return { ...row, images: [] };
};

export const addReviewImage = async (
  reviewId: string,
  imageUrl: string
): Promise<ReviewImage> => {
  const sql = getSql();
  const [row] = await sql<ReviewImage[]>`
    INSERT INTO review_images (review_id, url) VALUES (${reviewId}, ${imageUrl}) RETURNING *`;
  return row;
};

const attachImages = async (reviews: Review[]): Promise<Review[]> => {
  const sql = getSql();
  return Promise.all(
    reviews.map(async (review) => {
      const images = await sql<ReviewImage[]>`
        SELECT * FROM review_images WHERE review_id = ${review.id}`;
      return { ...review, images };
    })
  );
};

export const getPendingReviews = async (limit = 50): Promise<Review[]> => {
  const sql = getSql();
  const rows = await sql<Review[]>`
    SELECT * FROM reviews WHERE status = 'pending' ORDER BY created_at DESC LIMIT ${limit}`;
  return attachImages(rows);
};

export const getApprovedReviews = async (limit = 20): Promise<Review[]> => {
  const sql = getSql();
  const rows = await sql<Review[]>`
    SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT ${limit}`;
  return attachImages(rows);
};

export const approveReview = async (reviewId: string): Promise<Review> => {
  const sql = getSql();
  const [row] = await sql<Review[]>`
    UPDATE reviews SET status = 'approved', reviewed_at = now()
    WHERE id = ${reviewId} RETURNING *`;
  const images = await sql<ReviewImage[]>`SELECT * FROM review_images WHERE review_id = ${reviewId}`;
  return { ...row, images };
};

export const rejectReview = async (reviewId: string): Promise<Review> => {
  const sql = getSql();
  const [row] = await sql<Review[]>`
    UPDATE reviews SET status = 'rejected', reviewed_at = now()
    WHERE id = ${reviewId} RETURNING *`;
  const images = await sql<ReviewImage[]>`SELECT * FROM review_images WHERE review_id = ${reviewId}`;
  return { ...row, images };
};

// Keep for backward compatibility — no longer used for auth
export const createAdminSupabaseClient = () => {
  throw new Error('createAdminSupabaseClient is deprecated — use getSql() from lib/db instead');
};
