"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/context/cart-context";
import "../globals.css";
import "./checkout.css";

export default function CheckoutPage() {
  const { items, total, count, clear } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        customer: { name: data.get("name"), phone: data.get("phone"), email: data.get("email"), orderDate: data.get("date"), preferredTime: data.get("time"), fulfillment: data.get("fulfillment"), notes: data.get("notes") },
        items: items.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }))
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to place order");
      setOrderId(result.order.id); setSubmitted(true); clear();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to place order. Please try again."); }
    finally { setLoading(false); }
  }

  if (submitted) return <main className="checkout-page shell"><div className="success"><div className="success-mark">✓</div><p className="eyebrow">ORDER RECEIVED</p><h1>We&apos;ve got it.</h1><p>Your order <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> has been received. Zee&apos;s Kitchen will confirm the details with you.</p><a className="primary" href="/">Back to Zee&apos;s Kitchen <span>→</span></a></div></main>;
  if (!items.length) return <main className="checkout-page shell"><div className="empty-cart"><h2>Your cart is empty.</h2><a className="primary" href="/menu">Browse the menu <span>→</span></a></div></main>;
  return <main className="checkout-page shell"><a className="back" href="/cart">← Back to cart</a><header className="cart-header"><p className="eyebrow">CHECKOUT</p><h1>Almost there.</h1><p>{count} {count === 1 ? "item" : "items"} · ${total.toFixed(2)}</p></header><div className="checkout-layout"><form onSubmit={submit} className="order-form"><label>Full name<input name="name" required placeholder="Your name" /></label><label>Phone number<input name="phone" type="tel" required placeholder="(204) 000-0000" /></label><label>Email <span>optional</span><input name="email" type="email" placeholder="you@example.com" /></label><div className="form-row"><label>Order date<input name="date" type="date" required /></label><label>Preferred time<input name="time" type="time" required /></label></div><label>Pickup or delivery<select name="fulfillment" defaultValue="pickup"><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label><label>Notes <span>optional</span><textarea name="notes" rows={4} placeholder="Allergies, special requests, delivery notes..." /></label>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary" type="submit" disabled={loading}>{loading ? "Placing order…" : <>Place order <span>→</span></>}</button></form><aside className="checkout-summary"><p className="eyebrow">YOUR ORDER</p>{items.map(item => <div className="mini-line" key={item.id}><span>{item.name} × {item.quantity}</span><strong>${(item.price * item.quantity).toFixed(2)}</strong></div>)}<hr/><div className="mini-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div><p>Orders require 24–48 hours notice. Your order is a request until Zee&apos;s Kitchen confirms it.</p></aside></div></main>;
}
