"use client";

import Link from "next/link";
import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';

export default function AmenitiesPage() {
  const { t } = useLanguage();
  const amenities = t('amenities.items') as string[];

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition">
        {t('nav.backToHome')}
      </Link>
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('amenities.heading')}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('amenities.title')}</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-200">{t('amenities.description')}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((item) => (
          <div key={item} className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
            <p className="text-lg font-semibold text-white">{item}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
