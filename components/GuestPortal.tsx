'use client';

import { useState } from 'react';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { PORTAL_SECTIONS, PortalSection } from '@/types/guest-portal';
import GuestLoginPanel from './GuestLoginPanel';
import GuestWelcomeBanner from './GuestWelcomeBanner';
import PortalSidebar from './PortalSidebar';
import CleaningRequestForm from './features/CleaningRequestForm';
import TransportRequestForm from './features/TransportRequestForm';
import ExtendStayForm from './features/ExtendStayForm';
import CancelReservationForm from './features/CancelReservationForm';
import LeaveReviewForm from './features/LeaveReviewForm';
import IDVerificationForm from './features/IDVerificationForm';

interface TransportPrefill {
  destinationId: string;
  date: string; // YYYY-MM-DD
}

const GuestPortal = () => {
  const { session, loading, error, login, logout, isAuthenticated } = useGuestAuth();
  const [activeSection, setActiveSection] = useState<PortalSection>('transport');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transportPrefill, setTransportPrefill] = useState<TransportPrefill | null>(null);

  const handleSectionChange = (section: PortalSection) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 150);
  };

  const handleAirportCTA = () => {
    if (session) {
      setTransportPrefill({ destinationId: 'airport', date: session.checkIn.slice(0, 10) });
    }
    handleSectionChange('transport');
  };

  if (!isAuthenticated) {
    return <GuestLoginPanel onLogin={login} loading={loading} error={error} />;
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 mx-auto max-w-7xl px-6 py-6 h-screen">
      {/* Sidebar */}
      <PortalSidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        session={session}
      />

      {/* Content Area with Welcome Banner */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-6">
        <GuestWelcomeBanner
          session={session}
          onLogout={logout}
          onTransportRequest={handleAirportCTA}
        />

        <div
          className={`transition-all duration-300 transform ${
            isTransitioning
              ? 'opacity-0 translate-y-2'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {activeSection === 'cleaning' && <CleaningRequestForm session={session} />}
          {activeSection === 'transport' && (
            <TransportRequestForm
              session={session}
              prefill={transportPrefill}
              onPrefillConsumed={() => setTransportPrefill(null)}
            />
          )}
          {activeSection === 'extend' && <ExtendStayForm session={session} />}
          {activeSection === 'cancel' && <CancelReservationForm session={session} />}
          {activeSection === 'review' && <LeaveReviewForm session={session} />}
          {activeSection === 'verification' && <IDVerificationForm session={session} />}
        </div>
      </div>
    </div>
  );
};

export default GuestPortal;
