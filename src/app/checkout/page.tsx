"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import "../globals.css";

export default function CheckoutPage() {
  const { items, total, count } = useCart();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) return <main className="checkout-page shell"><div className="success"><div className="success-mark">✓</div><p className="eyebrow">ORDER RECEIVED</p><h1>We&apos;ve got it.</h1><p>Your order request has been received. Zee&apos;s Kitchen will confirm the details with you.</p><a className="primary" href="/">Back to Zee&apos;s Kitchen <span>→</span></a></div></main>;

  if (!items.length) return <main className="checkout-page shell"><div className="empty-cart"><h2>Your cart is empty.</h2><a className="primary" href="/menu">Browse the menu <span>→</span></a></div></main>;

  return <main className="checkout-page shell"><a className="back" href="/cart">← Back to cart</a><header className="cart-header"><p className="eyebrow">CHECKOUT</p><h1>Almost there.</h1><p>{count} {count === 1 ? "item" : "items"} · ${total.toFixed(2)}</p></header><div className="checkout-layout"><form onSubmit={submit} className="order-form"><label>Full name<input name="name" required placeholder="Your name" /></label><label>Phone number<input name="phone" type="tel" required placeholder="(204) 000-0000" /></label><label>Email <span>optional</span><input name="email" type="email" placeholder="you@example.com" /></label><div className="form-row"><label>Order date<input name="date" type="date" required /></label><label>Preferred time<input name="time" type="time" required /></label></div><label>Pickup or delivery<select name="fulfillment" defaultValue="pickup"><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></label><label>Notes <span>optional</span><textarea name="notes" rows={4} placeholder="Allergies, special requests, delivery notes..." /></label><button className="primary" type="submit">Place order <span>→</span></button></form><aside className="checkout-summary"><p className="eyebrow">YOUR ORDER</p>{items.map(item => <div className="mini-line" key={item.id}><span>{item.name} × {item.quantity}</span><strong>${(item.price * item.quantity).toFixed(2)}</strong></div>)}<hr/><div className="mini-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div><p>Orders require 24–48 hours notice. Your order is a request until Zee&apos;s Kitchen confirms it.</p></aside></div></main>;
}
