import type { DepositPolicy, SeasonType } from './deposit';

export const DEFAULT_DEPOSIT_POLICY: DepositPolicy = {
  shortStayDeposit: 300,        // < 7 nights
  mediumStayDeposit: 500,       // 7–27 nights
  longStayDepositMonths: 1,     // 28+ nights: 1 × effective monthly rate
  minDeposit: 100,
  maxDeposit: 2000,
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
