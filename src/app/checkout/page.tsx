"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import "../globals.css";
import "./checkout.css";

const provinces = [
  "Manitoba",
  "Ontario",
  "Alberta",
  "British Columbia",
  "Saskatchewan",
  "Quebec",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Prince Edward Island",
  "Yukon",
  "Northwest Territories",
  "Nunavut",
];

function addHours(d: Date, hours: number) {
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toTimeInput(d: Date) {
  return d.toTimeString().slice(0, 5);
}

export default function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [leadHours, setLeadHours] = useState(24);
  const [minDelivery, setMinDelivery] = useState(3500);
  const [pickupNote, setPickupNote] = useState("");
  const [pricing, setPricing] = useState({
    deliveryCents: 0,
    taxCents: 0,
    totalCents: Math.round(total * 100),
    currency: "CAD",
  });

  const minDateTime = useMemo(() => addHours(new Date(), leadHours), [leadHours]);
  const minDate = toDateInput(minDateTime);

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        setLeadHours(Number(s.lead_hours || 24));
        setMinDelivery(Number(s.min_delivery_order_cents || 3500));
        setPaymentNote(
          s.payment_note ||
            "Payment is arranged after we confirm your order. We accept Interac e-Transfer.",
        );
        setPickupNote(
          s.pickup_note ||
            "Pickup location is confirmed by WhatsApp when your order is accepted.",
        );
        const subtotal = Math.round(total * 100);
        const fee = 0;
        const tax = Math.round((subtotal + fee) * Number(s.tax_rate || 0.05));
        setPricing({
          deliveryCents: fee,
          taxCents: tax,
          totalCents: subtotal + fee + tax,
          currency: s.currency || "CAD",
        });
      })
      .catch(() => {});
  }, [total]);

  async function refreshPricing(isDelivery: boolean) {
    const r = await fetch("/api/pricing");
    if (r.ok) {
      const s = (await r.json()).settings;
      const subtotal = Math.round(total * 100),
        fee = isDelivery ? Number(s.delivery_fee_cents || 0) : 0,
        tax = Math.round((subtotal + fee) * Number(s.tax_rate || 0));
      setPricing({
        deliveryCents: fee,
        taxCents: tax,
        totalCents: subtotal + fee + tax,
        currency: s.currency || "CAD",
      });
      setLeadHours(Number(s.lead_hours || 24));
      setMinDelivery(Number(s.min_delivery_order_cents || 3500));
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const d = new FormData(e.currentTarget);
    const fulfillment = String(d.get("fulfillment"));
    const orderDate = String(d.get("date"));
    const preferredTime = String(d.get("time"));

    // Client-side lead check
    const when = new Date(`${orderDate}T${preferredTime}:00`);
    if (when < minDateTime) {
      setError(
        `Orders need at least ${leadHours} hours notice. Please pick a later date or time.`,
      );
      setLoading(false);
      return;
    }

    if (fulfillment === "delivery" && Math.round(total * 100) < minDelivery) {
      setError(
        `Delivery orders need a minimum of $${(minDelivery / 100).toFixed(2)} CAD before fees.`,
      );
      setLoading(false);
      return;
    }

    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: d.get("name"),
            phone: d.get("phone"),
            email: d.get("email"),
            orderDate,
            preferredTime,
            fulfillment,
            address: d.get("address"),
            city: d.get("city"),
            province: d.get("province"),
            postalCode: d.get("postalCode"),
            notes: d.get("notes"),
          },
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            selectedOptions: i.selectedOptions || [],
          })),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw Error(j.error || "Unable to place order");
      setOrderId(j.order.id);
      if (j.paymentNote) setPaymentNote(j.paymentNote);
      setSubmitted(true);
      clear();
    } catch (x) {
      setError(
        x instanceof Error ? x.message : "Unable to place order. Please try again",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted)
    return (
      <main className="checkout-page shell">
        <div className="success">
          <div className="success-mark">✓</div>
          <p className="eyebrow">ORDER RECEIVED</p>
          <h1>We&apos;ve got it.</h1>
          <p>
            Your order <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> has
            been received. Zee&apos;s Kitchen will confirm the details with you
            by phone or WhatsApp.
          </p>
          <div className="success-pay">
            <p className="eyebrow">PAYMENT</p>
            <p>{paymentNote}</p>
          </div>
          <p className="success-hint">
            Questions? Message us on{" "}
            <a href="https://wa.me/12049635748" target="_blank" rel="noreferrer">
              WhatsApp 204-963-5748
            </a>
            .
          </p>
          <a className="primary" href="/">
            Back to Zee&apos;s Kitchen <span>→</span>
          </a>
        </div>
      </main>
    );

  if (!items.length)
    return (
      <main className="checkout-page shell">
        <div className="empty-cart">
          <h2>Your cart is empty.</h2>
          <a className="primary" href="/menu">
            Browse the menu <span>→</span>
          </a>
        </div>
      </main>
    );

  const subtotalCents = Math.round(total * 100);

  return (
    <main className="checkout-page shell">
      <a className="back" href="/cart">
        ← Back to cart
      </a>
      <header className="cart-header">
        <p className="eyebrow">CHECKOUT • CANADA</p>
        <h1>Almost there.</h1>
        <p>
          {count} {count === 1 ? "item" : "items"} · $
          {(pricing.totalCents / 100).toFixed(2)} {pricing.currency}
        </p>
      </header>

      <div className="checkout-notice">
        <strong>{leadHours}+ hour notice required</strong>
        <span>
          Earliest available: {minDate} from about {toTimeInput(minDateTime)}. All
          orders are requests until Zee confirms.
        </span>
      </div>

      <div className="checkout-layout">
        <form onSubmit={submit} className="order-form">
          <label>
            Full name
            <input name="name" required placeholder="Your name" />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              required
              placeholder="204-555-0123"
            />
          </label>
          <label>
            Email <span>optional</span>
            <input name="email" type="email" placeholder="you@example.com" />
          </label>
          <div className="form-row">
            <label>
              Order date
              <input name="date" type="date" required min={minDate} />
            </label>
            <label>
              Preferred time
              <input name="time" type="time" required />
            </label>
          </div>
          <label>
            Pickup or delivery
            <select
              name="fulfillment"
              defaultValue="pickup"
              onChange={(e) => {
                const v = e.target.value === "delivery";
                setDelivery(v);
                refreshPricing(v);
              }}
            >
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery (Winnipeg)</option>
            </select>
          </label>
          {delivery && (
            <div className="delivery-fields">
              <p className="field-hint">
                Delivery currently serves Winnipeg. Minimum order $
                {(minDelivery / 100).toFixed(2)} CAD before fees.
              </p>
              <label>
                Street address
                <input
                  name="address"
                  required
                  placeholder="123 Main Street"
                />
              </label>
              <div className="form-row">
                <label>
                  City
                  <input name="city" required defaultValue="Winnipeg" />
                </label>
                <label>
                  Province
                  <select name="province" defaultValue="Manitoba">
                    {provinces.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Postal code
                <input
                  name="postalCode"
                  required
                  placeholder="R3C 0A1"
                  maxLength={7}
                />
              </label>
            </div>
          )}
          {!delivery && pickupNote && (
            <p className="field-hint">{pickupNote}</p>
          )}
          <label>
            Notes <span>optional</span>
            <textarea
              name="notes"
              rows={4}
              placeholder="Allergies, spice preference, special requests…"
            />
          </label>

          <div className="pay-box">
            <p className="eyebrow">HOW YOU PAY</p>
            <p>{paymentNote}</p>
          </div>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="primary" type="submit" disabled={loading}>
            {loading ? (
              "Placing order…"
            ) : (
              <>
                Place order <span>→</span>
              </>
            )}
          </button>
        </form>

        <aside className="checkout-summary">
          <p className="eyebrow">YOUR ORDER</p>
          {items.map((i) => (
            <div className="mini-line" key={i.lineId}>
              <span>
                {i.name} × {i.quantity}
                {i.selectedOptions?.length ? (
                  <small className="mini-opts">
                    {i.selectedOptions
                      .map((o) => o.label || `×${o.quantity}`)
                      .join(", ")}
                  </small>
                ) : null}
              </span>
              <strong>${(i.price * i.quantity).toFixed(2)}</strong>
            </div>
          ))}
          <hr />
          <div className="mini-line">
            <span>Subtotal</span>
            <strong>${(subtotalCents / 100).toFixed(2)}</strong>
          </div>
          <div className="mini-line">
            <span>Delivery</span>
            <strong>${(pricing.deliveryCents / 100).toFixed(2)}</strong>
          </div>
          <div className="mini-line">
            <span>GST (5%)</span>
            <strong>${(pricing.taxCents / 100).toFixed(2)}</strong>
          </div>
          <div className="mini-total">
            <span>Total</span>
            <strong>
              ${(pricing.totalCents / 100).toFixed(2)} {pricing.currency}
            </strong>
          </div>
          <p>
            Orders require {leadHours}+ hours notice. Your order is a request
            until Zee&apos;s Kitchen confirms it.
          </p>
        </aside>
      </div>
    </main>
  );
}
