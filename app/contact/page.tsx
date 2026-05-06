"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from '../../contexts/LanguageContext';
import BackgroundSlideshow from '../../components/BackgroundSlideshow';

export default function ContactPage() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verified) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError(t('contact.errorMessage'));
      }
    } catch {
      setError(t('contact.errorMessage'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden bg-black text-white min-h-screen">
      <BackgroundSlideshow />
      <Link href="/" className="absolute top-6 left-6 z-10 text-slate-300 hover:text-white transition">
        {t('nav.backToHome')}
      </Link>
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-300">{t('contact.heading')}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t('contact.title')}</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-200">{t('contact.description')}</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-4xl border border-slate-700 bg-[#241a13]/90 p-8 shadow-sm shadow-black/10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                <p className="text-2xl font-semibold text-white">{t('contact.successTitle')}</p>
                <p className="text-slate-300">{t('contact.successMessage')}</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">{t('contact.formName')}</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-600 bg-slate-800/60 p-4 text-white placeholder-slate-500 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                    placeholder={t('contact.formNamePlaceholder')}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">{t('contact.formEmail')}</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mt-2 w-full rounded-3xl border border-slate-600 bg-slate-800/60 p-4 text-white placeholder-slate-500 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                    placeholder={t('contact.formEmailPlaceholder')}
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">{t('contact.formMessage')}</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-600 bg-slate-800/60 p-4 text-white placeholder-slate-500 outline-none focus:border-garden focus:ring-2 focus:ring-garden/20"
                    rows={5}
                    placeholder={t('contact.formMessagePlaceholder')}
                    required
                  />
                </label>
                {/* Captcha */}
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/40 px-4 py-3 text-sm text-slate-300 transition hover:border-slate-500">
                  <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => setVerified(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-terracotta"
                  />
                  <span>{t('contact.captchaLabel')}</span>
                </label>

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !verified}
                  className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? t('contact.sending') : t('contact.formButton')}
                </button>
              </form>
            )}
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
