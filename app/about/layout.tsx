import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About La Casa",
  description:
    "La Casa Oaxaca is a private garden retreat in San Felipe del Agua — 15 minutes from downtown Oaxaca. Fruit orchards, contactless entry, mosquito protection, and authentic Oaxacan design.",
  alternates: { canonical: "https://oaxaca-rental.com/about" },
  openGraph: {
    title: "About La Casa Oaxaca",
    description: "Private garden retreat in San Felipe del Agua, Oaxaca. 15 min from downtown. Book direct.",
    url: "https://oaxaca-rental.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
