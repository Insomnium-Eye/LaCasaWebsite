'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import BackgroundSlideshow from '../../../components/BackgroundSlideshow';

function ConfirmationContent() {
  const params = useSearchParams();

  const code    = params.get('code') ?? '????';
  const name    = params.get('name') ?? 'Guest';
  const unit    = params.get('unit') ?? '';
  const checkin  = params.get('checkin') ?? '';
  const checkout = params.get('checkout') ?? '';
  const nights  = params.get('nights') ?? '0';
  const guests  = params.get('guests') ?? '1';
  const total   = params.get('total') ?? '0';

  const firstName = name.split(' ')[0];

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <div className="relative mx-auto max-w-2xl px-6 py-16 lg:px-8">

        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-garden/20 text-4xl mb-2">
            ✅
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Booking Confirmed!</h1>
          <p className="text-lg text-slate-300">
            Welcome, {firstName}. Your stay at La Casa Oaxaca is all set.
          </p>
        </div>

        {/* Lock Code */}
        <div className="rounded-3xl border-2 border-terracotta/60 bg-[#3d1a12]/80 p-8 text-center mb-6 shadow-lg shadow-terracotta/10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta mb-4">
            🔑 Your Lock Code
          </p>
          <div className="flex items-center justify-center gap-3 my-4">
            {code.split('').map((digit, i) => (
              <div
                key={i}
                className="w-16 h-20 flex items-center justify-center rounded-2xl bg-[#1a0800] border border-terracotta/40 text-4xl font-bold text-white shadow-inner"
              >
                {digit}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-4">
            Enter this code on the keypad to unlock your unit door.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            You can also use it — along with your email or phone — to sign into the Guest Portal.
          </p>
        </div>

        {/* Booking Summary */}
        <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 mb-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 mb-4">
            Booking Summary
          </p>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-400">Property</span>
            <span className="text-slate-100 font-medium">{unit}</span>
            <span className="text-slate-400">Check-in</span>
            <span className="text-slate-100 font-medium">{checkin}</span>
            <span className="text-slate-400">Check-out</span>
            <span className="text-slate-100 font-medium">{checkout}</span>
            <span className="text-slate-400">Nights</span>
            <span className="text-slate-100 font-medium">{nights}</span>
            <span className="text-slate-400">Guests</span>
            <span className="text-slate-100 font-medium">{guests}</span>
            <span className="text-slate-400 font-semibold pt-2 border-t border-slate-700">Total</span>
            <span className="text-slate-100 font-semibold pt-2 border-t border-slate-700">${parseFloat(total).toFixed(2)} USD</span>
          </div>
        </div>

        {/* Portal CTA */}
        <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            🏠 Guest Portal
          </p>
          <p className="text-slate-300 text-sm">
            Use the guest portal to request cleaning, book transport, extend your stay, and more.
          </p>
          <p className="text-xs text-slate-500">
            Login with your <span className="text-slate-300">email</span>, <span className="text-slate-300">phone number</span>, or <span className="text-slate-300">lock code ({code})</span>.
          </p>
          <Link
            href="/portal"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
          >
            Open Guest Portal →
          </Link>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition">
            ← Back to home
          </Link>
        </div>

        {/* Test mode note */}
        <p className="text-center text-xs text-slate-600 mt-8">
          🧪 Test mode — this is a simulated booking. No real payment was charged.
        </p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading…
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
