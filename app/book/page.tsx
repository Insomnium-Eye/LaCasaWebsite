"use client";

import { useMemo, useState, useEffect } from "react";
import { units } from "../../data/units";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatPrice } from "../../lib/currency";
import useUsdToMxn from "../../hooks/useUsdToMxn";
import BackgroundSlideshow from "../../components/BackgroundSlideshow";
import IdVerification from "../../components/IdVerification";
import EscrowModal from "../../components/EscrowModal";

const initialState = {
  name: "",
  email: "",
  phone: "",
  guests: 2,
  unit: "bungalow-1",
  checkIn: "",
  checkOut: ""
};

function parseDate(value: string) {
  return value ? new Date(value) : null;
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  if (!date) return '';
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().split('T')[0];
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
  const { convertToMxn, formatCurrency } = useUsdToMxn();
  const [form, setForm] = useState(initialState);
  const [showIdVerification, setShowIdVerification] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [showEscrow, setShowEscrow] = useState(false);
  const nights = useMemo(() => daysBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const selectedUnit = units.find((unit) => unit.slug === form.unit) ?? units[0];
  
  const today = new Date().toISOString().split('T')[0];
  const minNights = selectedUnit.slug === 'entire-house' ? 6 : 1;
  const checkOutMinDate = selectedUnit.slug === 'entire-house' && form.checkIn ? addDays(form.checkIn, minNights) : (form.checkIn || today);

  useEffect(() => {
    if (selectedUnit.slug !== 'entire-house' || !form.checkIn || !form.checkOut) return;
    const currentNights = daysBetween(form.checkIn, form.checkOut);
    if (currentNights > 0 && currentNights < minNights) {
      setForm((prev) => ({ ...prev, checkOut: addDays(prev.checkIn, minNights) }));
    }
  }, [form.checkIn, form.checkOut, selectedUnit.slug, minNights]);

  const calculatePricing = useMemo(() => {
    if (!nights || selectedUnit.nightlyRate === 0) return { base: 0, discount: 0, subtotal: 0, iva: 0, ish: 0, total: 0 };
    
    const base = nights * selectedUnit.nightlyRate;
    let discount = 0;
    if (nights >= 29) {
      discount = base * 0.25; // 25% off for 29+ nights
    } else if (nights >= 8) {
      discount = base * 0.10; // 10% off for 8+ nights
    }
    const subtotal = base - discount;
    const iva = subtotal * 0.16; // 16% IVA
    const ish = subtotal * 0.03; // 3% ISH
    const total = subtotal + iva + ish;
    
    return { base, discount, subtotal, iva, ish, total };
  }, [nights, selectedUnit.nightlyRate]);
  
  const handleRequestDetails = () => {
    if (!form.name || (!form.email && !form.phone) || !form.checkIn || !form.checkOut || nights <= 0) {
      alert(t('book.validationError'));
      return;
    }
    if (selectedUnit.slug === 'entire-house' && nights < minNights) {
      alert(t('book.entireHouseMinNightsError'));
      return;
    }
    setShowIdVerification(true);
  };
  
  const handleIdVerificationComplete = (verified: boolean) => {
    setIdVerified(verified);
    setShowIdVerification(false);
    if (verified) {
      setShowEscrow(true);
    }
  };
  
  const handleEscrowComplete = () => {
    setShowEscrow(false);
    alert('Booking submitted! You will receive a confirmation once approved by the owner.');
  };

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
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.email')}</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('book.email')}
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.phone')}</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('book.phone')}
              />
            </label>
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
                min={today}
                value={form.checkIn}
                onChange={(event) => setForm({ ...form, checkIn: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                required
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.checkOut')}</span>
              <input
                type="date"
                min={checkOutMinDate}
                value={form.checkOut}
                onChange={(event) => setForm({ ...form, checkOut: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                required
              />
            </label>
          </div>
          <button type="button" onClick={handleRequestDetails} className="inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
            {t('book.requestDetails')}
          </button>
        </form>

        <aside className="space-y-6 rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">{t('book.rateSummary')}</p>
            <p className="mt-4 text-slate-200">{`${t(`units.items.${selectedUnit.slug}.name`)} · ${selectedUnit.capacity} ${t('book.guests')}`}</p>
            <div className="mt-6 space-y-3 text-slate-200">
              {selectedUnit.nightlyRate > 0 && (
                <>
                  <p>{`${t('book.nightlyRate')}: ${formatPrice(selectedUnit.nightlyRate, language)}`}</p>
                  <p>{`${t('book.nights')}: ${nights || 0}`}</p>
                  <p>{`${t('book.baseAmount')}: ${formatPrice(calculatePricing.base, language)}`}</p>
                  {calculatePricing.discount > 0 && (
                    <p>{`${t('book.discount')}: -${formatPrice(calculatePricing.discount, language)}`}</p>
                  )}
                  <p>{`${t('book.subtotal')}: ${formatPrice(calculatePricing.subtotal, language)}`}</p>
                  <p>{`IVA (16%): ${formatPrice(calculatePricing.iva, language)}`}</p>
                  <p>{`ISH (3%): ${formatPrice(calculatePricing.ish, language)}`}</p>
                </>
              )}
            </div>
            <div className="mt-6 rounded-3xl bg-garden px-5 py-4 text-white">
              <p className="text-sm uppercase tracking-[0.24em]">{t('book.estimatedTotal')}</p>
              <p className="mt-2 text-3xl font-semibold">{formatPrice(calculatePricing.total, language)}</p>
              <p className="mt-1 text-sm">{formatCurrency(calculatePricing.total)}</p>
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
      {showIdVerification && (
        <IdVerification
          onVerificationComplete={handleIdVerificationComplete}
          onStatusChange={(status) => console.log('ID verification status:', status)}
        />
      )}
      {showEscrow && (
        <EscrowModal
          total={calculatePricing.total}
          nights={nights}
          onClose={() => setShowEscrow(false)}
          onPaymentComplete={handleEscrowComplete}
        />
      )}
    </div>
  );
}
