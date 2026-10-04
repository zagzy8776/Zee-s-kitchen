import type { Metadata } from "next";
import { BUSINESS, SITE_URL } from "@/lib/canada-locations";
import "../globals.css";
import "./faq.css";

export const metadata: Metadata = {
  title: "FAQ · Ordering, Allergens & Delivery",
  description:
    "How ordering works at Zee's Comfort Kitchen in Winnipeg: lead time, payment by e-Transfer, allergens, pickup, delivery and catering.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

const faqs = [
  {
    q: "How far in advance do I need to order?",
    a: "We need at least 24 hours notice (sometimes 48 for larger or weekend orders). The checkout form only allows dates that meet our lead time so everything is cooked fresh.",
  },
  {
    q: "How do I pay?",
    a: "After we confirm your order, we accept Interac e-Transfer. Payment details are shared when Zee confirms. There is no card charge on the website yet.",
  },
  {
    q: "Do you deliver?",
    a: "Yes — primarily within Winnipeg. Delivery has a small fee and a minimum order amount. Other areas can be arranged by messaging us on WhatsApp.",
  },
  {
    q: "Where is pickup?",
    a: "Pickup location is confirmed by WhatsApp when your order is accepted. We will send the exact address and timing with your confirmation.",
  },
  {
    q: "What about allergies?",
    a: "Each dish can list common allergens and spice level on the menu. Always tell us about serious allergies in the order notes — our kitchen is a home-style environment and may share equipment.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Message us on WhatsApp as soon as possible. Once cooking has started we may not be able to change the order, but we will always try to help.",
  },
  {
    q: "Do you cater parties and birthdays?",
    a: "Yes. Use Book a table or WhatsApp for trays, family packs and celebrations. Give us extra notice for larger groups.",
  },
  {
    q: "Is the food spicy?",
    a: "Spice levels are marked on the menu (mild / medium / hot). Tell us in the notes if you want it milder or hotter.",
  },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="faq-page shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a className="back" href="/">
        ← Back home
      </a>
      <header className="faq-header">
        <p className="eyebrow">HELP · {BUSINESS.city.toUpperCase()}</p>
        <h1>Questions before you order.</h1>
        <p>
          Straightforward answers about lead time, payment, allergens and
          delivery at Zee&apos;s Comfort Kitchen.
        </p>
      </header>
      <div className="faq-list">
        {faqs.map((f) => (
          <details key={f.q} className="faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="faq-cta">
        <p>Still unsure?</p>
        <a
          className="primary"
          href="https://wa.me/12049635748"
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp us <span>→</span>
        </a>
        <a className="text-link" href="/menu">
          Browse the menu →
        </a>
      </div>
    </main>
  );
}
