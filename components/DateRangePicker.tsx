'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface Props {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (d: string) => void;
  onCheckOutChange: (d: string) => void;
  blockedRanges: { start: string; end: string }[];
  minDate: string;
  minNights?: number;
  language: string;
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Expand blocked ranges into a Set of YYYY-MM-DD for O(1) lookup
function buildBlockedSet(ranges: { start: string; end: string }[]): Set<string> {
  const set = new Set<string>();
  for (const r of ranges) {
    let cur = new Date(r.start + 'T00:00:00');
    const end = new Date(r.end + 'T00:00:00');
    while (cur < end) {
      set.add(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
  }
  return set;
}

// First blocked range start strictly after checkIn — this is the max valid checkout
function getMaxCheckOut(checkIn: string, ranges: { start: string; end: string }[]): string | null {
  const after = ranges.map(r => r.start).filter(s => s > checkIn).sort();
  return after[0] ?? null;
}

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOW_EN = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const DOW_ES = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];

export default function DateRangePicker({
  checkIn, checkOut,
  onCheckInChange, onCheckOutChange,
  blockedRanges, minDate, minNights = 1, language,
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'in' | 'out'>('in');
  const [hover, setHover] = useState<string | null>(null);
  const [viewYear, setViewYear] = useState(() => new Date((checkIn || minDate) + 'T00:00:00').getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date((checkIn || minDate) + 'T00:00:00').getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  const blockedSet = useMemo(() => buildBlockedSet(blockedRanges), [blockedRanges]);
  const maxOut = useMemo(
    () => (checkIn ? getMaxCheckOut(checkIn, blockedRanges) : null),
    [checkIn, blockedRanges],
  );

  // Close calendar on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function openPicker(field: 'in' | 'out') {
    const f = field === 'out' && !checkIn ? 'in' : field;
    setStep(f);
    setOpen(true);
    const base = f === 'out' && checkIn ? checkIn : (checkIn || minDate);
    const d = new Date(base + 'T00:00:00');
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function handleDayClick(iso: string) {
    if (step === 'in') {
      onCheckInChange(iso);
      onCheckOutChange('');
      setStep('out');
    } else {
      onCheckOutChange(iso);
      setOpen(false);
      setHover(null);
      setStep('in');
    }
  }

  function isDisabled(iso: string): boolean {
    if (iso < minDate) return true;
    if (blockedSet.has(iso)) return true;
    if (step === 'out' && checkIn) {
      if (iso <= addDays(checkIn, minNights - 1)) return true;
      if (maxOut && iso > maxOut) return true;
    }
    return false;
  }

  function getDayStyle(iso: string): { bg: string; text: string } {
    if (blockedSet.has(iso)) return { bg: 'bg-red-50 cursor-not-allowed', text: 'line-through text-red-400' };
    if (iso < minDate) return { bg: 'cursor-not-allowed', text: 'text-slate-300' };
    if (iso === checkIn) return { bg: 'bg-garden rounded-lg', text: 'text-white font-bold' };
    if (iso === checkOut) return { bg: 'bg-garden rounded-lg', text: 'text-white font-bold' };
    if (checkIn && checkOut && iso > checkIn && iso < checkOut) {
      return { bg: 'bg-garden/20', text: 'text-garden font-medium' };
    }
    if (step === 'out' && checkIn && hover && iso > checkIn && iso <= hover && !isDisabled(iso)) {
      return { bg: 'bg-garden/10', text: 'text-slate-700' };
    }
    if (isDisabled(iso)) return { bg: 'cursor-not-allowed', text: 'text-slate-300' };
    return { bg: 'hover:bg-slate-100 cursor-pointer', text: 'text-slate-900' };
  }

  // Calendar grid: empty strings for leading padding, ISO dates for real days
  const grid = useMemo(() => {
    const cells: string[] = [];
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInM = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let i = 0; i < firstDow; i++) cells.push('');
    for (let d = 1; d <= daysInM; d++) cells.push(toISO(viewYear, viewMonth, d));
    return cells;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const months = language === 'es' ? MONTHS_ES : MONTHS_EN;
  const dows = language === 'es' ? DOW_ES : DOW_EN;

  function fmtDisplay(iso: string) {
    if (!iso) return language === 'es' ? 'Seleccionar' : 'Select date';
    if (language === 'es') {
      const [y, m, d] = iso.split('-');
      return `${d}/${m}/${y}`;
    }
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const checkInLabel = language === 'es' ? 'Llegada' : 'Check-in';
  const checkOutLabel = language === 'es' ? 'Salida' : 'Check-out';

  return (
    <div ref={wrapRef} className="relative">
      {/* Date field buttons */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-2">
            {checkInLabel} <span className="text-red-500">*</span>
          </p>
          <button
            type="button"
            onClick={() => openPicker('in')}
            className={`w-full rounded-3xl border px-4 py-4 text-sm text-left transition bg-slate-50
              ${open && step === 'in' ? 'border-garden ring-2 ring-garden/20' : 'border-slate-300 hover:border-slate-400'}
              ${checkIn ? 'text-slate-900' : 'text-slate-400'}`}
          >
            {fmtDisplay(checkIn)}
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 mb-2">
            {checkOutLabel} <span className="text-red-500">*</span>
          </p>
          <button
            type="button"
            onClick={() => openPicker('out')}
            className={`w-full rounded-3xl border px-4 py-4 text-sm text-left transition bg-slate-50
              ${open && step === 'out' ? 'border-garden ring-2 ring-garden/20' : 'border-slate-300 hover:border-slate-400'}
              ${checkOut ? 'text-slate-900' : 'text-slate-400'}`}
          >
            {fmtDisplay(checkOut)}
          </button>
        </div>
      </div>

      {/* Calendar popup */}
      {open && (
        <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 select-none">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-lg leading-none font-light"
            >
              ‹
            </button>
            <span className="font-semibold text-sm text-slate-900">
              {months[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-lg leading-none font-light"
            >
              ›
            </button>
          </div>

          {/* Step hint */}
          <p className="text-xs text-center text-slate-400 mb-3">
            {step === 'in'
              ? (language === 'es' ? 'Selecciona tu fecha de llegada' : 'Select your check-in date')
              : (language === 'es' ? 'Selecciona tu fecha de salida' : 'Select your check-out date')}
          </p>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {dows.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {grid.map((iso, i) => {
              if (!iso) return <div key={i} className="h-9" />;
              const disabled = isDisabled(iso);
              const { bg, text } = getDayStyle(iso);
              const day = parseInt(iso.split('-')[2], 10);

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(iso)}
                  onMouseEnter={() => setHover(iso)}
                  onMouseLeave={() => setHover(null)}
                  className={`h-9 w-full flex items-center justify-center text-sm rounded-lg transition ${bg}`}
                >
                  <span className={text}>{day}</span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded bg-garden inline-block shrink-0" />
              {language === 'es' ? 'Seleccionado' : 'Selected'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded bg-garden/20 inline-block shrink-0" />
              {language === 'es' ? 'Tu estadía' : 'Your stay'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-3.5 h-3.5 rounded bg-red-50 inline-flex items-center justify-center shrink-0">
                <span className="text-red-400 line-through text-[9px] leading-none">7</span>
              </span>
              {language === 'es' ? 'No disponible' : 'Unavailable'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
