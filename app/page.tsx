"use client";

import Link from "next/link";
import { useState } from "react";
import { units, Unit } from "../data/units";
import BackgroundSlideshow from "../components/BackgroundSlideshow";
import UnitModal from "../components/UnitModal";
import { useLanguage } from "../contexts/LanguageContext";

export default function HomePage() {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const { t } = useLanguage();

  const features = [
    {
      title: t("home.features.0.title"),
      description: t("home.features.0.description")
    },
    {
      title: t("home.features.1.title"),
      description: t("home.features.1.description")
    },
    {
      title: t("home.features.2.title"),
      description: t("home.features.2.description")
    }
  ];

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
          <span className="inline-flex rounded-full bg-terracotta/10 px-3 py-1 text-sm font-semibold text-terracotta">{t("home.directBooking")}</span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t("home.title")}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-200">
            {t("home.description")}
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-[#b55e47]">
              {t("home.bookNow")}
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-50 hover:text-slate-900">
              {t("home.aboutLaCasa")}
            </Link>
          </div>
        </div>
            <div className="rounded-4xl bg-gradient-to-br from-[#3c2b1f]/95 via-[#71573f]/90 to-[#8d7155]/80 p-10 text-slate-100 shadow-xl shadow-black/30">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t("home.luxuryRetreat")}</p>
            <h2 className="text-3xl font-semibold">{t("home.gardenTitle")}</h2>
            <p className="text-slate-200/90">{t("home.gardenDesc")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-[#21180f]/90 p-5 text-slate-100 shadow-sm shadow-black/10">
                <p className="text-xs font-semibold uppercase text-terracotta">{t("home.capacity")}</p>
                <p className="mt-2 text-2xl font-semibold">{t("home.capacityValue")}</p>
              </div>
              <div className="rounded-3xl bg-[#21180f]/90 p-5 text-slate-100 shadow-sm shadow-black/10">
                <p className="text-xs font-semibold uppercase text-garden">{t("home.stays")}</p>
                <p className="mt-2 text-2xl font-semibold">{t("home.staysValue")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 space-y-10">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((item) => (
            <div key={item.title} className="rounded-4xl border border-slate-700 bg-[#231a13]/90 p-8 shadow-sm shadow-black/10">
              <h3 className="text-xl font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-3 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{t("home.availableUnits")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{t("home.chooseStay")}</h2>
          </div>
          <Link href="/units" className="text-sm font-semibold text-terracotta hover:text-[#a95b48]">{t("home.seeAllUnits")}</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {units.map((unit) => (
            <article key={unit.slug} onClick={() => setSelectedUnit(unit)} className="group cursor-pointer rounded-4xl border border-slate-700 bg-[#241a13]/90 p-6 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-48 rounded-3xl bg-slate-800 p-6 text-slate-400">Photo preview</div>
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{unit.type}</p>
                <h3 className="text-2xl font-semibold text-slate-100">{unit.name}</h3>
                <p className="text-slate-300">{unit.summary}</p>
                <p className="text-lg font-semibold text-slate-100">${unit.rate}/night</p>
                <Link href="/book" className="inline-flex items-center rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b55e47]">
                  {t("home.checkAvailability")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <UnitModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      </div>
    </div>
  );
}
