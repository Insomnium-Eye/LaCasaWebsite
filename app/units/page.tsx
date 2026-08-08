"use client";

import Link from "next/link";
import { useState } from "react";
import { units, Unit } from "../../data/units";
import UnitModal from "../../components/UnitModal";
import LeaseApplicationModal from "../../components/LeaseApplicationModal";
import { useLanguage } from "../../contexts/LanguageContext";
import BackgroundSlideshow from "../../components/BackgroundSlideshow";
import useUsdToMxn from "../../hooks/useUsdToMxn";

export default function UnitsPage() {
  const { t } = useLanguage();
  const { rate } = useUsdToMxn();
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
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {units.map((unit) => {
          const usd = rate > 0 ? Math.floor(unit.monthlyRateMXN / rate).toLocaleString() : '—';
          return (
            <article key={unit.slug} onClick={() => setSelectedUnit(unit)} className="cursor-pointer rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-56 rounded-3xl overflow-hidden bg-transparent">
                {unit.displayImage ? (
                  <img src={unit.displayImage} alt={t(`units.items.${unit.slug}.name`)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl bg-slate-800 text-slate-400">{t('home.close')}</div>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{t(`units.items.${unit.slug}.type`)}</p>
                <h2 className="text-2xl font-semibold text-slate-100">{t(`units.items.${unit.slug}.name`)}</h2>
                <p className="text-slate-300">{t(`units.items.${unit.slug}.summary`)}</p>
                <ul className="space-y-1.5 text-slate-300 text-sm">
                  <li>{`${t('units.capacityLabel')} ${unit.capacity} ${t('units.guestsLabel')}`}</li>
                  <li>{t(`units.items.${unit.slug}.bathroom`)}</li>
                  <li>{t(`units.items.${unit.slug}.terrace`)}</li>
                </ul>
                {/* Monthly pricing */}
                <div className="rounded-xl bg-slate-800/60 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t('unitModal.monthlyRate')}</p>
                  <p className="mt-0.5 text-lg font-semibold text-white">
                    ${usd} <span className="text-sm font-normal text-slate-400">USD/mo</span>
                  </p>
                  <p className="text-xs text-slate-400">${unit.monthlyRateMXN.toLocaleString()} MXN</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                  <button
                    className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
                    onClick={(e) => { e.stopPropagation(); setApplyUnit(unit); }}
                  >
                    {t('units.checkAvailability')}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      </div>
      <UnitModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      {applyUnit && <LeaseApplicationModal unit={applyUnit} onClose={() => setApplyUnit(null)} />}
    </div>
  );
}
