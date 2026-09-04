import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Available Units",
  description:
    "Browse private bungalows and rooms for rent in San Felipe del Agua, Oaxaca. Short-term nightly stays via Airbnb or direct monthly leases from 1 to 12 months. Three units available: Sun of My Heart, Magic Moon, and Blessed Land.",
  alternates: { canonical: "https://www.oaxaca-rental.com/units" },
  openGraph: {
    title: "Available Units | La Casa Oaxaca",
    description: "Private bungalows and rooms for rent in Oaxaca. Short-term or 1–12 month lease. Book direct.",
    url: "https://www.oaxaca-rental.com/units",
    images: [{ url: "/imgs/Bungalow1/Main.jpg", width: 1200, height: 630, alt: "Bungalow at La Casa Oaxaca" }],
  },
};

export default function UnitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
