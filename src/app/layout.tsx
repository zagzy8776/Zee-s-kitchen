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
    "Zees Kitchen Winnipeg",
    "Zee comfort kitchen",
    "comfort food Winnipeg",
    "order food Winnipeg",
    "food delivery Winnipeg",
    "food pickup Winnipeg",
    "order ahead Winnipeg",
    "home cooked meals Winnipeg",
    "family meals Winnipeg",
    "African food Winnipeg",
    "West African food Winnipeg",
    "Nigerian food Winnipeg",
    "jollof rice Winnipeg",
    "jollof Winnipeg",
    "fried rice Winnipeg",
    "peppered chicken Winnipeg",
    "plantain Winnipeg",
    "African restaurant Winnipeg",
    "African takeout Winnipeg",
    "comfort food Manitoba",
    "African food Manitoba",
    "catering Winnipeg",
    "private chef Winnipeg",
    "meal prep Winnipeg",
    "birthday catering Winnipeg",
    "party food Winnipeg",
    "St Boniface food",
    "Transcona restaurant",
    "St Vital takeout",
    "Fort Garry food delivery",
    "Selkirk Manitoba food",
    "Steinbach takeout",
    "Brandon Manitoba catering",
    "order jollof online",
    "24 hour notice food order",
    "freshly prepared meals Winnipeg",
    "WhatsApp food order Winnipeg",
    "book a table Winnipeg",
    "comfort kitchen Canada",
    "best jollof in Winnipeg",
    "homemade African food Canada",
  ],
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  category: "food",
  classification: "Restaurant, Food Ordering",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} | Order Comfort Food in Winnipeg`,
    description: BUSINESS.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} | Comfort Food Winnipeg`,
    description: BUSINESS.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  themeColor: "#f6eee6",
  appleWebApp: {
    capable: true,
    title: "Zee's Kitchen",
    statusBarStyle: "default",
  },
  other: {
    "geo.region": "CA-MB",
    "geo.placename": "Winnipeg",
    "geo.position": "49.8951;-97.1384",
    ICBM: "49.8951, -97.1384",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Restaurant", "FoodEstablishment"],
  name: BUSINESS.name,
  alternateName: ["Zee's Kitchen", "Zees Comfort Kitchen", "Zee Comfort Kitchen"],
  description: BUSINESS.description,
  url: SITE_URL,
  telephone: BUSINESS.phone,
  servesCuisine: BUSINESS.cuisine,
  priceRange: BUSINESS.priceRange,
  keywords: BUSINESS.keywords.join(", "),
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
  areaServed: [
    { "@type": "City", name: "Winnipeg" },
    { "@type": "AdministrativeArea", name: "Manitoba" },
    { "@type": "Country", name: "Canada" },
  ],
  knowsAbout: [
    "Jollof rice",
    "West African cuisine",
    "Comfort food",
    "Nigerian food",
    "Catering",
    "Order-ahead meals",
  ],
  potentialAction: {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/menu`,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    deliveryMethod: [
      "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet",
      "http://purl.org/goodrelations/v1#DeliveryModePickUp",
    ],
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
