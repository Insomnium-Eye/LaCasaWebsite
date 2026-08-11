"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { units, Unit } from "../../data/units";
import { useLanguage } from "../../contexts/LanguageContext";
import BackgroundSlideshow from "../../components/BackgroundSlideshow";
import LeaseApplicationForm from "../../components/LeaseApplicationForm";
import useUsdToMxn from "../../hooks/useUsdToMxn";

export default function BookPage() {
  const { t, language } = useLanguage();
  const { rate } = useUsdToMxn();
  const [selectedUnit, setSelectedUnit] = useState<Unit>(units[0]);

  // Pre-select unit from ?unit= URL param
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("unit");
    const found = units.find((u) => u.slug === slug);
    if (found) setSelectedUnit(found);
  }, []);

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition">
        {t("nav.backToHome")}
      </Link>

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-8">
        {/* Header */}
        <div className="space-y-4 mb-12">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t("book.heading")}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t("book.title")}</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-200">{t("book.description")}</p>
        </div>

        {/* Unit Pricing Cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {units.map((unit) => {
            const usd = rate > 0 ? Math.floor(unit.monthlyRateMXN / rate).toLocaleString() : '—';
            return (
              <button
                key={unit.slug}
                type="button"
                onClick={() => setSelectedUnit(unit)}
                className={`rounded-3xl border p-5 text-left transition ${
                  selectedUnit.slug === unit.slug
                    ? "border-terracotta bg-terracotta/10"
                    : "border-slate-700 bg-[#241a13]/90 hover:border-slate-500"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {t(`units.items.${unit.slug}.type`)}
                </p>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="font-semibold text-slate-100">{t(`units.items.${unit.slug}.name`)}</p>
                  <span className="rounded-full bg-garden/20 px-2 py-0.5 text-xs font-semibold text-green-300 whitespace-nowrap">
                    Avail. {unit.availableFrom}
                  </span>
                </div>
                <p className="mt-2 text-xl font-semibold text-white">
                  ${usd}
                  <span className="text-sm font-normal text-slate-400"> USD/mo</span>
                </p>
                <p className="text-xs text-slate-400">${unit.monthlyRateMXN.toLocaleString()} MXN</p>
              </button>
            );
          })}
        </div>

        {/* Deposit notice */}
        <div className="mb-10 rounded-3xl border border-amber-700/50 bg-amber-900/20 px-6 py-4 text-amber-200 text-sm">
          {language === "es"
            ? `Mudanza requiere 2 meses por adelantado: depósito de seguridad + primer mes de renta. Mínimo 1 año de contrato.`
            : `Move-in requires 2 months upfront: security deposit + first month's rent. Minimum 1-year lease.`}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Application Form */}
          <div className="rounded-4xl border border-slate-700 bg-[#1a120c] p-8 shadow-sm shadow-black/10">
            <h2 className="text-lg font-semibold text-white mb-6">
              {language === "es" ? "Solicitud de Arrendamiento" : "Lease Application"}
            </h2>
            <LeaseApplicationForm defaultUnit={selectedUnit} dark />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-6 shadow-sm shadow-black/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t("book.discountsTitle")}</p>
              <ul className="mt-4 space-y-3 text-slate-300 text-sm">
                <li className="flex gap-2"><span>🏠</span><span>{t("book.discount7nights")}</span></li>
                <li className="flex gap-2"><span>🏠</span><span>{t("book.discount28nights")}</span></li>
                <li className="flex gap-2"><span>🏠</span><span>{t("book.rule.extraGuestFee")}</span></li>
              </ul>
            </div>

            <div className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-6 shadow-sm shadow-black/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t("book.rulesTitle")}</p>
              <ul className="mt-4 space-y-3 text-slate-200 text-sm">
                <li className="flex gap-2"><span>🚭</span><span>{t("book.rule.noSmoking")}</span></li>
                <li className="flex gap-2"><span>🎉</span><span>{t("book.rule.noParties")}</span></li>
                <li className="flex gap-2"><span>👥</span><span>{t("book.rule.extraGuest")}</span></li>
                <li className="flex gap-2"><span>🌿</span><span>{t("book.rule.beRespectful")}</span></li>
                <li className="flex gap-2"><span>📷</span><span>{t("book.rule.camera")}</span></li>
              </ul>
            </div>

            <div className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-6 shadow-sm shadow-black/10">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t("book.propertyNotes.title")}</p>
              <ul className="mt-4 space-y-3 text-slate-300 text-sm">
                <li className="flex gap-2"><span>🅿️</span><span>{t("book.propertyNotes.parking")}</span></li>
                <li className="flex gap-2"><span>🐾</span><span>{t("book.propertyNotes.pets")}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
