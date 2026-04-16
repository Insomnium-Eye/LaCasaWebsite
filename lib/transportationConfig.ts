/**
 * Transportation Services Configuration
 * 
 * Define all available transportation add-ons for La Casa
 * Prices are in USD, automatically converted to MXN
 * 
 * Integration with Channel Manager:
 * - This data can be synced from Lodgify or Hostaway API
 * - Replace MOCK_AVAILABILITY with real channel data
 * - Update prices from channel manager pricing rules
 */

export const TRANSPORTATION_SERVICES = {
  local_tours: {
    zocalo: {
      name: 'Oaxaca City Center (Zócalo)',
      description: 'Private jeep/SUV round-trip transfer',
      category: 'day_trip',
      priceUsd: 45,
      duration: '4-5 hours',
      passengers: '5 max',
      notes: 'Includes city tour walk, local guide recommend',
    },
    monte_alban: {
      name: 'Monte Albán Archaeological Site',
      description: 'Round-trip with 2-hour site visit and waiting time',
      category: 'day_trip',
      priceUsd: 75,
      duration: 'Full day (6-7 hours)',
      passengers: '5 max',
      notes: 'Advanced ticket purchase recommended',
    },
    mitla_hierve: {
      name: 'Mitla + Hierve el Agua',
      description: 'Full-day tour combining two major destinations',
      category: 'full_day',
      priceUsd: 150,
      duration: 'Full day (8-10 hours)',
      passengers: '5 max',
      notes: 'Includes lunch stop and swimming at natural springs',
    },
    teotitlan_mitla: {
      name: 'Teotitlán del Valle + Mitla',
      description: 'Day trip featuring weaving village and archaeological site',
      category: 'day_trip',
      priceUsd: 130,
      duration: 'Full day (8-9 hours)',
      passengers: '5 max',
      notes: 'Artisan workshop visit included',
    },
  },

  airport_services: {
    airport_oneway: {
      name: 'Oaxaca Airport (OAX) - One Way',
      description: 'One-way transfer to/from airport',
      category: 'airport_transfer',
      priceUsd: 55,
      duration: '45-60 minutes',
      passengers: '5 max',
      notes: 'Meet and greet available',
    },
    airport_roundtrip: {
      name: 'Oaxaca Airport (OAX) - Round Trip',
      description: 'Round-trip airport transfer',
      category: 'airport_transfer',
      priceUsd: 100,
      duration: '1.5-2 hours total',
      passengers: '5 max',
      notes: 'Valid for same-day round trips',
    },
    late_night_surcharge: {
      name: 'Late-Night Surcharge',
      description: 'Add-on for transfers after 11 PM',
      category: 'surcharge',
      priceUsd: 15,
      duration: 'N/A',
      passengers: 'N/A',
      notes: 'Applied to airport transfers only',
    },
  },

  extended_stay_discounts: {
    one_week: {
      minNights: 7,
      percentage: 5,
      label: '5% off 7+ nights',
    },
    two_weeks: {
      minNights: 14,
      percentage: 10,
      label: '10% off 14+ nights',
    },
    one_month: {
      minNights: 30,
      percentage: 15,
      label: '15% off 30+ nights',
    },
  },
};

/**
 * Channel Manager Integration
 * 
 * To integrate with Lodgify or Hostaway:
 * 
 * 1. LODGIFY API:
 *    - https://docs.lodgify.com/
 *    - Endpoints: /reservations, /properties, /availability
 *    - Rate limiting: 100 req/minute
 * 
 * 2. HOSTAWAY API:
 *    - https://api.hostaway.com/
 *    - Endpoints: /reservations, /listings
 *    - Authentication: OAuth 2.0
 * 
 * Implementation example in hooks/useChannelManager.ts
 */

export const CHANNEL_MANAGER_CONFIG = {
  provider: 'lodgify', // or 'hostaway'
  apiUrl: process.env.NEXT_PUBLIC_CHANNEL_API_URL,
  apiKey: process.env.NEXT_PUBLIC_CHANNEL_API_KEY,
  syncInterval: 3600000, // Sync every hour, in milliseconds
  properties: {
    bungalow1: { id: 'prop_001', name: 'Bungalow 1' },
    bungalow2: { id: 'prop_002', name: 'Bungalow 2' },
    bedroom: { id: 'prop_003', name: 'One Bedroom' },
  },
};

/**
 * Exchange Rate Configuration
 */
export const EXCHANGE_RATE_CONFIG = {
  primaryApi: 'https://api.exchangerate-api.com/v4/latest/USD',
  fallbackApi: 'https://api.frankfurter.app/latest?from=USD&to=MXN',
  fallbackRate: 20.5,
  cacheDuration: 86400000, // 24 hours in milliseconds
};

/**
 * ID Verification Service Configuration
 * 
 * Choose one service and set up accordingly:
 * 
 * 1. VERIFF (Recommended for simplicity)
 *    - https://www.veriff.com/
 *    - API: https://api.veriff.com/
 * 
 * 2. PERSONA
 *    - https://withpersona.com/
 *    - SDK: @persona-web/inquiry
 * 
 * 3. SIGNZY
 *    - https://www.signzy.ai/
 *    - Mobile-friendly verification
 */

export const ID_VERIFICATION_CONFIG = {
  provider: 'veriff', // or 'persona', or 'signzy'
  apiUrl: process.env.NEXT_PUBLIC_VERIFICATION_API_URL,
  apiKey: process.env.NEXT_PUBLIC_VERIFICATION_API_KEY,
  settings: {
    requireDocumentFrontAndBack: true,
    requireSelfie: true,
    requireLivenessCheck: true,
    languages: ['en', 'es'],
    onSuccessRedirect: '/booking?verified=true',
    onFailureRedirect: '/booking?verified=false',
  },
};
