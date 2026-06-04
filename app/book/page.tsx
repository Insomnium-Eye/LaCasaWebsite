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
import DateRangePicker from "../../components/DateRangePicker";
import { COUNTRIES, countryFlag } from "../../data/countryCodes";

const initialState = {
  name: "",
  email: "",
  phone: "",
  phoneDialCode: "+52",
  whatsappConsent: false,
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

function formatPhoneDisplay(digits: string): string {
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
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

  // Pre-select unit from ?unit= URL param (e.g. coming from home page card)
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('unit');
    if (slug && units.find(u => u.slug === slug)) {
      setForm(prev => ({ ...prev, unit: slug }));
    }
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const minNights = selectedUnit.slug === 'entire-house' ? 7 : 1;
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

  // $1,000 MXN per extra guest per night, converted to USD (rounded down)
  const guestFeeUsdPerNight = rate > 0 ? Math.floor(1000 / rate) : 0;

  const calculatePricing = useMemo(() => {
    const effectiveNightlyRate = selectedUnit.nightlyRate > 0
      ? selectedUnit.nightlyRate
      : selectedUnit.weeklyRate / 7;
    if (!nights || effectiveNightlyRate === 0) return { base: 0, discount: 0, guestFee: 0, extraGuests: 0, subtotal: 0, iva: 0, ish: 0, total: 0 };

    const base = nights * effectiveNightlyRate;
    let discount = 0;
    if (nights >= 28) {
      discount = base * 0.25;
    } else if (nights >= 7) {
      discount = base * 0.10;
    }

    const extraGuests = Math.max(0, form.guests - 1);
    const guestFee = guestFeeUsdPerNight * extraGuests * nights;

    const subtotal = base - discount + guestFee;
    const iva = subtotal * 0.16;
    const ish = subtotal * 0.03;
    const total = subtotal + iva + ish;

    return { base, discount, guestFee, extraGuests, subtotal, iva, ish, total };
  }, [nights, selectedUnit.nightlyRate, selectedUnit.weeklyRate, form.guests, guestFeeUsdPerNight]);

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

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const handleRequestDetails = () => {
    if (!form.name || !form.email || !form.checkIn || !form.checkOut || nights <= 0) {
      alert(t('book.validationError'));
      return;
    }
    if (!isValidEmail(form.email)) {
      alert(language === 'es'
        ? 'Por favor ingresa una dirección de correo electrónico válida.'
        : 'Please enter a valid email address.');
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
              <span className="text-sm font-semibold text-slate-900">{t('book.phone')} <span className="text-slate-400 font-normal text-xs">(optional)</span></span>
              <div className="mt-2 flex w-full rounded-3xl border border-slate-300 bg-slate-50 focus-within:border-garden focus-within:ring-2 focus-within:ring-garden/20 overflow-hidden">
                <select
                  value={form.phoneDialCode}
                  onChange={(e) => setForm({ ...form, phoneDialCode: e.target.value })}
                  className="flex-shrink-0 bg-slate-100 border-r border-slate-300 px-3 py-4 text-sm text-slate-900 outline-none cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.dialCode}>
                      {countryFlag(c.iso)} {c.dialCode}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formatPhoneDisplay(form.phone)}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  inputMode="numeric"
                  placeholder="(555) 555-5555"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-slate-900 outline-none"
                />
              </div>
              {form.phone && (
                <label className="mt-2 flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.whatsappConsent ?? false}
                    onChange={(e) => setForm({ ...form, whatsappConsent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-garden shrink-0"
                  />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    {language === 'es'
                      ? 'Acepto recibir actualizaciones de mi reserva por WhatsApp de La Casa Oaxaca. No es obligatorio.'
                      : 'I agree to receive WhatsApp booking updates from La Casa Oaxaca. Not required to book.'}
                  </span>
                </label>
              )}
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
                onChange={(event) => setForm({ ...form, guests: Math.min(Number(event.target.value), selectedUnit.capacity) })}
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                {language === 'es'
                  ? `1 huésped incluido. Cada huésped adicional: 1,000 MXN por noche. Máximo ${selectedUnit.capacity}.`
                  : `1 guest included. Each additional guest: 1,000 MXN (~$${guestFeeUsdPerNight} USD) per night. Max ${selectedUnit.capacity}.`}
              </p>
            </label>
          </div>
          <DateRangePicker
            checkIn={form.checkIn}
            checkOut={form.checkOut}
            onCheckInChange={(iso) => setForm(prev => ({ ...prev, checkIn: iso, checkOut: '' }))}
            onCheckOutChange={(iso) => setForm(prev => ({ ...prev, checkOut: iso }))}
            blockedRanges={blockedRanges}
            minDate={today}
            minNights={minNights}
            language={language}
          />
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
                  {calculatePricing.guestFee > 0 && (
                    <p className="text-amber-300">{`${language === 'es' ? `Huéspedes adicionales (${calculatePricing.extraGuests} × ${nights} noches)` : `Extra guests (${calculatePricing.extraGuests} × ${nights} nights)`}: +${formatPrice(calculatePricing.guestFee, language, rate)}`}</p>
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
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.paymentPolicy.title')}</p>
            <ul className="mt-4 space-y-3 text-slate-200 text-sm">
              <li className="flex gap-2"><span>🔒</span><span>{t('book.paymentPolicy.deposit')}</span></li>
              <li className="flex gap-2"><span>📅</span><span>{t('book.paymentPolicy.short')}</span></li>
              <li className="flex gap-2"><span>📅</span><span>{t('book.paymentPolicy.medium')}</span></li>
              <li className="flex gap-2"><span>📅</span><span>{t('book.paymentPolicy.long')}</span></li>
              <li className="flex gap-2"><span>💳</span><span>{t('book.paymentPolicy.card')}</span></li>
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
          <div className="rounded-4xl bg-[#1a0f0a]/90 p-6 shadow-sm shadow-black/10">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('book.propertyNotes.title')}</p>
            <ul className="mt-4 space-y-3 text-slate-300 text-sm">
              <li className="flex gap-2"><span>🅿️</span><span>{t('book.propertyNotes.parking')}</span></li>
              <li className="flex gap-2"><span>🐾</span><span>{t('book.propertyNotes.pets')}</span></li>
              <li className="flex gap-2"><span>🦎</span><span>{t('book.propertyNotes.wildlife')}</span></li>
              {form.unit === 'entire-house' && (
                <li className="flex gap-2 text-amber-300"><span>🏠</span><span>{t('book.propertyNotes.entireHouse')}</span></li>
              )}
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
            phone: form.phone ? `${form.phoneDialCode} ${form.phone}` : '',
            whatsappConsent: form.whatsappConsent,
            unitSlug: selectedUnit.slug,
            unitName: t(`units.items.${selectedUnit.slug}.name`),
            checkIn: form.checkIn,
            checkOut: form.checkOut,
            nights,
            guests: form.guests,
            totalUsd: calculatePricing.total,
            subtotalUsd: calculatePricing.subtotal,
            depositUsd: depositResult?.totalDueUpfront ?? calculatePricing.total * 0.3,
          }}
          onClose={() => setShowEscrow(false)}
          onPaymentComplete={handleEscrowComplete}
        />
      )}
    </div>
  );
}
