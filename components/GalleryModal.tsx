"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "../contexts/LanguageContext";

interface GalleryModalProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function GalleryModal({ images, initialIndex = 0, onClose }: GalleryModalProps) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [view, setView] = useState<"single" | "grid">("single");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (view === "single") {
        if (e.key === "ArrowLeft") setActiveIndex((p) => (p - 1 + images.length) % images.length);
        if (e.key === "ArrowRight") setActiveIndex((p) => (p + 1) % images.length);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, view, images.length]);

  if (!images.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-slate-950/95 p-4 shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{t("home.galleryTitle")}</p>
            {view === "single" && (
              <p className="text-sm text-slate-300">{`${activeIndex + 1} / ${images.length}`}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("single")}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                view === "single"
                  ? "border-slate-500 bg-slate-700 text-white"
                  : "border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
              }`}
            >
              ▶ Single
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                view === "grid"
                  ? "border-slate-500 bg-slate-700 text-white"
                  : "border-slate-700 bg-slate-900/80 text-slate-400 hover:bg-slate-800"
              }`}
            >
              ⊞ Grid
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800"
            >
              <span className="sr-only">{t("home.close")}</span>
              ×
            </button>
          </div>
        </div>

        {/* Single view */}
        {view === "single" && (
          <>
            <div className="mt-6 rounded-3xl bg-slate-900 p-2">
              <div className="relative aspect-[16/10] max-h-[55vh] w-full overflow-hidden rounded-3xl bg-slate-800">
                <Image
                  src={images[activeIndex]}
                  alt={`Gallery image ${activeIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 900px"
                />
                {/* Left tap zone */}
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setActiveIndex((p) => (p - 1 + images.length) % images.length)}
                  className="absolute inset-y-0 left-0 w-1/2 cursor-w-resize focus:outline-none sm:hidden"
                />
                {/* Right tap zone */}
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setActiveIndex((p) => (p + 1) % images.length)}
                  className="absolute inset-y-0 right-0 w-1/2 cursor-e-resize focus:outline-none sm:hidden"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">{`${activeIndex + 1} / ${images.length}`}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveIndex((p) => (p - 1 + images.length) % images.length)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  {t("home.prev")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((p) => (p + 1) % images.length)}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  {t("home.next")}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Grid view */}
        {view === "grid" && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  setView("single");
                }}
                className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition hover:scale-[1.02] hover:opacity-90 ${
                  i === activeIndex ? "border-terracotta" : "border-transparent"
                }`}
              >
                <Image
                  src={src}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <span className="absolute bottom-1 right-2 text-xs font-semibold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
