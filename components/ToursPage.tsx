'use client';

import Link from 'next/link';
import { useLanguage } from '../contexts/LanguageContext';
import useUsdToMxn from '../hooks/useUsdToMxn';
import BackgroundSlideshow from './BackgroundSlideshow';

const RATES = {
  oneWay: [
    { pax: { en: '1–2 passengers', es: '1–2 pasajeros' }, mxn: 5000 },
    { pax: { en: '3–4 passengers', es: '3–4 pasajeros' }, mxn: 5800 },
    { pax: { en: '5–6 passengers', es: '5–6 pasajeros' }, mxn: 6500 },
  ],
  roundTrip: [
    { pax: { en: '1–2 passengers', es: '1–2 pasajeros' }, mxn: 9000 },
    { pax: { en: '3–4 passengers', es: '3–4 pasajeros' }, mxn: 10500 },
    { pax: { en: '5–6 passengers', es: '5–6 pasajeros' }, mxn: 11800 },
  ],
  fullPackage: [
    { pax: { en: '1–2 passengers', es: '1–2 pasajeros' }, mxn: 19000 },
    { pax: { en: '3–4 passengers', es: '3–4 pasajeros' }, mxn: 21500 },
    { pax: { en: '5–6 passengers', es: '5–6 pasajeros' }, mxn: 24000 },
  ],
  oneWayPackage: [
    { pax: { en: '1–2 passengers', es: '1–2 pasajeros' }, mxn: 13500 },
    { pax: { en: '3–4 passengers', es: '3–4 pasajeros' }, mxn: 15500 },
    { pax: { en: '5–6 passengers', es: '5–6 pasajeros' }, mxn: 17500 },
  ],
};

const TOUR_A_DAYS: Record<'en' | 'es', string[]> = {
  en: [
    'Breakfast in Oaxaca de Juárez → Drive to Puerto Escondido → Hotel drop-off (1–2 hrs) → Playa Carrizalillo (2–3 hrs) → Hotel.',
    'Pickup → Playa Manzanillo / Puerto Angelito (3–4 hrs) → Playa Bacocho (2–3 hrs) → Laguna de Manialtepec (bioluminescence ~2–3 hrs) → Hotel.',
    'Pickup → Breakfast stop → Return to Oaxaca.',
  ],
  es: [
    'Desayuno en Oaxaca de Juárez → Viaje a Puerto Escondido → Llegada al hotel (1–2 hrs) → Playa Carrizalillo (2–3 hrs) → Hotel.',
    'Recogida → Playa Manzanillo / Puerto Angelito (3–4 hrs) → Playa Bacocho (2–3 hrs) → Laguna de Manialtepec (bioluminiscencia ~2–3 hrs) → Hotel.',
    'Recogida → Parada para desayuno → Regreso a Oaxaca.',
  ],
};

const TOUR_B_DAYS: Record<'en' | 'es', string[]> = {
  en: [
    'Breakfast in Oaxaca de Juárez → Drive → Hotel drop-off → Playa Zicatela / La Punta (2–3 hrs) → Hotel.',
    'Pickup → Playa Carrizalillo (3–4 hrs) → Playa Coral (2–3 hrs) → Laguna de Manialtepec → Hotel.',
    'Pickup → Breakfast stop → Return to Oaxaca.',
  ],
  es: [
    'Desayuno en Oaxaca de Juárez → Viaje → Llegada al hotel → Playa Zicatela / La Punta (2–3 hrs) → Hotel.',
    'Recogida → Playa Carrizalillo (3–4 hrs) → Playa Coral (2–3 hrs) → Laguna de Manialtepec → Hotel.',
    'Recogida → Parada para desayuno → Regreso a Oaxaca.',
  ],
};

