import type { Metadata } from "next";
import { BUSINESS, SITE_URL } from "@/lib/canada-locations";

export const metadata: Metadata = {
  title: "Menu · Order Jollof, Chicken & Comfort Food",
  description:
    "Browse Zee's Comfort Kitchen menu in Winnipeg. Jollof rice, fried rice, peppered chicken, plantain and specials. Order online with 24–48 hour notice for pickup or delivery.",
  keywords: [
    "Zee's Kitchen menu",
    "jollof rice menu Winnipeg",
    "African food menu Winnipeg",
    "order jollof Winnipeg",
    "peppered chicken Winnipeg",
    "fried rice Winnipeg menu",
    "plantain side Winnipeg",
    "comfort food menu Manitoba",
    "online food order Winnipeg",
  ],
  alternates: { canonical: `${SITE_URL}/menu` },
  openGraph: {
    title: `Menu | ${BUSINESS.name}`,
    description:
      "Freshly prepared comfort food. Order jollof, chicken bowls and more with 24–48 hour notice.",
    url: `${SITE_URL}/menu`,
    locale: "en_CA",
    type: "website",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
