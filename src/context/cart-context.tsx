"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { MenuItem } from "@/lib/menu";

type CartLine = MenuItem & { quantity: number };
type CartContextValue = { items: CartLine[]; count: number; total: number; add: (item: MenuItem) => void; remove: (id: string) => void; clear: () => void };

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zees-kitchen-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setItems([]); }
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);

  const value = useMemo(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    add: (item: MenuItem) => setItems((current) => current.some((x) => x.id === item.id) ? current.map((x) => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x) : [...current, { ...item, quantity: 1 }]),
    remove: (id: string) => setItems((current) => current.flatMap((x) => x.id !== id ? [x] : x.quantity > 1 ? [{ ...x, quantity: x.quantity - 1 }] : [])),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
