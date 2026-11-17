'use client';

import { useState } from 'react';
import { Unit } from '@/data/units';
import { useLanguage } from '@/contexts/LanguageContext';
import StayBookingModal from './StayBookingModal';

/** Airbnb logo (Simple Icons, CC0). */
function AirbnbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.953l.558 1.089.08.159c2.041 4.004 3.821 7.608 5.279 10.794l.026.025.533 1.22.318.764c.243.613.294 1.222.213 1.858zm1.22-2.39c-.186-.583-.505-1.271-.9-2.094v-.03c-1.889-4.006-3.642-7.608-5.307-10.844l-.111-.163C15.317 1.461 14.468 0 12.001 0c-2.44 0-3.476 1.695-4.535 3.898l-.081.16c-1.669 3.236-3.421 6.843-5.303 10.847v.053l-.559 1.22c-.21.504-.317.768-.345.847C-.172 20.74 2.611 24 5.98 24c.027 0 .132 0 .265-.027h.372c1.75-.213 3.554-1.325 5.384-3.317 1.829 1.989 3.635 3.104 5.382 3.317h.372c.133.027.239.027.265.027 3.37.003 6.152-3.261 4.802-6.975z" />
    </svg>
  );
}

/**
 * "Book directly" (our own form + Stripe payment) and an Airbnb button for a unit.
 * Clicks don't bubble to the surrounding card, which opens the unit pop-up.
 */
export default function StayBookingButtons({ unit, tone = 'dark' }: { unit: Unit; tone?: 'dark' | 'light' }) {
  const { language } = useLanguage();
  const es = language === 'es';
  const [open, setOpen] = useState(false);

  const airbnbClass =
    tone === 'dark'
      ? 'border-slate-600 bg-slate-800/60 hover:border-[#FF5A5F] hover:bg-slate-700/60'
      : 'border-slate-300 bg-white hover:border-[#FF5A5F] hover:bg-rose-50';

  return (
    <div className="flex items-stretch gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
      >
        {es ? 'Reservar directamente' : 'Book directly'}
      </button>
      {unit.airbnbUrl && (
        <a
          href={unit.airbnbUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={es ? 'Ver en Airbnb' : 'View on Airbnb'}
          title={es ? 'Ver en Airbnb' : 'View on Airbnb'}
          className={`flex w-11 shrink-0 items-center justify-center rounded-full border transition ${airbnbClass}`}
        >
          <AirbnbIcon className="h-5 w-5 text-[#FF5A5F]" />
        </a>
      )}
      {open && <StayBookingModal unit={unit} onClose={() => setOpen(false)} />}
    </div>
  );
}
