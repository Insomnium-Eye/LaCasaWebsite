'use client';

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

export default function DateInput({
  value, onChange, language, min, max, disabled, required, className, id,
}: DateInputProps) {
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

  // Spanish: styled wrapper shows DD/MM/AAAA; invisible native input underneath provides the calendar picker
  const wrapperClass = (className ?? '')
    .replace(/\bfocus:/g, 'focus-within:')
    .replace(/\boutline-none\b/, '');

  return (
    <div className={`relative ${wrapperClass}`}>
      <span className={value ? '' : 'text-gray-400'}>
        {value ? isoToDisplay(value) : 'DD/MM/AAAA'}
      </span>
      {/* Calendar icon */}
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {/* Native date input — invisible but clickable; opens the calendar picker */}
      <input
        id={id}
        type="date"
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
