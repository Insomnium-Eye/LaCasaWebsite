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

  if (language !== 'es') {
    // English: native input, but programmatically call showPicker() on any click so
    // clicking the text area (not just the small calendar icon) opens the picker.
    // Per spec, showPicker() is a no-op if the picker is already open, so clicking
    // the calendar icon natively (which opens it) then firing showPicker() is safe.
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

  // Spanish mode: the wrapper div owns all clicks. The native input is invisible
  // (opacity-0, pointer-events-none) so it never intercepts clicks itself — only the
  // wrapper does, which then calls showPicker() once per click with no conflicts.
  const wrapperClass = (className ?? '').replace(/\bfocus:/g, 'focus-within:');

  return (
    <div
      className={`relative ${wrapperClass} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => {
        if (!disabled) {
          try { inputRef.current?.showPicker(); } catch (_) {}
        }
      }}
    >
      {/* Formatted overlay — DD/MM/AAAA display, non-interactive */}
      <div className="pointer-events-none flex items-center justify-between gap-2 w-full">
        <span className={value ? '' : 'text-gray-400'}>
          {value ? isoToDisplay(value, type) : PLACEHOLDER[type]}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Native input: invisible but present for value binding, onChange, and form validation */}
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
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
      />
    </div>
  );
}
