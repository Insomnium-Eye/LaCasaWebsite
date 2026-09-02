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
  const getInitial = () => {
    if (!slug) return null;
    const cached = cache[slug];
    return cached && Date.now() - cached.ts < CACHE_TTL ? cached.data : null;
  };
  const [availability, setAvailability] = useState<Availability | null>(getInitial);
  const [loading, setLoading] = useState(() => !getInitial());

  useEffect(() => {
    if (!slug) return;
    const cached = cache[slug];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setAvailability(cached.data);
      setLoading(false);
      return;
    }
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
