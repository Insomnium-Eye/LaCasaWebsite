import { Unit, units } from '@/data/units';
import { NightlyRates, NightlyRatesBySlug } from '@/lib/nightlyRates';

/**
 * Hospitable Public API v2 (channel manager synced with Airbnb).
 * Auth: Personal Access Token from my.hospitable.com → Apps → API access,
 * with read access to properties and calendars.
 */
const BASE_URL = 'https://public.api.hospitable.com/v2';

/** How far ahead to look when computing the nightly price range. */
const LOOKAHEAD_DAYS = 90;

/** Refresh prices from Hospitable at most every 6 hours. */
export const NIGHTLY_RATES_REVALIDATE_SECONDS = 6 * 60 * 60;

/** Env vars holding each unit's Hospitable property UUID. */
const PROPERTY_ENV: Record<string, string> = {
  'bungalow-1': 'HOSPITABLE_PROPERTY_BUNGALOW_1',
  'bungalow-2': 'HOSPITABLE_PROPERTY_BUNGALOW_2',
  'main-bedroom': 'HOSPITABLE_PROPERTY_MAIN_BEDROOM',
};

interface CalendarDay {
  date: string;
  status?: { available?: boolean };
  price?: { amount?: number; currency?: string };
}

const isoDate = (d: Date) => d.toISOString().slice(0, 10);

function fallbackRates(unit: Unit): NightlyRates {
  return {
    source: 'fallback',
    currency: 'USD',
    min: unit.shortTermMin,
    max: unit.shortTermMax,
    tonight: null,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchCalendar(propertyId: string, token: string): Promise<CalendarDay[]> {
  // "Today" in Oaxaca (UTC-6), so late-evening requests don't skip tonight.
  const start = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + LOOKAHEAD_DAYS * 864e5);
  const url = `${BASE_URL}/properties/${encodeURIComponent(propertyId)}/calendar?start_date=${isoDate(start)}&end_date=${isoDate(end)}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    next: { revalidate: NIGHTLY_RATES_REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Hospitable calendar ${propertyId}: HTTP ${res.status}`);
  const body = await res.json();
  return body?.data?.days ?? [];
}

/** Live nightly rates for one unit, or its static fallback range if Hospitable isn't configured or fails. */
export async function getUnitNightlyRates(unit: Unit): Promise<NightlyRates> {
  const token = process.env.HOSPITABLE_API_TOKEN;
  const propertyId = process.env[PROPERTY_ENV[unit.slug] ?? ''];
  if (!token || !propertyId) return fallbackRates(unit);

  try {
    const days = await fetchCalendar(propertyId, token);
    // Hospitable returns amounts in minor units (cents / centavos).
    const priced = days
      .filter((d) => d.status?.available && (d.price?.amount ?? 0) > 0)
      .map((d) => ({ date: d.date, amount: d.price!.amount! / 100, currency: d.price!.currency ?? 'USD' }));
    if (priced.length === 0) return fallbackRates(unit);

    const amounts = priced.map((p) => p.amount);
    const today = isoDate(new Date(Date.now() - 6 * 60 * 60 * 1000));
    return {
      source: 'hospitable',
      currency: priced[0].currency.toUpperCase(),
      min: Math.min(...amounts),
      max: Math.max(...amounts),
      tonight: priced.find((p) => p.date === today)?.amount ?? null,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Hospitable nightly rates error:', error);
    return fallbackRates(unit);
  }
}

/** Nightly rates for every short-term unit, keyed by unit slug. */
export async function getAllNightlyRates(): Promise<NightlyRatesBySlug> {
  const shortTermUnits = units.filter((u) => !u.annualOnly);
  const results = await Promise.all(shortTermUnits.map(getUnitNightlyRates));
  return Object.fromEntries(shortTermUnits.map((u, i) => [u.slug, results[i]]));
}
