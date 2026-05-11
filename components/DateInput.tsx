'use client';

import { useState, useEffect, ChangeEvent } from 'react';

interface DateInputProps {
  value: string;            // ISO YYYY-MM-DD
  onChange: (iso: string) => void;
  language: string;
  min?: string;             // ISO YYYY-MM-DD
  max?: string;             // ISO YYYY-MM-DD
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

function isoToDisplay(iso: string): string {
  if (!iso || iso.length < 10) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToIso(display: string): string {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

function autoFormat(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function DateInput({
  value, onChange, language, min, max, disabled, required, className, id,
}: DateInputProps) {
  const [display, setDisplay] = useState(() => language === 'es' ? isoToDisplay(value) : '');

  useEffect(() => {
    if (language === 'es') setDisplay(isoToDisplay(value));
  }, [value, language]);

  if (language !== 'es') {
    return (
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className={className}
      />
    );
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = autoFormat(e.target.value);
    setDisplay(formatted);
    const iso = displayToIso(formatted);
    if (iso) {
      if (min && iso < min) return;
      if (max && iso > max) return;
      onChange(iso);
    }
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/AAAA"
      value={display}
      onChange={handleChange}
      disabled={disabled}
      required={required}
      className={className}
    />
  );
}
