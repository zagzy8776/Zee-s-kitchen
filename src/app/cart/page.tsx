"use client";

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import "../globals.css";
import "./cart.css";

export default function CartPage() {
  const { items, total, count, add, remove } = useCart();
  const router = useRouter();
  return <main className="cart-page shell"><a className="back" href="/menu">← Continue shopping</a><header className="cart-header"><p className="eyebrow">YOUR ORDER</p><h1>Your cart.</h1><p>{count ? `${count} ${count === 1 ? "item" : "items"} ready to order.` : "Your cart is waiting for something delicious."}</p></header>{!items.length ? <div className="empty-cart"><div>✦</div><h2>Nothing here yet.</h2><a className="primary" href="/menu">Browse the menu <span>→</span></a></div> : <div className="cart-layout"><section className="cart-items">{items.map(item => <article className="cart-item" key={item.id}><div className="cart-thumb" style={{backgroundImage:`url(${item.image})`}}/><div className="cart-item-main"><h2>{item.name}</h2><p>{item.description}</p><div className="quantity"><button type="button" onClick={()=>remove(item.id)} aria-label={`Remove one ${item.name}`}>−</button><strong>{item.quantity}</strong><button type="button" onClick={()=>add(item)} aria-label={`Add one ${item.name}`}>+</button></div></div><strong className="cart-price">${(item.price*item.quantity).toFixed(2)}</strong></article>)}</section><aside className="summary"><p className="eyebrow">ORDER SUMMARY</p><div><span>Subtotal</span><strong>${total.toFixed(2)}</strong></div><div><span>Delivery</span><span>Calculated at checkout</span></div><hr/><div className="grand"><span>Total</span><strong>${total.toFixed(2)}</strong></div><button type="button" className="primary checkout" onClick={()=>router.push("/checkout")}>Continue to checkout <span>→</span></button><small>Orders require 24–48 hours notice.</small></aside></div>}</main>;
}
