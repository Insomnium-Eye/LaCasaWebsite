'use client';

import { useEffect, useState } from 'react';
import { Unit, units } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import useUsdToMxn from '../hooks/useUsdToMxn';
import { COUNTRIES, countryFlag } from '../data/countryCodes';
import useGeoDialCode from '../hooks/useGeoDialCode';

interface Props {
  defaultUnit?: Unit | null;
  onSuccess?: () => void;
  dark?: boolean;
}

const inputClass = (dark?: boolean) =>
  `mt-2 w-full rounded-2xl border p-4 outline-none text-sm transition ${
    dark
      ? 'border-slate-600 bg-slate-800 text-white placeholder-slate-400 focus:border-terracotta focus:ring-2 focus:ring-terracotta/20'
      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-garden focus:ring-2 focus:ring-garden/20'
  }`;

const labelClass = (dark?: boolean) =>
  `text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-900'}`;

const optionalBadge = (dark?: boolean, es?: boolean) => (
  <span className={`text-xs font-normal ml-1 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
    ({es ? 'opcional' : 'optional'})
  </span>
);

function daysBetween(a: string, b: string) {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 864e5);
}

const today = new Date().toISOString().split('T')[0];

export default function LeaseApplicationForm({ defaultUnit, onSuccess, dark }: Props) {
  const { language } = useLanguage();
  const { rate } = useUsdToMxn();
  const es = language === 'es';
  const { dialCode: geoDialCode, ready: geoReady } = useGeoDialCode();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    phoneDialCode: '+52',
    unitSlug: defaultUnit?.slug ?? units[0].slug,
    checkIn: '',
    checkOut: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (geoReady) setForm(prev => ({ ...prev, phoneDialCode: geoDialCode }));
  }, [geoReady, geoDialCode]);

  const selectedUnit = units.find((u) => u.slug === form.unitSlug) ?? units[0];
  const liveUsd = rate > 0 ? Math.floor(selectedUnit.monthlyRateMXN / rate) : null;
  const depositMXN = Math.round(selectedUnit.monthlyRateMXN * 1.5);
  const depositUSD = rate > 0 ? Math.floor(depositMXN / rate) : null;

  const stayDays = daysBetween(form.checkIn, form.checkOut);
  const stayTooShort = stayDays !== null && stayDays < 30;
  const stayValid = stayDays !== null && stayDays >= 30;

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = es ? 'Requerido' : 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      e.email = es ? 'Correo inválido' : 'Invalid email';
    if (!form.checkIn) e.checkIn = es ? 'Requerido' : 'Required';
    if (!form.checkOut) e.checkOut = es ? 'Requerido' : 'Required';
    if (stayTooShort)
      e.checkOut = es
        ? 'La estadía mínima es de 1 mes para arrendamiento mensual.'
        : 'Minimum stay is 1 month for a monthly lease.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('sending');

    try {
      const res = await fetch('/api/lease-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone ? `${form.phoneDialCode} ${form.phone}` : '',
          unitName: selectedUnit.name,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          stayDays,
          monthlyMxn: selectedUnit.monthlyRateMXN.toLocaleString(),
          monthlyUsd: typeof liveUsd === 'number' ? liveUsd.toLocaleString() : liveUsd,
          notes: form.notes,
        }),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) onSuccess?.();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="py-10 text-center space-y-4">
        <p className="text-4xl">✅</p>
        <p className={`text-xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
          {es ? '¡Solicitud enviada!' : 'Application sent!'}
        </p>
        <p className={dark ? 'text-slate-300' : 'text-slate-600'}>
          {es
            ? 'Gracias por tu interés. Te contactaremos pronto.'
            : "Thank you for your interest. We'll be in touch soon."}
        </p>
      </div>
    );
  }

  const err = (key: string) =>
    errors[key] ? (
      <span className="mt-1 block text-xs text-red-500">{errors[key]}</span>
    ) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Unit selector */}
      <div>
        <label className={labelClass(dark)}>
          {es ? 'Unidad de Interés' : 'Unit of Interest'}
        </label>
        <select
          value={form.unitSlug}
          onChange={(e) => set('unitSlug', e.target.value)}
          className={inputClass(dark)}
        >
          {units.map((u) => {
            const usd = rate > 0 ? Math.floor(u.monthlyRateMXN / rate) : '—';
            return (
              <option key={u.slug} value={u.slug}>
                {u.name} — ${typeof usd === 'number' ? usd.toLocaleString() : usd} USD/mo
              </option>
            );
          })}
        </select>
        {/* Lease terms box */}
        <div className={`mt-3 rounded-xl border p-4 space-y-2 text-xs ${
          dark ? 'border-amber-700/50 bg-amber-900/20 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-800'
        }`}>
          <p className="font-semibold uppercase tracking-wide text-[10px] opacity-70">
            {es ? 'Términos del arrendamiento' : 'Lease terms'}
          </p>
          <div className="space-y-1.5">
            <p>
              <span className="font-semibold">{es ? 'Depósito al aprobar:' : 'Deposit upon approval:'}</span>{' '}
              {es
                ? `1 mes + ½ mes = $${depositMXN.toLocaleString()} MXN${depositUSD ? ` (~$${depositUSD.toLocaleString()} USD)` : ''}`
                : `1 month + ½ month = $${depositMXN.toLocaleString()} MXN${depositUSD ? ` (~$${depositUSD.toLocaleString()} USD)` : ''}`}
            </p>
            <p>
              <span className="font-semibold">{es ? 'Renta mensual:' : 'Monthly rent:'}</span>{' '}
              ${selectedUnit.monthlyRateMXN.toLocaleString()} MXN{liveUsd ? ` (~$${liveUsd.toLocaleString()} USD)` : ''}{' '}
              — <span className="font-semibold">{es ? 'vence el 1º de cada mes' : 'due on the 1st of every month'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass(dark)}>
            {es ? 'Nombre completo' : 'Full Name'} <span className="text-red-500">*</span>
          </label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass(dark)}
            placeholder={es ? 'Tu nombre completo' : 'Your full name'}
          />
          {err('name')}
        </div>
        <div>
          <label className={labelClass(dark)}>
            {es ? 'Correo electrónico' : 'Email'} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass(dark)}
            placeholder="you@example.com"
          />
          {err('email')}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass(dark)}>
          {es ? 'Teléfono' : 'Phone'}
          {optionalBadge(dark, es)}
        </label>
        <div className={`mt-2 flex w-full rounded-2xl border overflow-hidden transition ${
          dark
            ? 'border-slate-600 bg-slate-800 focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/20'
            : 'border-slate-300 bg-slate-50 focus-within:border-garden focus-within:ring-2 focus-within:ring-garden/20'
        }`}>
          <select
            value={form.phoneDialCode}
            onChange={(e) => set('phoneDialCode', e.target.value)}
            className={`flex-shrink-0 border-r px-3 py-3 text-xs outline-none cursor-pointer ${
              dark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
            }`}
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.dialCode}>
                {countryFlag(c.iso)} {c.dialCode}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 12))}
            inputMode="numeric"
            placeholder="555 555 5555"
            className={`min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none ${
              dark ? 'text-white placeholder-slate-400' : 'text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Length of stay */}
      <div>
        <label className={labelClass(dark)}>
          {es ? 'Duración de la estadía' : 'Length of stay'} <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <p className={`mb-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {es ? 'Fecha de entrada' : 'Move-in date'}
            </p>
            <input
              type="date"
              min={today}
              value={form.checkIn}
              onChange={(e) => {
                set('checkIn', e.target.value);
                if (form.checkOut && e.target.value > form.checkOut) set('checkOut', '');
              }}
              className={`w-full rounded-2xl border p-3 outline-none text-sm transition ${
                dark
                  ? 'border-slate-600 bg-slate-800 text-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20'
                  : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-garden focus:ring-2 focus:ring-garden/20'
              }`}
            />
            {err('checkIn')}
          </div>
          <div>
            <p className={`mb-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {es ? 'Fecha de salida' : 'Move-out date'}
            </p>
            <input
              type="date"
              min={form.checkIn || today}
              value={form.checkOut}
              onChange={(e) => set('checkOut', e.target.value)}
              className={`w-full rounded-2xl border p-3 outline-none text-sm transition ${
                dark
                  ? 'border-slate-600 bg-slate-800 text-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20'
                  : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-garden focus:ring-2 focus:ring-garden/20'
              }`}
            />
            {err('checkOut')}
          </div>
        </div>

        {/* Duration summary */}
        {stayValid && (
          <p className={`mt-2 text-xs font-semibold ${dark ? 'text-green-400' : 'text-green-700'}`}>
            {es
              ? `✓ ${Math.round(stayDays! / 30.44)} mes${Math.round(stayDays! / 30.44) !== 1 ? 'es' : ''} (${stayDays} días)`
              : `✓ ${Math.round(stayDays! / 30.44)} month${Math.round(stayDays! / 30.44) !== 1 ? 's' : ''} (${stayDays} days)`}
          </p>
        )}

        {/* Short-stay warning */}
        {stayTooShort && (
          <div className={`mt-2 rounded-xl border p-3 text-xs ${
            dark ? 'border-amber-600/50 bg-amber-900/20 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-800'
          }`}>
            <p className="font-semibold">
              {es ? 'Las estancias de menos de 1 mes no aplican para arrendamiento mensual.' : 'Stays under 1 month are not eligible for a monthly lease.'}
            </p>
            <p className="mt-1">
              {es ? 'Para estadías cortas, reserva directamente en Airbnb: ' : 'For short-term stays, book directly on Airbnb: '}
              <a
                href={selectedUnit.airbnbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:opacity-80 transition"
              >
                {es ? 'Ver en Airbnb ↗' : 'View on Airbnb ↗'}
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass(dark)}>
          {es ? 'Mensaje adicional' : 'Additional message'}
          {optionalBadge(dark, es)}
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          className={`${inputClass(dark)} resize-none`}
          placeholder={
            es
              ? 'Preguntas u otro contexto…'
              : 'Questions or any other context…'
          }
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500">
          {es ? 'Algo salió mal. Intenta de nuevo.' : 'Something went wrong. Please try again.'}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-full bg-terracotta py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending'
          ? (es ? 'Enviando…' : 'Sending…')
          : (es ? 'Enviar Solicitud' : 'Submit Application')}
      </button>

      <p className={`text-center text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        <span className="text-red-500">*</span>{' '}
        {es ? 'campos requeridos' : 'required fields'}
      </p>
    </form>
  );
}
