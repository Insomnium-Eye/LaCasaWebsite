import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";

export const metadata: Metadata = {
  title: "La Casa Oaxaca | Direct Booking Boutique Retreat",
  description: "Luxury direct-booking rental in San Felipe del Agua, Oaxaca with private bungalows and a 10% discount for direct reservations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-soft text-slate-900 antialiased">
        <ClientLayout>
          <main>{children}</main>
        </ClientLayout>
      </body>
    </html>
  );
}
