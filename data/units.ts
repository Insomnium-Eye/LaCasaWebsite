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
    monthlyRateMXN: 15000,
    shortTermMin: 55,
    shortTermMax: 115,
    airbnbUrl: "https://airbnb.com/h/oaxaca-rental-bungalow1",
    displayImage: "/imgs/Bungalow1/Exterior1.jpg",
    galleryImages: [
      "/imgs/Bungalow1/Exterior2.jpg",
      "/imgs/Bungalow1/Exterior3.jpg",
      "/imgs/Bungalow1/Bed1.jpg",
      "/imgs/Bungalow1/Bed2.jpg",
      "/imgs/Bungalow1/Bathroom1.jpg",
      "/imgs/Bungalow1/Kitchenette1.jpg",
      "/imgs/Bungalow1/Kitchenette2.jpg"
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
    displayImage: "/imgs/Bungalow2/Exterior1.jpg",
    galleryImages: [
      "/imgs/Bungalow2/Bed1.jpg",
      "/imgs/Bungalow2/Bathroom1.jpg",
      "/imgs/Bungalow2/Kitchennette1.jpg",
      "/imgs/Bungalow2/Table1.jpg"
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
    monthlyRateMXN: 10000,
    shortTermMin: 40,
    shortTermMax: 100,
    airbnbUrl: "https://airbnb.com/h/oaxaca-rental-room1",
    displayImage: "/imgs/Room/Exterior1.jpg",
    galleryImages: [
      "/imgs/Room/Exterior2.jpg",
      "/imgs/Room/Exterior3.jpg",
      "/imgs/Room/Bed1.jpg",
      "/imgs/Room/Bed2.jpg",
      "/imgs/Room/Bathroom1.jpg",
      "/imgs/Room/Kitchenette.jpg"
    ]
  },
];
