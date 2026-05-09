'use client';

import { useState } from 'react';
import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';
import useUsdToMxn from '@/hooks/useUsdToMxn';

interface Destination {
  id: string;
  emoji: string;
  name: string;
  priceUsd: number;
  duration: string;
}

const DESTINATIONS: Destination[] = [
  { id: 'airport',          emoji: '✈️',  name: 'Airport – Xoxocotlán International (OAX)',                priceUsd: 50,  duration: '15–25 min' },
  { id: 'el_llano',         emoji: '🌳',  name: 'El Llano (Parque Juárez)',                                priceUsd: 7.32,  duration: '10–20 min' },
  { id: 'zocalo',           emoji: '🏛️',  name: 'Zócalo (Historic Main Square)',                           priceUsd: 7.32,  duration: '12–25 min' },
  { id: 'monte_alban',      emoji: '🗿',  name: 'Monte Albán (Archaeological Site)',                       priceUsd: 80,  duration: '20–35 min' },
  { id: 'ado_station',      emoji: '🚌',  name: 'ADO Bus Station',                                         priceUsd: 7.32,  duration: '15–25 min' },
  { id: 'hierve_el_agua',   emoji: '💧',  name: 'Hierve el Agua (Petrified Waterfalls)',                   priceUsd: 200, duration: '1.5–2.5 hrs · full-day recommended' },
  { id: 'arbol_tule',       emoji: '🌲',  name: 'Árbol del Tule (Tree of Tule)',                           priceUsd: 10.74, duration: '20–35 min' },
  { id: 'mitla',            emoji: '🏺',  name: 'Mitla (Archaeological Site)',                             priceUsd: 110, duration: '50–75 min' },
  { id: 'teotitlan',        emoji: '🧶',  name: 'Teotitlán del Valle (Textile Village)',                   priceUsd: 90,  duration: '45–60 min' },
  { id: 'artisan_villages', emoji: '🎨',  name: 'San Bartolo Coyotepec / San Martín Tilcajete (Artisan Villages)', priceUsd: 65, duration: '25–40 min' },
];

// Round MXN down to nearest 10
function floorToTen(mxn: number): number {
  return Math.floor(mxn / 10) * 10;
}

interface TransportRequestFormProps {
  session: GuestSession | null;
}

const TransportRequestForm = ({ session }: TransportRequestFormProps) => {
  const { t, language } = useLanguage();
  const { rate } = useUsdToMxn();

  const [destinationId, setDestinationId] = useState('');
  const [datetime, setDatetime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) return null;

  const selectedDest = DESTINATIONS.find((d) => d.id === destinationId) ?? null;

  // Price calculation: round trip = base × 2 × 0.9 (10% off)
  const priceUsd = selectedDest
    ? roundTrip
      ? selectedDest.priceUsd * 2 * 0.9
      : selectedDest.priceUsd
    : 0;

  function formatPrice(usd: number): string {
    if (language === 'es') {
      const mxn = floorToTen(usd * rate);
      return `$${mxn.toLocaleString('es-MX')} MXN`;
    }
    return `$${usd.toFixed(2)} USD`;
  }

  function formatDropdownPrice(usd: number): string {
    if (language === 'es') {
      return `$${floorToTen(usd * rate).toLocaleString('es-MX')} MXN`;
    }
    return `$${usd.toFixed(0)}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDest) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/requests/transport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          destination: selectedDest.name,
          datetime,
          passengers,
          roundTrip,
          estimatedPriceUsd: priceUsd,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to book transport');
        return;
      }

      setSuccess(true);
      setDestinationId('');
      setDatetime('');
      setPassengers(1);
      setRoundTrip(false);
      setNotes('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
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
            <option value="">Select a destination</option>
            {DESTINATIONS.map((dest) => (
              <option key={dest.id} value={dest.id}>
                {dest.emoji} {dest.name} — {formatDropdownPrice(dest.priceUsd)} · {dest.duration}
              </option>
            ))}
          </select>

          {/* Duration hint */}
          {selectedDest && (
            <p className="mt-1.5 text-xs text-gray-500">
              ⏱ {selectedDest.duration} one way
            </p>
          )}
        </div>

        {/* Date/Time */}
        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
            {t('portal.transportRequest.date')} &amp; {t('portal.transportRequest.time')} <span className="text-red-500">*</span>
          </label>
          <input
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            max={session.checkOut}
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'person' : 'people'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
            <label className="flex items-center gap-2 h-10 px-4 border-2 border-gray-300 rounded-lg bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
                disabled={loading}
                className="w-4 h-4"
              />
              <span className="text-sm select-none">Round-trip (10% off)</span>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions for the driver?"
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
                  <span>One-way × 2</span>
                  <span>{formatPrice(selectedDest.priceUsd * 2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>Round-trip discount (−10%)</span>
                  <span>−{formatPrice(selectedDest.priceUsd * 2 * 0.1)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t border-amber-200 pt-2 mt-1">
                  <span>Total</span>
                  <span>{formatPrice(priceUsd)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Estimated price</span>
                <span>{formatPrice(priceUsd)}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 pt-1">
              Final price confirmed at booking. May vary with driving conditions.
            </p>
          </div>
        )}

        {/* Error & Success */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-700">✓ {t('portal.transportRequest.success')}</p>
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
