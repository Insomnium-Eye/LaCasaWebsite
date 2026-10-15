"use client";

import { useLanguage } from "../contexts/LanguageContext";
import { GALLERY_CATEGORIES, GalleryCategory } from "../data/gallery";

interface GalleryFiltersProps {
  selected: Set<GalleryCategory>;
  onToggle: (category: GalleryCategory) => void;
  className?: string;
}

export default function GalleryFilters({ selected, onToggle, className = "" }: GalleryFiltersProps) {
  const { t } = useLanguage();

  return (
    <fieldset className={`flex flex-wrap items-center gap-3 ${className}`}>
      <legend className="sr-only">{t("gallery.filterLabel")}</legend>
      <span className="mr-1 text-sm uppercase tracking-[0.24em] text-slate-300">{t("gallery.filterLabel")}</span>
      {GALLERY_CATEGORIES.map((category) => {
        const checked = selected.has(category);
        return (
          <label
            key={category}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              checked
                ? "border-terracotta bg-terracotta/20 text-white"
                : "border-slate-700 bg-slate-900/60 text-slate-400 hover:bg-slate-800"
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(category)}
              className="h-4 w-4 accent-terracotta"
            />
            {t(`gallery.filters.${category}`)}
          </label>
        );
      })}
    </fieldset>
  );
}

export const toggleInSet = <T,>(prev: Set<T>, value: T) => {
  const next = new Set(prev);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};
