/**
 * Nightly (short-term) rates for each unit — shared between the server
 * (which fetches them from Hospitable) and the browser (which displays them).
 */

export interface NightlyRates {
  /** 'hospitable' = live from the channel manager; 'fallback' = the static range in data/units.ts */
  source: 'hospitable' | 'fallback';
  /** ISO currency code the amounts are in, e.g. 'USD' or 'MXN'. */
  currency: string;
  /** Lowest and highest price among available nights in the next 90 days. */
  min: number;
  max: number;
  /** The current price: tonight's, or the next available night's. Null for the fallback. */
  current: { date: string; amount: number } | null;
  /** Why the fallback is shown (e.g. 'not_configured', 'HTTP 401'), for diagnosing. Never secret. */
  problem?: string;
  updatedAt: string;
}

export type NightlyRatesBySlug = Record<string, NightlyRates>;

/** Converts between USD and MXN using the live USD→MXN rate; null if it can't. */
export function convertCurrency(amount: number, from: string, to: 'MXN' | 'USD', usdToMxn: number) {
  const source = from.toUpperCase();
  if (source === to) return amount;
  if (!(usdToMxn > 0)) return null;
  if (source === 'USD' && to === 'MXN') return amount * usdToMxn;
  if (source === 'MXN' && to === 'USD') return amount / usdToMxn;
  return null;
}

/** "$1,234" in the visitor's currency: USD in English, MXN in Spanish. */
export function formatMoney(amount: number, from: string, language: string, usdToMxn: number) {
  const to = language === 'es' ? 'MXN' : 'USD';
  const value = convertCurrency(amount, from, to, usdToMxn);
  if (value === null) return null;
  return `$${Math.round(value).toLocaleString(to === 'MXN' ? 'es-MX' : 'en-US')} ${to}`;
}

/**
 * The nightly price to display: the current price when live, otherwise the
 * static range. `date` is set when the price is for a later night than tonight.
 */
export function formatNightlyPrice(rates: NightlyRates, language: string, usdToMxn: number) {
  const to = language === 'es' ? 'MXN' : 'USD';
  const unit = to === 'MXN' ? 'MXN/noche' : 'USD/night';
  const fmt = (n: number) => {
    const value = convertCurrency(n, rates.currency, to, usdToMxn);
    return value === null ? null : `$${Math.round(value).toLocaleString(to === 'MXN' ? 'es-MX' : 'en-US')}`;
  };

  if (rates.current) {
    const price = fmt(rates.current.amount);
    return price ? { price, unit, date: rates.current.date, live: true } : null;
  }
  const min = fmt(rates.min);
  const max = fmt(rates.max);
  if (!min || !max) return null;
  return { price: min === max ? min : `${min}–${max}`, unit, date: null, live: false };
}
