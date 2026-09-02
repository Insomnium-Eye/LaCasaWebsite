'use client';

import { useEffect, useState } from 'react';

export type Availability = {
  nightly: string;
  oneToThree: string;
  threeToSix: string;
  sixToTwelve: string;
  annual: string;
};

const cache: Record<string, { data: Availability; ts: number }> = {};
const CACHE_TTL = 60 * 60 * 1000;

export default function useAvailability(slug: string) {
  const cached = cache[slug];
  const [availability, setAvailability] = useState<Availability | null>(
    cached && Date.now() - cached.ts < CACHE_TTL ? cached.data : null
  );
  const [loading, setLoading] = useState(!availability);

  useEffect(() => {
    if (availability) return;
    let cancelled = false;
    setLoading(true);

    fetch(`/api/airbnb-availability/${slug}`)
      .then(r => r.json())
      .then((d: Availability | null) => {
        if (cancelled || !d) return;
        cache[slug] = { data: d, ts: Date.now() };
        setAvailability(d);
      })
      .catch(() => {
        if (!cancelled) setAvailability({
          nightly: '—', oneToThree: '—', threeToSix: '—', sixToTwelve: '—', annual: '—',
        });
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  return { availability, loading };
}
