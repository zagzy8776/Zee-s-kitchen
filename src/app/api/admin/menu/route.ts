import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

export async function GET() {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
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
    const items = await sql`SELECT id,name,description,price_cents,category,image,available,sort_order FROM menu_items ORDER BY sort_order ASC,name ASC`;
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin menu load failed", error);
    return NextResponse.json({ error: "Unable to load menu. Please check the database connection." }, { status: 500 });
  }
}
