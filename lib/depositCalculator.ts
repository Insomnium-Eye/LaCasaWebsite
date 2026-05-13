import type {
  BookingDetails,
  DepositPolicy,
  DepositResult,
  RefundDeduction,
  RefundResult,
} from './deposit';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculates security deposit and advance deposit for a booking.
 *
 * Security deposit tiers:
 *   < 7 nights  → shortStayDeposit (flat)
 *   7–27 nights → mediumStayDeposit (flat)
 *   28+ nights  → longStayDepositMonths × (baseNightlyRate × 30)
 *
 * Peak-season multiplier is applied before min/max capping.
 * Advance deposit is a configurable % of totalStayAmount, applied toward the balance.
 */
export function calculateDeposit(
  booking: BookingDetails,
  policy: DepositPolicy
): DepositResult {
  // 1. Base security deposit by stay length
  let base: number;
  if (booking.nights < 7) {
    base = policy.shortStayDeposit;
  } else if (booking.nights < 28) {
    base = policy.mediumStayDeposit;
  } else {
    base = booking.baseNightlyRate * 30 * policy.longStayDepositMonths;
  }

  // 2. Season multiplier (only peaks are charged extra)
  const multiplier = booking.seasonType === 'peak' ? policy.peakSeasonMultiplier : 1;
  const afterMultiplier = base * multiplier;

  // 3. Enforce min/max cap
  const wasCapped = afterMultiplier < policy.minDeposit || afterMultiplier > policy.maxDeposit;
  const securityDeposit = round2(
    Math.max(policy.minDeposit, Math.min(policy.maxDeposit, afterMultiplier))
  );

  // 4. Advance deposit — short stays (≤ 7 nights) require full payment upfront
  const advancePercent = booking.nights <= 7 ? 1 : policy.advanceDepositPercent;
  const advanceDeposit = policy.advanceDepositEnabled
    ? round2(booking.totalStayAmount * advancePercent)
    : 0;

  // 5. Remaining balance after advance deposit
  const remainingBalance = round2(booking.totalStayAmount - advanceDeposit);

  // 6. What's due upfront right now
  const totalDueUpfront = round2(
    (policy.advanceDepositTiming === 'upfront' ? advanceDeposit : 0) +
    (policy.securityDepositTiming === 'upfront' ? securityDeposit : 0)
  );

  return {
    securityDeposit,
    advanceDeposit,
    remainingBalance,
    totalDueUpfront,
    securityDepositTiming: policy.securityDepositTiming,
    advanceDepositTiming: policy.advanceDepositTiming,
    seasonType: booking.seasonType,
    breakdown: { base, seasonMultiplier: multiplier, afterMultiplier, wasCapped },
  };
}

/**
 * Stub for refund logic.
 * Pass an array of deductions (damages, cleaning fees, etc.) to receive a
 * refund breakdown.  Wire this to the actual refund flow when the backend is ready.
 */
export function calculateRefund(
  securityDeposit: number,
  deductions: RefundDeduction[]
): RefundResult {
  const totalDeductions = round2(deductions.reduce((s, d) => s + d.amount, 0));
  const refundAmount = round2(Math.max(0, securityDeposit - totalDeductions));
  const status =
    refundAmount === 0 ? 'none' : refundAmount < securityDeposit ? 'partial' : 'full';

  return {
    originalDeposit: securityDeposit,
    totalDeductions,
    refundAmount,
    status,
    reason:
      deductions.length === 0
        ? 'No deductions — full refund issued.'
        : `${deductions.length} deduction(s) applied.`,
    deductions,
  };
}
