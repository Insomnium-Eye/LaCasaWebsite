'use client';

import { useState, useEffect } from 'react';
import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';
import DateInput from '@/components/DateInput';

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function subDays(iso: string, n: number): string {
  return addDays(iso, -n);
}

interface ExtendStayFormProps {
  session: GuestSession | null;
}

const ExtendStayForm = ({ session }: ExtendStayFormProps) => {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const [newCheckout, setNewCheckout] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [maxCheckout, setMaxCheckout] = useState<string | undefined>(undefined);

  const currentCheckoutIso = session?.checkOut?.slice(0, 10) ?? '';

  useEffect(() => {
    if (!session?.unitSlug) return;
    fetch(`/api/availability/${session.unitSlug}`)
      .then(r => r.json())
      .then((data: { blocked?: { start: string; end: string }[] }) => {
        const ranges = data.blocked ?? [];
        // The availability API already uses the 2-day buffer, so r.start = next booking's check_in.
        // Find the earliest next booking that starts strictly after current checkout.
        const nextStarts = ranges
          .map(r => r.start)
          .filter(s => s > currentCheckoutIso)
          .sort();
        if (nextStarts.length > 0) {
          // Max new checkout = next booking check_in − 2 days (reserves 2 clean days).
          const computed = subDays(nextStarts[0], 2);
          // Only set a limit if there's actually room to extend at least 1 day
          setMaxCheckout(computed > currentCheckoutIso ? computed : currentCheckoutIso);
        }
      })
      .catch(() => {/* no limit if unavailable */});
  }, [session?.unitSlug, currentCheckoutIso]);

  if (!session) return null;

  const currentCheckout = new Date(currentCheckoutIso);
  const minNewCheckout = new Date(currentCheckout);
  minNewCheckout.setDate(minNewCheckout.getDate() + 1);

  const handleCheckoutChange = (value: string) => {
    setNewCheckout(value);

    if (value) {
      const newDate = new Date(value);
      const extraNights = Math.ceil(
        (newDate.getTime() - currentCheckout.getTime()) / (1000 * 60 * 60 * 24)
      );
      const cost = extraNights * session.nightlyRate;
      setCalculatedCost(cost);
    } else {
      setCalculatedCost(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/requests/extend-stay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          requestedCheckout: newCheckout,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to request extension');
        return;
      }

      setSuccess(true);
      setNewCheckout('');
      setCalculatedCost(0);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extraNights = newCheckout
    ? Math.ceil(
        (new Date(newCheckout).getTime() - currentCheckout.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const noRoomToExtend = maxCheckout !== undefined && maxCheckout <= currentCheckoutIso;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('portal.extendStay.title')}</h3>
      <p className="text-gray-600 mb-6">
        {t('portal.extendStay.description')}
      </p>

      {noRoomToExtend && (
        <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
          <p className="text-sm text-amber-800 font-medium">
            {language === 'es'
              ? 'No hay disponibilidad para extender tu estadía — el siguiente huésped llega dentro de dos días de tu salida.'
              : 'No extension is available — the next guest arrives within two days of your checkout, leaving no room for the cleaning period.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Checkout */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">{t('portal.extendStay.currentCheckout')}</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date(session.checkOut.slice(0,10) + 'T12:00:00Z').toLocaleDateString(locale, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* New Checkout Date */}
        <div>
          <label htmlFor="newCheckout" className="block text-sm font-medium text-gray-700 mb-2">
            {t('portal.extendStay.newCheckOut')} <span className="text-red-500">*</span>
          </label>
          <DateInput
            id="newCheckout"
            value={newCheckout}
            onChange={handleCheckoutChange}
            language={language}
            min={minNewCheckout.toISOString().split('T')[0]}
            max={maxCheckout}
            required
            disabled={loading || noRoomToExtend}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
          {maxCheckout && (
            <p className="mt-1.5 text-xs text-amber-700">
              {language === 'es'
                ? `Extensión disponible hasta el ${new Date(maxCheckout + 'T12:00:00Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} (la siguiente reserva requiere 2 días de preparación).`
                : `Extension available until ${new Date(maxCheckout + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} — next booking requires 2 prep days.`}
            </p>
          )}
        </div>

        {/* Cost Breakdown */}
        {newCheckout && (
          <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{t('portal.extendStay.additionalNights')}:</span> {extraNights}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{t('portal.extendStay.nightlyRate')}:</span> ${session.nightlyRate.toFixed(2)} USD
            </p>
            <div className="pt-2 border-t border-amber-300">
              <p className="text-lg font-bold text-amber-900">
                {t('portal.extendStay.estimatedCost')}: ${calculatedCost.toFixed(2)} USD
              </p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{t('portal.extendStay.noteLabel')}:</span> {t('portal.extendStay.noteText')}
          </p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-700">✓ {t('portal.extendStay.success')}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !newCheckout || noRoomToExtend}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('portal.extendStay.submitting')}</span>
            </div>
          ) : (
            t('portal.extendStay.submit')
          )}
        </button>
      </form>
    </div>
  );
};

export default ExtendStayForm;
