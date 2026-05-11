'use client';

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
  // datetime-local: YYYY-MM-DDTHH:MM
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
  // English: plain native input, no changes
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
      />
    );
  }

  // Spanish: styled wrapper shows DD/MM/AAAA(HH:MM).
  // The native input is opacity-0 but covers the entire wrapper and has normal pointer events,
  // so a single click anywhere opens the calendar picker natively — no showPicker() needed.
  const wrapperClass = (className ?? '').replace(/\bfocus:/g, 'focus-within:');

  return (
    <div className={`relative ${wrapperClass}`}>
      <span className={value ? '' : 'text-gray-400'}>
        {value ? isoToDisplay(value, type) : PLACEHOLDER[type]}
      </span>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {/* opacity-0 native input covers the whole wrapper; a single click opens the picker directly */}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
    </div>
  );
}
