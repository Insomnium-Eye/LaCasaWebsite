"use client";

import { useLanguage } from '../contexts/LanguageContext';
import { attractionCategories } from '../data/attractions';

export default function ThingsToDoSection() {
  const { t, language } = useLanguage();

  return (
    <section id="discover-oaxaca" className="mt-24">
      {/* Hero heading */}
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
          {t('explore.label')}
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl [text-shadow:0_1px_4px_rgba(0,0,0,0.8),0_3px_10px_rgba(0,0,0,0.5)]">
          {t('explore.title')}
        </h2>
        <p className="max-w-2xl text-lg leading-8 text-slate-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
          {t('explore.description')}
        </p>
      </div>

      {/* Category sections */}
      <div className="mt-12 space-y-14">
        {attractionCategories.map((category, catIndex) => (
          <div key={category.id}>
            {/* Divider between categories */}
            {catIndex > 0 && (
              <div className="mb-10 border-t border-slate-700/50" />
            )}

            {/* Category heading */}
            <h3 className="mb-6 text-lg font-semibold uppercase tracking-[0.18em] text-slate-300 [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]">
              {language === 'es' ? category.es.title : category.en.title}
            </h3>

            {/* Card grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.attractions.map((attraction) => {
                const content = language === 'es' ? attraction.es : attraction.en;
                return (
                  <div
                    key={attraction.id}
                    className="group rounded-3xl border border-slate-700/60 bg-[#1a1008]/80 p-6 shadow-sm shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-slate-500 hover:shadow-md hover:shadow-black/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-2xl leading-none">{attraction.emoji}</span>
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        {content.category}
                      </span>
                    </div>
                    <h4 className="mt-4 text-base font-semibold text-slate-100">
                      {attraction.name}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {content.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
