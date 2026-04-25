"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DisclaimerModal({ open, onClose }: DisclaimerModalProps) {
  const { t } = useLanguage();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/30">
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-red-600 font-semibold">{t("home.disclaimerTitle")}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{t("home.disclaimerHeading")}</h2>
          </div>

          <div className="space-y-4 text-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">{t("home.disclaimerConstruction")}</h3>
              <p>{t("home.disclaimerConstructionDesc")}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">{t("home.disclaimerFeatures")}</h3>
              <p>{t("home.disclaimerFeaturesDesc")}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">{t("home.disclaimerLogin")}</h3>
              <p>{t("home.disclaimerLoginDesc")}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full bg-terracotta px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-[#b55e47]"
          >
            {t("home.disclaimerAccept")}
          </button>
        </div>
      </div>
    </div>
  );
}
