"use client";

import Link from "next/link";
import { useState } from "react";
import { units, Unit } from "../../data/units";
import UnitModal from "../../components/UnitModal";
import LeaseApplicationModal from "../../components/LeaseApplicationModal";
import UnitCard from "../../components/UnitCard";
import { useLanguage } from "../../contexts/LanguageContext";
import BackgroundSlideshow from "../../components/BackgroundSlideshow";

export default function UnitsPage() {
  const { t } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [applyUnit, setApplyUnit] = useState<Unit | null>(null);

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition">
        {t('nav.backToHome')}
      </Link>
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('units.heading')}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('units.title')}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-200">{t('units.description')}</p>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-300">
              <span className="h-2 w-2 rounded-full bg-terracotta" />
              Short-term available via Airbnb — nightly rates vary by demand
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-700/60 bg-amber-900/25 px-4 py-2 text-sm text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Long-term leases available — 1-year minimum, fixed monthly rate
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {units.map((unit) => (
            <UnitCard
              key={unit.slug}
              unit={unit}
              showDetails
              onSelect={() => setSelectedUnit(unit)}
              onInquire={(e) => { e.stopPropagation(); setApplyUnit(unit); }}
            />
          ))}
        </div>
      </div>
      <UnitModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      {applyUnit && <LeaseApplicationModal unit={applyUnit} onClose={() => setApplyUnit(null)} />}
    </div>
  );
}
