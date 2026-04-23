'use client';

import { useState, useEffect } from 'react';
import { GuestSession } from '@/types/guest-portal';

interface TransportDestination {
  id: string;
  name: string;
  emoji: string;
  base_price: number;
  estimated_duration_minutes: number;
}

interface TransportRequestFormProps {
  session: GuestSession | null;
}

const TransportRequestForm = ({ session }: TransportRequestFormProps) => {
  const [destinations, setDestinations] = useState<TransportDestination[]>([]);
  const [destination, setDestination] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [datetime, setDatetime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [roundTrip, setRoundTrip] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  if (!session) return null;

  // Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/requests/transport/destinations', {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setDestinations(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch destinations:', err);
      } finally {
        setLoadingDestinations(false);
      }
    };

    fetchDestinations();
  }, [session.token]);

  // Calculate price
  useEffect(() => {
    if (!destination || destination === 'custom') {
      setEstimatedPrice(0);
      return;
    }

    const selectedDest = destinations.find((d) => d.name === destination);
    if (!selectedDest) {
      setEstimatedPrice(0);
      return;
    }

    let price = selectedDest.base_price;
    if (roundTrip) {
      price = selectedDest.base_price * 2 * 0.9; // 10% discount
    }

    setEstimatedPrice(parseFloat(price.toFixed(2)));
  }, [destination, roundTrip, destinations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          destination: destination === 'custom' ? 'custom' : destination,
          customDestination: destination === 'custom' ? customDestination : undefined,
          datetime,
          passengers,
          roundTrip,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to book transport');
        return;
      }

      setSuccess(true);
      setDestination('');
      setCustomDestination('');
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
      <h3 className="text-2xl font-bold text-gray-900 mb-2">🚗 Book Transportation</h3>
      <p className="text-gray-600 mb-6">
        Arrange a driver to popular destinations or custom locations
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Destination <span className="text-red-500">*</span>
          </label>
          <select
            id="destination"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              if (e.target.value !== 'custom') {
                setCustomDestination('');
              }
            }}
            disabled={loading || loadingDestinations}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
            required
          >
            <option value="">Select a destination</option>
            {destinations.map((dest) => (
              <option key={dest.id} value={dest.name}>
                {dest.emoji} {dest.name} - ${dest.base_price.toFixed(2)}
              </option>
            ))}
            <option value="custom">📍 Custom Destination (Quote on Request)</option>
          </select>
        </div>

        {/* Custom Destination */}
        {destination === 'custom' && (
          <div>
            <label htmlFor="customDest" className="block text-sm font-medium text-gray-700 mb-2">
              Destination Address <span className="text-red-500">*</span>
            </label>
            <input
              id="customDest"
              type="text"
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              placeholder="Enter address or location name"
              required
              disabled={loading}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-600 transition-colors disabled:bg-gray-100"
            />
          </div>
        )}

        {/* Date/Time */}
        <div>
          <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-2">
            Date & Time <span className="text-red-500">*</span>
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
              Passengers <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Type
            </label>
            <div className="flex items-center gap-2 h-10 px-4 border-2 border-gray-300 rounded-lg bg-gray-50">
              <input
                id="roundTrip"
                type="checkbox"
                checked={roundTrip}
                onChange={(e) => setRoundTrip(e.target.checked)}
                disabled={loading}
                className="w-4 h-4"
              />
              <label htmlFor="roundTrip" className="text-sm cursor-pointer flex-1">
                Round-trip (10% off)
              </label>
            </div>
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
        {estimatedPrice > 0 && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Estimated Price:</span> ${estimatedPrice.toFixed(2)} USD
            </p>
            <p className="text-xs text-gray-600 mt-1">
              This is an estimate. Final price may vary based on actual driving conditions.
            </p>
          </div>
        )}

        {/* Error & Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <p className="text-sm text-green-700">
              ✓ Transport booked! The property manager will confirm your ride.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !destination || !datetime || loadingDestinations}
          className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Booking...</span>
            </div>
          ) : (
            'Book Transport'
          )}
        </button>
      </form>
    </div>
  );
};

export default TransportRequestForm;
