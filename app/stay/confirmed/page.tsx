"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

// Shown after Stripe's in-page checkout completes. The booking itself is
// recorded by the Stripe webhook, never from this page.
export default function StayConfirmedPage() {
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
            ? "Gracias por reservar con nosotros. En unos minutos recibirás un correo con la confirmación, tu código de acceso y el enlace al portal de huéspedes."
            : "Thank you for booking with us. Within a few minutes you'll receive an email with your confirmation, your door code and a link to the guest portal."}
        </p>
        <p className="mt-3 text-sm text-green-700">
          {es
            ? "Si esas fechas se reservaron mientras pagabas, te reembolsaremos el total automáticamente y te avisaremos por correo."
            : "If those dates were booked by someone else while you were paying, we'll refund you in full automatically and let you know by email."}
        </p>
        <div className="mt-6">
          <Link href="/" className="inline-block rounded-lg bg-garden px-5 py-2.5 font-semibold text-white transition hover:bg-[#3c5a35]">
            {es ? "Volver al inicio" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
