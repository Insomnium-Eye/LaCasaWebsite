"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { units } from "../../data/units";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatPrice } from "../../lib/currency";
import useUsdToMxn from "../../hooks/useUsdToMxn";
import { calculateDeposit } from "../../lib/depositCalculator";
import { DEFAULT_DEPOSIT_POLICY, getSeasonType } from "../../lib/depositPolicy";
import type { BookingDetails, DepositTiming } from "../../lib/deposit";
import BackgroundSlideshow from "../../components/BackgroundSlideshow";
import IdVerification from "../../components/IdVerification";
import EscrowModal from "../../components/EscrowModal";
import DateInput from "../../components/DateInput";
import PhoneInput from "../../components/PhoneInput";

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

function isRangeBlocked(
  checkIn: string,
  checkOut: string,
  blocked: { start: string; end: string }[],
): boolean {
  if (!checkIn) return false;
  const end = checkOut || checkIn;
  return blocked.some((r) => checkIn < r.end && end > r.start);
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
  const { formatCurrency, rate } = useUsdToMxn();
  const [form, setForm] = useState(initialState);
  const [showIdVerification, setShowIdVerification] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [showEscrow, setShowEscrow] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<{ start: string; end: string }[]>([]);
  const nights = useMemo(() => daysBetween(form.checkIn, form.checkOut), [form.checkIn, form.checkOut]);
  const selectedUnit = units.find((unit) => unit.slug === form.unit) ?? units[0];

  const today = new Date().toISOString().split('T')[0];
  const minNights = selectedUnit.slug === 'entire-house' ? 7 : 1;
  const checkOutMinDate = form.checkIn
    ? addDays(form.checkIn, selectedUnit.slug === 'entire-house' ? minNights : 1)
    : today;

  // Fetch blocked dates whenever the selected unit changes
  useEffect(() => {
    fetch(`/api/availability/${selectedUnit.slug}`)
      .then((r) => r.json())
      .then((data) => setBlockedRanges(data.blocked ?? []))
      .catch(() => setBlockedRanges([]));
  }, [selectedUnit.slug]);

  // Reset dates if they now conflict after a unit change
  useEffect(() => {
    if (form.checkIn && isRangeBlocked(form.checkIn, form.checkOut || form.checkIn, blockedRanges)) {
      setForm((prev) => ({ ...prev, checkIn: '', checkOut: '' }));
    }
  }, [blockedRanges]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedUnit.slug !== 'entire-house' || !form.checkIn || !form.checkOut) return;
    const currentNights = daysBetween(form.checkIn, form.checkOut);
    if (currentNights > 0 && currentNights < minNights) {
      setForm((prev) => ({ ...prev, checkOut: addDays(prev.checkIn, minNights) }));
    }
  }, [form.checkIn, form.checkOut, selectedUnit.slug, minNights]);

  const calculatePricing = useMemo(() => {
    const effectiveNightlyRate = selectedUnit.nightlyRate > 0
      ? selectedUnit.nightlyRate
      : selectedUnit.weeklyRate / 7;
    if (!nights || effectiveNightlyRate === 0) return { base: 0, discount: 0, subtotal: 0, iva: 0, ish: 0, total: 0 };

    const base = nights * effectiveNightlyRate;
    let discount = 0;
    if (nights >= 28) {
      discount = base * 0.25;
    } else if (nights >= 7) {
      discount = base * 0.10;
    }
    const subtotal = base - discount;
    const iva = subtotal * 0.16; // 16% IVA
    const ish = subtotal * 0.03; // 3% ISH
    const total = subtotal + iva + ish;
    
    return { base, discount, subtotal, iva, ish, total };
  }, [nights, selectedUnit.nightlyRate]);

  const depositResult = useMemo(() => {
    if (!nights || calculatePricing.total === 0) return null;
    const effectiveNightlyRate = selectedUnit.nightlyRate > 0
      ? selectedUnit.nightlyRate
      : selectedUnit.weeklyRate / 7;
    const booking: BookingDetails = {
      nights,
      baseNightlyRate: effectiveNightlyRate,
      totalStayAmount: calculatePricing.total,
      propertySlug: selectedUnit.slug,
      seasonType: getSeasonType(form.checkIn),
    };
    return calculateDeposit(booking, DEFAULT_DEPOSIT_POLICY);
  }, [nights, calculatePricing.total, selectedUnit, form.checkIn]);

  const timingLabel = (timing: DepositTiming) => {
    if (timing === 'upfront') return t('book.deposit.timing.upfront');
    if (timing === 'at_checkin') return t('book.deposit.timing.at_checkin');
    return t('book.deposit.timing.pre_authorization');
  };

  const handleRequestDetails = () => {
    if (!form.name || (!form.email && !form.phone) || !form.checkIn || !form.checkOut || nights <= 0) {
      alert(t('book.validationError'));
      return;
    }
    if (selectedUnit.slug === 'entire-house' && nights < minNights) {
      alert(t('book.entireHouseMinNightsError'));
      return;
    }
    if (isRangeBlocked(form.checkIn, form.checkOut, blockedRanges)) {
      alert(language === 'es'
        ? 'Esas fechas no están disponibles para esa unidad. Por favor elige otras fechas.'
        : 'Those dates are not available for that unit. Please choose different dates.');
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
  };

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition">
        {t('nav.backToHome')}
      </Link>
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
              <span className="text-sm font-semibold text-slate-900">{t('book.name')} <span className="text-red-500">*</span></span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('book.name')}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.email')} <span className="text-red-500">*</span></span>
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
              <span className="text-sm font-semibold text-slate-900">{t('book.phone')} <span className="text-red-500">*</span></span>
              <PhoneInput
                value={form.phone}
                onChange={(phone) => setForm({ ...form, phone })}
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
          <p className="text-xs text-slate-500"><span className="text-red-500">*</span> {t('book.contactNote')}</p>
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
              <DateInput
                value={form.checkIn}
                onChange={(iso) => setForm({ ...form, checkIn: iso })}
                language={language}
                min={today}
                required
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('book.checkOut')}</span>
              <DateInput
                value={form.checkOut}
                onChange={(iso) => setForm({ ...form, checkOut: iso })}
                language={language}
                min={checkOutMinDate}
                required
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
            </label>
          </div>
          {form.checkIn && form.checkOut && isRangeBlocked(form.checkIn, form.checkOut, blockedRanges) && (
            <div className="rounded-xl border border-red-500/40 bg-red-900/60 px-4 py-3 text-sm font-semibold text-red-200">
              <span className="mr-2">🚫</span>
              {language === 'es'
                ? 'Esas fechas no están disponibles para esta unidad. Por favor elige otras fechas.'
                : 'Those dates are already booked for this unit. Please choose different dates.'}
            </div>
          )}
          <button
            type="button"
            onClick={handleRequestDetails}
            disabled={!!(form.checkIn && form.checkOut && isRangeBlocked(form.checkIn, form.checkOut, blockedRanges))}
            className="inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35] disabled:bg-slate-500 disabled:cursor-not-allowed"
          >
            {t('book.requestDetails')}
          </button>
        </form>

        <aside className="space-y-6 rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">{t('book.rateSummary')}</p>
            <p className="mt-4 text-slate-200">{`${t(`units.items.${selectedUnit.slug}.name`)} · ${selectedUnit.capacity} ${t('book.guests')}`}</p>
            <div className="mt-6 space-y-3 text-slate-200">
              {(selectedUnit.nightlyRate > 0 || selectedUnit.weeklyRate > 0) && (
                <>
                  <p>{`${t('book.nightlyRate')}: ${formatPrice(selectedUnit.nightlyRate > 0 ? selectedUnit.nightlyRate : selectedUnit.weeklyRate / 7, language, rate)}`}</p>
                  <p>{`${t('book.nights')}: ${nights || 0}`}</p>
                  <p>{`${t('book.baseAmount')}: ${formatPrice(calculatePricing.base, language, rate)}`}</p>
                  {calculatePricing.discount > 0 && (
                    <p>{`${t('book.discount')}: -${formatPrice(calculatePricing.discount, language, rate)}`}</p>
                  )}
                  <p>{`${t('book.subtotal')}: ${formatPrice(calculatePricing.subtotal, language, rate)}`}</p>
                  <p>{`IVA (16%): ${formatPrice(calculatePricing.iva, language, rate)}`}</p>
                  <p>{`ISH (3%): ${formatPrice(calculatePricing.ish, language, rate)}`}</p>
                </>
              )}
            </div>
            <div className="mt-6 rounded-3xl bg-garden px-5 py-4 text-white">
              <p className="text-sm uppercase tracking-[0.24em]">{t('book.estimatedTotal')}</p>
              <p className="mt-2 text-3xl font-semibold">{formatPrice(calculatePricing.total, language, rate)}</p>
              <p className="mt-1 text-sm">{formatCurrency(calculatePricing.total)}</p>
            </div>
          </div>
          {depositResult && (
            <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.deposit.title')}</p>
                {depositResult.seasonType === 'peak' && (
                  <span className="rounded-full bg-terracotta/20 px-2 py-0.5 text-xs font-semibold text-terracotta">
                    {t('book.deposit.season.peak')}
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-3 text-slate-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-100">{t('book.deposit.security')}</p>
                    <p className="text-xs text-slate-400">{t('book.deposit.securityNote')} · {timingLabel(depositResult.securityDepositTiming)}</p>
                  </div>
                  <p className="shrink-0 font-semibold text-slate-100">{formatPrice(depositResult.securityDeposit, language, rate)}</p>
                </div>
                {depositResult.advanceDeposit > 0 && (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-100">{t('book.deposit.advance')}</p>
                      <p className="text-xs text-slate-400">{t('book.deposit.advanceNote')} · {timingLabel(depositResult.advanceDepositTiming)}</p>
                    </div>
                    <p className="shrink-0 font-semibold text-slate-100">{formatPrice(depositResult.advanceDeposit, language, rate)}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2 border-t border-slate-700 pt-4 text-sm">
                {depositResult.advanceDeposit > 0 && !depositResult.isMonthlyPlan && (
                  <div className="flex justify-between text-slate-300">
                    <span>{t('book.deposit.remainingBalance')}</span>
                    <span>{formatPrice(depositResult.remainingBalance, language, rate)}</span>
                  </div>
                )}
                {depositResult.isMonthlyPlan && depositResult.installments != null && depositResult.monthlyPayment != null && (
                  <div className="rounded-lg bg-amber-900/30 px-3 py-2 text-amber-200 text-xs">
                    {language === 'es'
                      ? `Pago mensual de ${formatPrice(depositResult.monthlyPayment, language, rate)} cada 28 días · ${depositResult.installments} pago${depositResult.installments !== 1 ? 's' : ''} restante${depositResult.installments !== 1 ? 's' : ''} tras el primero`
                      : `${formatPrice(depositResult.monthlyPayment, language, rate)} every 28 days · ${depositResult.installments} further payment${depositResult.installments !== 1 ? 's' : ''} after the first`}
                  </div>
                )}
                <div className="flex justify-between font-semibold text-slate-100">
                  <span>{t('book.deposit.totalDueNow')}</span>
                  <span>{formatPrice(depositResult.totalDueUpfront, language, rate)}</span>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.discountsTitle')}</p>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>🏷️ {t('book.discount7nights')}</li>
              <li>🏷️ {t('book.discount28nights')}</li>
            </ul>
          </div>
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.rulesTitle')}</p>
            <ul className="mt-4 space-y-3 text-slate-200 text-sm">
              <li className="flex gap-2"><span>🚭</span><span>{t('book.rule.noSmoking')}</span></li>
              <li className="flex gap-2"><span>🎉</span><span>{t('book.rule.noParties')}</span></li>
              <li className="flex gap-2">
                <span>👥</span>
                <span>
                  {t('book.rule.extraGuest')}{' '}
                  <span className="font-semibold text-amber-300">
                    {t('book.rule.extraGuestFee')} $1,000 MXN{' '}
                    (~${rate > 0 ? (1000 / rate).toFixed(0) : '49'} USD)
                  </span>
                </span>
              </li>
              <li className="flex gap-2"><span>🌿</span><span>{t('book.rule.beRespectful')}</span></li>
              <li className="flex gap-2"><span>📷</span><span>{t('book.rule.camera')}</span></li>
            </ul>
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
          guestName={form.name}
          onVerificationComplete={handleIdVerificationComplete}
          onStatusChange={(status) => console.log('ID verification status:', status)}
        />
      )}
      {showEscrow && (
        <EscrowModal
          total={calculatePricing.total}
          nights={nights}
          bookingData={{
            name: form.name,
            email: form.email,
            phone: form.phone,
            unitSlug: selectedUnit.slug,
            unitName: t(`units.items.${selectedUnit.slug}.name`),
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            nights,
            guests: form.guests,
            totalUsd: calculatePricing.total,
            depositUsd: depositResult?.totalDueUpfront ?? calculatePricing.total * 0.3,
          }}
          onClose={() => setShowEscrow(false)}
          onPaymentComplete={handleEscrowComplete}
        />
      )}
    </div>
  );
}
