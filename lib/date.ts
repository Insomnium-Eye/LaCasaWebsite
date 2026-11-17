export function formatDate(isoDate: string, language: string): string {
  if (!isoDate) return '';
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  return new Date(isoDate.slice(0, 10) + 'T12:00:00Z').toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Stay dates: calendar dates (YYYY-MM-DD), maths done in UTC ─────────────

/** Days after `iso`, as YYYY-MM-DD (negative `days` goes back). */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso.slice(0, 10) + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Number of nights between check-in and check-out. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut + 'T00:00:00Z') - Date.parse(checkIn + 'T00:00:00Z')) / 864e5);
}

/** Today's date in Oaxaca (fixed UTC-6). */
export function oaxacaToday(): string {
  return new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Days after a stay's check-out that stay blocked for cleaning. */
export const CLEANING_BUFFER_DAYS = 2;
