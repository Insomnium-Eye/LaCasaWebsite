'use client';

import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type InputType = 'date' | 'datetime-local';

interface DateInputProps {
  value: string;           // ISO string: 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:MM'
  onChange: (iso: string) => void;
  language: string;
  type?: InputType;
  min?: string;            // ISO string
  max?: string;            // ISO string
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

function toDate(iso: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
  return isNaN(d.getTime()) ? null : d;
}

function toIso(date: Date, type: InputType): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  if (type === 'date') return `${y}-${m}-${d}`;
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export default function DateInput({
  value, onChange, language, type = 'date', min, max, disabled, required, className, id,
}: DateInputProps) {
  const selected = toDate(value);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minDate = min ? toDate(min) ?? today : today;
  const maxDate = max ? toDate(max) ?? undefined : undefined;
  const showTime = type === 'datetime-local';

  const locale = language === 'es' ? 'es' : undefined;
  const dateFormat = showTime
    ? (language === 'es' ? 'dd/MM/yyyy HH:mm' : 'MM/dd/yyyy h:mm aa')
    : (language === 'es' ? 'dd/MM/yyyy'       : 'MM/dd/yyyy');

  return (
    <ReactDatePicker
      id={id}
      selected={selected}
      onChange={(d: Date | null) => d && onChange(toIso(d, type))}
      minDate={minDate ?? undefined}
      maxDate={maxDate ?? undefined}
      showTimeSelect={showTime}
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat={dateFormat}
      locale={locale}
      disabled={disabled}
      required={required}
      placeholderText={showTime
        ? (language === 'es' ? 'DD/MM/AAAA HH:MM' : 'MM/DD/YYYY HH:MM')
        : (language === 'es' ? 'DD/MM/AAAA'       : 'MM/DD/YYYY')}
      className={className}
      wrapperClassName="w-full"
      autoComplete="off"
    />
  );
}
