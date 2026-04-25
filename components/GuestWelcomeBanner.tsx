'use client';

import { GuestSession } from '@/types/guest-portal';
import { useLanguage } from '@/contexts/LanguageContext';

interface GuestWelcomeBannerProps {
  session: GuestSession | null;
  onLogout: () => void;
}

const GuestWelcomeBanner = ({ session, onLogout }: GuestWelcomeBannerProps) => {
  const { t, language } = useLanguage();
  
  if (!session) return null;

  const checkOutDate = new Date(session.checkOut);
  const formattedCheckOut = checkOutDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-gradient-to-r from-amber-700 to-orange-600 text-white p-6 shadow-lg rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Welcome Message */}
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('portal.welcomeBack').replace('{name}', session.guestName)}</h2>
          <div className="text-amber-50 space-y-1">
            <p>
              📅 <span className="font-semibold">{session.nightsRemaining}</span> {t('portal.nightsRemaining')}
              {session.nightsRemaining === 1 ? ` ${t('portal.lastNight')}` : ''}
            </p>
            <p>
              🏡 {t('portal.checkingOut')} <span className="font-semibold">{formattedCheckOut}</span>
            </p>
            <p>
              🏠 {t('portal.unit')} <span className="font-semibold">{session.unitName}</span>
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="self-start md:self-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
        >
          {t('portal.signOut')}
        </button>
      </div>
    </div>
  );
};

export default GuestWelcomeBanner;
