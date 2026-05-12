import type { DepositPolicy, SeasonType } from './deposit';

export const DEFAULT_DEPOSIT_POLICY: DepositPolicy = {
  shortStayDeposit: 100,        // < 7 nights
  mediumStayDeposit: 100,       // 7–27 nights
  longStayDepositMonths: 0,     // 28+ nights: overridden by min/max clamp below
  minDeposit: 100,
  maxDeposit: 100,              // flat $100 security deposit for all stay lengths
  peakSeasonMultiplier: 1.25,
  advanceDepositEnabled: true,
  advanceDepositPercent: 0.20,  // 20% of total stay due upfront
  securityDepositTiming: 'at_checkin',
  advanceDepositTiming: 'upfront',
};

/**
 * Derives season from check-in month for Oaxaca, Mexico.
 * Peak: Dec, Jan, Jul, Aug (holidays + summer)
 * Low:  May, Jun, Sep, Oct (shoulder months)
 * Standard: everything else
 */
export function getSeasonType(checkInDate: string): SeasonType {
  if (!checkInDate) return 'standard';
  const month = new Date(checkInDate).getUTCMonth() + 1;
  if ([12, 1, 7, 8].includes(month)) return 'peak';
  if ([5, 6, 9, 10].includes(month)) return 'low';
  return 'standard';
}
