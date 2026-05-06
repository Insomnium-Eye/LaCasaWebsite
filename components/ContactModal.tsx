"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  function handleClose() {
    onClose();
    // Reset after close animation finishes
    setTimeout(() => {
      setSubmitted(false);
      setError("");
      setVerified(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 300);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!verified) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setMessage("");
        setVerified(false);
      } else {
        setError(t("contact.errorMessage"));
      }
    } catch {
      setError(t("contact.errorMessage"));
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-terracotta">
              {t("home.contactModalTitle")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              {t("home.contactModalHeading")}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="sr-only">{t("home.close")}</span>×
          </button>
        </div>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-2xl font-semibold text-slate-900">{t("contact.successTitle")}</p>
            <p className="text-slate-600">{t("contact.successMessage")}</p>
            <button
              onClick={handleClose}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
            >
              {t("home.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-700">
                <span>{t("home.contactName")}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("home.contactNamePlaceholder")}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-700">
                <span>{t("home.contactEmail")}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("home.contactEmailPlaceholder")}
                  required
                  className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-700">
              <span>{t("home.contactMessage")}</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("home.contactMessagePlaceholder")}
                rows={5}
                required
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </label>

            {/* Captcha */}
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-terracotta"
              />
              <span>{t("contact.captchaLabel")}</span>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !verified}
                className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t("contact.sending") : t("home.contactSend")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
