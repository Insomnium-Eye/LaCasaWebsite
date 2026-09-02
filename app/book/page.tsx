"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { units, Unit, LEASE_TIERS } from "../../data/units";
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
          <p className="text-sm text-slate-400">
            Looking for a short stay?{' '}
            <Link href="/units" className="text-terracotta hover:text-[#b55e47] font-semibold">
              View all units
            </Link>
            {' '}for Airbnb links and nightly rates.
          </p>
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
                <p className="font-semibold text-slate-100 mt-1">{t(`units.items.${unit.slug}.name`)}</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  ${usd}
                  <span className="text-sm font-normal text-slate-400"> USD/mo</span>
                </p>
                <p className="text-xs text-slate-400">${unit.monthlyRateMXN.toLocaleString()} MXN</p>
              </button>
            );
          })}
        </div>

        {/* Lease terms notice */}
        <div className="mb-10 rounded-3xl border border-amber-700/50 bg-amber-900/20 px-6 py-5 text-amber-200 text-sm space-y-4">
          <p className="font-semibold text-amber-100 text-xs uppercase tracking-wider">
            {language === "es" ? "Tarifas por plazo — " : "Rates by lease term — "}
            {t(`units.items.${selectedUnit.slug}.name`)}
          </p>

          {/* Tier table */}
          <div className="space-y-2">
            {LEASE_TIERS.map((tier) => {
              const mxn = Math.round(selectedUnit.monthlyRateMXN * tier.multiplier);
              const usd = rate > 0 ? Math.floor(mxn / rate).toLocaleString() : '—';
              const isAnnual = tier.multiplier === 1;
              return (
                <div key={tier.label} className={`flex items-center gap-3 ${isAnnual ? 'pt-2 border-t border-amber-700/40 font-semibold text-amber-100' : 'text-amber-200'}`}>
                  <span className="w-28 shrink-0 text-xs">{tier.label}</span>
                  <span className="flex-1">
                    ${mxn.toLocaleString()} MXN
                    <span className="ml-1 text-xs font-normal text-amber-300/70">(~${usd} USD)</span>
                    <span className="ml-1 text-xs font-normal text-amber-400/70">/ mo</span>
                  </span>
                  <span className={`shrink-0 text-xs font-semibold ${isAnnual ? 'text-amber-300' : 'text-amber-400/60'}`}>
                    {tier.badge}
                  </span>
                </div>
              );
            })}
          </div>

          <ul className="space-y-1 text-amber-200/80 pt-1 border-t border-amber-700/30">
            <li>
              <span className="font-semibold text-amber-100">
                {language === "es" ? "Depósito al ser aprobado:" : "Deposit upon approval:"}
              </span>
              {" "}
              {`1 month + ½ = $${Math.round(selectedUnit.monthlyRateMXN * 1.5).toLocaleString()} MXN${rate > 0 ? ` (~$${Math.floor(selectedUnit.monthlyRateMXN * 1.5 / rate).toLocaleString()} USD)` : ""}`}
            </li>
            <li>
              <span className="font-semibold text-amber-100">
                {language === "es" ? "Renta mensual vence:" : "Rent due:"}
              </span>
              {" "}{language === "es" ? "el 1º de cada mes" : "the 1st of every month"}
            </li>
          </ul>
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
