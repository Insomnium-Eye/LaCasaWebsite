export type Unit = {
  slug: string;
  name: string;
  type: string;
  summary: string;
  capacity: number;
  bathroom: string;
  terrace: string;
  nightlyRate: number;
  weeklyRate: number;
  monthlyRate: number;
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
    terrace: "Private veranda and garden area",
    nightlyRate: 75,
    weeklyRate: 450,
    monthlyRate: 1575,
    displayImage: "/imgs/OaxacaPicture_7.jpg",
    galleryImages: ["/imgs/OaxacaPicture_8.jpg", "/imgs/OaxacaPicture_9.jpg"]
  },
  {
    slug: "bungalow-2",
    name: "Bungalow 2",
    type: "Private bungalow",
    summary: "Bright retreat with direct garden access and comfortable indoor/outdoor living.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Private veranda and garden area",
    nightlyRate: 90,
    weeklyRate: 500,
    monthlyRate: 1575
  },
  {
    slug: "main-bedroom",
    name: "Main Residence Bedroom",
    type: "Bedroom in main house",
    summary: "Relaxed room inside the main residence with private bathroom and authentic style.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Shared terrace nearby",
    nightlyRate: 75,
    weeklyRate: 450,
    monthlyRate: 1575
  },
  {
    slug: "entire-house",
    name: "Entire House",
    type: "Full property rental",
    summary: "Rent the entire beautiful property including all bungalows and the main residence (office and master bedroom remain locked).",
    capacity: 6,
    bathroom: "Multiple bathrooms",
    terrace: "Multiple terraces and garden areas",
    nightlyRate: 0,
    weeklyRate: 1200,
    monthlyRate: 2700,
    displayImage: "/imgs/OaxacaPicture_1.jpg",
    galleryImages: ["/imgs/OaxacaPicture_2.jpg", "/imgs/OaxacaPicture_3.jpg", "/imgs/OaxacaPicture_4.jpg"]
  }
];
