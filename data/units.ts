export const LEASE_TIERS = [
  { label: '1–3 months',  term: 'mid-term',  multiplier: 1.15, badge: '+15%',    note: 'Mid-term',  availKey: 'oneToThree'  as const },
  { label: '3–6 months',  term: 'long-term', multiplier: 1.10, badge: '+10%',    note: 'Long-term', availKey: 'threeToSix'  as const },
  { label: '6–12 months', term: 'long-term', multiplier: 1.05, badge: '+5%',     note: 'Long-term', availKey: 'sixToTwelve' as const },
  { label: '12 months',   term: 'annual',    multiplier: 1.00, badge: '★ best',  note: 'Annual',    availKey: 'annual'       as const },
];

export type Unit = {
  slug: string;
  name: string;
  type: string;
  summary: string;
  capacity: number;
  bathroom: string;
  terrace: string;
  monthlyRateMXN: number;
  shortTermMin: number;
  shortTermMax: number;
  airbnbUrl: string;
  displayImage?: string;
  galleryImages?: string[];
};

export const units: Unit[] = [
  {
    slug: "bungalow-1",
    name: "Bungalow 1",
    type: "Private bungalow",
    summary: "Cozy bungalow with en-suite bathroom, private veranda, and garden view.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Private veranda with garden access",
    monthlyRateMXN: 17000,
    shortTermMin: 55,
    shortTermMax: 115,
    airbnbUrl: "https://airbnb.com/h/oaxaca-rental-bungalow1",
    displayImage: "/imgs/Bungalow1/Main.jpg",
    galleryImages: [
      "/imgs/Bungalow1/Exterior1.jpg",
      "/imgs/Bungalow1/Exterior2.jpg",
      "/imgs/Bungalow1/Exterior3.jpg",
      "/imgs/Bungalow1/Exterior4.jpg",
      "/imgs/Bungalow1/bathroom.jpg",
      "/imgs/Bungalow1/bed1.jpg",
      "/imgs/Bungalow1/bed2.jpg",
      "/imgs/Bungalow1/kitchenette1.jpg",
      "/imgs/Bungalow1/kitchennete2.jpg"
    ]
  },
  {
    slug: "bungalow-2",
    name: "Bungalow 2",
    type: "Private bungalow",
    summary: "Bright retreat with direct garden access and comfortable indoor/outdoor living.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Private veranda with garden access",
    monthlyRateMXN: 20000,
    shortTermMin: 65,
    shortTermMax: 125,
    airbnbUrl: "https://airbnb.com/h/oaxaca-rental-bungalow2",
    displayImage: "/imgs/Bungalow2/Main.jpg",
    galleryImages: [
      "/imgs/Bungalow2/Exterior1.jpg",
      "/imgs/Bungalow2/Bathroom1.jpg",
      "/imgs/Bungalow2/Bed1.jpg",
      "/imgs/Bungalow2/Table1.jpg",
      "/imgs/Bungalow2/QqWao.jpg"
    ]
  },
  {
    slug: "main-bedroom",
    name: "Main Residence Bedroom",
    type: "Bedroom in main house",
    summary: "Relaxed room inside the main residence with private bathroom and authentic style.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Shared terrace nearby",
    monthlyRateMXN: 8000,
    shortTermMin: 40,
    shortTermMax: 100,
    airbnbUrl: "https://airbnb.com/h/oaxaca-rental-room1",
    displayImage: "/imgs/Room/Main.jpg",
    galleryImages: [
      "/imgs/Room/exterior1.jpg",
      "/imgs/Room/Exterior3.jpg",
      "/imgs/Room/bathroom.jpg",
      "/imgs/Room/bed1.jpg",
      "/imgs/Room/bed2.jpg",
      "/imgs/Room/kitchen.jpg"
    ]
  },
];
