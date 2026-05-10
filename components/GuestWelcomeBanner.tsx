'use client';

import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';

interface GuestWelcomeBannerProps {
  session: GuestSession | null;
  onLogout: () => void;
  onTransportRequest: () => void;
}

const GuestWelcomeBanner = ({ session, onLogout, onTransportRequest }: GuestWelcomeBannerProps) => {
  const { t, language } = useLanguage();

  if (!session) return null;

  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const unitDisplayName = session.unitSlug
    ? t(`units.items.${session.unitSlug}.name`)
    : unitDisplayName;

  // Normalize to YYYY-MM-DD regardless of whether DB returned a full ISO string or a plain date
  const normDate = (iso: string) => iso.slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  const isPreArrival = today < normDate(session.checkIn);
  const isCheckedOut = today >= normDate(session.checkOut);

  const totalNights = Math.round(
    (new Date(normDate(session.checkOut)).getTime() - new Date(normDate(session.checkIn)).getTime()) / 86400000
  );

  // Use noon UTC to avoid any date shifting across timezones
  const fmt = (iso: string) =>
    new Date(normDate(iso) + 'T12:00:00Z').toLocaleDateString(locale, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  return (
    <div className="bg-gradient-to-r from-amber-700 to-orange-600 text-white p-6 shadow-lg rounded-lg space-y-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">
            {isCheckedOut
              ? `${t('portal.welcomeBack').replace('{name}', session.guestName)} 👋`
              : t('portal.welcomeBack').replace('{name}', session.guestName)}
          </h2>

          {isPreArrival && (
            <div className="text-amber-50 space-y-1">
              <p>
                📅 {language === 'es' ? 'Tu check-in es el' : 'Your check-in is on'}{' '}
                <span className="font-semibold">{fmt(session.checkIn)}</span>
              </p>
              <p>
                🌙 {language === 'es'
                  ? `Tienes reservadas ${totalNights} noches en`
                  : `You are booked for ${totalNights} nights at`}{' '}
                <span className="font-semibold">{unitDisplayName}</span>
              </p>
              <p>
                🏁 {language === 'es' ? 'Check-out:' : 'Check-out:'}{' '}
                <span className="font-semibold">{fmt(session.checkOut)}</span>
              </p>
            </div>
          )}

          {!isPreArrival && !isCheckedOut && (
            <div className="text-amber-50 space-y-1">
              <p>
                📅 <span className="font-semibold">{session.nightsRemaining}</span>{' '}
                {t('portal.nightsRemaining')}
                {session.nightsRemaining === 1 ? ` ${t('portal.lastNight')}` : ''}
              </p>
              <p>
                🏡 {t('portal.checkingOut')} <span className="font-semibold">{fmt(session.checkOut)}</span>
              </p>
              <p>
                🏠 {t('portal.unit')} <span className="font-semibold">{unitDisplayName}</span>
              </p>
            </div>
          )}

          {isCheckedOut && (
            <p className="text-amber-50">
              {language === 'es'
                ? 'Esperamos que hayas disfrutado tu estancia.'
                : 'We hope you enjoyed your stay.'}
            </p>
          )}
        </div>

        <button
          onClick={onLogout}
          className="self-start md:self-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          {t('portal.signOut')}
        </button>
      </div>

      {/* Pre-arrival airport pickup CTA */}
      {isPreArrival && (
        <div className="bg-white/15 border border-white/30 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-amber-50 flex-1">
            ✈️{' '}
            {language === 'es'
              ? 'Solicita transporte desde el aeropuerto con anticipación — te recogemos directamente.'
              : 'Request a pickup from the airport in advance — we\'ll meet you right at arrivals.'}
          </p>
          <button
            onClick={onTransportRequest}
            className="shrink-0 bg-white text-amber-800 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
          >
            {language === 'es' ? 'Solicitar transporte' : 'Request transport'}
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestWelcomeBanner;
