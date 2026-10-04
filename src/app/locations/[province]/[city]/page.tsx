import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BUSINESS,
  CITIES,
  PROVINCES,
  getCity,
  SITE_URL,
} from "@/lib/canada-locations";
import "../../../globals.css";
import "../../locations.css";

type Props = { params: Promise<{ province: string; city: string }> };

export async function generateStaticParams() {
  return CITIES.map((c) => {
    const province = PROVINCES.find((p) => p.code === c.provinceCode)!;
    return { province: province.slug, city: c.slug };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: pSlug, city: cSlug } = await params;
  const data = getCity(pSlug, cSlug);
  if (!data) return {};
  const { province, city } = data;
  const title = `Order Comfort Food in ${city.name}, ${province.code} | ${BUSINESS.name}`;
  const description = `Looking for comfort food in ${city.name}, ${province.name}? ${BUSINESS.name} cooks from Winnipeg with 24–48 hour notice. Browse the menu, order ahead, or message us on WhatsApp.`;
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/locations/${province.slug}/${city.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/locations/${province.slug}/${city.slug}`,
      locale: "en_CA",
      type: "website",
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { province: pSlug, city: cSlug } = await params;
  const data = getCity(pSlug, cSlug);
  if (!data) notFound();
  const { province, city } = data;
  const isWinnipegArea =
    province.code === "MB" &&
    [
      "winnipeg",
      "st-boniface",
      "transcona",
      "st-vital",
      "fort-garry",
      "charleswood",
      "tuxedo",
      "river-heights",
      "east-kildonan",
      "west-kildonan",
      "st-james",
      "garden-city",
      "north-kildonan",
      "selkirk",
      "stonewall",
      "oakbank",
      "niverville",
      "st-andrews",
    ].includes(city.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: BUSINESS.name,
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
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: province.name,
      },
    },
    sameAs: BUSINESS.sameAs,
  };

  return (
    <main className="shell locations-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="locations-breadcrumb" aria-label="Breadcrumb">
        <Link href="/locations">Canada</Link>
        <span>/</span>
        <Link href={`/locations/${province.slug}`}>{province.name}</Link>
        <span>/</span>
        <span>{city.name}</span>
      </nav>

      <header className="locations-hero">
        <p className="eyebrow">
          {city.name.toUpperCase()} · {province.code}
        </p>
        <h1>
          Comfort food for {city.name}
          {isWinnipegArea ? " — we cook here." : "."}
        </h1>
        <p>
          {isWinnipegArea
            ? `Zee's Comfort Kitchen is based in Winnipeg. Residents of ${city.name} can order online for pickup or request delivery with 24–48 hour notice. Every plate is prepared fresh.`
            : `${BUSINESS.name} cooks from Winnipeg, Manitoba. If you are in ${city.name}, ${province.name}, you can still browse the full menu and contact us on WhatsApp to arrange an order. We need 24–48 hours to cook properly.`}
        </p>
        <div className="locations-cta">
          <a className="primary" href="/menu">
            Browse menu <span>→</span>
          </a>
          <a
            className="secondary"
            href={BUSINESS.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Message on WhatsApp
          </a>
        </div>
      </header>

      <section className="locations-features">
        <article>
          <h2>24–48 hour notice</h2>
          <p>
            We do not run a fast-food line. Every order is cooked with intention.
            Plan ahead and we will confirm your time slot.
          </p>
        </article>
        <article>
          <h2>{isWinnipegArea ? "Pickup & delivery" : "How to order"}</h2>
          <p>
            {isWinnipegArea
              ? "Pickup is available in Winnipeg. Delivery can be arranged on request for nearby neighbourhoods."
              : "Place your interest via the menu or WhatsApp. We will confirm whether we can fulfill from Winnipeg for your area."}
          </p>
        </article>
        <article>
          <h2>Real comfort food</h2>
          <p>
            Jollof, fried rice, peppered chicken, plantain and rotating specials —
            made for family tables, birthdays and busy weeks.
          </p>
        </article>
      </section>

      <section className="locations-note">
        <p className="eyebrow">NEXT STEP</p>
        <h2>See what is cooking today.</h2>
        <a className="primary" href="/menu">
          Open the menu <span>→</span>
        </a>
        <p className="muted" style={{ marginTop: 16 }}>
          <Link href={`/locations/${province.slug}`}>
            ← More cities in {province.name}
          </Link>
        </p>
      </section>
    </main>
  );
}
