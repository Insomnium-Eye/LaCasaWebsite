"use client";

import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';

export default function AboutPage() {
  const { t } = useLanguage();
  const highlights = t('about.highlights') as string[];
  const features = t('about.features') as Array<{ title: string; description: string }>;

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[0.9fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('about.heading')}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('about.title')}</h1>
          <p className="text-lg leading-8 text-slate-200">{t('about.description')}</p>
        </div>
        <div className="rounded-4xl bg-[#241a13]/90 p-10 text-slate-200 shadow-sm shadow-black/10">
          <h2 className="text-2xl font-semibold text-white">{t('about.highlightsTitle')}</h2>
          <ul className="mt-6 space-y-4 text-slate-300">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        {features.map((item) => (
          <div key={item.title} className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-slate-200">{item.description}</p>
          </div>
        ))}
      </section>
      </div>
    </div>
  );
}
