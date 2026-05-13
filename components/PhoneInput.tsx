'use client';

import { useState, useMemo } from 'react';
import { COUNTRIES, countryFlag } from '../data/countryCodes';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const [selectedIso, setSelectedIso] = useState('MX');

  const selectedCountry = COUNTRIES.find(c => c.iso === selectedIso) ?? COUNTRIES[0];

  const localNumber = useMemo(() => {
    if (!value) return '';
    const prefix = selectedCountry.dialCode + ' ';
    return value.startsWith(prefix)
      ? value.slice(prefix.length)
      : value.replace(/\D/g, '');
  }, [value, selectedCountry.dialCode]);

  const handleCountryChange = (iso: string) => {
    const country = COUNTRIES.find(c => c.iso === iso) ?? COUNTRIES[0];
    setSelectedIso(iso);
    onChange(localNumber ? `${country.dialCode} ${localNumber}` : '');
  };

  const handleNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    onChange(digits ? `${selectedCountry.dialCode} ${digits}` : '');
  };

  return (
    <div className="mt-2 flex w-full overflow-hidden rounded-3xl border border-slate-300 bg-slate-50 focus-within:border-garden focus-within:ring-2 focus-within:ring-garden/20">
      <select
        value={selectedIso}
        onChange={e => handleCountryChange(e.target.value)}
        aria-label="Country dial code"
        className="cursor-pointer border-r border-slate-300 bg-slate-100 px-3 py-4 text-sm text-slate-800 outline-none"
      >
        {COUNTRIES.map(c => (
          <option key={c.iso} value={c.iso}>
            {countryFlag(c.iso)} {c.dialCode}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={localNumber}
        onChange={e => handleNumberChange(e.target.value)}
        inputMode="numeric"
        placeholder={placeholder ?? '1234567890'}
        className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-slate-900 outline-none"
      />
    </div>
  );
}
