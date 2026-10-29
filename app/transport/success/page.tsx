"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TransportSuccessPage() {
  const { language } = useLanguage();
  const es = language === "es";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-lg rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
        <p className="text-4xl">✓</p>
        <h1 className="mt-3 text-2xl font-bold text-green-900">
          {es ? "¡Pago recibido!" : "Payment received!"}
        </h1>
        <p className="mt-3 text-green-800">
          {es
            ? "Tu transporte privado está reservado. Recibirás un correo de confirmación y te contactaremos antes del viaje."
            : "Your private transport is booked. You'll receive a confirmation email, and we'll be in touch before your trip."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/transport" className="rounded-lg border-2 border-garden px-5 py-2.5 font-semibold text-garden transition hover:bg-garden hover:text-white">
            {es ? "Reservar otro viaje" : "Book another trip"}
          </Link>
          <Link href="/" className="rounded-lg bg-garden px-5 py-2.5 font-semibold text-white transition hover:bg-[#3c5a35]">
            {es ? "Volver al inicio" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
