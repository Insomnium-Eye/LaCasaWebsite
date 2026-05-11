'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

interface GuestLoginPanelProps {
  onLogin: (identifier: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

function getFormatError(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{4}$/.test(v)) return null; // 4-digit lock code
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null; // email
  const digits = v.replace(/\D/g, '');
  if (digits.length >= 7 && digits.length <= 15 && /^\+?[\d\s\-(). ]+$/.test(v)) return null; // phone
  return 'Enter a 4-digit lock code, email address, or phone number.';
}

const GuestLoginPanel = ({ onLogin, loading, error }: GuestLoginPanelProps) => {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const formatError = touched ? getFormatError(identifier) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setTouched(true);

    if (!identifier.trim()) {
      setLocalError(t('portal.emptyIdentifierError'));
      return;
    }

    const fmt = getFormatError(identifier);
    if (fmt) {
      setLocalError(fmt);
      return;
    }

    const success = await onLogin(identifier);
    if (!success) {
      setLocalError(error || t('portal.loginError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="texture" patternUnits="userSpaceOnUse" width="100" height="100">
              <circle cx="50" cy="50" r="1" fill="white" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#texture)" />
        </svg>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 mb-4 text-sm font-semibold text-amber-100 hover:text-white transition-colors"
        >
          {t('nav.backToHome')}
        </Link>
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 to-orange-600 p-8">
            <h1 className="text-3xl font-bold text-white mb-2">{t('portal.welcomeHome')}</h1>
            <p className="text-amber-50 text-sm">
              {t('portal.loginDescription')}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('portal.identifier')}
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setLocalError(null); }}
                  onBlur={() => setTouched(true)}
                  placeholder={t('portal.enterIdentifier')}
                  disabled={loading}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors disabled:bg-gray-100 ${
                    formatError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-amber-600'
                  }`}
                />
                <p className="mt-2 text-xs text-gray-500">
                  {t('portal.identifierHint')}
                </p>
              </div>

              {/* Format hint shown while typing */}
              {formatError && !localError && (
                <p className="text-xs text-red-500 -mt-1">{formatError}</p>
              )}

              {/* Error Message */}
              {(localError || (!formatError && error)) && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-sm text-red-700">
                    {localError || error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-700 to-orange-600 hover:from-amber-800 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('portal.signingIn')}</span>
                  </div>
                ) : (
                  t('portal.signIn')
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Having trouble logging in?{' '}
                <a href="#contact" className="text-amber-700 hover:text-amber-900 font-semibold">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-4 text-center text-amber-50 text-sm">
          <p>Your session is secure and temporary (4 hours)</p>
        </div>
      </div>
    </div>
  );
};

export default GuestLoginPanel;
