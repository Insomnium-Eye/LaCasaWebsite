'use client';

import { useEffect, useState } from 'react';
import { COUNTRIES } from '../data/countryCodes';

const DEFAULT = '+52';
let cached: string | null = null;

export default function useGeoDialCode() {
  const [dialCode, setDialCode] = useState<string>(cached ?? DEFAULT);
  const [ready, setReady] = useState(cached !== null);

  useEffect(() => {
    if (cached !== null) {
      setDialCode(cached);
      setReady(true);
      return;
    }

    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then((d: { country_code?: string }) => {
        const iso = d.country_code?.toUpperCase();
        const match = iso ? COUNTRIES.find(c => c.iso === iso) : null;
        cached = match ? match.dialCode : DEFAULT;
        setDialCode(cached);
      })
      .catch(() => {
        cached = DEFAULT;
      })
      .finally(() => setReady(true));
  }, []);

  return { dialCode, ready };
}
