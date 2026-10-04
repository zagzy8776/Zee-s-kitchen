import type { Metadata } from "next";
import { BUSINESS, SITE_URL } from "@/lib/canada-locations";

export const metadata: Metadata = {
  title: "Book a Table · Private Dinners & Celebrations",
  description:
    "Book a table or celebration with Zee's Comfort Kitchen in Winnipeg. Birthdays, family dinners and special occasions. We confirm every booking personally.",
  keywords: [
    "book a table Winnipeg",
    "private dinner Winnipeg",
    "birthday catering Winnipeg",
    "family dinner booking Manitoba",
    "Zee's Kitchen reservation",
    "celebration dinner Winnipeg",
  ],
  alternates: { canonical: `${SITE_URL}/book` },
  openGraph: {
    title: `Book a Table | ${BUSINESS.name}`,
    description: "Reserve a table or celebration dinner in Winnipeg.",
    url: `${SITE_URL}/book`,
    locale: "en_CA",
    type: "website",
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
