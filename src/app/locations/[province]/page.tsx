import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BUSINESS,
  PROVINCES,
  citiesByProvince,
  getProvince,
  SITE_URL,
} from "@/lib/canada-locations";
import "../../globals.css";
import "../locations.css";

type Props = { params: Promise<{ province: string }> };

export async function generateStaticParams() {
  return PROVINCES.map((p) => ({ province: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) return {};
  const title = `Comfort Food in ${province.name} | ${BUSINESS.name}`;
  const description = `${BUSINESS.name} serves comfort food from Winnipeg, Manitoba. Customers in ${province.name} can browse the menu, order ahead, or contact us on WhatsApp. 24–48 hour notice.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/locations/${province.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/locations/${province.slug}`,
      locale: "en_CA",
      type: "website",
    },
  };
}

export default async function ProvincePage({ params }: Props) {
  const { province: slug } = await params;
  const province = getProvince(slug);
  if (!province) notFound();
  const cities = citiesByProvince(province.code);
  const isHome = province.code === "MB";

  return (
    <main className="shell locations-page">
      <a className="back" href="/locations">
        ← All provinces
      </a>
      <header className="locations-hero">
        <p className="eyebrow">
          {province.code} · {isHome ? "HOME PROVINCE" : "CANADA"}
        </p>
        <h1>
          {BUSINESS.name} in {province.name}
        </h1>
        <p>
          {isHome
            ? `Based in Winnipeg, we cook comfort food for families across Manitoba. Order ahead for pickup or delivery (on request) with 24–48 hour notice.`
            : `We cook from Winnipeg, Manitoba. Customers in ${province.name} can browse the full menu and message us to discuss ordering. Fresh preparation requires 24–48 hour notice.`}
        </p>
        <div className="locations-cta">
          <a className="primary" href="/menu">
            Order from the menu <span>→</span>
          </a>
          <a
            className="secondary"
            href={BUSINESS.whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp us
          </a>
        </div>
      </header>

      <section className="city-list">
        <h2>Cities in {province.name}</h2>
        <div className="city-grid">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/locations/${province.slug}/${city.slug}`}
              className="city-chip"
            >
              {city.name}
            </Link>
          ))}
          {!cities.length && (
            <p className="muted">
              Reach us on WhatsApp for orders from anywhere in {province.name}.
            </p>
          )}
        </div>
      </section>

      <section className="locations-note">
        <p className="eyebrow">HOW ORDERING WORKS</p>
        <ol className="order-steps">
          <li>Browse the menu and build your order online.</li>
          <li>Checkout with your preferred date and time (24–48 hr notice).</li>
          <li>We confirm by phone or WhatsApp before cooking.</li>
        </ol>
        <a className="primary" href="/menu">
          Start an order <span>→</span>
        </a>
      </section>
    </main>
  );
}
