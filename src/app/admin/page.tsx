"use client";

import { useEffect, useState } from "react";
import "../globals.css";
import "./admin.css";

type Order = { id: string; customer_name: string; fulfillment: string; status: string; total_cents: number; created_at: string };
const statuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true); const [unauthorized, setUnauthorized] = useState(false);
  async function load() { const response = await fetch("/api/orders", { cache: "no-store" }); if (response.status === 401) { setUnauthorized(true); setLoading(false); return; } const data = await response.json(); setOrders(data.orders || []); setLoading(false); }
  useEffect(() => { load(); }, []);
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin/login"; }
  if (unauthorized) return <main className="admin-page shell"><div className="admin-empty"><h2>Sign in required.</h2><a className="primary" href="/admin/login">Open kitchen login <span>→</span></a></div></main>;
  const pending = orders.filter(o => ["pending", "confirmed", "preparing"].includes(o.status));
  return <main className="admin-page shell"><header className="admin-nav"><a className="brand" href="/"><span>Z</span> Zee&apos;s Kitchen</a><div><a href="/">View storefront →</a><button className="admin-logout" onClick={logout}>Sign out</button></div></header><div className="admin-heading"><div><p className="eyebrow">KITCHEN DASHBOARD</p><h1>Good evening, Zee.</h1><p>Here&apos;s what&apos;s happening with your orders.</p></div><div className="admin-date">Today<br/><strong>{new Date().toLocaleDateString("en-CA", { month: "long", day: "numeric" })}</strong></div></div><section className="stats"><div><span>Active orders</span><strong>{pending.length}</strong></div><div><span>Total orders</span><strong>{orders.length}</strong></div><div><span>Revenue</span><strong>${(orders.reduce((s,o)=>s+o.total_cents,0)/100).toFixed(2)}</strong></div></section><section className="orders"><div className="orders-head"><div><p className="eyebrow">ORDER QUEUE</p><h2>Recent orders</h2></div></div>{loading ? <div className="admin-empty">Loading orders…</div> : !orders.length ? <div className="admin-empty">No orders yet. They&apos;ll appear here when customers place one.</div> : <div className="order-table">{orders.map(order => <article key={order.id} className="admin-order"><div><strong>#{order.id.slice(0,8).toUpperCase()}</strong><span>{order.customer_name}</span></div><span>{order.fulfillment}</span><select className={`status ${order.status}`} value={order.status} onChange={async e => { const next=e.target.value; const r=await fetch(`/api/orders/${order.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:next})}); if(r.ok) setOrders(current=>current.map(o=>o.id===order.id?{...o,status:next}:o)); }} aria-label={`Update order ${order.id} status`}>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select><strong>${(order.total_cents/100).toFixed(2)}</strong></article>)}</div>}</section></main>;
}
