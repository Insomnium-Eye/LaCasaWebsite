"use client";

import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('contact.heading')}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('contact.title')}</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-200">{t('contact.description')}</p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            className="space-y-6"
          >
            <input type="hidden" name="form-name" value="contact" />
            <div style={{ display: 'none' }}>
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('contact.formName')}</span>
              <input
                name="name"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('contact.formNamePlaceholder')}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('contact.formEmail')}</span>
              <input
                name="email"
                type="email"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                placeholder={t('contact.formEmailPlaceholder')}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-slate-900">{t('contact.formMessage')}</span>
              <textarea
                name="message"
                className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 p-4 text-slate-900 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                rows={5}
                placeholder={t('contact.formMessagePlaceholder')}
                required
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
            >
              {t('contact.formButton')}
            </button>
          </form>
        </div>
        <div className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
          <div className="space-y-4">
            <p className="text-lg font-semibold text-white">{t('contact.detailsTitle')}</p>
            <p className="text-slate-200">{t('contact.email')}</p>
            <p className="text-slate-200">{t('contact.whatsapp')}</p>
            <p className="text-slate-200">{t('contact.location')}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
