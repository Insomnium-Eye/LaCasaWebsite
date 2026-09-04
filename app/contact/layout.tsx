import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact La Casa Oaxaca to inquire about bungalow rentals in San Felipe del Agua. Reach us by email or WhatsApp for availability, lease terms, and direct booking.",
  alternates: { canonical: "https://www.oaxaca-rental.com/contact" },
  openGraph: {
    title: "Contact La Casa Oaxaca",
    description: "Inquire about bungalow rentals in San Felipe del Agua, Oaxaca. Email or WhatsApp.",
    url: "https://www.oaxaca-rental.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
