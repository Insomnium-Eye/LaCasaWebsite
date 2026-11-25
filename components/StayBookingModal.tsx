'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { Unit } from '@/data/units';
import { useLanguage } from '@/contexts/LanguageContext';
import useUsdToMxn from '@/hooks/useUsdToMxn';
import DateInput from '@/components/DateInput';
import { addDays, nightsBetween, oaxacaToday } from '@/lib/date';
import { formatMoney } from '@/lib/nightlyRates';
import PhoneInput from './PhoneInput';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// Loaded once, the first time a booking reaches the payment step.
let stripePromise: ReturnType<typeof loadStripe> | null = null;
const getStripePromise = () => (stripePromise ??= loadStripe(publishableKey!));

type Quote =
  | { ok: true; nights: { date: string; price: number }[]; total: number; currency: string }
  | { ok: false; error: string; minStay?: number };

const inputClass =
  'w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-terracotta transition-colors disabled:bg-slate-100';

function errorMessage(code: string, es: boolean, minStay?: number) {
  const messages: Record<string, [string, string]> = {
    unavailable: ["Some of those nights are already booked. Please try other dates.", 'Algunas de esas noches ya están reservadas. Prueba otras fechas.'],
    booked: ["Those dates overlap another stay (we keep 2 days for cleaning). Please try other dates.", 'Esas fechas se cruzan con otra estancia (dejamos 2 días para limpieza). Prueba otras fechas.'],
    min_stay: [`This stay needs at least ${minStay} nights.`, `Esta estancia requiere al menos ${minStay} noches.`],
    closed_checkin: ["Check-in isn't possible on that day. Please pick another check-in date.", 'No es posible hacer check-in ese día. Elige otra fecha de llegada.'],
    closed_checkout: ["Check-out isn't possible on that day. Please pick another check-out date.", 'No es posible hacer check-out ese día. Elige otra fecha de salida.'],
    too_long: ['Nightly booking is for stays of up to 29 nights. Staying a month or more? Apply for a monthly lease instead.', 'La reserva por noche es para estancias de hasta 29 noches. ¿Te quedas un mes o más? Solicita un arrendamiento mensual.'],
    too_many_guests: ['Too many guests for this unit.', 'Demasiados huéspedes para esta unidad.'],
    invalid_dates: ['Please choose valid dates.', 'Elige fechas válidas.'],
    invalid_details: ['Please check your details and try again.', 'Revisa tus datos e inténtalo de nuevo.'],
  };
  const fallback: [string, string] = ["Online booking isn't available right now. Please contact us or book on Airbnb.", 'La reserva en línea no está disponible ahora. Contáctanos o reserva en Airbnb.'];
  return (messages[code] ?? fallback)[es ? 1 : 0];
}

