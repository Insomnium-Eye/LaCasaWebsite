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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert(t("home.contactSubmitNotice"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-terracotta">{t("home.contactModalTitle")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{t("home.contactModalHeading")}</h2>
            <p className="mt-3 text-slate-600">{t("home.contactModalDescription")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <span className="sr-only">{t("home.close")}</span>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span>{t("home.contactName")}</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("home.contactNamePlaceholder")}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              <span>{t("home.contactEmail")}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("home.contactEmailPlaceholder")}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            <span>{t("home.contactMessage")}</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t("home.contactMessagePlaceholder")}
              rows={5}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/20"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{t("home.contactNote")}</p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]"
            >
              {t("home.contactSend")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
