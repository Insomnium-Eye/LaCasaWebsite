const DEFAULT_MXN_RATE = 20.5; // fallback MXN-per-USD

// Takes MXN as base.
// Spanish → "X,XXX MXN"
// English → "$X USD" (floor, no cents)
export function formatPrice(priceMXN: number, language: 'en' | 'es', mxnRate?: number): string {
  const mxn = Math.round(priceMXN);
  if (language === 'es') {
    return `$${mxn.toLocaleString('es-MX')} MXN`;
  }
  const rate = mxnRate ?? DEFAULT_MXN_RATE;
  const usd = Math.floor(priceMXN / rate);
  return `$${usd.toLocaleString('en-US')} USD`;
}

// Legacy helper — converts a USD amount to MXN for display via formatPrice
export function formatPriceFromUsd(priceUSD: number, language: 'en' | 'es', mxnRate?: number): string {
  const rate = mxnRate ?? DEFAULT_MXN_RATE;
  return formatPrice(Math.round(priceUSD * rate), language, mxnRate);
}
