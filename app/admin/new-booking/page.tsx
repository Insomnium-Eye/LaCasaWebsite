'use client';

import { useState } from 'react';

const UNITS = [
  { id: 'bungalow-1',   name: 'Bungalow 1' },
  { id: 'bungalow-2',   name: 'Bungalow 2' },
  { id: 'main-bedroom', name: 'Main Residence Bedroom' },
];

const SOURCES = [
  { id: 'airbnb',      label: 'Airbnb' },
  { id: 'booking_com', label: 'Booking.com' },
  { id: 'vrbo',        label: 'Vrbo' },
  { id: 'direct',      label: 'Direct' },
];

type Screen = 'lock' | 'form' | 'success';

export default function NewBookingPage() {
  const [screen, setScreen] = useState<Screen>('lock');
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');

  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [unit, setUnit]             = useState('');
  const [checkIn, setCheckIn]       = useState('');
  const [checkOut, setCheckOut]     = useState('');
  const [totalPaid, setTotalPaid]   = useState('');
  const [source, setSource]         = useState('airbnb');
  const [loading, setLoading]       = useState(false);
  const [formError, setFormError]   = useState('');

  const [pin, setPin]     = useState('');
  const [copied, setCopied] = useState(false);

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) {
      setCodeError('Enter the 4-digit admin code.');
      return;
    }
    // We validate the code server-side; just advance the screen
    setCodeError('');
    setScreen('form');
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    const res = await fetch('/api/admin/create-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_code: code.trim(),
        guest_first_name: firstName.trim(),
        guest_last_name: lastName.trim(),
        unit_id: unit,
        check_in: checkIn,
        check_out: checkOut,
        total_paid: totalPaid || undefined,
        source,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setScreen('lock');
        setCode('');
        setCodeError('Incorrect code. Try again.');
      } else {
        setFormError((data as { error?: string }).error || 'Something went wrong. Please try again.');
      }
      return;
    }

    const data = await res.json() as { pin: string };
    setPin(data.pin);
    setScreen('success');
  }

  function resetForm() {
    setFirstName(''); setLastName(''); setUnit('');
    setCheckIn(''); setCheckOut(''); setTotalPaid('');
    setSource('airbnb'); setPin(''); setCopied(false);
    setScreen('form');
  }

  const nights =
    checkIn && checkOut
      ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
      : 0;

  if (screen === 'lock') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏠</div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your access code</p>
          </div>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => { setCode(e.target.value); setCodeError(''); }}
              placeholder="••••"
              autoFocus
              className="w-full text-center text-3xl tracking-widest border-2 border-gray-200 rounded-xl py-4 focus:outline-none focus:border-amber-600 transition-colors"
            />
            {codeError && <p className="text-sm text-red-600 text-center">{codeError}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (screen === 'success') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Booking Created</h2>
          <p className="text-gray-500 text-sm mb-8">Guest added to Supabase. A confirmation email was sent to you.</p>

          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-8">
            <p className="text-sm text-amber-700 font-semibold uppercase tracking-wide mb-2">Door PIN</p>
            <div className="text-6xl font-black tracking-widest text-amber-900 mb-4">{pin}</div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(pin);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-sm text-amber-700 hover:text-amber-900 underline transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy PIN'}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={resetForm}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Add Another
            </button>
            <a
              href="/admin/reviews"
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors flex items-center justify-center"
            >
              Admin Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Booking</h1>
          <p className="text-gray-500 text-sm mt-1">Manually add a booking and generate a door PIN</p>
        </div>

        <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">

          {/* Guest Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                placeholder="Maria"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="García"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Unit <span className="text-red-500">*</span>
            </label>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors bg-white"
            >
              <option value="">Select a unit…</option>
              {UNITS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Check-in <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Check-out <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                min={checkIn ? (() => { const d = new Date(checkIn + 'T00:00:00'); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() : ''}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
          </div>

          {/* Nights badge */}
          {nights > 0 && (
            <p className="text-xs text-amber-700 font-medium -mt-2">
              {nights} night{nights !== 1 ? 's' : ''}
            </p>
          )}

          {/* Source */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Booking Source</label>
            <div className="grid grid-cols-4 gap-2">
              {SOURCES.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    source === s.id
                      ? 'border-amber-600 bg-amber-50 text-amber-800'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Paid */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Total Paid (USD) <span className="text-gray-400 font-normal">optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalPaid}
                onChange={e => setTotalPaid(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-600 transition-colors"
              />
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !firstName || !unit || !checkIn || !checkOut}
            className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-xl transition-all text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating booking…
              </span>
            ) : (
              'Create Booking & Generate PIN'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
