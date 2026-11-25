'use client';

import { useEffect, useState } from 'react';
import { COUNTRIES } from '../data/countryCodes';

const DEFAULT_ISO = 'MX';
let cached: string | null = null;

/** The visitor's country (by IP, looked up once per page load), for defaulting phone dial codes. Mexico if unknown. */
export default function useGeoDialCode() {
  const [iso, setIso] = useState<string>(cached ?? DEFAULT_ISO);
  const [ready, setReady] = useState(cached !== null);

  useEffect(() => {
    if (cached !== null) {
      setIso(cached);
      setReady(true);
      return;
    }

    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then((d: { country_code?: string }) => {
        const code = d.country_code?.toUpperCase();
        cached = code && COUNTRIES.some(c => c.iso === code) ? code : DEFAULT_ISO;
        setIso(cached);
      })
      .catch(() => {
        cached = DEFAULT_ISO;
      })
      .finally(() => setReady(true));
  }, []);

  const dialCode = (COUNTRIES.find(c => c.iso === iso) ?? COUNTRIES.find(c => c.iso === DEFAULT_ISO))!.dialCode;
  return { iso, dialCode, ready };
}
