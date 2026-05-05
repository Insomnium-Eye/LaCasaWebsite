const DEFAULT_USD_TO_MXN_RATE = 20.5;

export function convertToMXN(priceUSD: number, rate: number = DEFAULT_USD_TO_MXN_RATE): number {
  return Math.floor(priceUSD * rate);
}

export function formatPrice(priceUSD: number, language: 'en' | 'es', mxnRate?: number): string {
  const roundedPrice = Math.round(priceUSD * 100) / 100;
  if (language === 'es') {
    const priceMXN = convertToMXN(roundedPrice, mxnRate);
    return `$${priceMXN.toLocaleString('es-MX')} MXN`;
  }
  return `$${roundedPrice.toFixed(2)}`;
}
