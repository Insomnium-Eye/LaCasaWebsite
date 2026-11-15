'use client';

import { useEffect, useState } from 'react';
import { NightlyRates, NightlyRatesBySlug } from '@/lib/nightlyRates';

// One request per page load, shared by every unit card and modal.
let request: Promise<NightlyRatesBySlug> | null = null;

const loadNightlyRates = () => {
  request ??= fetch('/api/nightly-rates')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => {
      request = null;
      return {};
    });
  return request;
};

/** Live nightly rates for a unit (from Hospitable), or null while loading / unavailable. */
export default function useNightlyRates(slug: string): NightlyRates | null {
  const [rates, setRates] = useState<NightlyRates | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadNightlyRates().then((all) => {
      if (!cancelled) setRates(all[slug] ?? null);
    });
    return () => { cancelled = true; };
  }, [slug]);

  return rates;
}
