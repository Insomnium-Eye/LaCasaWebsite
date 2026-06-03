'use client';

import { Suspense } from 'react';
import GuestPortal from '@/components/GuestPortal';
import BackgroundSlideshow from '@/components/BackgroundSlideshow';

export default function PortalPage() {
  return (
    <main className="relative overflow-hidden bg-black min-h-screen">
      <BackgroundSlideshow />
      <div className="relative z-10">
        <Suspense fallback={null}>
          <GuestPortal />
        </Suspense>
      </div>
    </main>
  );
}
