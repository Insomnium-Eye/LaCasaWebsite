'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface BookingDetail {
  id: string;
  guest_name: string;
  email: string;
  phone: string;
  unit_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  total_usd: number;
  lock_code: string;
  status: string;
  created_at: string;
}

function BookingReviewContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [acting, setActing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch(`/api/booking/${id}?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBooking(data.booking);
      })
      .catch(err => setFetchError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleAction = async (action: 'confirm' | 'deny') => {
    setActing(true);
    try {
      const res = await fetch(`/api/booking/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, token }),
      });
      const data = await res.json() as { success?: boolean; status?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Action failed');
      setBooking(prev => prev ? { ...prev, status: data.status ?? prev.status } : prev);
      setResult({
        ok: true,
        message: action === 'confirm'
          ? '✅ Booking confirmed — guest has been notified by email & SMS.'
          : '❌ Booking denied — guest has been notified.',
      });
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : 'Failed' });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0906] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#0d0906] flex items-center justify-center px-6 text-center">
        <div className="space-y-3">
          <p className="text-2xl text-red-400">⚠️ {fetchError}</p>
          <p className="text-slate-400 text-sm">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isPending = booking.status === 'pending';

  const statusBadge = {
    confirmed: 'bg-green-900/40 text-green-300 border-green-700/40',
    denied:    'bg-red-900/40 text-red-300 border-red-700/40',
    pending:   'bg-amber-900/40 text-amber-300 border-amber-700/40',
  }[booking.status] ?? 'bg-slate-700 text-slate-300';

  const statusLabel = {
    confirmed: '✅ Confirmed',
    denied:    '❌ Denied',
    pending:   '⏳ Awaiting Review',
  }[booking.status] ?? booking.status;

  return (
    <div className="min-h-screen bg-[#0d0906] text-white px-6 py-12">
      <div className="mx-auto max-w-lg space-y-5">

        {/* Header */}
        <div className="text-center space-y-1 mb-6">
          <p className="text-xs uppercase tracking-widest text-terracotta font-semibold">La Casa Oaxaca</p>
          <h1 className="text-3xl font-semibold">Booking Review</h1>
          <p className="text-slate-500 text-xs font-mono">#{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Status */}
        <div className={`rounded-xl border px-4 py-2.5 text-center text-sm font-semibold ${statusBadge}`}>
          {statusLabel}
        </div>

        {/* Guest info */}
        <div className="rounded-2xl border border-slate-700 bg-[#1a120e]/80 p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Guest Information</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            <dt className="text-slate-400">Name</dt>
            <dd className="text-slate-100 font-medium">{booking.guest_name}</dd>
            <dt className="text-slate-400">Email</dt>
            <dd className="text-slate-100 font-medium break-all">{booking.email || '—'}</dd>
            <dt className="text-slate-400">Phone</dt>
            <dd className="text-slate-100 font-medium">{booking.phone || '—'}</dd>
          </dl>
        </div>

        {/* Stay details */}
        <div className="rounded-2xl border border-slate-700 bg-[#1a120e]/80 p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">Stay Details</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
            <dt className="text-slate-400">Property</dt>
            <dd className="text-slate-100 font-medium">{booking.unit_name}</dd>
            <dt className="text-slate-400">Check-in</dt>
            <dd className="text-slate-100 font-medium">{booking.check_in}</dd>
            <dt className="text-slate-400">Check-out</dt>
            <dd className="text-slate-100 font-medium">{booking.check_out}</dd>
            <dt className="text-slate-400">Nights</dt>
            <dd className="text-slate-100 font-medium">{booking.nights}</dd>
            <dt className="text-slate-400">Guests</dt>
            <dd className="text-slate-100 font-medium">{booking.guests}</dd>
            <dt className="text-slate-400">Total</dt>
            <dd className="text-slate-100 font-medium">${booking.total_usd?.toFixed(2)} USD</dd>
            <dt className="text-slate-400">Lock Code</dt>
            <dd className="text-slate-100 font-bold tracking-[0.3em] text-xl">{booking.lock_code}</dd>
          </dl>
        </div>

        {/* Result banner */}
        {result && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-semibold text-center ${
            result.ok
              ? 'bg-green-900/40 text-green-200 border-green-700/40'
              : 'bg-red-900/40 text-red-200 border-red-700/40'
          }`}>
            {result.message}
          </div>
        )}

        {/* Action buttons — only shown when pending and no result yet */}
        {isPending && !result && (
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('deny')}
              disabled={acting}
              className="flex-1 rounded-xl border border-red-500/40 bg-red-900/30 py-4 text-sm font-semibold text-red-300 hover:bg-red-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✗ Deny
            </button>
            <button
              onClick={() => handleAction('confirm')}
              disabled={acting}
              className="flex-[2] rounded-xl bg-garden py-4 text-sm font-semibold text-white hover:bg-[#3c5a35] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {acting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing…
                </span>
              ) : '✓ Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d0906] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingReviewContent />
    </Suspense>
  );
}
