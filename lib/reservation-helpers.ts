import { getSql } from '@/lib/db';

/**
 * Generate a 4-digit PIN that is not currently active on any other reservation.
 * "Active" means check_out is in the future (or today).
 */
export async function generateUniquePin(): Promise<string> {
  const sql = getSql();
  for (let i = 0; i < 20; i++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const [conflict] = await sql<{ id: string }[]>`
      SELECT id FROM reservations
      WHERE digital_key = ${pin}
        AND check_out >= CURRENT_DATE
      LIMIT 1
    `;
    if (!conflict) return pin;
  }
  throw new Error('Could not generate a unique PIN after 20 attempts');
}

interface ReturningGuestInfo {
  pin: string | null;       // null = generate a fresh one
  bookingCount: number;     // 1 for new guests, n+1 for returning
}

/**
 * Look up a returning guest by email (preferred) or exact full name.
 * Returns their previous PIN if it is safe to reuse (not currently active
 * on another reservation), plus the incremented booking count.
 */
export async function getReturningGuestInfo(
  email: string | null | undefined,
  firstName: string,
  lastName: string,
): Promise<ReturningGuestInfo> {
  const sql = getSql();

  let previous: { digital_key: string; booking_count: number } | undefined;

  if (email) {
    [previous] = await sql<{ digital_key: string; booking_count: number }[]>`
      SELECT digital_key, COALESCE(booking_count, 1) AS booking_count
      FROM reservations
      WHERE email = ${email}
      ORDER BY check_in DESC
      LIMIT 1
    `;
  }

  if (!previous && lastName.trim()) {
    [previous] = await sql<{ digital_key: string; booking_count: number }[]>`
      SELECT digital_key, COALESCE(booking_count, 1) AS booking_count
      FROM reservations
      WHERE guest_first_name ILIKE ${firstName.trim()}
        AND guest_last_name  ILIKE ${lastName.trim()}
      ORDER BY check_in DESC
      LIMIT 1
    `;
  }

  if (!previous) {
    return { pin: null, bookingCount: 1 };
  }

  // Only reuse the old PIN if it is not currently active for another reservation
  const [activeConflict] = await sql<{ id: string }[]>`
    SELECT id FROM reservations
    WHERE digital_key = ${previous.digital_key}
      AND check_out >= CURRENT_DATE
    LIMIT 1
  `;

  return {
    pin: activeConflict ? null : previous.digital_key,
    bookingCount: previous.booking_count + 1,
  };
}
