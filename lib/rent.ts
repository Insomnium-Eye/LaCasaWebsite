import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_EMAIL = 'ebm22david@gmail.com';

/** Returns an error response unless the request carries the admin portal code. */
export function checkAdminCode(request: NextRequest): NextResponse | null {
  const adminCode = process.env.ADMIN_PORTAL_CODE;
  if (!adminCode) return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 });
  if (request.headers.get('x-admin-code') !== adminCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export type TenantStatus = 'pending_setup' | 'activating' | 'active' | 'past_due' | 'completed' | 'cancelled';

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  unit_id: string;
  unit_name: string | null;
  monthly_rent: string; // NUMERIC comes back from postgres as a string
  currency: string;
  first_rent_date: Date;
  months: number;
  language: 'en' | 'es';
  notes: string | null;
  status: TenantStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: Date;
}

// Rent is charged at 09:00 Oaxaca time (fixed UTC-6 since 2022) on the 1st of each month.
const CHARGE_HOUR_UTC = 15;

/** 'YYYY-MM-01' or a Date (as returned by postgres for DATE columns) → [year, monthIndex]. */
const yearMonth = (date: string | Date): [number, number] => {
  const iso = typeof date === 'string' ? date : date.toISOString();
  return [Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1];
};

/** Unix timestamp (seconds) of the first rent charge. */
export const firstChargeAt = (firstRentDate: string | Date): number => {
  const [y, m] = yearMonth(firstRentDate);
  return Date.UTC(y, m, 1, CHARGE_HOUR_UTC) / 1000;
};

/**
 * Unix timestamp (seconds) at which the subscription ends: exactly when the
 * (months + 1)th charge would have happened, so it never runs.
 */
export const leaseEndAt = (firstRentDate: string | Date, months: number): number => {
  const [y, m] = yearMonth(firstRentDate);
  return Date.UTC(y, m + months, 1, CHARGE_HOUR_UTC) / 1000;
};

/** Human label for the month containing a date, e.g. "December 2026". */
export const monthLabel = (date: string | Date, language: 'en' | 'es' = 'en', offsetMonths = 0): string => {
  const [y, m] = yearMonth(date);
  return new Date(Date.UTC(y, m + offsetMonths, 1, 12)).toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

export const formatMoney = (amount: number | string, currency: string) =>
  `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency.toUpperCase()}`;

// ---------- Tenant setup links ----------

const linkSecret = () => process.env.ADMIN_TOKEN_SECRET ?? 'dev-secret-change-me';

export const tenantToken = (tenantId: string): string =>
  createHmac('sha256', linkSecret()).update(`tenant-rent:${tenantId}`).digest('hex').slice(0, 32);

export const verifyTenantToken = (tenantId: string, token: string): boolean => {
  const expected = tenantToken(tenantId);
  return token.length === expected.length && timingSafeEqual(Buffer.from(token), Buffer.from(expected));
};

/** Permanent link the tenant uses to set up autopay (and later to update their card). */
export const tenantLink = (origin: string, tenantId: string) =>
  `${origin}/api/rent/setup/${tenantId}/${tenantToken(tenantId)}`;
