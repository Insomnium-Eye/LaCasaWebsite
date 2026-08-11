'use client';

import { useState } from 'react';
import { Unit, units } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import useUsdToMxn from '../hooks/useUsdToMxn';
import { COUNTRIES, countryFlag } from '../data/countryCodes';

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

export default function LeaseApplicationForm({ defaultUnit, onSuccess, dark }: Props) {
  const { language } = useLanguage();
  const { rate } = useUsdToMxn();
  const es = language === 'es';

  const [form, setForm] = useState({
    name: '',
    email: '',
    nationality: '',
    phone: '',
    phoneDialCode: '+52',
    unitSlug: defaultUnit?.slug ?? units[0].slug,
    refName: '',
    refAffiliation: '',
    refContact: '',
    notes: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedUnit = units.find((u) => u.slug === form.unitSlug) ?? units[0];
  const liveUsd = rate > 0 ? Math.floor(selectedUnit.monthlyRateMXN / rate) : '—';

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = es ? 'Requerido' : 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      e.email = es ? 'Correo inválido' : 'Invalid email';
    if (!form.refName.trim()) e.refName = es ? 'Requerido' : 'Required';
    if (!form.refAffiliation.trim()) e.refAffiliation = es ? 'Requerido' : 'Required';
    if (!form.refContact.trim()) e.refContact = es ? 'Requerido' : 'Required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus('sending');

    try {
      const res = await fetch('/api/lease-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          nationality: form.nationality,
          phone: form.phone ? `${form.phoneDialCode} ${form.phone}` : '',
          unitName: selectedUnit.name,
          monthlyMxn: selectedUnit.monthlyRateMXN.toLocaleString(),
          monthlyUsd: typeof liveUsd === 'number' ? liveUsd.toLocaleString() : liveUsd,
          refName: form.refName,
          refAffiliation: form.refAffiliation,
          refContact: form.refContact,
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
                {u.name} — ${typeof usd === 'number' ? usd.toLocaleString() : usd} USD — Avail. {u.availableFrom}
              </option>
            );
          })}
        </select>
        <p className={`mt-1.5 text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {es
            ? `Renta mensual: $${typeof liveUsd === 'number' ? liveUsd.toLocaleString() : liveUsd} USD — depósito: 2 meses por adelantado`
            : `Monthly rent: $${typeof liveUsd === 'number' ? liveUsd.toLocaleString() : liveUsd} USD — deposit: 2 months upfront`}
        </p>
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

      {/* Nationality + Phone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass(dark)}>
            {es ? 'Nacionalidad' : 'Nationality'}
            {optionalBadge(dark, es)}
          </label>
          <input
            value={form.nationality}
            onChange={(e) => set('nationality', e.target.value)}
            className={inputClass(dark)}
            placeholder={es ? 'Ej. Mexicana, Estadounidense…' : 'e.g. American, Mexican…'}
          />
        </div>
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
      </div>

      {/* Reference section */}
      <div className={`rounded-2xl border p-5 space-y-4 ${
        dark ? 'border-slate-600 bg-slate-800/60' : 'border-slate-200 bg-slate-50'
      }`}>
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.14em] ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            {es ? 'Referencia Personal' : 'Personal Reference'}
          </p>
          <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            {es
              ? 'Alguien que nos pueda dar referencias sobre ti (no familiar directo)'
              : 'Someone who can vouch for you (not an immediate family member)'}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass(dark)}>
              {es ? 'Nombre' : 'Name'} <span className="text-red-500">*</span>
            </label>
            <input
              value={form.refName}
              onChange={(e) => set('refName', e.target.value)}
              className={inputClass(dark)}
              placeholder={es ? 'Nombre de tu referencia' : "Reference's name"}
            />
            {err('refName')}
          </div>
          <div>
            <label className={labelClass(dark)}>
              {es ? 'Relación / Organización' : 'Affiliation / Relationship'} <span className="text-red-500">*</span>
            </label>
            <input
              value={form.refAffiliation}
              onChange={(e) => set('refAffiliation', e.target.value)}
              className={inputClass(dark)}
              placeholder={es ? 'Ej. Empleador, colega, vecino…' : 'e.g. Employer, colleague, neighbor…'}
            />
            {err('refAffiliation')}
          </div>
        </div>
        <div>
          <label className={labelClass(dark)}>
            {es ? 'Correo o teléfono de contacto' : 'Contact email or phone'} <span className="text-red-500">*</span>
          </label>
          <input
            value={form.refContact}
            onChange={(e) => set('refContact', e.target.value)}
            className={inputClass(dark)}
            placeholder={es ? 'correo@ejemplo.com o +52 555…' : 'email@example.com or +1 555…'}
          />
          {err('refContact')}
        </div>
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
              ? 'Fecha de mudanza preferida, preguntas u otro contexto…'
              : 'Preferred move-in date, questions, or any other context…'
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
