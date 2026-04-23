"use client";

import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navigation() {
  const { t } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/amenities", label: t("nav.amenities") },
    { href: "/units", label: t("nav.units") },
    { href: "/book", label: t("nav.book") },
    { href: "/gallery", label: t("nav.gallery") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/contact", label: t("nav.contact") }
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          La Casa Oaxaca
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/portal" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            {t("nav.signIn") || "Already a guest? Sign in!"}
          </Link>
          <Link href="/book" className="rounded-full bg-garden px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#3c5a35]">
            {t("nav.bookDirect")}
          </Link>
        </div>
      </div>
    </header>
  );
}
