'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { convertToMXN } from '@/lib/currency';
import TransportQuoteModal from './TransportQuoteModal';

interface Destination {
  id: string;
  name: string;
  priceMin: number;
  priceMax: number;
  duration: string;
  description: string;
  icon: string;
}

const destinations: Destination[] = [
  {
    id: 'airport',
    name: 'Airport (OAX)',
    priceMin: 50,
    priceMax: 50,
    duration: '15–25 min',
    description: 'Xoxocotlán International Airport – convenient transfers for arrivals and departures.',
    icon: '✈️',
  },
  {
    id: 'elllano',
    name: 'El Llano (Parque Juárez)',
    priceMin: 7,
    priceMax: 7,
    duration: '10–20 min',
    description: 'Peaceful park offering scenic walks and cultural events.',
    icon: '🌳',
  },
  {
    id: 'zocalo',
    name: 'Zócalo (Historic Main Square)',
    priceMin: 7,
    priceMax: 7,
    duration: '12–25 min',
    description: 'Heart of Oaxaca city – shops, cafés, and cultural landmarks.',
    icon: '🏛️',
  },
  {
    id: 'monteAlban',
    name: 'Monte Albán',
    priceMin: 80,
    priceMax: 80,
    duration: '20–35 min',
    description: 'UNESCO World Heritage archaeological site with ancient ruins and panoramic views.',
    icon: '🏺',
  },
  {
    id: 'adobusStation',
    name: 'ADO Bus Station',
    priceMin: 7,
    priceMax: 7,
    duration: '15–25 min',
    description: 'Main intercity bus terminal for departures to other Mexican destinations.',
    icon: '🚌',
  },
  {
    id: 'hierveAgua',
    name: 'Hierve el Agua (Petrified Waterfalls)',
    priceMin: 200,
    priceMax: 200,
    duration: '1.5–2.5 hrs',
    description: 'Stunning natural mineral pools – full-day recommended for the best experience.',
    icon: '💧',
  },
  {
    id: 'arbolTule',
    name: 'Árbol del Tule (Tree of Tule)',
    priceMin: 10,
    priceMax: 10,
    duration: '20–35 min',
    description: 'Historic colonial town with the world\'s widest tree – a natural wonder.',
    icon: '🌲',
  },
  {
    id: 'mitla',
    name: 'Mitla',
    priceMin: 80,
    priceMax: 80,
    duration: '50–75 min',
    description: 'Archaeological site famous for intricate stone mosaics and pre-Hispanic architecture.',
    icon: '🏺',
  },
  {
    id: 'teotitlan',
    name: 'Teotitlán del Valle',
    priceMin: 100,
    priceMax: 100,
    duration: '45–60 min',
    description: 'Authentic Zapotec village renowned for handwoven textiles and traditional crafts.',
    icon: '🧵',
  },
  {
    id: 'artisans',
    name: 'San Bartolo Coyotepec & San Martín Tilcajete',
    priceMin: 80,
    priceMax: 80,
    duration: '25–40 min',
    description: 'Twin artisan villages famous for black pottery and colorful alebrijes (wooden figurines).',
    icon: '🎨',
  },
];

export default function TransportationServices() {
  const { t, language } = useLanguage();
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Helper function to get price with currency symbol
  const getPrice = (priceUSD: number) => {
    if (language === 'es') {
      return `$${convertToMXN(priceUSD)}`;
    }
    return `$${priceUSD.toFixed(2)}`;
  };

  // Helper function to get price range with currency symbol
  const getPriceRange = (priceMin: number, priceMax: number) => {
    if (priceMin === priceMax) {
      return getPrice(priceMin);
    }
    if (language === 'es') {
      const minMXN = convertToMXN(priceMin);
      const maxMXN = convertToMXN(priceMax);
      return `$${minMXN} – $${maxMXN}`;
    }
    return `$${priceMin.toFixed(2)} – $${priceMax.toFixed(2)}`;
  };

  return (
    <div className="relative bg-white py-16 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            🚗 Private Driving Services – Round-Trip Estimates
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Reliable private transfers from your accommodation in La Chigulera to Oaxaca's most popular destinations. 
            Prices are in USD for a standard sedan (1–4 passengers) and include door-to-door service. Rates are estimates 
            and subject to confirmation based on date, time, vehicle type, and waiting duration. Custom quotes are available upon request.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
              viewMode === 'cards'
                ? 'bg-garden text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-garden text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Table View
          </button>
        </div>

        {/* Cards Layout */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {destinations.map((dest) => (
              <div
                key={dest.id}
                className="group bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-slate-200 hover:border-garden/50"
              >
                {/* Icon & Title */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{dest.name}</h3>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      ⏱️ {dest.duration} one-way
                    </p>
                  </div>
                  <span className="text-3xl">{dest.icon}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{dest.description}</p>

                {/* Price Section */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-garden/20">
                  <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
                    Round-Trip Price {language === 'es' ? '(MXN)' : '(USD)'}
                  </p>
                  <p className="text-2xl font-bold text-garden">
                    {getPriceRange(dest.priceMin, dest.priceMax)}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="w-full bg-garden text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#3c5a35] transition-colors duration-200 text-sm"
                >
                  Request Quote
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
                  <th className="px-6 py-4 text-left font-semibold">Destination</th>
                  <th className="px-6 py-4 text-left font-semibold">Round-Trip Price</th>
                  <th className="px-6 py-4 text-left font-semibold">One-Way Duration</th>
                  <th className="px-6 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest, idx) => (
                  <tr
                    key={dest.id}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dest.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{dest.name}</p>
                          <p className="text-sm text-slate-600 hidden sm:block">{dest.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-garden">
                      {getPriceRange(dest.priceMin, dest.priceMax)}
                      <div className="text-xs text-slate-600 font-normal">
                        {language === 'es' ? '(MXN)' : '(USD)'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{dest.duration}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setQuoteModalOpen(true)}
                        className="inline-block bg-garden text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#3c5a35] transition-colors duration-200 text-sm whitespace-nowrap"
                      >
                        Quote
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
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need a Custom Travel Plan?</h2>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            Multi-stop tours, full-day excursions, and special group arrangements are available. 
            Submit a custom request and we'll provide a personalized quote within 24 hours.
          </p>
          <button
            onClick={() => setQuoteModalOpen(true)}
            className="inline-block bg-garden hover:bg-[#3c5a35] text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Request a Custom Quote
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-r-lg">
          <p className="text-sm text-slate-700">
            <span className="font-semibold block mb-2">📋 Important Notice:</span>
            All prices are estimates in USD and may vary. Final rates will be confirmed upon booking. 
            Full-day services and multi-stop tours are available on request. Prices include standard vehicle; 
            premium vehicles available at additional cost. Waiting time, special stops, and group discounts can be arranged.
          </p>
        </div>
      </div>

      {/* Modal */}
      <TransportQuoteModal open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />
    </div>
  );
}
