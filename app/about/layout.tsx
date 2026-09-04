import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About La Casa",
  description:
    "La Casa Oaxaca is a private garden retreat in San Felipe del Agua — 15 minutes from downtown Oaxaca. Fruit orchards, contactless entry, mosquito protection, and authentic Oaxacan design.",
  alternates: { canonical: "https://www.oaxaca-rental.com/about" },
  openGraph: {
    title: "About La Casa Oaxaca",
    description: "Private garden retreat in San Felipe del Agua, Oaxaca. 15 min from downtown. Direct leasing.",
    url: "https://www.oaxaca-rental.com/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
