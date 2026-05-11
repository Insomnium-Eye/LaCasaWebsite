'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatDate } from '../lib/date';
import DateInput from './DateInput';
import { Unit } from '../data/units';

interface BookingModalProps {
  unit: Unit;
  onClose: () => void;
  onBackToUnit: () => void;
}

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

export default function BookingModal({ unit, onClose, onBackToUnit }: BookingModalProps) {
  const { t, language } = useLanguage();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingPeriod, setBookingPeriod] = useState<'nightly' | 'weekly' | 'monthly'>('nightly');
  const [showEscrow, setShowEscrow] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;

    const startDate = parseDate(checkIn);
    const endDate = parseDate(checkOut);
    if (!startDate || !endDate || endDate <= startDate) return 0;

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (bookingPeriod) {
      case 'nightly':
        return diffDays * unit.nightlyRate;
      case 'weekly':
        return Math.ceil(diffDays / 7) * unit.weeklyRate;
      case 'monthly':
        return Math.ceil(diffDays / 30) * unit.monthlyRate;
      default:
        return 0;
    }
  };

  const total = calculateTotal();

  const handleProceedToPayment = () => {
    if (total > 0) {
      setShowEscrow(true);
    }
  };

  const getPeriodDisplay = () => {
    const count = checkIn && checkOut ? daysBetween(checkIn, checkOut) : 0;
    switch (bookingPeriod) {
      case 'nightly':
        return `${count} ${count === 1 ? t('book.priceUnit.night') : t('book.nights')}`;
      case 'weekly':
        return `${Math.ceil(count / 7)} ${count === 1 ? t('book.priceUnit.week') : t('book.weeks')}`;
      case 'monthly':
        return `${Math.ceil(count / 30)} ${count === 1 ? t('book.priceUnit.month') : t('book.months')}`;
      default:
        return '';
    }
  };

  if (showEscrow) {
    return (
      <EscrowModal
        unit={unit}
        checkIn={checkIn}
        checkOut={checkOut}
        bookingPeriod={bookingPeriod}
        periodDisplay={getPeriodDisplay()}
        total={total}
        onClose={onClose}
        onBack={() => setShowEscrow(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t('bookingModal.bookUnit').replace('{unit}', unit.name)}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t('bookingModal.selectDates')}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('bookingModal.bookingPeriod')}</span>
              <select
                value={bookingPeriod}
                onChange={(e) => setBookingPeriod(e.target.value as 'nightly' | 'weekly' | 'monthly')}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              >
                <option value="nightly">{`${t('book.periods.nightly')} (${unit.nightlyRate}/${t('book.priceUnit.night')})`}</option>
                <option value="weekly">{`${t('book.periods.weekly')} (${unit.weeklyRate}/${t('book.priceUnit.week')})`}</option>
                <option value="monthly">{`${t('book.periods.monthly')} (${unit.monthlyRate}/${t('book.priceUnit.month')})`}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('bookingModal.checkInDate')}</span>
              <DateInput
                value={checkIn}
                onChange={setCheckIn}
                language={language}
                min={new Date().toISOString().split('T')[0]}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('bookingModal.checkOutDate')}</span>
              <DateInput
                value={checkOut}
                onChange={setCheckOut}
                language={language}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </label>
          </div>

          {total > 0 && (
            <div className="rounded-xl bg-slate-50 p-4 space-y-2">
              <p className="font-semibold text-slate-900">{unit.name} · {getPeriodDisplay()}</p>
              <p className="text-sm text-slate-600">{formatDate(checkIn, language)} {t('bookingModal.to')} {formatDate(checkOut, language)}</p>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>{t('bookingModal.total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onBackToUnit}
              className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t('bookingModal.back')}
            </button>
            <button
              onClick={handleProceedToPayment}
              disabled={total === 0}
              className="flex-1 rounded-full bg-terracotta px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('bookingModal.proceedToPayment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EscrowModalProps {
  unit: Unit;
  checkIn: string;
  checkOut: string;
  bookingPeriod: 'nightly' | 'weekly' | 'monthly';
  periodDisplay: string;
  total: number;
  onClose: () => void;
  onBack: () => void;
}

function EscrowModal({ unit, checkIn, checkOut, bookingPeriod, periodDisplay, total, onClose, onBack }: EscrowModalProps) {
  const { t } = useLanguage();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with a payment processor
    alert(
      t('bookingModal.securePaymentAlert')
        .replace('{unit}', unit.name)
        .replace('{checkIn}', checkIn)
        .replace('{checkOut}', checkOut)
        .replace('{total}', total.toFixed(2))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t('bookingModal.securePayment')}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t('bookingModal.paymentHeading')}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 space-y-2">
            <p className="font-semibold text-slate-900">{unit.name}</p>
            <p className="text-sm text-slate-600">{checkIn} to {checkOut} ({periodDisplay})</p>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>{t('bookingModal.total')}</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('bookingModal.cardNumber')}</span>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="1234 5678 9012 3456"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">{t('bookingModal.expiry')}</span>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="MMYY"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900">{t('bookingModal.cvv')}</span>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('bookingModal.cardholderName')}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('bookingModal.cardholderName')}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-900 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                required
              />
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t('bookingModal.back')}
              </button>
              <button
                type="submit"
                className="flex-1 rounded-full bg-terracotta px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
              >
                {t('bookingModal.completeBooking')}
              </button>
            </div>
          </form>

          <p className="text-xs text-slate-500 text-center">
            {t('bookingModal.paymentNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}