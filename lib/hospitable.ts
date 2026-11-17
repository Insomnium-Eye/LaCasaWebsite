import { Unit, units } from '@/data/units';
import { NightlyRates, NightlyRatesBySlug } from '@/lib/nightlyRates';
import { addDays, nightsBetween, oaxacaToday } from '@/lib/date';

/**
 * Hospitable Public API v2 (channel manager synced with Airbnb and Vrbo).
 * Auth: one Personal Access Token (Read) from my.hospitable.com → Settings → Integrations → API access.
 */
const BASE_URL = 'https://public.api.hospitable.com/v2';

/** How far ahead to look for the next available night's price. */
const LOOKAHEAD_DAYS = 90;

/** Refresh the displayed prices from Hospitable at most every hour. */
export const NIGHTLY_RATES_REVALIDATE_SECONDS = 60 * 60;

/** Env vars holding each unit's Hospitable property UUID (the property linked to its Airbnb listing). */
const PROPERTY_ENV: Record<string, string> = {
  'bungalow-1': 'HOSPITABLE_PROPERTY_BUNGALOW_1',
  'bungalow-2': 'HOSPITABLE_PROPERTY_BUNGALOW_2',
  'main-bedroom': 'HOSPITABLE_PROPERTY_MAIN_BEDROOM',
};

interface RawCalendarDay {
  date: string;
  min_stay?: number;
  status?: { available?: boolean };
  price?: { amount?: number | string; currency?: string; formatted?: string };
  closed_for_checkin?: boolean;
  closed_for_checkout?: boolean;
}

/** One night on a unit's calendar, with the price in major units (dollars / pesos). */
export interface CalendarNight {
  date: string;
  available: boolean;
  price: number | null;
  currency: string;
  minStay: number;
  closedForCheckin: boolean;
  closedForCheckout: boolean;
}

/** A failed Hospitable request; the message (e.g. 'HTTP 401') is safe to show publicly. */
class HospitableError extends Error {}

function hospitableConfig(slug: string) {
  // Trim: a space or newline pasted into Vercel would break the request header.
  const token = process.env.HOSPITABLE_API_TOKEN?.trim();
  const propertyId = process.env[PROPERTY_ENV[slug] ?? '']?.trim();
  return token && propertyId ? { token, propertyId } : null;
}

export const isHospitableConfigured = (slug: string) => hospitableConfig(slug) !== null;

/**
 * Hospitable sends amounts in minor units (cents). If its formatted string
 * shows the amount is already in major units, trust that instead.
 */
function parsePrice(price: RawCalendarDay['price']): number | null {
  const raw = Number(price?.amount);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  const shown = Number((price?.formatted ?? '').replace(/[^\d.]/g, ''));
  if (shown > 0 && Math.abs(shown - raw) < 0.01) return raw;
  return raw / 100;
}

/**
 * The unit's calendar from `start` to `end` (inclusive), or null if Hospitable
 * isn't configured for it. `fresh` skips the cache (for quotes and payments).
 */
export async function getUnitCalendar(slug: string, start: string, end: string, fresh = false): Promise<CalendarNight[] | null> {
  const config = hospitableConfig(slug);
  if (!config) return null;

  const url = `${BASE_URL}/properties/${encodeURIComponent(config.propertyId)}/calendar?start_date=${start}&end_date=${end}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${config.token}`, Accept: 'application/json' },
    ...(fresh ? { cache: 'no-store' as const } : { next: { revalidate: NIGHTLY_RATES_REVALIDATE_SECONDS } }),
  });
  if (!res.ok) throw new HospitableError(`HTTP ${res.status}`);

  const body = await res.json();
  const days: RawCalendarDay[] = body?.data?.days ?? (Array.isArray(body?.data) ? body.data : []);
  return days.map((d) => ({
    date: d.date,
    available: d.status?.available === true,
    price: parsePrice(d.price),
    currency: (d.price?.currency ?? 'USD').toUpperCase(),
    minStay: d.min_stay ?? 1,
    closedForCheckin: d.closed_for_checkin === true,
    closedForCheckout: d.closed_for_checkout === true,
  }));
}

function fallbackRates(unit: Unit, problem: string): NightlyRates {
  return {
    source: 'fallback',
    problem,
    currency: 'USD',
    min: unit.shortTermMin,
    max: unit.shortTermMax,
    current: null,
    updatedAt: new Date().toISOString(),
  };
}

/** The unit's current nightly price (tonight, or the next available night) and its 90-day range. */
export async function getUnitNightlyRates(unit: Unit): Promise<NightlyRates> {
  try {
    const today = oaxacaToday();
    const calendar = await getUnitCalendar(unit.slug, today, addDays(today, LOOKAHEAD_DAYS));
    const priced = (calendar ?? []).filter((n) => n.available && n.price !== null);
    if (!calendar) return fallbackRates(unit, 'not_configured');
    if (priced.length === 0) {
      console.warn(`Hospitable: no available priced nights for ${unit.slug} (${calendar.length} days returned)`);
      return fallbackRates(unit, `no_priced_nights (${calendar.length} days)`);
    }

    const amounts = priced.map((n) => n.price!);
    return {
      source: 'hospitable',
      currency: priced[0].currency,
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      current: { date: priced[0].date, amount: priced[0].price! },
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Hospitable nightly rates error for ${unit.slug}:`, error);
    return fallbackRates(unit, error instanceof HospitableError ? error.message : 'request_failed');
  }
}

/** Nightly rates for every short-term unit, keyed by unit slug. */
export async function getAllNightlyRates(): Promise<NightlyRatesBySlug> {
  const shortTermUnits = units.filter((u) => !u.annualOnly);
  const results = await Promise.all(shortTermUnits.map(getUnitNightlyRates));
  return Object.fromEntries(shortTermUnits.map((u, i) => [u.slug, results[i]]));
}

export type StayQuoteError = 'not_configured' | 'unavailable' | 'min_stay' | 'closed_checkin' | 'closed_checkout' | 'no_price';

export type StayQuote =
  | { ok: true; nights: { date: string; price: number }[]; total: number; currency: string }
  | { ok: false; error: StayQuoteError; minStay?: number };

/**
 * Prices a stay from Hospitable's live calendar (always fresh, never cached).
 * `checkOut` is the departure day; the nights are checkIn … checkOut − 1.
 */
export async function quoteStay(slug: string, checkIn: string, checkOut: string): Promise<StayQuote> {
  const calendar = await getUnitCalendar(slug, checkIn, checkOut, true);
  if (!calendar) return { ok: false, error: 'not_configured' };

  const byDate = new Map(calendar.map((n) => [n.date, n]));
  const first = byDate.get(checkIn);
  const count = nightsBetween(checkIn, checkOut);
  const nights: { date: string; price: number }[] = [];

  for (let i = 0; i < count; i++) {
    const night = byDate.get(addDays(checkIn, i));
    if (!night || !night.available) return { ok: false, error: 'unavailable' };
    if (night.price === null) return { ok: false, error: 'no_price' };
    nights.push({ date: night.date, price: night.price });
  }
  if (first?.closedForCheckin) return { ok: false, error: 'closed_checkin' };
  if (byDate.get(checkOut)?.closedForCheckout) return { ok: false, error: 'closed_checkout' };
  if (first && count < first.minStay) return { ok: false, error: 'min_stay', minStay: first.minStay };

  // Round to cents so the Stripe amount matches what the guest saw.
  const total = Math.round(nights.reduce((sum, n) => sum + n.price, 0) * 100) / 100;
  return { ok: true, nights, total, currency: first?.currency ?? calendar[0]?.currency ?? 'USD' };
}
