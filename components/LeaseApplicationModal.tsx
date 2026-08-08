'use client';

import { useEffect } from 'react';
import { Unit } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';
import LeaseApplicationForm from './LeaseApplicationForm';

interface Props {
  unit?: Unit | null;
  onClose: () => void;
}

export default function LeaseApplicationModal({ unit, onClose }: Props) {
  const { language } = useLanguage();
  const es = language === 'es';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#1a120c] shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-slate-700">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-terracotta font-semibold">
              {es ? 'Arrendamiento a largo plazo' : 'Long-Term Lease'}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {unit
                ? (es ? `Solicitud — ${unit.name}` : `Apply for ${unit.name}`)
                : (es ? 'Solicitud de Arrendamiento' : 'Lease Application')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition ml-4 mt-0.5 flex-shrink-0"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-7 py-6">
          <LeaseApplicationForm defaultUnit={unit} onSuccess={onClose} dark />
        </div>
      </div>
    </div>
  );
}
