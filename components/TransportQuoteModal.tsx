'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import DateInput from '@/components/DateInput';

interface TransportQuoteModalProps {
  open: boolean;
  onClose: () => void;
}

export default function TransportQuoteModal({ open, onClose }: TransportQuoteModalProps) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    time: '',
    passengers: 1,
    tripType: 'round-trip',
    waitingTime: 0,
    specialRequests: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
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
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-garden to-[#3c5a35] text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Request a Custom Quote</h2>
            <p className="text-green-100 text-sm mt-1">Fill out your travel details below</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/20 transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="bg-green-50 border-b-4 border-green-600 p-6 text-center">
            <p className="text-lg font-semibold text-green-900">✓ Request Submitted!</p>
            <p className="text-green-700 text-sm mt-1">
              We'll confirm your quote within 24 hours. Check your email for updates.
            </p>
          </div>
        )}

        {/* Form */}
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
                Number of Passengers <span className="text-red-600">*</span>
              </label>
              <select
                name="passengers"
                value={formData.passengers}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'passenger' : 'passengers'}
                  </option>
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

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">📧 Next Steps:</span> Submit this form and we'll send a custom quote to your email 
              within 24 hours. You'll also receive payment instructions and booking details.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
