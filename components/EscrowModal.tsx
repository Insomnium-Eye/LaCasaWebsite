'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../lib/currency';
import useUsdToMxn from '../hooks/useUsdToMxn';

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  unitSlug: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalUsd: number;
  depositUsd: number;
}

interface EscrowModalProps {
  total: number;
  nights: number;
  bookingData: BookingData;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const EscrowModal: React.FC<EscrowModalProps> = ({
  total,
  nights,
  bookingData,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const { formatCurrency } = useUsdToMxn();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  function handleCardNumber(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
  }

  function handleExpiry(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else if (raw.endsWith('/') && digits.length === 2) {
      setExpiry(`${digits}/`);
    } else {
      setExpiry(digits);
    }
  }

  function handleCvv(raw: string) {
    setCvv(raw.replace(/\D/g, '').slice(0, 4));
  }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const deposit = nights < 7 ? total : nights < 28 ? total * 0.5 : Math.max(total / nights, 75) * 7;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          unitSlug: bookingData.unitSlug,
          unitName: bookingData.unitName,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          nights: bookingData.nights,
          guests: bookingData.guests,
          totalUsd: bookingData.totalUsd,
          depositUsd: bookingData.depositUsd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        setError(errMsg || 'Booking failed. Please try again.');
        setSubmitting(false);
        return;
      }

      const params = new URLSearchParams({
        id: data.bookingId,
        code: data.lockCode,
        name: bookingData.name,
        unit: bookingData.unitName,
        checkin: bookingData.checkIn,
        checkout: bookingData.checkOut,
        nights: String(bookingData.nights),
        guests: String(bookingData.guests),
        total: String(bookingData.totalUsd.toFixed(2)),
      });

      router.push(`/book/confirmation?${params.toString()}`);
    } catch (err) {
      setError('Network error. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl text-gray-900">

        {/* Test mode banner */}
        <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800 font-medium">
          🧪 Test mode — no real payment will be processed
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Confirm Booking</h2>
        <p className="text-gray-500 text-sm mb-6">
          Payment is held in escrow until your stay is confirmed.
        </p>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1.5">
          <p className="font-semibold text-gray-900">{bookingData.unitName}</p>
          <p className="text-sm text-gray-600">{bookingData.checkIn} → {bookingData.checkOut} · {nights} night{nights !== 1 ? 's' : ''}</p>
          <div className="flex justify-between pt-1 border-t border-gray-200 mt-2">
            <span className="text-sm text-gray-600">Deposit due now</span>
            <span className="font-semibold text-gray-900">{formatPrice(deposit, language)}</span>
          </div>
          <p className="text-xs text-gray-400">{formatCurrency(deposit)}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment method */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'spei')}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white"
            >
              <option value="card">Credit / Debit Card</option>
              <option value="spei">SPEI Transfer (Mexico)</option>
            </select>
          </div>

          {paymentMethod === 'card' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Card Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => handleCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white tracking-widest"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">Expiry</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiry}
                    onChange={(e) => handleExpiry(e.target.value)}
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => handleCvv(e.target.value)}
                    maxLength={4}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white"
                    placeholder="123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value.slice(0, 50))}
                  maxLength={50}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 bg-white"
                  placeholder="Full name on card"
                />
              </div>
            </>
          )}

          {paymentMethod === 'spei' && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
              SPEI transfer details will be sent to your email after confirmation.
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-terracotta hover:bg-[#b55e47] text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </span>
              ) : (
                `Pay ${formatPrice(deposit, language)}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EscrowModal;
