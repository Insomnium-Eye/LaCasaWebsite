import { z } from 'zod';
import { units } from '@/data/units';
import { addDays, nightsBetween, oaxacaToday } from '@/lib/date';
import { StayQuote, quoteStay } from '@/lib/hospitable';
import { hasOverlappingStay } from '@/lib/supabase-helpers';

/** Units that can be booked by the night. */
export const SHORT_TERM_UNITS = units.filter((u) => !u.annualOnly);

/** Longest stay that can be booked and paid online. */
export const MAX_STAY_NIGHTS = 90;
/** How far ahead a stay can start. */
export const MAX_DAYS_AHEAD = 365;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** The dates part of a booking: shared by the quote and checkout routes. */
export const stayDatesSchema = z.object({
  unitSlug: z.enum(SHORT_TERM_UNITS.map((u) => u.slug) as [string, ...string[]]),
  checkIn: isoDate,
  checkOut: isoDate,
});

export const stayCheckoutSchema = stayDatesSchema.extend({
  guests: z.number().int().min(1).max(20),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(30),
  notes: z.string().trim().max(450).optional(),
  language: z.enum(['en', 'es']).default('en'),
});

export type StayCheckError = Extract<StayQuote, { ok: false }>['error'] | 'invalid_dates' | 'too_long' | 'booked' | 'too_many_guests';
export type StayCheck = Extract<StayQuote, { ok: true }> | { ok: false; error: StayCheckError; minStay?: number };

/**
 * Checks a stay can be booked and prices it on the server: valid dates, free
 * on our own calendar (direct bookings + cleaning buffer), and available and
 * priced on Hospitable's live calendar (Airbnb / Vrbo bookings, min stay).
 */
export async function checkStay(unitSlug: string, checkIn: string, checkOut: string, guests?: number): Promise<StayCheck> {
  const unit = SHORT_TERM_UNITS.find((u) => u.slug === unitSlug);
  if (!unit) return { ok: false, error: 'invalid_dates' };
  if (guests !== undefined && guests > unit.capacity) return { ok: false, error: 'too_many_guests' };

  const today = oaxacaToday();
  const nights = nightsBetween(checkIn, checkOut);
  if (!(nights > 0) || checkIn < today || checkIn > addDays(today, MAX_DAYS_AHEAD)) return { ok: false, error: 'invalid_dates' };
  if (nights > MAX_STAY_NIGHTS) return { ok: false, error: 'too_long' };

  if (await hasOverlappingStay(unitSlug, checkIn, checkOut)) return { ok: false, error: 'booked' };
  return quoteStay(unitSlug, checkIn, checkOut);
}
