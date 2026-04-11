export type Unit = {
  slug: string;
  name: string;
  type: string;
  summary: string;
  capacity: number;
  bathroom: string;
  terrace: string;
  rate: number;
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
    rate: 190
  },
  {
    slug: "bungalow-2",
    name: "Bungalow 2",
    type: "Private bungalow",
    summary: "Bright retreat with direct garden access and comfortable indoor/outdoor living.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Private veranda and garden area",
    rate: 180
  },
  {
    slug: "main-bedroom",
    name: "Main Residence Bedroom",
    type: "Bedroom in main house",
    summary: "Relaxed room inside the main residence with private bathroom and authentic style.",
    capacity: 2,
    bathroom: "En-suite bathroom",
    terrace: "Shared terrace nearby",
    rate: 155
  }
];
