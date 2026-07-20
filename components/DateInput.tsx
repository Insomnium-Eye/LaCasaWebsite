'use client';

import { useRef } from 'react';

type InputType = 'date' | 'datetime-local';

interface DateInputProps {
  value: string;
  onChange: (iso: string) => void;
  language: string;
  type?: InputType;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

function isoToDisplay(iso: string, type: InputType): string {
  if (type === 'date') {
    if (!iso || iso.length < 10) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }
  if (!iso || iso.length < 16) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y} ${iso.slice(11, 16)}`;
}

const PLACEHOLDER: Record<InputType, string> = {
  'date': 'DD/MM/AAAA',
  'datetime-local': 'DD/MM/AAAA HH:MM',
};

export default function DateInput({
  value, onChange, language, type = 'date', min, max, disabled, required, className, id,
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // English: native input; showPicker() makes the entire field area clickable (not just the icon)
  if (language !== 'es') {
    return (
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className={className}
        onClick={(e) => {
          if (!disabled) {
            try { (e.currentTarget as HTMLInputElement).showPicker(); } catch (_) {}
          }
        }}
      />
    );
  }

  // Spanish: formatted DD/MM/AAAA overlay with a transparent native input underneath.
  // pointer-events-none is removed from the native input so real clicks open the picker.
  const wrapperClass = (className ?? '').replace(/\bfocus:/g, 'focus-within:');

  return (
    <div className={`relative ${wrapperClass} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      {/* Formatted overlay — visual only */}
      <div className="pointer-events-none flex items-center justify-between gap-2 w-full">
        <span className={value ? '' : 'text-gray-400'}>
          {value ? isoToDisplay(value, type) : PLACEHOLDER[type]}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Native input: covers full area, invisible but fully clickable */}
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}
