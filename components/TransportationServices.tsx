'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import useUsdToMxn from '@/hooks/useUsdToMxn';
import { TRANSPORT_DESTINATIONS, TransportDestination, oneWayPriceMxn, tripPriceMxn } from '@/lib/transportPricing';
import TransportQuoteModal from './TransportQuoteModal';
import TransportBookingModal from './TransportBookingModal';

export default function TransportationServices() {
  const { language } = useLanguage();
  const es = language === 'es';
  const lang = es ? 'es' : 'en';
  const { rate } = useUsdToMxn();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [bookingDest, setBookingDest] = useState<TransportDestination | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [cancelled, setCancelled] = useState(false);

  // Stripe sends the visitor back with ?payment=cancelled if they abandon checkout.
  useEffect(() => {
    setCancelled(new URLSearchParams(window.location.search).get('payment') === 'cancelled');
  }, []);

  const mxn = (amount: number) => `$${amount.toLocaleString(es ? 'es-MX' : 'en-US')} MXN`;
  const usd = (amount: number) => (rate > 0 ? `≈ $${Math.floor(amount / rate).toLocaleString('en-US')} USD` : '');

  const PriceBlock = ({ dest, compact }: { dest: TransportDestination; compact?: boolean }) => {
    const oneWay = oneWayPriceMxn(dest);
    const roundTrip = tripPriceMxn(dest, true);
    return (
      <div className={compact ? '' : 'space-y-1'}>
        <p className={`font-bold text-garden ${compact ? '' : 'text-2xl'}`}>
          {mxn(oneWay)} <span className="text-sm font-normal text-slate-500">{es ? 'ida' : 'one way'}</span>
        </p>
        {!es && <p className="text-xs text-slate-500">{usd(oneWay)}</p>}
        <p className="text-sm text-slate-600">
          {es ? 'Ida y vuelta' : 'Round trip'}: <span className="font-semibold">{mxn(roundTrip)}</span>
          {!es && rate > 0 && <span className="text-xs text-slate-500"> ({usd(roundTrip)})</span>}
        </p>
      </div>
    );
  };

  return (
    <div className="relative bg-white py-16 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            🚗 {es ? 'Servicio de Transporte Privado' : 'Private Driving Services'}
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {es
              ? 'Traslados privados y confiables desde La Casa Oaxaca en San Felipe del Agua a los destinos más populares de Oaxaca. Precios en pesos mexicanos para un sedán estándar, servicio puerta a puerta. Reserva y paga en línea con tarjeta de débito o crédito.'
              : "Reliable private transfers from La Casa Oaxaca in San Felipe del Agua to Oaxaca's most popular destinations. Prices are in Mexican pesos for a standard sedan with door-to-door service. Book and pay online with any debit or credit card."}
          </p>
        </div>

        {cancelled && (
          <div className="mx-auto mb-8 max-w-3xl rounded-r-lg border-l-4 border-amber-500 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              {es ? 'El pago fue cancelado — no se realizó ningún cargo.' : 'Payment was cancelled — you have not been charged.'}
            </p>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          {(['cards', 'table'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                viewMode === mode ? 'bg-garden text-white shadow-lg' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mode === 'cards' ? (es ? 'Tarjetas' : 'Grid View') : (es ? 'Tabla' : 'Table View')}
            </button>
          ))}
        </div>

        {/* Cards Layout */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {TRANSPORT_DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                className="group flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 hover:border-garden/50"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{dest.name[lang]}</h3>
                    <p className="text-sm text-slate-600">⏱️ {dest.duration[lang]} {es ? 'de ida' : 'one way'}</p>
                  </div>
                  <span className="text-3xl">{dest.emoji}</span>
                </div>

                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{dest.description[lang]}</p>

                <div className="mt-auto bg-white rounded-lg p-4 mb-4 border border-garden/20">
                  <PriceBlock dest={dest} />
                </div>

                <button
                  onClick={() => setBookingDest(dest)}
                  className="w-full bg-garden text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#3c5a35] transition-colors duration-200 text-sm"
                >
                  💳 {es ? 'Reservar y pagar con tarjeta' : 'Book & pay by card'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Table Layout */}
        {viewMode === 'table' && (
          <div className="mb-12 overflow-x-auto rounded-xl shadow-md border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-garden to-[#3c5a35] text-white">
                  <th className="px-6 py-4 text-left font-semibold">{es ? 'Destino' : 'Destination'}</th>
                  <th className="px-6 py-4 text-left font-semibold">{es ? 'Precio' : 'Price'}</th>
                  <th className="px-6 py-4 text-left font-semibold">{es ? 'Duración (ida)' : 'One-Way Duration'}</th>
                  <th className="px-6 py-4 text-center font-semibold">{es ? 'Reservar' : 'Book'}</th>
                </tr>
              </thead>
              <tbody>
                {TRANSPORT_DESTINATIONS.map((dest, idx) => (
                  <tr
                    key={dest.id}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dest.emoji}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{dest.name[lang]}</p>
                          <p className="text-sm text-slate-600 hidden sm:block">{dest.description[lang]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriceBlock dest={dest} compact />
                    </td>
                    <td className="px-6 py-4 text-slate-700">{dest.duration[lang]}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setBookingDest(dest)}
                        className="inline-block bg-garden text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#3c5a35] transition-colors duration-200 text-sm whitespace-nowrap"
                      >
                        💳 {es ? 'Reservar' : 'Book'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#f5f3f0] to-[#f0f4f1] rounded-xl p-8 text-center border border-garden/20 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{es ? '¿Necesitas un plan de viaje personalizado?' : 'Need a Custom Travel Plan?'}</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            {es
              ? 'Tours con varias paradas, excursiones de día completo y arreglos para grupos están disponibles. Envía tu solicitud y te daremos una cotización personalizada en 24 horas.'
              : "Multi-stop tours, full-day excursions, and special group arrangements are available. Submit a custom request and we'll provide a personalized quote within 24 hours."}
          </p>
          <button
            onClick={() => setQuoteModalOpen(true)}
            className="inline-block bg-garden hover:bg-[#3c5a35] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            {es ? 'Solicitar cotización' : 'Request a Custom Quote'}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg">
          <p className="text-sm text-slate-700">
            <span className="font-semibold block mb-2">📋 {es ? 'Aviso importante:' : 'Important Notice:'}</span>
            {es
              ? 'Los precios están en pesos mexicanos (MXN) y se basan en la distancia desde la propiedad. El pago se realiza de forma segura con tarjeta mediante Stripe. Los viajes de ida y vuelta tienen 10% de descuento. Tiempo de espera, paradas especiales y vehículos premium se cotizan por separado.'
              : "Prices are in Mexican pesos (MXN) and based on distance from the property. USD amounts are estimates at today's exchange rate; your card is charged in MXN and your bank sets the final conversion. Payment is processed securely by Stripe. Round trips are 10% off. Waiting time, special stops, and premium vehicles are quoted separately."}
          </p>
        </div>
      </div>

      <TransportBookingModal destination={bookingDest} onClose={() => setBookingDest(null)} />
      <TransportQuoteModal open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
    </div>
  );
}
