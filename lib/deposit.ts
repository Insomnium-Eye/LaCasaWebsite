export type SeasonType = 'peak' | 'standard' | 'low';
export type DepositTiming = 'upfront' | 'at_checkin' | 'pre_authorization';
export type RefundStatus = 'full' | 'partial' | 'none';

export interface BookingDetails {
  nights: number;
  baseNightlyRate: number;
  totalStayAmount: number;
  propertySlug: string;
  seasonType: SeasonType;
}

/** Configurable rules — swap in a DB-driven version later without touching the calculator. */
export interface DepositPolicy {
  shortStayDeposit: number;       // flat amount for < 7 nights
  mediumStayDeposit: number;      // flat amount for 7–27 nights
  longStayDepositMonths: number;  // multiplier × 30-day rate for 28+ nights
  minDeposit: number;
  maxDeposit: number;
  peakSeasonMultiplier: number;
  advanceDepositEnabled: boolean;
  advanceDepositPercent: number;  // fraction of total stay, e.g. 0.20
  securityDepositTiming: DepositTiming;
  advanceDepositTiming: DepositTiming;
}

export interface DepositBreakdown {
  base: number;
  seasonMultiplier: number;
  afterMultiplier: number;
  wasCapped: boolean;
}

export interface DepositResult {
  securityDeposit: number;
  advanceDeposit: number;
  remainingBalance: number;  // totalStayAmount − advanceDeposit
  totalDueUpfront: number;
  securityDepositTiming: DepositTiming;
  advanceDepositTiming: DepositTiming;
  seasonType: SeasonType;
  breakdown: DepositBreakdown;
}

export interface RefundDeduction {
  description: string;
  amount: number;
}

export interface RefundResult {
  originalDeposit: number;
  totalDeductions: number;
  refundAmount: number;
  status: RefundStatus;
  reason: string;
  deductions: RefundDeduction[];
}
