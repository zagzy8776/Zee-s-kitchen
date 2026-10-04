import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { BUSINESS, SITE_URL } from "@/lib/canada-locations";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} | Comfort Food in Winnipeg, Manitoba`,
    template: `%s | ${BUSINESS.name}`,
  },
  description: BUSINESS.description,
  keywords: [
    "Zee's Kitchen",
    "Zee's Comfort Kitchen",
    "comfort food Winnipeg",
    "jollof Winnipeg",
    "order food Winnipeg",
    "African food Manitoba",
    "catering Winnipeg",
    "pickup delivery Winnipeg",
  ],
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} | Comfort Food in Winnipeg`,
    description: BUSINESS.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} | Comfort Food in Winnipeg`,
    description: BUSINESS.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#111111",
  appleWebApp: {
    capable: true,
    title: "Zee's Kitchen",
    statusBarStyle: "default",
  },
  other: {
    "geo.region": "CA-MB",
    "geo.placename": "Winnipeg",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: BUSINESS.name,
  alternateName: "Zee's Kitchen",
  description: BUSINESS.description,
  url: SITE_URL,
  telephone: BUSINESS.phone,
  servesCuisine: BUSINESS.cuisine,
  priceRange: BUSINESS.priceRange,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Winnipeg",
    addressRegion: "MB",
    addressCountry: "CA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.8951,
    longitude: -97.1384,
  },
  areaServed: {
    "@type": "City",
    name: "Winnipeg",
  },
  sameAs: BUSINESS.sameAs,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-CA">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <CartProvider>{children}</CartProvider>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`window.OneSignalDeferred = window.OneSignalDeferred || [];
window.OneSignalDeferred.push(async function(OneSignal) {
  await OneSignal.init({ appId: "efe0837d-52d8-4b0c-b650-b7db0d18eff0" });
});`}
        </Script>
      </body>
    </html>
  );
}
