"use client";

import { useMemo, useState } from "react";
import { units } from "../../data/units";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatPrice } from "../../lib/currency";
import BackgroundSlideshow from "../../components/BackgroundSlideshow";

const initialState = {
  name: "",
  email: "",
  guests: 2,
  unit: "bungalow-1",
  checkIn: "",
  checkOut: "",
  bookingPeriod: "nightly" as "nightly" | "weekly" | "monthly"
};

function parseDate(value: string) {
  return value ? new Date(value) : null;
}

function daysBetween(start: string, end: string) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate || endDate <= startDate) return 0;
  const diff = endDate.getTime() - startDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function BookPage() {
  const { t, language } = useLanguage();
  const [form, setForm] = useState(initialState);
  const nights = useMemo(() => daysBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const selectedUnit = units.find((unit) => unit.slug === form.unit) ?? units[0];
  
  const calculateTotal = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    
    const startDate = parseDate(form.checkIn);
    const endDate = parseDate(form.checkOut);
    if (!startDate || !endDate || endDate <= startDate) return 0;
    
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (form.bookingPeriod) {
      case 'nightly':
        return diffDays * selectedUnit.nightlyRate;
      case 'weekly':
        return Math.ceil(diffDays / 7) * selectedUnit.weeklyRate;
      case 'monthly':
        return Math.ceil(diffDays / 30) * selectedUnit.monthlyRate;
      default:
        return 0;
    }
  }, [form.checkIn, form.checkOut, form.bookingPeriod, selectedUnit]);
  
  const baseAmount = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    
    const startDate = parseDate(form.checkIn);
    const endDate = parseDate(form.checkOut);
    if (!startDate || !endDate || endDate <= startDate) return 0;
    
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (form.bookingPeriod) {
      case 'nightly':
        return diffDays * selectedUnit.nightlyRate;
      case 'weekly':
        return Math.ceil(diffDays / 7) * selectedUnit.weeklyRate;
      case 'monthly':
        return Math.ceil(diffDays / 30) * selectedUnit.monthlyRate;
      default:
        return 0;
    }
  }, [form.checkIn, form.checkOut, form.bookingPeriod, selectedUnit]);

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.heading')}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('book.title')}</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-200">{t('book.description')}</p>
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
        <form className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.name')}</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('book.name')}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.email')}</span>
              <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('book.email')}
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.unit')}</span>
              <select
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              >
                {units.map((unit) => (
                  <option key={unit.slug} value={unit.slug}>
                    {t(`units.items.${unit.slug}.name`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.bookingPeriod')}</span>
              <select
                value={form.bookingPeriod}
                onChange={(event) => setForm({ ...form, bookingPeriod: event.target.value as "nightly" | "weekly" | "monthly" })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              >
                <option value="nightly">{`${t('book.periods.nightly')} (${formatPrice(selectedUnit.nightlyRate, language)}/${t('book.priceUnit.night')})`}</option>
                <option value="weekly">{`${t('book.periods.weekly')} (${formatPrice(selectedUnit.weeklyRate, language)}/${t('book.priceUnit.week')})`}</option>
                <option value="monthly">{`${t('book.periods.monthly')} (${formatPrice(selectedUnit.monthlyRate, language)}/${t('book.priceUnit.month')})`}</option>
              </select>
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.guests')}</span>
              <input
                type="number"
                min={1}
                max={selectedUnit.capacity}
                value={form.guests}
                onChange={(event) => setForm({ ...form, guests: Number(event.target.value) })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.checkIn')}</span>
              <input
                type="date"
                value={form.checkIn}
                onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.checkOut')}</span>
              <input
                type="date"
                value={form.checkOut}
                onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
          </div>
          <button type="button" className="inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
            {t('book.requestDetails')}
          </button>
        </form>

        <aside className="space-y-6 rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">{t('book.rateSummary')}</p>
            <p className="mt-4 text-slate-200">{`${t(`units.items.${selectedUnit.slug}.name`)} · ${selectedUnit.capacity} ${t('book.guests')}`}</p>
            <div className="mt-6 space-y-3 text-slate-200">
              {form.bookingPeriod === 'nightly' && (
                <>
                  <p>{`${t('book.nightlyRate')}: ${formatPrice(selectedUnit.nightlyRate, language)}`}</p>
                  <p>{`${t('book.nights')}: ${nights || 0}`}</p>
                </>
              )}
              {form.bookingPeriod === 'weekly' && (
                <>
                  <p>{`${t('book.weeklyRate')}: ${formatPrice(selectedUnit.weeklyRate, language)}`}</p>
                  <p>{`${t('book.weeks')}: ${nights ? Math.ceil(nights / 7) : 0}`}</p>
                </>
              )}
              {form.bookingPeriod === 'monthly' && (
                <>
                  <p>{`${t('book.monthlyRate')}: ${formatPrice(selectedUnit.monthlyRate, language)}`}</p>
                  <p>{`${t('book.months')}: ${nights ? Math.ceil(nights / 30) : 0}`}</p>
                </>
              )}
              <p>{`${t('book.subtotal')}: ${formatPrice(baseAmount, language)}`}</p>
            </div>
            <div className="mt-6 rounded-3xl bg-garden px-5 py-4 text-white">
              <p className="text-sm uppercase tracking-[0.24em]">{t('book.estimatedTotal')}</p>
              <p className="mt-2 text-3xl font-semibold">{formatPrice(calculateTotal, language)}</p>
            </div>
          </div>
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.bookingNotes')}</p>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>{t('book.note1')}</li>
              <li>{t('book.note2')}</li>
              <li>{t('book.note3')}</li>
            </ul>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}
