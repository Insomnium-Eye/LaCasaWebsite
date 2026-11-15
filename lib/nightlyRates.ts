/**
 * Nightly (short-term / Airbnb) rates for each unit — shared between the
 * server (which fetches them from Hospitable) and the client (which displays them).
 */

export interface NightlyRates {
  /** 'hospitable' = live from the channel manager; 'fallback' = the static range in data/units.ts */
  source: 'hospitable' | 'fallback';
  /** ISO currency code the amounts are in, e.g. 'USD' or 'MXN'. */
  currency: string;
  /** Lowest and highest price among available nights in the look-ahead window. */
  min: number;
  max: number;
  /** Tonight's price, if tonight is available. */
  tonight: number | null;
  updatedAt: string;
}

export type NightlyRatesBySlug = Record<string, NightlyRates>;

/** Converts an amount to MXN or USD using the live USD→MXN rate. */
function convert(amount: number, from: string, to: 'MXN' | 'USD', usdToMxn: number) {
  if (from === to) return amount;
  if (!(usdToMxn > 0)) return null;
  if (from === 'USD' && to === 'MXN') return amount * usdToMxn;
  if (from === 'MXN' && to === 'USD') return amount / usdToMxn;
  return null;
}

/**
 * Formats a nightly range for display: USD in English, MXN in Spanish.
 * Returns null when the currency can't be converted yet (e.g. exchange rate still loading).
 */
export function formatNightlyRange(rates: NightlyRates, language: string, usdToMxn: number) {
  const to = language === 'es' ? 'MXN' : 'USD';
  const min = convert(rates.min, rates.currency.toUpperCase(), to, usdToMxn);
  const max = convert(rates.max, rates.currency.toUpperCase(), to, usdToMxn);
  if (min === null || max === null) return null;
  const fmt = (n: number) => `$${Math.round(n).toLocaleString(to === 'MXN' ? 'es-MX' : 'en-US')}`;
  const range = Math.round(min) === Math.round(max) ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
  return { range, unit: to === 'MXN' ? 'MXN/noche' : 'USD/night' };
}
