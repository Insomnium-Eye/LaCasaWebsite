"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Message = { tone: "good" | "info" | "bad"; title: [string, string]; body: [string, string] };

// [English, Spanish]
const MESSAGES: Record<string, Message> = {
  success: {
    tone: "good",
    title: ["Autopay is set up!", "¡Pago automático configurado!"],
    body: [
      "Your card is saved. Rent will be charged automatically on the 1st of each month, and you'll get a receipt by email each time.",
      "Tu tarjeta quedó guardada. La renta se cobrará automáticamente el día 1 de cada mes y recibirás un recibo por correo cada vez.",
    ],
  },
  active: {
    tone: "good",
    title: ["Autopay is active", "El pago automático está activo"],
    body: [
      "Your rent is being paid automatically. To change your card, contact us and we'll help you.",
      "Tu renta se está pagando automáticamente. Para cambiar tu tarjeta, contáctanos y te ayudamos.",
    ],
  },
  setup_cancelled: {
    tone: "info",
    title: ["Autopay not set up yet", "Pago automático pendiente"],
    body: [
      "No card was saved. You can try again whenever you're ready.",
      "No se guardó ninguna tarjeta. Puedes intentarlo de nuevo cuando quieras.",
    ],
  },
  ended: {
    tone: "info",
    title: ["This lease has ended", "Este contrato ha terminado"],
    body: [
      "There are no more automatic rent payments for this lease.",
      "Ya no hay pagos automáticos de renta para este contrato.",
    ],
  },
  expired: {
    tone: "bad",
    title: ["This link needs to be renewed", "Este enlace debe renovarse"],
    body: [
      "The first rent date for this link has passed. Please contact us and we'll send you a new one.",
      "La fecha del primer pago de este enlace ya pasó. Contáctanos y te enviaremos uno nuevo.",
    ],
  },
  invalid: {
    tone: "bad",
    title: ["Invalid link", "Enlace no válido"],
    body: [
      "This rent link isn't valid. Please use the link from your email, or contact us.",
      "Este enlace de renta no es válido. Usa el enlace de tu correo o contáctanos.",
    ],
  },
  error: {
    tone: "bad",
    title: ["Something went wrong", "Algo salió mal"],
    body: [
      "We couldn't open the payment page. Please try again in a few minutes, or contact us.",
      "No pudimos abrir la página de pago. Inténtalo de nuevo en unos minutos o contáctanos.",
    ],
  },
};

const TONES = {
  good: "border-green-200 bg-green-50 text-green-900",
  info: "border-amber-200 bg-amber-50 text-amber-900",
  bad: "border-red-200 bg-red-50 text-red-900",
};

function RentStatus() {
  const { language } = useLanguage();
  const lang = language === "es" ? 1 : 0;
  const params = useSearchParams();
  const msg = MESSAGES[params.get("state") ?? ""] ?? MESSAGES.invalid;
  // Only ever link back to our own rent setup endpoint.
  const retry = params.get("retry");
  const retryHref = retry && /^\/api\/rent\/setup\/[0-9a-f-]{36}\/[0-9a-f]{32}$/i.test(retry) ? retry : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className={`w-full max-w-lg rounded-2xl border p-8 text-center shadow-sm ${TONES[msg.tone]}`}>
        <p className="text-4xl">{msg.tone === "good" ? "✓" : msg.tone === "info" ? "🏠" : "!"}</p>
        <h1 className="mt-3 text-2xl font-bold">{msg.title[lang]}</h1>
        <p className="mt-3">{msg.body[lang]}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {retryHref && (
            <a href={retryHref} className="rounded-lg bg-garden px-5 py-2.5 font-semibold text-white transition hover:bg-[#3c5a35]">
              {lang ? "Intentar de nuevo" : "Try again"}
            </a>
          )}
          <Link href="/contact" className="rounded-lg border-2 border-garden px-5 py-2.5 font-semibold text-garden transition hover:bg-garden hover:text-white">
            {lang ? "Contáctanos" : "Contact us"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RentStatusPage() {
  return (
    <Suspense>
      <RentStatus />
    </Suspense>
  );
}
