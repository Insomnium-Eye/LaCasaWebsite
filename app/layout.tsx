import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "La Casa Oaxaca | Direct Booking Boutique Retreat",
  description: "Luxury direct-booking rental in San Felipe del Agua, Oaxaca with private bungalows and a 10% discount for direct reservations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-soft text-slate-900 antialiased">
        <div className="min-h-screen bg-white">
          <Navigation />
          <main>{children}</main>
          <footer className="border-t border-slate-200 bg-adobe px-6 py-10 text-slate-700">
            <div className="mx-auto max-w-6xl text-sm leading-6">
              <p className="font-semibold text-slate-900">La Casa San Felipe del Agua</p>
              <p>Book direct for a 10% discount. Email: hello@lacasaoaxaca.mx</p>
              <p className="mt-4">© 2026 La Casa Oaxaca. Privacy policy | Terms of service</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
