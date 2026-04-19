"use client";

import Link from "next/link";
import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';

export default function FAQPage() {
  const { t } = useLanguage();
  const faqs = t('faq.items') as Array<{ question: string; answer: string }>;

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition">
        {t('nav.backToHome')}
      </Link>
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('faq.heading')}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('faq.title')}</h1>
      </div>
      <div className="mt-12 space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
            <p className="text-xl font-semibold text-white">{faq.question}</p>
            <p className="mt-3 text-slate-200">{faq.answer}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
