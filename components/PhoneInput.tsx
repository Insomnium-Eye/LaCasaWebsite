'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { COUNTRIES, countryFlag, type Country } from '../data/countryCodes';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const DEFAULT_ISO = 'MX';

export default function PhoneInput({ value, onChange, className, placeholder }: PhoneInputProps) {
  const [selectedIso, setSelectedIso] = useState<string>(DEFAULT_ISO);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry: Country = COUNTRIES.find(c => c.iso === selectedIso) ?? COUNTRIES[0];

  // Derive the local number portion from the controlled value
  const localNumber = useMemo(() => {
    if (!value) return '';
    const prefix = selectedCountry.dialCode + ' ';
    return value.startsWith(prefix) ? value.slice(prefix.length) : value.replace(/\D/g, '');
  }, [value, selectedCountry.dialCode]);

  const handleNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    onChange(digits ? `${selectedCountry.dialCode} ${digits}` : '');
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedIso(country.iso);
    setOpen(false);
    setSearch('');
    onChange(localNumber ? `${country.dialCode} ${localNumber}` : '');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className={`flex ${className ?? ''}`} ref={dropdownRef}>
      {/* Country code picker */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="h-full flex items-center gap-1.5 px-3 rounded-l-3xl border border-r-0 border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 transition whitespace-nowrap"
        >
          <span className="text-lg leading-none">{countryFlag(selectedCountry.iso)}</span>
          <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
          <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '14rem' }}>
            <div className="p-2 border-b border-slate-100 flex-shrink-0">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-garden"
                autoFocus
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredCountries.map(country => (
                <button
                  key={country.iso}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition ${
                    country.iso === selectedIso
                      ? 'bg-garden/10 text-garden font-semibold'
                      : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base leading-none flex-shrink-0">{countryFlag(country.iso)}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  <span className="text-slate-400 text-xs font-mono flex-shrink-0">{country.dialCode}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="px-3 py-4 text-sm text-slate-400 text-center">No countries found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone number digits */}
      <input
        type="tel"
        value={localNumber}
        onChange={e => handleNumberChange(e.target.value)}
        inputMode="numeric"
        placeholder={placeholder ?? '1234567890'}
        className="flex-1 min-w-0 rounded-r-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
      />
    </div>
  );
}
