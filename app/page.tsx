"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { units, Unit } from "../data/units";
import BackgroundSlideshow from "../components/BackgroundSlideshow";
import UnitModal from "../components/UnitModal";
import GalleryModal from "../components/GalleryModal";
import ContactModal from "../components/ContactModal";
import DisclaimerModal from "../components/DisclaimerModal";
import { useLanguage } from "../contexts/LanguageContext";
import { formatPrice } from "../lib/currency";

export default function HomePage() {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const { t, language } = useLanguage();

  // Show disclaimer modal on first visit
  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem("hasSeenDisclaimer");
    if (!hasSeenDisclaimer) {
      setDisclaimerOpen(true);
      localStorage.setItem("hasSeenDisclaimer", "true");
    }
  }, []);

  const galleryImages = Array.from({ length: 21 }, (_, index) => `/imgs/OaxacaPicture_${index + 1}.jpg`);

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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-700 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link href="/" className="text-lg font-semibold text-white">
            La Casa Oaxaca
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/portal" className="rounded-full border border-slate-500 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900/50">
              Already a guest? Sign in!
            </Link>
            <Link href="/book" className="rounded-full bg-garden px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
              {t("nav.bookDirect")}
            </Link>
          </div>
        </div>
      </header>
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
            <Link href="/about" className="inline-flex items-center justify-center rounded-full bg-garden px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-garden/80">
              {t("home.aboutLaCasa")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setGalleryIndex(0);
                setGalleryOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-full bg-adobe px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-200 transition hover:bg-adobe/80"
            >
              {t("home.galleryButton")}
            </button>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              {t("home.contactButton")}
            </button>
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
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.5)]">{t("home.availableUnits")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8),0_3px_10px_rgba(0,0,0,0.5)]">{t("home.chooseStay")}</h2>
          </div>
          <Link href="/units" className="text-sm font-semibold text-terracotta hover:text-[#a95b48]">{t("home.seeAllUnits")}</Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {units.filter((unit) => unit.slug !== 'entire-house').map((unit) => (
            <article key={unit.slug} onClick={() => setSelectedUnit(unit)} className="group cursor-pointer rounded-4xl border border-slate-700 bg-[#241a13]/90 p-6 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="h-48 rounded-3xl overflow-hidden bg-transparent">
                {unit.displayImage ? (
                  <img src={unit.displayImage} alt={t(`units.items.${unit.slug}.name`)} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl bg-slate-800 text-slate-400">{t('home.close')}</div>
                )}
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{t(`units.items.${unit.slug}.type`)}</p>
                <h3 className="text-2xl font-semibold text-slate-100">{t(`units.items.${unit.slug}.name`)}</h3>
                <p className="text-slate-300">{t(`units.items.${unit.slug}.summary`)}</p>
                <div className="space-y-1">
                  {unit.nightlyRate > 0 && (
                    <p className="text-lg font-semibold text-slate-100">{formatPrice(unit.nightlyRate, language)}/{t('book.priceUnit.night')}</p>
                  )}
                  <p className="text-sm text-slate-300">{formatPrice(unit.weeklyRate, language)}/{t('book.priceUnit.week')}</p>
                  <p className="text-sm text-slate-300">{formatPrice(unit.monthlyRate, language)}/{t('book.priceUnit.month')}</p>
                </div>
                <Link href="/book" className="inline-flex items-center rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b55e47]">
                  {t("home.checkAvailability")}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Entire House Rental Section */}
        {units.find((unit) => unit.slug === 'entire-house') && (
          <div className="mt-10 md:col-span-3">
            <article onClick={() => setSelectedUnit(units.find((unit) => unit.slug === 'entire-house') || null)} className="group cursor-pointer rounded-4xl border border-slate-700 bg-gradient-to-r from-[#8d4a3f]/95 to-[#5c3628]/95 p-8 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="grid gap-8 md:grid-cols-3 md:items-center">
                <div className="md:col-span-1">
                  <div className="h-64 rounded-3xl overflow-hidden bg-transparent">
                    {units.find((unit) => unit.slug === 'entire-house')?.displayImage ? (
                      <img src={units.find((unit) => unit.slug === 'entire-house')?.displayImage} alt={t(`units.items.entire-house.name`)} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-3xl bg-slate-800 text-slate-400">{t('home.close')}</div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">✨ {t(`units.items.entire-house.type`)}</p>
                    <h3 className="text-4xl font-semibold text-slate-50 mt-2">{t(`units.items.entire-house.name`)}</h3>
                  </div>
                  <p className="text-lg text-slate-100">{t(`units.items.entire-house.summary`)}</p>
                  <div className="bg-slate-900/50 rounded-3xl p-6 space-y-4">
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">👥 Capacity:</span> {units.find((unit) => unit.slug === 'entire-house')?.capacity} guests</p>
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">🚪 Bathrooms:</span> {units.find((unit) => unit.slug === 'entire-house')?.bathroom}</p>
                    <p className="text-sm text-slate-300"><span className="font-semibold text-slate-100">🌳 Terraces:</span> {units.find((unit) => unit.slug === 'entire-house')?.terrace}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-600/50 space-y-3">
                    <p className="text-sm text-slate-300"><span className="text-lg font-semibold text-slate-50">{formatPrice(1200, language)}</span>/{t('book.priceUnit.week')}</p>
                    <p className="text-sm text-slate-300"><span className="text-lg font-semibold text-slate-50">{formatPrice(2700, language)}</span>/{t('book.priceUnit.month')}</p>
                  </div>
                  <Link href="/book" className="inline-flex items-center rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600">
                    {t("home.checkAvailability")} →
                  </Link>
                </div>
              </div>
            </article>
          </div>
        )}
      </section>
      <UnitModal unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      {galleryOpen && (
        <GalleryModal
          images={galleryImages}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <DisclaimerModal open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
      </div>
    </div>
  );
}
