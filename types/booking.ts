/**
 * TypeScript Types & Interfaces
 * Location: types/booking.ts
 *
 * Extend this file as your booking system grows
 */

// Unit/Property Types
export interface Unit {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  description?: string;
}

// Booking Types
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  units: string[];
  dateRange: DateRange;
  guests: number;
  accommodationTotal: number;
  transportation: TransportationAddon[];
  transportationTotal: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transportation Types
export interface TransportationOption {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  type: 'roundtrip' | 'oneway' | 'fullday';
}

export interface TransportationAddon extends TransportationOption {
  quantity?: number;
  applicableDiscount?: number;
}

// Availability Types
export interface Availability {
  propertyId: string;
  year: number;
  month: number;
  days: boolean[];
}

export interface AvailabilityMap {
  [propertyId: string]: Availability[];
}

// Exchange Rate Types
export interface ExchangeRateData {
  rate: number;
  source: 'ExchangeRate-API' | 'Frankfurter' | 'fallback';
  timestamp: Date;
  cached: boolean;
}

// ID Verification Types
export type VerificationStatus = 'idle' | 'pending' | 'in-progress' | 'verified' | 'failed';

export interface VerificationResult {
  verified: boolean;
  verificationId: string;
  timestamp: Date;
  method: 'veriff' | 'persona' | 'signzy';
}

// Pricing Types
export interface PricingBreakdown {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  afterDiscount: number;
  transportation: number;
  tax?: number;
  total: number;
}

// Promo Code Types
export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  discountAmount?: number;
  validFrom: Date;
  validTo: Date;
  maxUses: number;
  applicableUnits?: string[]; // Leave empty for all units
}

// Guest Profile Types
export interface GuestProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  verified: boolean;
  verificationId?: string;
}

// Channel Manager Integration Types
export interface ChannelManagerReservation {
  id: string;
  propertyId: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// API Request/Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExchangeRateResponse extends ApiResponse<ExchangeRateData> {
  message?: string;
}

export interface BookingResponse extends ApiResponse<Booking> {}

export interface AvailabilityResponse
  extends ApiResponse<AvailabilityMap> {}

// Discount Types
export interface DiscountTier {
  minNights: number;
  percentage: number;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  conditions: DiscountCondition[];
}

export type DiscountCondition =
  | { type: 'extended_stay'; minNights: number }
  | { type: 'promo_code'; code: string }
  | { type: 'off_season'; months: number[] };

// Notification Types
export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'whatsapp';
  recipient: string;
  subject?: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
}
