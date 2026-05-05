import { useState, useEffect } from 'react';

/**
 * Custom hook for USD to MXN conversion with daily caching
 * Fetches live rates from ExchangeRate-API with Frankfurter as fallback
 * Caches results for 24 hours to minimize API calls
 * Falls back to ~20.5 MXN per USD if API fails
 */
const useUsdToMxn = () => {
  const [rate, setRate] = useState<number>(20.5); // Default fallback rate
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Determine cache key with today's date
  const getCacheKey = (): string => {
    const today = new Date().toISOString().split('T')[0];
    return `usd_mxn_rate_${today}`;
  };

  // Round amount DOWN to nearest peso
  const roundDownToNearestPeso = (amount: number): number => {
    return Math.floor(amount);
  };

  // Convert USD to MXN
  const convertToMxn = (usdAmount: number): number => {
    return roundDownToNearestPeso(usdAmount * rate);
  };

  // Format currency for display
  const formatCurrency = (usdAmount: number): string => {
    const roundedUsd = Math.round(usdAmount * 100) / 100;
    const mxnAmount = convertToMxn(roundedUsd);
    return `$${roundedUsd.toFixed(2)} USD ≈ $${mxnAmount.toLocaleString('es-MX')} MXN`;
  };

  // Fetch the current exchange rate
  const fetchExchangeRate = async () => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey();
      const cachedRate = localStorage.getItem(cacheKey);

      // Use cached rate if available
      if (cachedRate) {
        setRate(parseFloat(cachedRate));
        setLoading(false);
        return;
      }

      // Try ExchangeRate-API first
      try {
        const response = await fetch(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );

        if (response.ok) {
          const data = await response.json();
          const mxnRate = data.rates.MXN;

          if (mxnRate) {
            setRate(mxnRate);
            localStorage.setItem(cacheKey, mxnRate.toString());
            setLoading(false);
            return;
          }
        }
      } catch {
        console.warn('ExchangeRate-API failed, trying Frankfurter...');
      }

      // Fallback to Frankfurter API
      try {
        const response = await fetch(
          'https://api.frankfurter.app/latest?from=USD&to=MXN'
        );

        if (response.ok) {
          const data = await response.json();
          const mxnRate = data.rates.MXN;

          if (mxnRate) {
            setRate(mxnRate);
            localStorage.setItem(cacheKey, mxnRate.toString());
            setLoading(false);
            return;
          }
        }
      } catch {
        console.warn('Frankfurter API failed, using fallback rate');
      }

      // If both APIs fail, use fallback rate (already set as default)
      setError(
        'Using cached or default exchange rate. Real-time rate unavailable.'
      );
      localStorage.setItem(cacheKey, rate.toString());
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch exchange rate. Using fallback rate.');
      setLoading(false);
    }
  };

  // Fetch rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  return {
    rate,
    loading,
    error,
    convertToMxn,
    formatCurrency,
    refetchRate: fetchExchangeRate,
  };
};

export default useUsdToMxn;
