"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import type { MenuItem } from "@/lib/menu";
import "../globals.css";
import "./menu.css";

type DbItem = MenuItem & { price_cents: number; available: boolean };

export default function MenuPage() {
  const { add } = useCart();
  const [items, setItems] = useState<DbItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems((d.items || []).map((i: DbItem) => ({ ...i, price: i.price_cents / 100 }))))
      .finally(() => setLoading(false));
  }, []);

  const groups = items.reduce<Record<string, DbItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <main className="menu-page shell">
      <a className="back" href="/">← Back home</a>
      <header className="menu-header">
        <p className="eyebrow">ZEE&apos;S KITCHEN</p>
        <h1>The menu.</h1>
        <p>Freshly prepared comfort food. Please allow 24–48 hours for orders.</p>
      </header>
      <div className="menu-list">
        {loading ? (
          <p>Loading today&apos;s menu…</p>
        ) : (
          Object.entries(groups).map(([category, group]) => (
            <section key={category}>
              <h2>{category}</h2>
              {group.map((item, index) => (
                <article className="menu-row" key={item.id}>
                  <div>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{item.name}</h3>
                      <small>{item.description}</small>
                    </div>
                  </div>
                  <button type="button" disabled={!item.available} onClick={() => add({ ...item, price: item.price_cents / 100 })}>
                    {item.available ? <>Add to order <b>+</b></> : "Sold out"}
                  </button>
                </article>
              ))}
            </section>
          ))
        )}
      </div>
      <div className="menu-cta">
        <strong>Ready to order?</strong>
        <a className="primary" href="/cart">View your order <span>→</span></a>
      </div>
    </main>
  );
}