export default function StayBookingModal({ unit, onClose }: { unit: Unit; onClose: () => void }) {
  const { t, language } = useLanguage();
  const es = language === 'es';
  const { rate } = useUsdToMxn();
  const today = oaxacaToday();

  const [form, setForm] = useState({ checkIn: '', checkOut: '', guests: 1, name: '', email: '', phone: '', notes: '' });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const datesReady = form.checkIn && form.checkOut && nightsBetween(form.checkIn, form.checkOut) > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !submitting) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  // Keep check-out after check-in.
  useEffect(() => {
    if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) set('checkOut', '');
  }, [form.checkIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live price from the server whenever the dates change.
  useEffect(() => {
    setQuote(null);
    if (!datesReady) return;
    let cancelled = false;
    setQuoting(true);
    const timer = setTimeout(async () => {
      const res = await fetch('/api/stays/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitSlug: unit.slug, checkIn: form.checkIn, checkOut: form.checkOut }),
      }).catch(() => null);
      const data: Quote = res ? await res.json().catch(() => ({ ok: false, error: 'error' })) : { ok: false, error: 'error' };
      if (!cancelled) {
        setQuote(data);
        setQuoting(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); setQuoting(false); };
  }, [unit.slug, form.checkIn, form.checkOut, datesReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishableKey) {
      setError(errorMessage('not_configured', es));
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/stays/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitSlug: unit.slug, ...form, notes: form.notes || undefined, language }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    setSubmitting(false);
    if (data?.ok && data.clientSecret) {
      setClientSecret(data.clientSecret);
    } else {
      if (data && !data.ok && data.error in { unavailable: 1, booked: 1, min_stay: 1 }) setQuote(data);
      setError(errorMessage(data?.error ?? 'error', es, data?.minStay));
    }
  };

  const charged = (amount: number, currency: string) =>
    `$${amount.toLocaleString(es ? 'es-MX' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  const approx = (amount: number, currency: string) => {
    const shown = formatMoney(amount, currency, language, rate);
    return shown && !shown.endsWith(currency) ? ` (≈ ${shown})` : '';
  };

  const unitName = t(`units.items.${unit.slug}.name`);
  const nights = quote?.ok ? quote.nights.length : 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => !submitting && onClose()}>
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between bg-gradient-to-r from-terracotta to-[#8d4a3f] p-5 text-white">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{es ? 'Reserva directa' : 'Book directly'}</p>
            <h2 className="text-xl font-bold">{unitName}</h2>
          </div>
          <button onClick={onClose} disabled={submitting} className="rounded-full p-2 transition-colors hover:bg-white/20" aria-label={es ? 'Cerrar' : 'Close'}>
            <span className="text-xl">✕</span>
          </button>
        </div>

        {clientSecret ? (
          <div className="p-4 sm:p-6">
            <button onClick={() => setClientSecret(null)} className="mb-3 text-sm font-semibold text-terracotta hover:underline">
              ← {es ? 'Cambiar datos' : 'Edit details'}
            </button>
            <EmbeddedCheckoutProvider stripe={getStripePromise()} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Llegada' : 'Check-in'} <span className="text-red-600">*</span></label>
                <DateInput value={form.checkIn} onChange={(v) => set('checkIn', v)} language={language} min={today} max={addDays(today, 365)} required disabled={submitting} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Salida' : 'Check-out'} <span className="text-red-600">*</span></label>
                <DateInput
                  value={form.checkOut}
                  onChange={(v) => set('checkOut', v)}
                  language={language}
                  min={form.checkIn ? addDays(form.checkIn, 1) : addDays(today, 1)}
                  max={addDays(form.checkIn || today, 90)}
                  required
                  disabled={submitting}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Huéspedes' : 'Guests'}</label>
                <select value={form.guests} onChange={(e) => set('guests', parseInt(e.target.value))} disabled={submitting} className={inputClass}>
                  {Array.from({ length: unit.capacity }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Teléfono / WhatsApp' : 'Phone / WhatsApp'} <span className="text-red-600">*</span></label>
                <PhoneInput value={form.phone} onChange={(v) => set('phone', v)} variant="modal" required disabled={submitting} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Nombre completo' : 'Full name'} <span className="text-red-600">*</span></label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required minLength={2} maxLength={100} disabled={submitting} className={inputClass} autoComplete="name" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Correo electrónico' : 'Email'} <span className="text-red-600">*</span></label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required maxLength={200} disabled={submitting} className={inputClass} autoComplete="email" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold">{es ? 'Notas (opcional)' : 'Notes (optional)'}</label>
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} maxLength={450} rows={2} disabled={submitting} className={`${inputClass} resize-none`} placeholder={es ? 'Hora de llegada, peticiones, etc.' : 'Arrival time, requests, etc.'} />
              </div>
            </div>

            {/* Price */}
            <div className="rounded-lg border border-terracotta/30 bg-[#fdf6f3] p-4 text-sm">
              {!datesReady ? (
                <p className="text-slate-500">{es ? 'Elige tus fechas para ver el precio.' : 'Choose your dates to see the price.'}</p>
              ) : quoting || !quote ? (
                <p className="text-slate-500">{es ? 'Calculando precio…' : 'Checking price…'}</p>
              ) : quote.ok ? (
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>{nights} {es ? (nights === 1 ? 'noche' : 'noches') : (nights === 1 ? 'night' : 'nights')}</span>
                    <span>{es ? 'promedio' : 'avg.'} {charged(quote.total / nights, quote.currency)}{es ? '/noche' : '/night'}</span>
                  </div>
                  <div className="flex justify-between border-t border-terracotta/20 pt-2 font-semibold">
                    <span>Total</span>
                    <span>{charged(quote.total, quote.currency)}<span className="font-normal text-slate-500">{approx(quote.total, quote.currency)}</span></span>
                  </div>
                  <p className="pt-1 text-xs text-slate-500">
                    {es
                      ? `Precio en vivo por noche. Se cobra en ${quote.currency} con tarjeta mediante Stripe.`
                      : `Live nightly prices. Charged in ${quote.currency} by card via Stripe.`}
                  </p>
                </div>
              ) : (
                <p className="text-red-700">{errorMessage(quote.error, es, quote.minStay)}</p>
              )}
            </div>

            {error && (
              <div className="rounded border-l-4 border-red-500 bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !quote?.ok}
              className="w-full rounded-full bg-terracotta px-6 py-3 font-semibold text-white transition-colors hover:bg-[#b55e47] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? (es ? 'Preparando el pago…' : 'Preparing payment…')
                : quote?.ok
                  ? `${es ? 'Continuar al pago' : 'Continue to payment'} · ${charged(quote.total, quote.currency)}`
                  : (es ? 'Continuar al pago' : 'Continue to payment')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
