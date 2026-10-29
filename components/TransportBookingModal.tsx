'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import useUsdToMxn from '@/hooks/useUsdToMxn';
import DateInput from '@/components/DateInput';
import { MAX_PASSENGERS, TransportDestination, formatMxnWithUsd, oneWayPriceMxn, tripPriceMxn } from '@/lib/transportPricing';
import { startTransportCheckout } from '@/lib/transportCheckout';

interface Props {
  destination: TransportDestination | null;
  onClose: () => void;
}

const inputClass =
  'w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-garden transition-colors disabled:bg-slate-100';

export default function TransportBookingModal({ destination, onClose }: Props) {
  const { language } = useLanguage();
  const es = language === 'es';
  const { rate } = useUsdToMxn();

  const [form, setForm] = useState({ name: '', email: '', phone: '', datetime: '', passengers: 1, roundTrip: false, notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, loading]);

  if (!destination) return null;

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const oneWayMxn = oneWayPriceMxn(destination);
  const totalMxn = tripPriceMxn(destination, form.roundTrip);
  const formatPrice = (mxn: number) => formatMxnWithUsd(mxn, language, rate);
  const minDatetime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const checkoutError = await startTransportCheckout({
      destinationId: destination.id,
      datetime: form.datetime,
      passengers: form.passengers,
      roundTrip: form.roundTrip,
      notes: form.notes || undefined,
      language,
      name: form.name,
      email: form.email,
      phone: form.phone,
    });
    // On success the browser is already navigating to Stripe, so keep the spinner.
    if (checkoutError) {
      setError(checkoutError);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => !loading && onClose()}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between bg-gradient-to-r from-garden to-[#3c5a35] p-6 text-white">
          <div>
            <h2 className="text-2xl font-bold">{destination.emoji} {destination.name[es ? 'es' : 'en']}</h2>
            <p className="mt-1 text-sm text-green-100">⏱️ {destination.duration[es ? 'es' : 'en']} {es ? 'de ida' : 'one way'}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="rounded-full p-2 transition-colors hover:bg-white/20" aria-label={es ? 'Cerrar' : 'Close'}>
            <span className="text-2xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Nombre completo' : 'Full name'} <span className="text-red-600">*</span></label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} required disabled={loading} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Correo electrónico' : 'Email'} <span className="text-red-600">*</span></label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required disabled={loading} className={inputClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'} <span className="text-red-600">*</span></label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required disabled={loading} className={inputClass} placeholder="+52 951 123 4567" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Fecha y hora de recogida' : 'Pickup date & time'} <span className="text-red-600">*</span></label>
              <DateInput
                type="datetime-local"
                value={form.datetime}
                onChange={(v) => set('datetime', v)}
                language={language}
                min={minDatetime}
                required
                disabled={loading}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500">{es ? 'Hora de Oaxaca' : 'Oaxaca local time'}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Pasajeros' : 'Passengers'}</label>
              <select value={form.passengers} onChange={(e) => set('passengers', parseInt(e.target.value))} disabled={loading} className={inputClass}>
                {Array.from({ length: MAX_PASSENGERS }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Tipo de viaje' : 'Trip type'}</label>
              <label className="flex h-[44px] cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-300 bg-slate-50 px-4">
                <input type="checkbox" checked={form.roundTrip} onChange={(e) => set('roundTrip', e.target.checked)} disabled={loading} className="h-4 w-4" />
                <span className="select-none text-sm">{es ? 'Ida y vuelta (10% desc.)' : 'Round trip (10% off)'}</span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-slate-900">{es ? 'Notas (opcional)' : 'Notes (optional)'}</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                maxLength={450}
                rows={3}
                disabled={loading}
                className={`${inputClass} resize-none`}
                placeholder={es ? 'Número de vuelo, silla para niños, etc.' : 'Flight number, child seat, etc.'}
              />
            </div>
          </div>

          <div className="space-y-1 rounded-lg border border-garden/30 bg-[#f0f4f1] p-4">
            {form.roundTrip && (
              <>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>{es ? 'Ida × 2' : 'One way × 2'}</span>
                  <span>{formatPrice(oneWayMxn * 2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-700">
                  <span>{es ? 'Descuento ida y vuelta' : 'Round-trip discount'}</span>
                  <span>−{formatPrice(oneWayMxn * 2 - totalMxn)}</span>
                </div>
              </>
            )}
            <div className={`flex justify-between font-semibold text-slate-900 ${form.roundTrip ? 'mt-1 border-t border-garden/30 pt-2' : ''}`}>
              <span>Total</span>
              <span>{formatPrice(totalMxn)}</span>
            </div>
            <p className="pt-1 text-xs text-slate-500">
              {es
                ? 'Se cobra en MXN con tarjeta de débito o crédito mediante Stripe.'
                : "Charged in MXN by debit or credit card via Stripe. The USD amount is an estimate at today's exchange rate; your bank sets the final conversion."}
            </p>
          </div>

          {error && (
            <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.datetime}
            className="w-full rounded-lg bg-garden px-6 py-3 font-semibold text-white transition-colors hover:bg-[#3c5a35] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {es ? 'Redirigiendo al pago...' : 'Redirecting to payment...'}
              </span>
            ) : (
              <>💳 {es ? 'Pagar con tarjeta' : 'Pay by card'} · {`$${totalMxn.toLocaleString(es ? 'es-MX' : 'en-US')} MXN`}</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
