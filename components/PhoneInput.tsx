'use client';

import { useEffect, useRef, useState } from 'react';
import { COUNTRIES, countryFlag } from '../data/countryCodes';
import useGeoDialCode from '../hooks/useGeoDialCode';

const STYLES = {
  dark: {
    box: 'rounded-2xl border border-slate-600 bg-slate-800 focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/20',
    select: 'border-slate-600 bg-slate-700 py-3 text-xs text-white',
    input: 'py-3 text-white placeholder-slate-400',
  },
  light: {
    box: 'rounded-2xl border border-slate-300 bg-slate-50 focus-within:border-garden focus-within:ring-2 focus-within:ring-garden/20',
    select: 'border-slate-300 bg-slate-100 py-3 text-xs text-slate-900',
    input: 'py-3 text-slate-900',
  },
  /** Matches the inputs in the "Book directly" pop-up. */
  modal: {
    box: 'rounded-lg border-2 border-slate-300 bg-white focus-within:border-terracotta',
    select: 'border-slate-300 bg-slate-50 py-2 text-sm text-slate-900',
    input: 'py-2 text-slate-900',
  },
};

interface PhoneInputProps {
  /** Full number as "+52 5551234567", or '' when empty. */
  value: string;
  onChange: (value: string) => void;
  variant?: keyof typeof STYLES;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Phone number with a country dial-code picker. The country defaults to the
 * visitor's (by IP) until they pick one themselves.
 */
export default function PhoneInput({ value, onChange, variant = 'light', required, disabled, placeholder, className = '' }: PhoneInputProps) {
  const { iso: geoIso, ready: geoReady } = useGeoDialCode();
  const [iso, setIso] = useState('MX');
  const chosenByUser = useRef(false);
  const styles = STYLES[variant];

  const country = COUNTRIES.find(c => c.iso === iso) ?? COUNTRIES[0];
  const prefix = country.dialCode + ' ';
  const digits = value.startsWith(prefix) ? value.slice(prefix.length) : value.replace(/\D/g, '');

  const selectCountry = (nextIso: string) => {
    const next = COUNTRIES.find(c => c.iso === nextIso) ?? COUNTRIES[0];
    setIso(next.iso);
    if (digits) onChange(`${next.dialCode} ${digits}`);
  };

  // Default to the visitor's country once it's known, unless they already picked one.
  useEffect(() => {
    if (geoReady && !chosenByUser.current) selectCountry(geoIso);
  }, [geoReady, geoIso]);

  return (
    <div className={`flex w-full overflow-hidden transition ${styles.box} ${className}`}>
      <select
        value={iso}
        onChange={e => { chosenByUser.current = true; selectCountry(e.target.value); }}
        disabled={disabled}
        aria-label="Country dial code"
        className={`shrink-0 cursor-pointer border-r px-3 outline-none ${styles.select}`}
      >
        {COUNTRIES.map(c => (
          <option key={c.iso} value={c.iso}>
            {countryFlag(c.iso)} {c.dialCode}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={digits}
        onChange={e => {
          const next = e.target.value.replace(/\D/g, '').slice(0, 15);
          onChange(next ? `${country.dialCode} ${next}` : '');
        }}
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        minLength={required ? 6 : undefined}
        disabled={disabled}
        placeholder={placeholder ?? '555 555 5555'}
        className={`min-w-0 flex-1 bg-transparent px-3 text-sm outline-none ${styles.input}`}
      />
    </div>
  );
}
