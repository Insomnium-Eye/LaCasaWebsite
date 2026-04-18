import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPrice } from '../lib/currency';
import useUsdToMxn from '../hooks/useUsdToMxn';

interface EscrowModalProps {
  total: number;
  nights: number;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const EscrowModal: React.FC<EscrowModalProps> = ({ total, nights, onClose, onPaymentComplete }) => {
  const { t, language } = useLanguage();
  const { formatCurrency } = useUsdToMxn();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'spei'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Calculate deposit
  const deposit = nights < 7 ? total : nights < 28 ? total * 0.5 : Math.max(total / nights, 75) * 7; // 1 week's deposit

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock payment processing
    setTimeout(() => {
      alert('Payment processed successfully! Booking submitted for owner approval.');
      onPaymentComplete();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Secure Payment via Escrow</h2>
        <p className="text-gray-600 mb-6">
          Your payment is held securely in escrow until your booking is confirmed by the owner.
        </p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
          <p className="text-sm text-gray-600">Total: {formatPrice(total, language)}</p>
          <p className="text-sm text-gray-600">Deposit Required: {formatPrice(deposit, language)}</p>
          <p className="text-sm text-gray-600">{formatCurrency(deposit)}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'spei')}
              className="w-full border border-gray-300 rounded-lg p-3"
            >
              <option value="card">Credit/Debit Card</option>
              <option value="spei">SPEI Transfer (Mexico)</option>
            </select>
          </div>

          {paymentMethod === 'card' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Expiry
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3"
                  placeholder="John Doe"
                  required
                />
              </div>
            </>
          )}

          {paymentMethod === 'spei' && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                SPEI transfer details will be provided after form submission.
                Funds will be held in escrow until booking confirmation.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Pay {formatPrice(deposit, language)}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          This is a demo. No real payment will be processed.
        </p>
      </div>
    </div>
  );
};

export default EscrowModal;