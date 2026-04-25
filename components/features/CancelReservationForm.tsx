'use client';

import { useState } from 'react';
import { GuestSession, CANCELLATION_REASONS, CANCELLATION_POLICY } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';

interface CancelReservationFormProps {
  session: GuestSession | null;
}

const CancelReservationForm = ({ session }: CancelReservationFormProps) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [explanation, setExplanation] = useState('');
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a cancellation reason');
      return;
    }
    setConfirmationStep(true);
    setError(null);
  };

  const handleConfirmedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/requests/cancellation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          reason,
          explanation: explanation || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit cancellation request');
        return;
      }

      setSuccess(true);
      setReason('');
      setExplanation('');
      setConfirmationStep(false);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!confirmationStep) {
    return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('portal.cancelReservation.title')}</h3>
        <p className="text-gray-600 mb-6">
          {t('portal.cancelReservation.description')}
        </p>

        {/* Warning Banner */}
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
          <p className="text-sm font-semibold text-red-900 mb-2">Cancellation Policy</p>
          <p className="text-sm text-red-800">{CANCELLATION_POLICY}</p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-6">
          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              {t('portal.cancelReservation.reason')} <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
              required
            >
              <option value="">Select a reason</option>
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Details */}
          <div>
            <label htmlFor="explanation" className="block text-sm font-medium text-gray-700 mb-2">
              {t('portal.cancelReservation.notes')} <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Help us improve: what could we have done better?"
              disabled={loading}
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !reason}
            className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
          >
            {t('portal.cancelReservation.submit')}
          </button>
        </form>
      </div>
    );
  }

  // Confirmation Step
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">⚠️ {t('portal.cancelReservation.confirmMessage')}</h3>

      {/* Warning */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-6">
        <p className="text-sm font-semibold text-red-900 mb-2">This action cannot be undone</p>
        <p className="text-sm text-red-800">
          Are you sure you want to cancel your reservation for{' '}
          <span className="font-bold">
            {new Date(session.checkIn).toLocaleDateString()} -{' '}
            {new Date(session.checkOut).toLocaleDateString()}
          </span>
          ?
        </p>
        <p className="text-sm text-red-700 mt-3">
          You will begin the cancellation process. Our team will review your request and contact you
          within 24 hours regarding any applicable refunds.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded mb-6 space-y-2">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Reason:</span> {reason}
        </p>
        {explanation && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Details:</span> {explanation}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => {
            setConfirmationStep(false);
            setError(null);
          }}
          disabled={loading}
          className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          Go Back
        </button>

        <button
          onClick={handleConfirmedSubmit}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('portal.cancelReservation.submitting')}</span>
            </div>
          ) : (
            t('portal.cancelReservation.submit')
          )}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-sm text-green-700">
            ✓ Cancellation request submitted. We will contact you within 24 hours.
          </p>
        </div>
      )}
    </div>
  );
};

export default CancelReservationForm;
