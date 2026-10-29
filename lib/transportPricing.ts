/**
 * Transport destinations and pricing — single source of truth for the
 * public /transport page, the guest-portal form, and the checkout API.
 *
 * Prices are in MXN. The airport transfer is the anchor price; every other
 * destination is priced by its road distance from the property
 * (San Felipe del Agua) at the same per-km rate.
 */

export const AIRPORT_PRICE_MXN = 500;
const AIRPORT_DISTANCE_KM = 15;
export const PRICE_PER_KM_MXN = AIRPORT_PRICE_MXN / AIRPORT_DISTANCE_KM;

/** Round trips are charged as two one-way legs with 10% off. */
export const ROUND_TRIP_DISCOUNT = 0.1;

export const MAX_PASSENGERS = 7;

export interface TransportDestination {
  id: string;
  emoji: string;
  /** Approximate one-way road distance from the property. */
  distanceKm: number;
  name: { en: string; es: string };
  description: { en: string; es: string };
  duration: { en: string; es: string };
}

export const TRANSPORT_DESTINATIONS: TransportDestination[] = [
  {
    id: 'airport',
    emoji: '✈️',
    distanceKm: AIRPORT_DISTANCE_KM,
    name: { en: 'Airport – Xoxocotlán International (OAX)', es: 'Aeropuerto – Internacional Xoxocotlán (OAX)' },
    description: { en: 'Convenient transfers for arrivals and departures.', es: 'Traslados cómodos para llegadas y salidas.' },
    duration: { en: '25–35 min', es: '25–35 min' },
  },
  {
    id: 'el_llano',
    emoji: '🌳',
    distanceKm: 4,
    name: { en: 'El Llano (Parque Juárez)', es: 'El Llano (Parque Juárez)' },
    description: { en: 'Peaceful park with scenic walks and cultural events.', es: 'Parque tranquilo con paseos y eventos culturales.' },
    duration: { en: '10–20 min', es: '10–20 min' },
  },
  {
    id: 'zocalo',
    emoji: '🏛️',
    distanceKm: 5,
    name: { en: 'Zócalo (Historic Main Square)', es: 'Zócalo (Plaza Principal Histórica)' },
    description: { en: 'Heart of Oaxaca city – shops, cafés, and landmarks.', es: 'El corazón de Oaxaca – tiendas, cafés y monumentos.' },
    duration: { en: '12–25 min', es: '12–25 min' },
  },
  {
    id: 'ado_station',
    emoji: '🚌',
    distanceKm: 4,
    name: { en: 'ADO Bus Station', es: 'Central de Autobuses ADO' },
    description: { en: 'Main intercity bus terminal.', es: 'Terminal principal de autobuses foráneos.' },
    duration: { en: '15–25 min', es: '15–25 min' },
  },
  {
    id: 'monte_alban',
    emoji: '🗿',
    distanceKm: 14,
    name: { en: 'Monte Albán (Archaeological Site)', es: 'Monte Albán (Zona Arqueológica)' },
    description: { en: 'UNESCO World Heritage ruins with panoramic views.', es: 'Zona arqueológica Patrimonio de la Humanidad con vistas panorámicas.' },
    duration: { en: '25–40 min', es: '25–40 min' },
  },
  {
    id: 'arbol_tule',
    emoji: '🌲',
    distanceKm: 13,
    name: { en: 'Árbol del Tule (Tree of Tule)', es: 'Árbol del Tule' },
    description: { en: "The world's widest tree.", es: 'El árbol más ancho del mundo.' },
    duration: { en: '25–35 min', es: '25–35 min' },
  },
  {
    id: 'artisan_villages',
    emoji: '🎨',
    distanceKm: 30,
    name: { en: 'San Bartolo Coyotepec / San Martín Tilcajete (Artisan Villages)', es: 'San Bartolo Coyotepec / San Martín Tilcajete (Pueblos Artesanales)' },
    description: { en: 'Black pottery and colorful alebrijes.', es: 'Barro negro y alebrijes de colores.' },
    duration: { en: '35–50 min', es: '35–50 min' },
  },
  {
    id: 'teotitlan',
    emoji: '🧶',
    distanceKm: 30,
    name: { en: 'Teotitlán del Valle (Textile Village)', es: 'Teotitlán del Valle (Pueblo Textil)' },
    description: { en: 'Zapotec village renowned for handwoven textiles.', es: 'Pueblo zapoteco famoso por sus textiles tejidos a mano.' },
    duration: { en: '40–55 min', es: '40–55 min' },
  },
  {
    id: 'mitla',
    emoji: '🏺',
    distanceKm: 47,
    name: { en: 'Mitla (Archaeological Site)', es: 'Mitla (Zona Arqueológica)' },
    description: { en: 'Famous for intricate stone mosaics.', es: 'Famosa por sus grecas de piedra.' },
    duration: { en: '50–75 min', es: '50–75 min' },
  },
  {
    id: 'hierve_el_agua',
    emoji: '💧',
    distanceKm: 75,
    name: { en: 'Hierve el Agua (Petrified Waterfalls)', es: 'Hierve el Agua (Cascadas Petrificadas)' },
    description: { en: 'Natural mineral pools – full day recommended.', es: 'Pozas minerales naturales – se recomienda día completo.' },
    duration: { en: '1.5–2.5 hrs', es: '1.5–2.5 hrs' },
  },
];

export const getDestination = (id: string) =>
  TRANSPORT_DESTINATIONS.find((d) => d.id === id) ?? null;

const roundUpToTen = (mxn: number) => Math.ceil(mxn / 10) * 10;

/** One-way price in MXN, rounded up to the nearest 10 pesos. */
export const oneWayPriceMxn = (dest: TransportDestination) =>
  dest.id === 'airport' ? AIRPORT_PRICE_MXN : roundUpToTen(dest.distanceKm * PRICE_PER_KM_MXN);

/** Total trip price in MXN. */
export const tripPriceMxn = (dest: TransportDestination, roundTrip: boolean) => {
  const oneWay = oneWayPriceMxn(dest);
  return roundTrip ? roundUpToTen(oneWay * 2 * (1 - ROUND_TRIP_DISCOUNT)) : oneWay;
};

/** "$1,234 MXN", plus "(≈ $62 USD)" for English when a rate is available. */
export const formatMxnWithUsd = (mxn: number, language: string, rate: number) => {
  const base = `$${mxn.toLocaleString(language === 'es' ? 'es-MX' : 'en-US')} MXN`;
  if (language === 'es' || !(rate > 0)) return base;
  return `${base} (≈ $${Math.floor(mxn / rate).toLocaleString('en-US')} USD)`;
};
