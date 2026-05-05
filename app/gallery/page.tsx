"use client";

import Link from "next/link";
import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';

export default function GalleryPage() {
  const { t } = useLanguage();
  const galleryItems = t('gallery.items') as string[];

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.5)]">
        {t('nav.backToHome')}
      </Link>
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.5)]">{t('gallery.heading')}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl [text-shadow:0_1px_4px_rgba(0,0,0,0.8),0_3px_10px_rgba(0,0,0,0.5)]">{t('gallery.title')}</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.5)]">{t('gallery.description')}</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <div key={item} className="group rounded-4xl overflow-hidden bg-[#241a13]/90 p-6 text-slate-200 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="h-52 rounded-3xl bg-gradient-to-br from-slate-200 via-adobe to-terracotta" />
            <p className="mt-4 text-lg font-semibold text-white">{item}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
