import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS,
  CITIES,
  PROVINCES,
  citiesByProvince,
  SITE_URL,
} from "@/lib/canada-locations";
import "../globals.css";
import "./locations.css";

export const metadata: Metadata = {
  title: `Order Comfort Food Across Canada | ${BUSINESS.name}`,
  description: `${BUSINESS.name} is based in Winnipeg, Manitoba. Browse our menu, order ahead, or book a table. Serving customers across Canada with 24–48 hour notice.`,
  alternates: { canonical: `${SITE_URL}/locations` },
  openGraph: {
    title: `Locations · ${BUSINESS.name}`,
    description: BUSINESS.description,
    url: `${SITE_URL}/locations`,
    locale: "en_CA",
    type: "website",
  },
};

export default function LocationsIndex() {
  return (
    <main className="shell locations-page">
      <a className="back" href="/">
        ← Back home
      </a>
      <header className="locations-hero">
        <p className="eyebrow">CANADA · WINNIPEG HOME KITCHEN</p>
        <h1>Where we cook. Where you can order.</h1>
        <p>
          Zee&apos;s Comfort Kitchen is based in <strong>Winnipeg, Manitoba</strong>.
          We prepare every order with 24–48 hour notice. Pickup and delivery are
          available on request in the Winnipeg area — customers across Canada can
          still browse the menu and reach us on WhatsApp.
        </p>
        <div className="locations-cta">
          <a className="primary" href="/menu">
            View menu <span>→</span>
          </a>
          <a className="secondary" href="/book">
            Book a table
          </a>
        </div>
      </header>

      <section className="locations-grid">
        {PROVINCES.map((province) => {
          const cities = citiesByProvince(province.code);
          return (
            <article key={province.code} className="province-card">
              <Link href={`/locations/${province.slug}`}>
                <span className="province-code">{province.code}</span>
                <h2>{province.name}</h2>
                <p>
                  {cities.length
                    ? `${cities.length} cities covered`
                    : "Province overview"}
                </p>
              </Link>
              {cities.length > 0 && (
                <ul>
                  {cities.slice(0, 8).map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/locations/${province.slug}/${city.slug}`}
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                  {cities.length > 8 && (
                    <li>
                      <Link href={`/locations/${province.slug}`}>
                        +{cities.length - 8} more
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </article>
          );
        })}
      </section>

      <section className="locations-note">
        <p className="eyebrow">IMPORTANT</p>
        <h2>Winnipeg is our kitchen.</h2>
        <p>
          We are not a national chain. Orders outside the Winnipeg area are
          handled case-by-case. Message us on WhatsApp with your city and we
          will confirm what is possible.
        </p>
        <a
          className="primary"
          href={BUSINESS.whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp {BUSINESS.phone.replace("+1-", "")} <span>→</span>
        </a>
      </section>
    </main>
  );
}
