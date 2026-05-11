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
  if (!iso || iso.length < 16) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y} ${iso.slice(11, 16)}`;
}

const PLACEHOLDER: Record<InputType, string> = {
  'date': 'DD/MM/AAAA',
  'datetime-local': 'DD/MM/AAAA HH:MM',
};

// Expanding the calendar-picker-indicator to cover the full input area makes any
// click open the picker popup, not just clicking the small calendar icon on the right.
const EXPAND_INDICATOR = [
  '[&::-webkit-calendar-picker-indicator]:absolute',
  '[&::-webkit-calendar-picker-indicator]:inset-0',
  '[&::-webkit-calendar-picker-indicator]:opacity-0',
].join(' ');

export default function DateInput({
  value, onChange, language, type = 'date', min, max, disabled, required, className, id,
}: DateInputProps) {
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
        className={[
          className ?? '',
          'relative',
          EXPAND_INDICATOR,
          disabled ? '[&::-webkit-calendar-picker-indicator]:cursor-not-allowed' : '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
        ].join(' ')}
      />
    );
  }

  // Spanish mode: native input sits absolutely over a formatted overlay.
  // Internal datetime text is hidden; indicator expanded to full area so one click opens picker.
  const wrapperClass = (className ?? '').replace(/\bfocus:/g, 'focus-within:');

  return (
    <div className={`relative ${wrapperClass}`}>
      {/* Formatted overlay — visible through the transparent native input above it */}
      <div className="pointer-events-none flex items-center justify-between gap-2 w-full">
        <span className={value ? '' : 'text-gray-400'}>
          {value ? isoToDisplay(value, type) : PLACEHOLDER[type]}
        </span>
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        required={required}
        className={[
          'absolute inset-0 w-full h-full p-0 border-none outline-none bg-transparent',
          '[&::-webkit-datetime-edit]:opacity-0',
          EXPAND_INDICATOR,
          disabled ? 'cursor-not-allowed [&::-webkit-calendar-picker-indicator]:cursor-not-allowed'
                   : 'cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer',
        ].join(' ')}
      />
    </div>
  );
}
