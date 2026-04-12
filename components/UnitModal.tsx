'use client';

import { useEffect } from 'react';
import { Unit } from '../data/units';
import { useLanguage } from '../contexts/LanguageContext';

interface UnitModalProps {
  unit: Unit | null;
  onClose: () => void;
}

export default function UnitModal({ unit, onClose }: UnitModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-lg rounded-2xl bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{unit.type}</p>
              <h2 className="mt-1 text-3xl font-semibold text-slate-900">{unit.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-48 rounded-xl bg-slate-100 p-6 text-slate-500 flex items-center justify-center">
            Photo preview
          </div>

          <p className="text-slate-600">{unit.summary}</p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{t("home.modal.capacity")}</span>
              <span className="text-slate-600">{unit.capacity} {t("home.modal.guests")}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{t("home.modal.bathroom")}</span>
              <span className="text-slate-600">{unit.bathroom}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">{t("home.modal.terrace")}</span>
              <span className="text-slate-600">{unit.terrace}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-2xl font-semibold text-slate-900">${unit.rate}/night</p>
            <a
              href="/book"
              className="rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
            >
              {t("home.modal.bookNow")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}