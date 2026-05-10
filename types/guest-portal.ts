// Guest Portal Types

export interface GuestAuthCredentials {
  identifier: string; // email, phone, or digital key
}

export interface GuestSession {
  reservationId: string;
  guestName: string;
  email: string;
  phone?: string;
  unitName: string;
  unitSlug?: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  nightsRemaining: number;
  nightlyRate: number;
  token: string; // JWT
}

export interface Reservation {
  id: string;
  guest_first_name: string;
  guest_last_name: string;
  email: string;
  phone?: string;
  digital_key?: string;
  unit_id: string;
  unit_name: string;
  check_in: string; // ISO date
  check_out: string; // ISO date
  nightly_rate: number;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Cleaning Request Types
export interface CleaningRequest {
  id: string;
  reservation_id: string;
  scheduled_date: string; // ISO date
  notes?: string;
  fee: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CleaningRequestPayload {
  reservationId: string;
  date: string; // ISO date
  notes?: string;
}

// Transport Types
export interface TransportDestination {
  id: string;
  name: string;
  emoji: string;
  base_price: number;
  estimated_duration_minutes: number;
  notes: string;
  is_active: boolean;
}

export interface TransportRequest {
  id: string;
  reservation_id: string;
  destination: string;
  custom_destination?: string;
  scheduled_at: string; // ISO datetime
  passengers: number;
  round_trip: boolean;
  price: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TransportRequestPayload {
  reservationId: string;
  destination: string;
  customDestination?: string;
  datetime: string; // ISO datetime
  passengers: number;
  roundTrip: boolean;
  notes?: string;
}

// Stay Extension Types
export interface StayExtension {
  id: string;
  reservation_id: string;
  requested_checkout: string; // ISO date
  extra_nights: number;
  estimated_cost: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface StayExtensionPayload {
  reservationId: string;
  requestedCheckout: string; // ISO date
}

// Cancellation Types
export interface CancellationRequest {
  id: string;
  reservation_id: string;
  reason: string;
  explanation?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CancellationRequestPayload {
  reservationId: string;
  reason: string;
  explanation?: string;
}

export const CANCELLATION_REASONS = [
  'Changed plans',
  'Found other accommodation',
  'Emergency',
  'Other',
];

export const CANCELLATION_POLICY =
  'Cancellations made more than 7 days before arrival receive a 50% refund. Cancellations within 7 days are non-refundable.';

// Review Types
export interface Review {
  id: string;
  reservation_id: string;
  stars: number;
  headline: string;
  body: string;
  anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected';
  images: ReviewImage[];
  created_at: string;
  reviewed_at?: string;
  updated_at: string;
}

export interface ReviewImage {
  id: string;
  review_id: string;
  url: string;
  created_at: string;
}

export interface ReviewPayload {
  reservationId: string;
  stars: number;
  headline: string;
  body: string;
  anonymous: boolean;
  images: File[]; // Client-side only
}

// Portal Sidebar Items
export type PortalSection = 'cleaning' | 'transport' | 'extend' | 'cancel' | 'review';

export const PORTAL_SECTIONS: Record<
  PortalSection,
  { label: string; icon: string; description: string }
> = {
  cleaning: {
    label: 'Cleaning Request',
    icon: '🧹',
    description: 'Schedule a room cleaning',
  },
  transport: {
    label: 'Transport Request',
    icon: '🚗',
    description: 'Book transportation',
  },
  extend: {
    label: 'Extend Stay',
    icon: '📅',
    description: 'Request additional nights',
  },
  cancel: {
    label: 'Cancel Reservation',
    icon: '❌',
    description: 'Initiate cancellation',
  },
  review: {
    label: 'Leave a Review',
    icon: '⭐',
    description: 'Share your experience',
  },
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
