// Exchange rate: 1 USD = 20 MXN
const USD_TO_MXN_RATE = 20;

/**
 * Converts a price from USD to MXN and rounds down to the nearest peso
 * @param priceUSD - Price in US dollars
 * @returns Price in Mexican pesos, rounded down to the nearest peso
 */
export function convertToMXN(priceUSD: number): number {
  const priceMXN = priceUSD * USD_TO_MXN_RATE;
  return Math.floor(priceMXN);
}

/**
 * Formats a price in USD or MXN based on language
 * @param priceUSD - Price in US dollars
 * @param language - Current language ('en' or 'es')
 * @returns Formatted price string with appropriate currency symbol
 */
export function formatPrice(priceUSD: number, language: 'en' | 'es'): string {
  const roundedPrice = Math.round(priceUSD * 100) / 100; // Round to 2 decimal places
  if (language === 'es') {
    const priceMXN = convertToMXN(roundedPrice);
    return `$${priceMXN}`;
  }
  return `$${roundedPrice.toFixed(2)}`;
}
