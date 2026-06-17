export type Unit = {
  slug: string;
  name: string;
  type: string;
  summary: string;
  capacity: number;
  bathroom: string;
  terrace: string;
  nightlyRate?: number;
  weeklyRate?: number;
  monthlyRate?: number;
  airbnbUrl?: string;
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
    airbnbUrl: "https://www.airbnb.com/rooms/1702322410862536247?guests=1&adults=1&s=67&unique_share_id=cfc3dff4-51a6-4d49-9c5f-47b539e8ca5b",
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
    airbnbUrl: "https://www.airbnb.com/rooms/1702417529255850388?guests=1&adults=1&s=67&unique_share_id=295241b4-053b-4393-a59b-4a58eae29e38",
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
    airbnbUrl: "https://www.airbnb.com/rooms/1702419818538938394?guests=1&adults=1&s=67&unique_share_id=69f850f1-2d03-441d-b0ed-b316286848a7",
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
