'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DateInput from '@/components/DateInput';

interface TransportQuoteModalProps {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS = [
  {
    id: 'clabe',
    label: 'CLABE (Mexican Bank Transfer)',
    icon: '🏦',
    detail: '002610702365656432',
    subDetail: 'Rosa Elena Duran Ramirez',
    copyValue: '002610702365656432',
    instructions: 'Use this CLABE for a direct bank transfer (SPEI). Include your booking date in the concept/notes field.',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: '🅿️',
    detail: 'insomnium-eye@live.com',
    copyValue: 'insomnium-eye@live.com',
    instructions: 'Send payment to this PayPal email. Include your booking date in the payment note.',
  },
  {
    id: 'cashapp',
    label: 'Cash App',
    icon: '💵',
    detail: '$DavidGPiper',
    copyValue: '$DavidGPiper',
    instructions: 'Send to $DavidGPiper on Cash App. Include your booking date in the note.',
  },
  {
    id: 'venmo',
    label: 'Venmo',
    icon: '💙',
    detail: '@David-Piper-73',
    copyValue: '@David-Piper-73',
    instructions: 'Send to @David-Piper-73 on Venmo. Include your booking date in the note.',
  },
];

export default function TransportQuoteModal({ open, onClose }: TransportQuoteModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    tripType: 'round-trip',
    waitingTime: 0,
    specialRequests: '',
  });
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!open) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setStep('payment');
  };

  const handleCopy = (value: string, id: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      destination: '',
      date: '',
      time: '',
      passengers: 1,
      tripType: 'round-trip',
      waitingTime: 0,
      specialRequests: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-garden to-[#3c5a35] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {step === 'form' ? 'Request a Transport Quote' : 'How to Pay'}
            </h2>
            <p className="text-green-100 text-sm mt-1">
              {step === 'form'
                ? 'Fill out your travel details below'
                : 'Your request was received — pay when your quote is confirmed'}
            </p>
          </div>
          <button onClick={handleClose} className="rounded-full p-2 hover:bg-white/20 transition-colors">
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Destination(s) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g., Monte Albán + Hierve el Agua"
                  required
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">Single or multiple destinations</p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Date <span className="text-red-600">*</span>
                </label>
                <DateInput
                  value={formData.date}
                  onChange={(iso) => setFormData((prev) => ({ ...prev, date: iso }))}
                  language={language}
                  required
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Preferred Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Passengers <span className="text-red-600">*</span>
                </label>
                <select
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'passenger' : 'passengers'}</option>
                  ))}
                </select>
              </div>

              {/* Trip Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Trip Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="tripType"
                  value={formData.tripType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
                >
                  <option value="one-way">One-Way</option>
                  <option value="round-trip">Round-Trip</option>
                  <option value="full-day">Full-Day Excursion</option>
                  <option value="multi-stop">Multi-Stop Tour</option>
                </select>
              </div>

              {/* Waiting Time */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Waiting Time at Destination (hours)
                </label>
                <input
                  type="number"
                  name="waitingTime"
                  value={formData.waitingTime}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="24"
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">For round-trip or full-day tours</p>
              </div>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Special Requests or Notes
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any special requirements? E.g., child seat, wheelchair accessibility, bilingual driver, etc."
                rows={4}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors resize-none"
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">📧 Next Steps:</span> We'll confirm your quote and send payment details. Payment is due once confirmed.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border-2 border-slate-300 rounded-lg font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-garden hover:bg-[#3c5a35] text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : 'Submit Request'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Payment Info ── */}
        {step === 'payment' && (
          <div className="p-8 space-y-6">
            {/* Confirmation banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-semibold text-lg">✓ Request Received!</p>
              <p className="text-green-700 text-sm mt-1">
                We'll confirm your quote within 24 hours. Once confirmed, pay using any method below.
              </p>
            </div>

            <p className="text-slate-700 font-semibold text-center">Choose your payment method:</p>

            <div className="space-y-4">
              {PAYMENT_METHODS.map((method) => (
                <div
                  key={method.id}
                  className="border-2 border-slate-200 rounded-xl p-5 hover:border-garden/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">{method.icon}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{method.label}</p>
                        <p className="text-garden font-mono font-bold text-lg truncate">{method.detail}</p>
                        {method.subDetail && (
                          <p className="text-slate-500 text-sm">{method.subDetail}</p>
                        )}
                        <p className="text-slate-600 text-xs mt-1">{method.instructions}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(method.copyValue, method.id)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold border-2 border-garden text-garden rounded-lg hover:bg-garden hover:text-white transition-colors"
                    >
                      {copied === method.id ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Important:</span> Do not pay until you receive confirmation from us. Always include your travel date in the payment note so we can match it to your booking.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-garden hover:bg-[#3c5a35] text-white rounded-lg font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
