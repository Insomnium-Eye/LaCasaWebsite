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
    nightlyRate: 1500,
    weeklyRate: 10500,
    monthlyRate: 45000,
    airbnbUrl: "https://www.airbnb.com/rooms/1702322410862536247?guests=1&adults=1&s=67&unique_share_id=cfc3dff4-51a6-4d49-9c5f-47b539e8ca5b",
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
    terrace: "Private veranda with garden access",
    nightlyRate: 2000,
    weeklyRate: 14000,
    monthlyRate: 60000,
    airbnbUrl: "https://www.airbnb.com/rooms/1702417529255850388?guests=1&adults=1&s=67&unique_share_id=295241b4-053b-4393-a59b-4a58eae29e38"
  },
  {
    slug: "main-bedroom",
    name: "Main Residence Bedroom",
    type: "Bedroom in main house",
    summary: "Relaxed room inside the main residence with private bathroom and authentic style.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Shared terrace nearby",
    nightlyRate: 1500,
    weeklyRate: 10500,
    monthlyRate: 45000,
    airbnbUrl: "https://www.airbnb.com/rooms/1702419818538938394?guests=1&adults=1&s=67&unique_share_id=69f850f1-2d03-441d-b0ed-b316286848a7"
  },
];