function RateTable({
  rows, accentClass, headerBg, icon, title, subtitle, lang, fmt,
}: {
  rows: { pax: { en: string; es: string }; mxn: number }[];
  accentClass: string;
  headerBg: string;
  icon: string;
  title: string;
  subtitle?: string;
  lang: string;
  fmt: (mxn: number) => string;
}) {
  const es = lang === 'es';
  return (
    <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 overflow-hidden">
      <div className={`${headerBg} px-5 py-3.5 border-b border-slate-700`}>
        <h3 className={`font-semibold ${accentClass}`}>{icon} {title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left px-5 py-2.5 text-slate-400 font-medium">{es ? 'Pasajeros' : 'Passengers'}</th>
            <th className="text-right px-5 py-2.5 text-slate-400 font-medium">{es ? 'Precio' : 'Price'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 1 ? 'bg-[#1a0f0a]/50' : ''}>
              <td className="px-5 py-3 text-slate-200">{row.pax[lang as 'en' | 'es']}</td>
              <td className="px-5 py-3 text-right font-semibold text-white">{fmt(row.mxn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToursContent() {
  const { language } = useLanguage();
  const { rate } = useUsdToMxn();
  const es = language === 'es';
  const lang = language as 'en' | 'es';

  const fmt = (mxn: number) =>
    es
      ? `$${mxn.toLocaleString('es-MX')} MXN`
      : `$${Math.floor(mxn / rate).toLocaleString('en-US')} USD`;

  const dayLabel = (i: number) => es ? `Día ${i + 1}` : `Day ${i + 1}`;

  return (
    <div className="relative min-h-screen bg-black text-white">
      <BackgroundSlideshow />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 space-y-20">

        {/* Back */}
        <Link href="/" className="inline-block text-slate-400 hover:text-white text-sm transition">
          ← {es ? 'Volver al inicio' : 'Back to home'}
        </Link>

        {/* Hero */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta mb-3">
            🚗 La Casa Oaxaca
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            {es ? 'Tours Privados y Traslados' : 'Private Driving Tours & Transfers'}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            {es
              ? 'Servicio cómodo de puerta a puerta en nuestra Honda HR-V (hasta 6 pasajeros).'
              : 'Comfortable door-to-door service in our Honda HR-V (up to 6 passengers).'}
          </p>
        </section>

        {/* Intro */}
        <section className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-8 space-y-6">
          <p className="text-slate-200 leading-relaxed">
            {es
              ? 'Ofrecemos transporte privado confiable y paquetes de playa personalizados desde Oaxaca de Juárez hacia Puerto Escondido, Huatulco, San José del Pacífico y más. Ideal para familias, amigos o grupos pequeños que buscan flexibilidad, seguridad e itinerarios personalizados sin la incomodidad del transporte público o rentar un auto.'
              : 'We offer reliable private transportation and customized beach packages from Oaxaca de Juárez to Puerto Escondido, Huatulco, San José del Pacífico, and beyond. Perfect for families, friends, or small groups who want flexibility, safety, and personalized itineraries without the hassle of public transport or rental cars.'}
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#1a0f0a]/90 p-5">
              <p className="text-sm font-semibold text-terracotta mb-2">🚙 {es ? 'Vehículo' : 'Vehicle'}</p>
              <p className="text-sm text-slate-300">
                {es ? 'Honda HR-V moderno con espacio para pasajeros y equipaje.' : 'Modern Honda HR-V with ample space for passengers and luggage.'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#1a0f0a]/90 p-5">
              <p className="text-sm font-semibold text-garden mb-2">✅ {es ? 'Incluye' : 'Services include'}</p>
              <p className="text-sm text-slate-300">
                {es ? 'Transporte, traducciones útiles y sugerencias locales.' : 'Transportation, helpful translations, and local suggestions.'}
              </p>
            </div>
            <div className="rounded-2xl bg-[#1a0f0a]/90 p-5">
              <p className="text-sm font-semibold text-slate-400 mb-2">❌ {es ? 'No incluye' : 'We do NOT provide'}</p>
              <p className="text-sm text-slate-300">
                {es ? 'Hospedaje, comidas ni tours guiados — solo transporte y apoyo excelentes.' : 'Accommodation, meals, or guided tours — just excellent transport and support.'}
              </p>
            </div>
          </div>
        </section>

        {/* Base Transfer Rates */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {es ? 'Tarifas Base de Traslado' : 'Base Transfer Rates'} — Oaxaca ↔ Puerto Escondido
            </h2>
            <p className="text-slate-400 text-sm">
              {es
                ? 'Incluyen combustible, casetas y tiempo de manejo. Temporada alta / días festivos / viajes nocturnos: +10–20%.'
                : 'Rates include fuel, tolls, and driver time. Peak season / holidays / night trips may incur +10–20%.'}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <RateTable
              rows={RATES.oneWay}
              icon="📍" accentClass="text-terracotta" headerBg="bg-terracotta/10"
              title={es ? 'Ida (por vehículo)' : 'One-Way (per vehicle)'}
              lang={language} fmt={fmt}
            />
            <RateTable
              rows={RATES.roundTrip}
              icon="🔄" accentClass="text-garden" headerBg="bg-garden/10"
              title={es ? 'Ida y Vuelta' : 'Round-Trip'}
              subtitle={es ? 'Mismo día o espera limitada' : 'Same-day or limited waiting'}
              lang={language} fmt={fmt}
            />
          </div>
        </section>

        {/* Multi-Day Packages */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {es ? 'Paquetes de Varios Días a Puerto Escondido' : 'Multi-Day Tour Packages to Puerto Escondido'}
            </h2>
            <p className="text-slate-300 font-medium mb-1">
              {es ? '2 Noches / 3 Días — Escape a la Playa' : '2-Night / 3-Day Beach Escape – Highlights Tour'}
            </p>
            <p className="text-slate-400 text-sm">
              {es
                ? 'Salida por la mañana desde Oaxaca el Día 1, regreso el Día 3. Traslados locales en Puerto Escondido: 5–30 minutos.'
                : 'Morning departure from Oaxaca on Day 1, morning return on Day 3. All local transfers in Puerto Escondido are short (5–30 minutes).'}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <RateTable
              rows={RATES.fullPackage}
              icon="🏖️" accentClass="text-terracotta" headerBg="bg-terracotta/10"
              title={es ? 'Paquete Completo' : 'Full Package'}
              subtitle={es ? 'Traslado ida + 2 noches servicio local + regreso' : 'One-way transfer + 2 nights local service + return transfer'}
              lang={language} fmt={fmt}
            />
            <RateTable
              rows={RATES.oneWayPackage}
              icon="✈️" accentClass="text-garden" headerBg="bg-garden/10"
              title={es ? 'Paquete Solo Ida' : 'One-Way Package'}
              subtitle={es ? 'Traslado ida + servicio local, sin regreso' : 'One-way transfer + local service, no return'}
              lang={language} fmt={fmt}
            />
          </div>
        </section>

        {/* Itineraries */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white">
            {es ? 'Itinerarios Detallados' : 'Detailed Itineraries'}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tour A</span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {es ? 'Playas Tranquilas y Familiares' : 'Calm & Family-Friendly Beaches'}
                </h3>
              </div>
              <div className="space-y-4">
                {TOUR_A_DAYS[lang].map((detail, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-bold text-terracotta text-xs pt-0.5">{dayLabel(i)}</span>
                    <p className="text-slate-300 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tour B</span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {es ? 'Playas Vibrantes y de Surf' : 'Vibrant & Surf Beaches'}
                </h3>
              </div>
              <div className="space-y-4">
                {TOUR_B_DAYS[lang].map((detail, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-bold text-garden text-xs pt-0.5">{dayLabel(i)}</span>
                    <p className="text-slate-300 leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Supplements */}
        <section className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 space-y-4">
          <h3 className="font-bold text-white text-lg">{es ? 'Suplementos' : 'Supplements'}</h3>
          <ul className="space-y-2.5 text-sm text-slate-300">
            <li className="flex gap-3"><span>🌊</span><span>{es ? 'Tour de bioluminiscencia en lancha: 800–1,500 MXN por persona (reservar por separado).' : 'Bioluminescence boat tour: 800–1,500 MXN per person (book separately).'}</span></li>
            <li className="flex gap-3"><span>📅</span><span>{es ? 'Ajustes personalizados o noches adicionales: cotización a petición.' : 'Custom adjustments or extra nights: Quoted on request.'}</span></li>
          </ul>
        </section>

        {/* Booking & Policies */}
        <section className="rounded-3xl border border-slate-700 bg-[#241a13]/90 p-6 space-y-4">
          <h3 className="font-bold text-white text-lg">{es ? 'Reservas y Políticas' : 'Booking & Policies'}</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-3"><span>💬</span><span>{es ? 'Contáctanos por WhatsApp o el formulario de reserva para disponibilidad.' : 'Contact us via WhatsApp or the booking form below for availability and reservations.'}</span></li>
            <li className="flex gap-3"><span>⏰</span><span>{es ? 'Política de cancelación de 48 horas.' : '48-hour cancellation policy.'}</span></li>
            <li className="flex gap-3"><span>🎒</span><span>{es ? 'Qué traer: Protector solar, traje de baño, efectivo para comidas/actividades, toalla de playa.' : 'What to bring: Sunscreen, swimsuit, cash for meals/activities, beach towel.'}</span></li>
            <li className="flex gap-3"><span>🛡️</span><span>{es ? 'Seguridad primero: Priorizamos una conducción cómoda y responsable.' : 'Safety first: We prioritize comfortable and responsible driving.'}</span></li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center space-y-5 pb-8">
          <h2 className="text-3xl font-bold text-white">
            {es ? '¿Listo para escapar a la costa del Pacífico?' : 'Ready to escape to the Pacific coast?'}
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto">
            {es
              ? 'Completa el formulario de reserva o escríbenos con tus fechas, tamaño de grupo y tour preferido.'
              : 'Fill out the booking form or message us with your dates, group size, and preferred tour.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/book" className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#b55e47]">
              {es ? 'Formulario de Reserva' : 'Booking Form'}
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-600 px-7 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white">
              ← {es ? 'Volver al inicio' : 'Back to home'}
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
