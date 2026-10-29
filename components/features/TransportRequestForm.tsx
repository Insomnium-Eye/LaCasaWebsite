'use client';

import { useState, useEffect } from 'react';
import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';
import useUsdToMxn from '@/hooks/useUsdToMxn';
import DateInput from '@/components/DateInput';
import { MAX_PASSENGERS, TRANSPORT_DESTINATIONS, formatMxnWithUsd, getDestination, oneWayPriceMxn, tripPriceMxn } from '@/lib/transportPricing';
import { startTransportCheckout } from '@/lib/transportCheckout';

interface TransportRequestFormProps {
  session: GuestSession | null;
  prefill?: { destinationId: string; date: string } | null;
  onPrefillConsumed?: () => void;
}

const TransportRequestForm = ({ session, prefill, onPrefillConsumed }: TransportRequestFormProps) => {
  const { t, language } = useLanguage();
  const { rate } = useUsdToMxn();

  const [destinationId, setDestinationId] = useState('');
  const [datetime, setDatetime] = useState('');

  useEffect(() => {
    if (prefill) {
      setDestinationId(prefill.destinationId);
      setDatetime(prefill.date + 'T09:00');
      onPrefillConsumed?.();
    }
  }, [prefill]);
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);

  // Stripe sends the guest back with ?payment=cancelled if they abandon checkout.
  useEffect(() => {
    setCancelled(new URLSearchParams(window.location.search).get('payment') === 'cancelled');
  }, []);

  if (!session) return null;

  // Clamp min to the later of checkIn or right now; max ends at 23:59 on checkout day
  const checkInDatetime = session.checkIn.slice(0, 10) + 'T00:00';
  const nowDatetime = new Date().toISOString().slice(0, 16);
  const minDatetime = checkInDatetime > nowDatetime ? checkInDatetime : nowDatetime;
  const maxDatetime = session.checkOut.slice(0, 10) + 'T23:59';

  const selectedDest = getDestination(destinationId);
  const oneWayMxn = selectedDest ? oneWayPriceMxn(selectedDest) : 0;
  const totalMxn = selectedDest ? tripPriceMxn(selectedDest, roundTrip) : 0;
  const formatPrice = (mxn: number) => formatMxnWithUsd(mxn, language, rate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDest) return;
    setLoading(true);
    setError(null);
    setCancelled(false);

    const checkoutError = await startTransportCheckout(
      { destinationId: selectedDest.id, datetime, passengers, roundTrip, notes: notes || undefined, language },
      session.token
    );
    // On success the browser is already navigating to Stripe, so keep the spinner.
    if (checkoutError) {
      setError(checkoutError);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('portal.transportRequest.title')}</h3>
      <p className="text-gray-600 mb-6">{t('portal.transportRequest.description')}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            {t('portal.transportRequest.destination')} <span className="text-red-500">*</span>
          </label>
          <select
            id="destination"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
            required
          >
            <option value="">{t('portal.transportRequest.selectDestination')}</option>
            {TRANSPORT_DESTINATIONS.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.emoji} {dest.name[language === 'es' ? 'es' : 'en']} — {formatPrice(oneWayPriceMxn(dest))} · {dest.duration[language === 'es' ? 'es' : 'en']}
              </option>
            ))}
          </select>

          {/* Duration hint */}
          {selectedDest && (
            <p className="mt-1.5 text-xs text-gray-500">
              ⏱ {selectedDest.duration[language === 'es' ? 'es' : 'en']} {t('portal.transportRequest.oneWayHint')}
            </p>
          )}
        </div>

        {/* Date/Time */}
        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
            {t('portal.transportRequest.date')} &amp; {t('portal.transportRequest.time')} <span className="text-red-500">*</span>
          </label>
          <DateInput
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={setDatetime}
            language={language}
            min={minDatetime}
            max={maxDatetime}
            required
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
        </div>

        {/* Passengers & Round Trip */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-2">
              {t('portal.transportRequest.passengers')} <span className="text-red-500">*</span>
            </label>
            <select
              id="passengers"
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
            >
              {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t('portal.transportRequest.person') : t('portal.transportRequest.people')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('portal.transportRequest.tripType')}</label>
            <label className="flex items-center gap-2 h-10 px-4 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
                disabled={loading}
                className="w-4 h-4"
              />
              <span className="text-sm select-none">{t('portal.transportRequest.roundTrip')}</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            {t('portal.transportRequest.notes')} <span className="text-gray-400">({t('portal.transportRequest.notesOptional')})</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('portal.transportRequest.notesPlaceholder')}
            disabled={loading}
            rows={3}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
          />
        </div>

        {/* Price Preview */}
        {selectedDest && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-1">
            {roundTrip ? (
              <>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>{t('portal.transportRequest.oneWayX2')}</span>
                  <span>{formatPrice(oneWayMxn * 2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>{t('portal.transportRequest.roundTripDiscount')}</span>
                  <span>−{formatPrice(oneWayMxn * 2 - totalMxn)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-amber-200 pt-2 mt-1">
                  <span>{t('portal.transportRequest.total')}</span>
                  <span>{formatPrice(totalMxn)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between font-semibold text-gray-900">
                <span>{t('portal.transportRequest.estimatedPrice')}</span>
                <span>{formatPrice(totalMxn)}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 pt-1">
              {t('portal.transportRequest.priceDisclaimer')}
            </p>
          </div>
        )}

        {cancelled && !error && (
          <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
            <p className="text-sm text-amber-800">{t('portal.transportRequest.paymentCancelled')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !destinationId || !datetime}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('portal.transportRequest.submitting')}</span>
            </div>
          ) : (
            t('portal.transportRequest.submit')
          )}
        </button>
      </form>
    </div>
  );
};

export default TransportRequestForm;
