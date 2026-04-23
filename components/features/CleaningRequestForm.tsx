'use client';

import { useState } from 'react';
import { GuestSession, CleaningRequest } from '@/types/guest-portal';

const CLEANING_FEE = parseFloat(process.env.NEXT_PUBLIC_CLEANING_FEE || '15');

interface CleaningRequestFormProps {
  session: GuestSession | null;
}

const CleaningRequestForm = ({ session }: CleaningRequestFormProps) => {
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  // Calculate date range (check-in to check-out)
  const minDate = session.checkIn;
  const maxDate = session.checkOut;
  const today = new Date().toISOString().split('T')[0];
  const earliestAvailable = new Date(Math.max(
    new Date(minDate).getTime(),
    new Date(today).getTime()
  )).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/requests/cleaning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          date,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to schedule cleaning');
        return;
      }

      setSuccess(true);
      setDate('');
      setNotes('');

      // Show success message
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">🧹 Schedule Cleaning</h3>
      <p className="text-gray-600 mb-6">
        Request a room or bungalow cleaning on your preferred date
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Picker */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Cleaning Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={earliestAvailable}
            max={maxDate}
            required
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
          <p className="mt-2 text-xs text-gray-500">
            Available between {new Date(session.checkIn).toLocaleDateString()} and{' '}
            {new Date(session.checkOut).toLocaleDateString()}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Focus on windows, avoid towel cabinet, etc."
            disabled={loading}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
        </div>

        {/* Fee Display */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Cleaning Fee:</span> ${CLEANING_FEE.toFixed(2)} USD
          </p>
          <p className="text-xs text-gray-600 mt-1">
            This fee will be added to your account after confirmation
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-700">
              ✓ Cleaning successfully scheduled! You will receive a confirmation email.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !date}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Scheduling...</span>
            </div>
          ) : (
            'Confirm Cleaning Request'
          )}
        </button>
      </form>
    </div>
  );
};

export default CleaningRequestForm;
