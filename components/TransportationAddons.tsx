import React, { useState, useEffect } from 'react';
import useUsdToMxn from '@/hooks/useUsdToMxn';

interface TransportationOption {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
  type: 'roundtrip' | 'oneway' | 'fullday';
}

interface TransportationAddonsProps {
  onAddonsChange?: (selectedAddons: TransportationOption[], totalUsd: number) => void;
}

const TRANSPORTATION_OPTIONS: TransportationOption[] = [
  {
    id: 'zocalo',
    name: 'Oaxaca City Center (Zócalo)',
    description: 'Private jeep/SUV round-trip',
    priceUsd: 45,
    type: 'roundtrip',
  },
  {
    id: 'airport-oneway',
    name: 'Oaxaca Airport (OAX)',
    description: 'One-way transfer',
    priceUsd: 55,
    type: 'oneway',
  },
  {
    id: 'monteAlban',
    name: 'Monte Albán',
    description: 'Round-trip with waiting time',
    priceUsd: 75,
    type: 'roundtrip',
  },
  {
    id: 'mitlaHierve',
    name: 'Mitla + Hierve el Agua',
    description: 'Full-day tour (up to 5 passengers)',
    priceUsd: 150,
    type: 'fullday',
  },
  {
    id: 'teotitlanMitla',
    name: 'Teotitlán del Valle + Mitla',
    description: 'Day trip (up to 5 passengers)',
    priceUsd: 130,
    type: 'fullday',
  },
  {
    id: 'airport-latenight',
    name: 'Airport Late-Night Surcharge',
    description: 'Add to airport transfer after 11 PM',
    priceUsd: 15,
    type: 'oneway',
  },
];

/**
 * TransportationAddons Component
 * 
 * Displays available transportation services with:
 * - Checkbox selection for multiple add-ons
 * - Live USD to MXN conversion (rounded down to nearest 10 MXN)
 * - Real-time price calculation and display
 * - Luxurious, responsive design with Oaxaca-inspired colors
 */
const TransportationAddons: React.FC<TransportationAddonsProps> = ({
  onAddonsChange,
}) => {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const { convertToMxn, formatCurrency, rate, loading } = useUsdToMxn();

  // Calculate total USD price
  const calculateTotalPrice = (): number => {
    let total = 0;
    selectedAddons.forEach((addonId) => {
      const addon = TRANSPORTATION_OPTIONS.find((o) => o.id === addonId);
      if (addon) {
        total += addon.priceUsd;
      }
    });

    return total;
  };

  // Handle checkbox change
  const handleAddonToggle = (addonId: string) => {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
  };

  // Notify parent component when addons change
  useEffect(() => {
    if (onAddonsChange) {
      const selectedList = TRANSPORTATION_OPTIONS.filter((opt) =>
        selectedAddons.has(opt.id)
      );
      const totalPrice = calculateTotalPrice();
      onAddonsChange(selectedList, totalPrice);
    }
  }, [selectedAddons]);

  const totalPrice = calculateTotalPrice();

  return (
    <section className="py-8 px-4 md:px-8 bg-gradient-to-b from-amber-50 via-orange-50 to-white rounded-lg border border-orange-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-amber-900 mb-2">
          🚗 Transportation Add-ons
        </h2>
        <p className="text-amber-800">
          Explore Oaxaca's treasures with our curated tours. Up to 5 passengers per vehicle.
        </p>
        {loading && (
          <p className="text-sm text-amber-600 mt-2">Fetching current exchange rates...</p>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {TRANSPORTATION_OPTIONS.map((option) => {
          const isSelected = selectedAddons.has(option.id);
          const basePriceUsd = option.priceUsd;
          const displayPriceUsd = option.priceUsd;
          const mxnPrice = convertToMxn(displayPriceUsd);

          return (
            <div
              key={option.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-orange-200 bg-white hover:border-orange-400'
              }`}
              onClick={() => handleAddonToggle(option.id)}
            >
              {/* Checkbox and Title */}
              <div className="flex items-start gap-3 mb-2">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={isSelected}
                  onChange={() => handleAddonToggle(option.id)}
                  className="w-5 h-5 mt-1 rounded border-amber-300 text-green-600 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    htmlFor={option.id}
                    className="text-lg font-semibold text-amber-900 cursor-pointer block"
                  >
                    {option.name}
                  </label>
                  <p className="text-sm text-amber-700 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-3 pt-3 border-t border-orange-100">
                <div className="text-sm text-amber-600">
                  {basePriceUsd !== displayPriceUsd ? (
                    <>
                      <span className="line-through">
                        ${basePriceUsd.toFixed(2)}
                      </span>
                      {' '}
                      <span className="text-green-600 font-semibold">
                        ${displayPriceUsd.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">${displayPriceUsd.toFixed(2)}</span>
                  )}
                  {' '}USD
                </div>
                <div className="text-sm text-amber-600 font-medium">
                  {mxnPrice.toLocaleString('es-MX')} MXN
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Summary */}
      {selectedAddons.size > 0 && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-l-4 border-green-600 p-4 rounded">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-sm text-green-700 font-semibold">
                Total Transportation: {selectedAddons.size} item(s) selected
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-right text-sm md:text-base text-green-800">
                <span className="font-bold text-lg text-green-900">
                  ${totalPrice.toFixed(2)}
                </span>
                {' '}
                USD
              </p>
              <p className="text-right text-sm md:text-base font-semibold text-green-800">
                ≈ {convertToMxn(totalPrice).toLocaleString('es-MX')} MXN
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedAddons.size === 0 && (
        <div className="text-center py-8 text-amber-700">
          <p className="text-sm md:text-base">
            Select transportation services to add them to your booking
          </p>
        </div>
      )}
    </section>
  );
};

export default TransportationAddons;
