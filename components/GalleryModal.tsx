"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

interface GalleryModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function GalleryModal({ images, currentIndex, onClose, onPrev, onNext }: GalleryModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-5xl rounded-[2rem] bg-slate-950/95 p-4 shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{t("home.galleryTitle")}</p>
            <p className="text-sm text-slate-300">{`${currentIndex + 1} / ${images.length}`}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800"
          >
            <span className="sr-only">{t("home.close")}</span>
            ×
          </button>
        </div>

        <div className="mt-6 rounded-3xl bg-slate-900 p-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-slate-800">
            <Image
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <p className="text-sm text-slate-400">{`${currentIndex + 1} / ${images.length}`}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              {t("home.prev")}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              {t("home.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
