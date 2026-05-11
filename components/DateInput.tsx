'use client';

import { useRef } from 'react';

interface DateInputProps {
  value: string;
  onChange: (iso: string) => void;
  language: string;
  min?: string;
  max?: string;
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

function openPicker(el: HTMLInputElement | null) {
  if (!el) return;
  try {
    (el as any).showPicker();
  } catch {
    el.click();
  }
}

export default function DateInput({
  value, onChange, language, min, max, disabled, required, className, id,
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (language !== 'es') {
    return (
      <input
        id={id}
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={() => openPicker(inputRef.current)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className={className}
      />
    );
  }

  // Spanish: show DD/MM/AAAA; clicking anywhere opens the native calendar via showPicker()
  const wrapperClass = (className ?? '').replace(/\bfocus:/g, 'focus-within:');

  return (
    <div
      className={`relative cursor-pointer ${wrapperClass}`}
      onClick={() => !disabled && openPicker(inputRef.current)}
    >
      <span className={value ? '' : 'text-gray-400'}>
        {value ? isoToDisplay(value) : 'DD/MM/AAAA'}
      </span>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {/* Native input — hidden but positioned so the calendar popup appears correctly */}
      <input
        id={id}
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        tabIndex={-1}
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
      />
    </div>
  );
}
