'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import BackgroundSlideshow from '../../../components/BackgroundSlideshow';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatDate } from '../../../lib/date';
import useUsdToMxn from '../../../hooks/useUsdToMxn';
import { formatPrice } from '../../../lib/currency';

function ConfirmationContent() {
  const params = useSearchParams();
  const { t, language } = useLanguage();
  const { rate } = useUsdToMxn();

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
          <h1 className="text-4xl font-semibold tracking-tight text-white">{t('book.confirmation.title')}</h1>
          <p className="text-lg text-slate-300">
            {t('book.confirmation.welcomePrefix')} {firstName}. {t('book.confirmation.welcomeSuffix')}
          </p>
        </div>

        {/* Lock Code */}
        <div className="rounded-3xl border-2 border-terracotta/60 bg-[#3d1a12]/80 p-8 text-center mb-6 shadow-lg shadow-terracotta/10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta mb-4">
            🔑 {t('book.confirmation.lockCodeTitle')}
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
            {t('book.confirmation.lockCodeEnter')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t('book.confirmation.lockCodePortalHint')}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 mb-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 mb-4">
            {t('book.confirmation.summaryTitle')}
          </p>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-400">{t('book.confirmation.property')}</span>
            <span className="text-slate-100 font-medium">{unit}</span>
            <span className="text-slate-400">{t('book.confirmation.checkIn')}</span>
            <span className="text-slate-100 font-medium">{formatDate(checkin, language)}</span>
            <span className="text-slate-400">{t('book.confirmation.checkOut')}</span>
            <span className="text-slate-100 font-medium">{formatDate(checkout, language)}</span>
            <span className="text-slate-400">{t('book.confirmation.nights')}</span>
            <span className="text-slate-100 font-medium">{nights}</span>
            <span className="text-slate-400">{t('book.confirmation.guests')}</span>
            <span className="text-slate-100 font-medium">{guests}</span>
            <span className="text-slate-400 font-semibold pt-2 border-t border-slate-700">{t('book.confirmation.total')}</span>
            <span className="text-slate-100 font-semibold pt-2 border-t border-slate-700">{formatPrice(parseFloat(total), language, rate)}</span>
          </div>
        </div>

        {/* Portal CTA */}
        <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 mb-8 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
            🏠 {t('book.confirmation.portalTitle')}
          </p>
          <p className="text-slate-300 text-sm">
            {t('book.confirmation.portalDesc')}
          </p>
          <p className="text-xs text-slate-500">
            {t('book.confirmation.portalLoginHintPrefix')}{' '}
            (<span className="text-slate-300">{code}</span>).
          </p>
          <Link
            href="/portal"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
          >
            {t('book.confirmation.openPortal')}
          </Link>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200 transition">
            {t('book.confirmation.backHome')}
          </Link>
        </div>

        {/* Test mode note */}
        <p className="text-center text-xs text-slate-600 mt-8">
          🧪 {t('book.confirmation.testMode')}
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
