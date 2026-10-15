"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';
import GalleryModal from '../../components/GalleryModal';
import GalleryFilters, { toggleInSet } from '../../components/GalleryFilters';
import { GALLERY_CATEGORIES, GalleryCategory, getGalleryImages } from '../../data/gallery';

export default function GalleryPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<Set<GalleryCategory>>(() => new Set(GALLERY_CATEGORIES));
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const visibleImages = useMemo(() => getGalleryImages(selected), [selected]);

  const toggleCategory = (category: GalleryCategory) => {
    setSelected((prev) => toggleInSet(prev, category));
  };

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
      <GalleryFilters
        selected={selected}
        onToggle={toggleCategory}
        className="mt-10 rounded-3xl bg-[#241a13]/90 px-5 py-4 shadow-sm shadow-black/10"
      />
      {visibleImages.length === 0 ? (
        <p className="mt-12 text-center text-slate-300">{t('gallery.empty')}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleImages.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setModalIndex(i)}
              className="group overflow-hidden rounded-4xl bg-[#241a13]/90 p-3 shadow-sm shadow-black/10 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={src}
                alt={`Gallery image ${i + 1}`}
                loading="lazy"
                className="h-60 w-full rounded-3xl object-cover transition group-hover:opacity-90"
              />
            </button>
          ))}
        </div>
      )}
      </div>
      {modalIndex !== null && (
        <GalleryModal
          images={visibleImages}
          initialIndex={modalIndex}
          onClose={() => setModalIndex(null)}
        />
      )}
    </div>
  );
}
