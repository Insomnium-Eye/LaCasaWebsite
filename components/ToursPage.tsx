"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";
import useUsdToMxn from "@/hooks/useUsdToMxn";

export default function ToursContent() {
  const { t, language } = useLanguage();
  const { rate } = useUsdToMxn();

  const cityHighlights = t('tours.cityTour.highlights') as string[];
  const hikingAreas = t('tours.hikingTours.areas') as string[];

  const CITY_TOUR_USD = 60;
  const cityTourPrice = language === 'es'
    ? `$${(Math.floor((CITY_TOUR_USD * rate) / 10) * 10).toLocaleString('es-MX')} MXN ${t('tours.cityTour.pricePerPerson')}`
    : `$${CITY_TOUR_USD} USD ${t('tours.cityTour.pricePerPerson')}`;

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />

      <div className="relative z-10 px-6 pt-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold text-slate-300 hover:text-white transition">
          {t('nav.backToHome')}
        </Link>
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-10 lg:px-8">

        {/* Hero */}
        <section className="mb-14 max-w-3xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400">La Casa Oaxaca</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {t('tours.heading')}
          </h1>
          <p className="text-lg leading-8 text-slate-200">
            {t('tours.subtitle')}
          </p>
        </section>

        {/* Tour cards */}
        <section className="grid gap-8 lg:grid-cols-2">

          {/* City Tour */}
          <div className="flex flex-col rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              {t('tours.cityTour.label')}
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {t('tours.cityTour.title')}
            </h2>
            <p className="mt-3 text-slate-300">
              {t('tours.cityTour.description')}
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('tours.cityTour.highlightsTitle')}
              </p>
              <ul className="mt-3 space-y-3">
                {cityHighlights.map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-200">
                    <span className="mt-0.5 shrink-0 text-amber-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-3xl bg-[#1a0f0a]/90 p-5">
              <div>
                <p className="text-xs text-slate-400">{t('tours.cityTour.durationLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-white">{t('tours.cityTour.duration')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t('tours.cityTour.priceLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-amber-300">{cityTourPrice}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t('tours.cityTour.languagesLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-white">{t('tours.cityTour.languages')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">{t('tours.cityTour.scheduleLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-white">{t('tours.cityTour.schedule')}</p>
              </div>
            </div>

            <div className="mt-6 grow" />
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]"
            >
              {t('tours.contactButton')}
            </Link>
          </div>

          {/* Hiking Tours */}
          <div className="flex flex-col rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              {t('tours.hikingTours.label')}
            </p>
            <h2 className="text-2xl font-semibold text-white">
              {t('tours.hikingTours.title')}
            </h2>
            <p className="mt-3 text-slate-300">
              {t('tours.hikingTours.description')}
            </p>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('tours.hikingTours.areasTitle')}
              </p>
              <ul className="mt-3 space-y-3">
                {hikingAreas.map((area, i) => (
                  <li key={i} className="flex gap-3 text-slate-200">
                    <span className="shrink-0">⛰️</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-3xl bg-[#1a0f0a]/90 p-5 space-y-3">
              <div>
                <p className="text-xs text-slate-400">{t('tours.hikingTours.languagesLabel')}</p>
                <p className="mt-1 text-sm font-semibold text-white">{t('tours.hikingTours.languages')}</p>
              </div>
              <p className="text-sm text-slate-300">{t('tours.hikingTours.pricing')}</p>
            </div>

            <div className="mt-6 grow" />
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]"
            >
              {t('tours.contactButton')}
            </Link>
          </div>
        </section>

        {/* Bottom CTA strip */}
        <section className="mt-14 rounded-4xl border border-slate-700 bg-[#241a13]/90 px-8 py-10 text-center shadow-sm shadow-black/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">La Casa Oaxaca</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">
            {language === 'es' ? 'Guías bilingües locales · Experiencias auténticas' : 'Local bilingual guides · Authentic experiences'}
          </h3>
          <p className="mt-3 text-slate-300">
            {language === 'es'
              ? 'Todos nuestros tours son personalizados y adaptados a sus intereses. Contáctenos para reservar o solicitar un tour personalizado.'
              : 'All our tours are personalized and tailored to your interests. Contact us to book or request a custom tour.'}
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-garden px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#3c5a35]"
          >
            {t('tours.contactButton')}
          </Link>
        </section>
      </div>
    </div>
  );
}
