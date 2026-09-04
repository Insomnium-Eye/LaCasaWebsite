import "./globals.css";
import type { Metadata } from "next";
import ClientLayout from "../components/ClientLayout";

const siteUrl = "https://www.oaxaca-rental.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "La Casa Oaxaca | Private Bungalow Rentals in San Felipe del Agua",
    template: "%s | La Casa Oaxaca",
  },
  description:
    "Private bungalows and rooms for rent in San Felipe del Agua, Oaxaca. Short-term nightly stays via Airbnb or direct monthly leases from 1–12 months. Garden setting, contactless entry, fruit orchard, 15 min from downtown Oaxaca.",
  keywords: [
    "Oaxaca rental",
    "bungalow rental Oaxaca",
    "San Felipe del Agua rental",
    "long term rental Oaxaca",
    "monthly rental Oaxaca",
    "Oaxaca bungalow",
    "rent Oaxaca Mexico",
    "Oaxaca accommodation",
    "private rental Oaxaca",
    "Oaxaca expat housing",
    "alquiler Oaxaca",
    "renta bungalow Oaxaca",
  ],
  authors: [{ name: "La Casa Oaxaca" }],
  creator: "La Casa Oaxaca",
  publisher: "La Casa Oaxaca",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_MX",
    url: siteUrl,
    siteName: "La Casa Oaxaca",
    title: "La Casa Oaxaca | Private Bungalow Rentals in San Felipe del Agua",
    description:
      "Private bungalows and rooms for rent in San Felipe del Agua, Oaxaca. Short-term or monthly lease. Garden, orchard, contactless entry.",
    images: [
      {
        url: "/imgs/OaxacaPicture_1.jpg",
        width: 1200,
        height: 630,
        alt: "La Casa Oaxaca — private bungalows in San Felipe del Agua",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Casa Oaxaca | Private Bungalow Rentals",
    description:
      "Private bungalows in San Felipe del Agua, Oaxaca. Short-term or monthly lease. Book direct.",
    images: ["/imgs/OaxacaPicture_1.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    // Add your Google Search Console verification token here once you have it:
    // google: "YOUR_VERIFICATION_TOKEN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="geo.region" content="MX-OAX" />
        <meta name="geo.placename" content="San Felipe del Agua, Oaxaca, Mexico" />
        <meta name="geo.position" content="17.1023;-96.7241" />
        <meta name="ICBM" content="17.1023, -96.7241" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LodgingBusiness",
              name: "La Casa Oaxaca",
              description:
                "Private bungalows and rooms for rent in San Felipe del Agua, Oaxaca. Short-term nightly stays or direct monthly leases from 1 to 12 months.",
              url: siteUrl,
              image: `${siteUrl}/imgs/OaxacaPicture_1.jpg`,
              priceRange: "$40–$125 USD/night · $470–$1,350 USD/month",
              currenciesAccepted: "USD, MXN",
              paymentAccepted: "Cash, Bank Transfer",
              address: {
                "@type": "PostalAddress",
                streetAddress: "San Felipe del Agua",
                addressLocality: "Oaxaca de Juárez",
                addressRegion: "Oaxaca",
                postalCode: "68020",
                addressCountry: "MX",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 17.1023,
                longitude: -96.7241,
              },
              amenityFeature: [
                { "@type": "LocationFeatureSpecification", name: "Private parking", value: true },
                { "@type": "LocationFeatureSpecification", name: "Garden", value: true },
                { "@type": "LocationFeatureSpecification", name: "Contactless check-in", value: true },
                { "@type": "LocationFeatureSpecification", name: "Fruit orchard", value: true },
                { "@type": "LocationFeatureSpecification", name: "Mosquito protection", value: true },
              ],
              containsPlace: [
                {
                  "@type": "LodgingBusiness",
                  name: "Sun of My Heart — Bungalow 1",
                  description: "Private bungalow with garden access, en-suite bathroom, and private veranda.",
                },
                {
                  "@type": "LodgingBusiness",
                  name: "Magic Moon — Bungalow 2",
                  description: "Private bungalow surrounded by flowers and trees, with en-suite bathroom.",
                },
                {
                  "@type": "LodgingBusiness",
                  name: "Blessed Land — Main Bedroom",
                  description: "Peaceful bedroom inside the main residence with garden views.",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-soft text-slate-900 antialiased">
        <ClientLayout>
          <main>{children}</main>
        </ClientLayout>
      </body>
    </html>
  );
}
