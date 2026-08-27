import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

async function ensureMenuTable() {
  const sql = db();
  await sql`CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    category TEXT NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    available BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(available, sort_order)`;
  return sql;
}

export async function GET() {
  try {
    const sql = await ensureMenuTable();
    const items = await sql`SELECT id,name,description,price_cents,category,image,available,sort_order FROM menu_items WHERE available=true ORDER BY sort_order ASC, name ASC`;
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Menu load failed", error);
    return NextResponse.json({ error: "Unable to load menu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, name, description, priceCents, category, image, available = true, sortOrder = 0 } = await request.json();
    if (![id, name, category].every(v => typeof v === "string" && v.trim()) || !Number.isInteger(priceCents) || priceCents < 0) {
      return NextResponse.json({ error: "Invalid menu item" }, { status: 400 });
    }
    const sql = await ensureMenuTable();
    const [item] = await sql`
      INSERT INTO menu_items(id,name,description,price_cents,category,image,available,sort_order)
      VALUES(${id.trim()},${name.trim()},${description?.trim() || ""},${priceCents},${category.trim()},${image?.trim() || ""},${available},${sortOrder})
      RETURNING id,name,description,price_cents,category,image,available,sort_order
    `;
    return NextResponse.json({ item }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Menu create failed", error);
    return NextResponse.json({ error: "Unable to create menu item. Please check the database connection." }, { status: 500 });
  }
}
