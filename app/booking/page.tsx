'use client';

import React, { useState, useEffect } from 'react';
import TransportationAddons from '@/components/TransportationAddons';
import IdVerification from '@/components/IdVerification';
import useUsdToMxn from '@/hooks/useUsdToMxn';

interface Unit {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Booking {
  units: string[];
  dateRange: DateRange;
  guests: number;
  transportationTotal: number;
}

/**
 * BookingPage Component
 *
 * Comprehensive booking flow featuring:
 * - Unit selection (Bungalow 1, Bungalow 2, One Bedroom)
 * - Interactive calendar with availability
 * - Guest count selector
 * - Pricing breakdown with extended-stay discounts
 * - Transportation add-ons with dynamic pricing
 * - ID verification step
 * - Real-time USD to MXN conversion
 * - Luxurious Oaxaca-inspired design
 */

const UNITS: Unit[] = [
  { id: 'bungalow1', name: 'Bungalow 1', basePrice: 120, maxGuests: 4 },
  { id: 'bungalow2', name: 'Bungalow 2', basePrice: 120, maxGuests: 4 },
  { id: 'bedroom', name: 'One Bedroom (Main Residence)', basePrice: 80, maxGuests: 2 },
];

// Mock availability data - replace with real channel manager integration
const MOCK_AVAILABILITY: Record<string, boolean[]> = {
  bungalow1: Array(30).fill(true).map(() => Math.random() > 0.3),
  bungalow2: Array(30).fill(true).map(() => Math.random() > 0.3),
  bedroom: Array(30).fill(true).map(() => Math.random() > 0.3),
};

const BookingPage: React.FC = () => {
  const {
    convertToMxn,
    formatCurrency,
    loading: rateLoading,
  } = useUsdToMxn();

  // Booking state
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [guests, setGuests] = useState(1);
  const [transportationTotal, setTransportationTotal] = useState(0);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // UI state
  const [visibleStep, setVisibleStep] = useState<'units' | 'dates' | 'verification' | 'summary'>('units');

  // Calculate number of nights
  const calculateNights = (): number => {
    if (!dateRange.start || !dateRange.end) return 0;
    const diffTime = dateRange.end.getTime() - dateRange.start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Calculate extended-stay discount
  const getDiscountRate = (): number => {
    const nights = calculateNights();
    if (nights >= 30) return 0.15; // 15% off for 30+ nights
    if (nights >= 14) return 0.1; // 10% off for 14+ nights
    if (nights >= 7) return 0.05; // 5% off for 7+ nights
    return 0;
  };

  // Calculate nightly rate with unit averaging
  const getAverageNightlyRate = (): number => {
    if (selectedUnits.size === 0) return 0;
    let total = 0;

    selectedUnits.forEach((unitId) => {
      const unit = UNITS.find((u) => u.id === unitId);
      if (unit) {
        total += unit.basePrice;
      }
    });

    return total / selectedUnits.size;
  };

  // Calculate total price
  const calculateTotalPrice = (): number => {
    const nights = calculateNights();
    if (nights === 0) return 0;

    const nightlyRate = getAverageNightlyRate();
    const discountRate = getDiscountRate();
    const subtotal = nightlyRate * nights;
    const discount = subtotal * discountRate;
    const afterDiscount = subtotal - discount;
    const withTransport = afterDiscount + transportationTotal;

    return Math.round(withTransport * 100) / 100;
  };

  // Handle unit selection
  const handleUnitToggle = (unitId: string) => {
    const newSelected = new Set(selectedUnits);
    if (newSelected.has(unitId)) {
      newSelected.delete(unitId);
    } else {
      newSelected.add(unitId);
    }
    setSelectedUnits(newSelected);
  };

  // Calendar day click handler
  const handleDayClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (!dateRange.start) {
      setDateRange({ start: selectedDate, end: null });
    } else if (!dateRange.end) {
      if (selectedDate > dateRange.start) {
        setDateRange({ ...dateRange, end: selectedDate });
      } else {
        setDateRange({ start: selectedDate, end: null });
      }
    } else {
      setDateRange({ start: selectedDate, end: null });
    }
  };

  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isStart = dateRange.start && date.toDateString() === dateRange.start.toDateString();
      const isEnd = dateRange.end && date.toDateString() === dateRange.end.toDateString();
      const isInRange =
        dateRange.start &&
        dateRange.end &&
        date > dateRange.start &&
        date < dateRange.end;

      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`p-2 text-sm rounded-lg font-semibold transition-all ${
            isStart || isEnd
              ? 'bg-green-600 text-white'
              : isInRange
              ? 'bg-green-100 text-green-800'
              : 'hover:bg-amber-100 text-amber-900'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const nights = calculateNights();
  const discountRate = getDiscountRate();
  const nightlyRate = getAverageNightlyRate();
  const subtotal = nightlyRate * nights;
  const discount = subtotal * discountRate;
  const afterDiscount = subtotal - discount;
  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-green-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold text-amber-900 mb-2">🏡 La Casa Booking</h1>
          <p className="text-xl text-amber-800">
            Resort accommodation in San Felipe del Agua, Oaxaca
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 md:gap-4 my-8 flex-wrap">
          {[
            { id: 'units', label: 'Select Units', icon: '🏠' },
            { id: 'dates', label: 'Choose Dates', icon: '📅' },
            { id: 'verification', label: 'Verify ID', icon: '🆔' },
            { id: 'summary', label: 'Review', icon: '✅' },
          ].map((step, idx, arr) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setVisibleStep(step.id as never)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold transition-all ${
                  visibleStep === step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-amber-900 hover:bg-amber-100'
                }`}
              >
                <span>{step.icon}</span>
                <span className="hidden md:inline">{step.label}</span>
              </button>
              {idx < arr.length - 1 && (
                <div className="text-2xl text-amber-400">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Step 1: Unit Selection */}
          {visibleStep === 'units' && (
            <section className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-green-600">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">🏠 Select Your Units</h2>
              <p className="text-amber-800 mb-6">
                Choose one or more units for your stay. Each unit is priced individually.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {UNITS.map((unit) => {
                  const isSelected = selectedUnits.has(unit.id);
                  return (
                    <button
                      key={unit.id}
                      onClick={() => handleUnitToggle(unit.id)}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-green-600 bg-green-50 shadow-md'
                          : 'border-orange-200 bg-orange-50 hover:border-green-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleUnitToggle(unit.id)}
                          className="w-5 h-5 mt-1 rounded border-amber-300 text-green-600 cursor-pointer"
                        />
                        <div>
                          <h3 className="font-bold text-amber-900 text-lg">
                            {unit.name}
                          </h3>
                          <p className="text-sm text-amber-700 mt-1">
                            Up to {unit.maxGuests} guests
                          </p>
                          <p className="text-lg font-semibold text-green-700 mt-2">
                            ${unit.basePrice}/night
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>


              {selectedUnits.size > 0 && (
                <button
                  onClick={() => setVisibleStep('dates')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Continue to Dates →
                </button>
              )}
            </section>
          )}

          {/* Step 2: Date & Guest Selection */}
          {visibleStep === 'dates' && (
            <section className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">📅 Select Dates & Guests</h2>

              {/* Calendar */}
              <div className="mb-8 bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    ← Prev
                  </button>
                  <h3 className="text-lg font-bold text-amber-900">
                    {currentMonth.toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Next →
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center font-bold text-amber-900 text-sm py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
              </div>

              {/* Date Range Display */}
              {dateRange.start && (
                <div className="bg-green-100 border border-green-500 rounded-lg p-4 mb-6">
                  <p className="text-green-900 font-semibold">
                    📍 Check-in:{' '}
                    <span className="text-lg">
                      {dateRange.start.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {dateRange.end && (
                      <>
                        {' '}
                        | Check-out:{' '}
                        <span className="text-lg">
                          {dateRange.end.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {' '}
                        | <span className="text-lg font-bold">{nights} nights</span>
                      </>
                    )}
                  </p>
                </div>
              )}

              {/* Guest Count */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-amber-900 mb-3">
                  👥 Number of Guests
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="px-4 py-2 bg-amber-200 hover:bg-amber-300 rounded font-bold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-amber-900 min-w-12 text-center">
                    {guests}
                  </span>
                  <button
                    onClick={() => setGuests(guests + 1)}
                    className="px-4 py-2 bg-amber-200 hover:bg-amber-300 rounded font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setVisibleStep('units')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setVisibleStep('verification')}
                  disabled={!dateRange.end}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Verify ID →
                </button>
              </div>
            </section>
          )}

          {/* Step 3: ID Verification */}
          {visibleStep === 'verification' && (
            <section className="bg-white rounded-xl shadow-lg p-8">
              <IdVerification
                onVerificationComplete={(verified) => {
                  setVerificationComplete(verified);
                  if (verified) {
                    setTimeout(() => setVisibleStep('summary'), 1500);
                  }
                }}
              />
            </section>
          )}

          {/* Step 4: Summary & Confirmation */}
          {visibleStep === 'summary' && (
            <section className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-gold">
              <h2 className="text-3xl font-bold text-amber-900 mb-6">✅ Review Your Booking</h2>

              {/* Booking Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-xs text-blue-700 font-semibold mb-1">UNITS</p>
                  <p className="text-lg font-bold text-blue-900">
                    {selectedUnits.size > 0 ? selectedUnits.size : '−'} Unit{selectedUnits.size !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <p className="text-xs text-green-700 font-semibold mb-1">NIGHTS</p>
                  <p className="text-lg font-bold text-green-900">{nights}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-xs text-purple-700 font-semibold mb-1">GUESTS</p>
                  <p className="text-lg font-bold text-purple-900">{guests}</p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-bold text-amber-900 mb-4">Pricing Breakdown</h3>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-amber-800">
                    <span>Nightly Rate × {nights} Nights</span>
                    <span>${(nightlyRate * nights).toFixed(2)}</span>
                  </div>

                  {discountRate > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Extended Stay Discount ({Math.round(discountRate * 100)}% off)</span>
                      <span>−${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-amber-300 pt-2 flex justify-between font-semibold text-amber-900">
                    <span>Accommodation Subtotal</span>
                    <span>${afterDiscount.toFixed(2)}</span>
                  </div>

                  {transportationTotal > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Transportation Add-ons</span>
                      <span>${transportationTotal.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-amber-600 pt-4 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-amber-700 mb-1">TOTAL</p>
                    <p className="text-2xl font-bold text-amber-900">
                      ${totalPrice.toFixed(2)} USD
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-700 mb-1">≈ MXN</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {convertToMxn(totalPrice).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setVisibleStep('dates')}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg transition-colors"
                >
                  ← Edit Booking
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
                  ✓ Confirm Booking
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Pricing Summary & Transportation */}
        <div className="space-y-6">
          {/* Pricing Sticky Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border-t-4 border-green-600">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Price Summary</h3>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-amber-800">
                <span>Accommodation</span>
                <span>${afterDiscount.toFixed(2)}</span>
              </div>
              {transportationTotal > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>Transportation</span>
                  <span>${transportationTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-amber-200 pt-3 flex justify-between font-bold text-lg text-amber-900">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="text-right text-sm text-amber-700">
                ≈ {convertToMxn(totalPrice).toLocaleString('es-MX')} MXN
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-amber-50 rounded-lg p-4 space-y-2 text-sm">
              <div>
                <p className="text-xs text-amber-600 font-semibold">Units Selected</p>
                <p className="text-amber-900 font-bold">{selectedUnits.size || '−'}</p>
              </div>
              <div>
                <p className="text-xs text-amber-600 font-semibold">Duration</p>
                <p className="text-amber-900 font-bold">{nights || '−'} nights</p>
              </div>
              {discountRate > 0 && (
                <div className="bg-green-100 -mx-4 -mb-4 p-3 mt-4">
                  <p className="text-green-700 font-bold">
                    {Math.round(discountRate * 100)}% Extended Stay Discount! 🎉
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Transportation Add-ons Card */}
          {visibleStep === 'dates' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-green-500"></div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-amber-900 mb-4">🚗 Quick Add Transportation</h3>
                <div className="space-y-2 text-sm mb-4">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-amber-50">
                    <input type="checkbox" className="rounded" />
                    <span className="text-amber-800">Oaxaca City Center ($45)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-amber-50">
                    <input type="checkbox" className="rounded" />
                    <span className="text-amber-800">Monte Albán ($75)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-amber-50">
                    <input type="checkbox" className="rounded" />
                    <span className="text-amber-800">Mitla + Hierve el Agua ($150)</span>
                  </label>
                </div>
                <p className="text-xs text-amber-700 text-center py-2">
                  Full transportation section in summary view
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Transportation Add-ons Section (in dates or summary view) */}
      {(visibleStep === 'dates' || visibleStep === 'summary') && (
        <div className="max-w-6xl mx-auto mt-8 lg:col-span-2">
          <TransportationAddons
            onAddonsChange={(_addons, total) => {
              setTransportationTotal(total);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BookingPage;
