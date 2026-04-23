'use client';

import GuestPortal from '@/components/GuestPortal';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function PortalPage() {
  return (
    <main className="relative overflow-hidden bg-black min-h-screen">
      <BackgroundSlideshow />
      <div className="relative z-10">
        <GuestPortal />
      </div>
    </main>
  );
}
