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
    await sql`CREATE TABLE IF NOT EXISTS menu_item_options (
      id TEXT PRIMARY KEY,
      menu_item_id TEXT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      option_type TEXT NOT NULL DEFAULT 'choice' CHECK (option_type IN ('choice','quantity')),
      required BOOLEAN NOT NULL DEFAULT FALSE,
      min_quantity INTEGER NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
      max_quantity INTEGER NOT NULL DEFAULT 1 CHECK (max_quantity >= min_quantity),
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS menu_item_option_values (
      id TEXT PRIMARY KEY,
      option_id TEXT NOT NULL REFERENCES menu_item_options(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      price_delta_cents INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`;
    await sql`CREATE INDEX IF NOT EXISTS menu_item_options_item_idx ON menu_item_options(menu_item_id,sort_order)`;
    await sql`CREATE INDEX IF NOT EXISTS menu_item_option_values_option_idx ON menu_item_option_values(option_id,sort_order)`;
    const items = await sql`SELECT id,name,description,price_cents,category,image,available,sort_order FROM menu_items ORDER BY sort_order ASC,name ASC`;
    const options = await sql`SELECT id,menu_item_id,name,option_type,required,min_quantity,max_quantity,sort_order FROM menu_item_options ORDER BY sort_order ASC,id ASC`;
    const values = await sql`SELECT id,option_id,label,price_delta_cents,sort_order FROM menu_item_option_values ORDER BY sort_order ASC,id ASC`;
    const byOption = new Map<string, any[]>();
    for (const value of values) byOption.set(value.option_id,[...(byOption.get(value.option_id)||[]),value]);
    const byItem = new Map<string, any[]>();
    for (const option of options) byItem.set(option.menu_item_id,[...(byItem.get(option.menu_item_id)||[]),{...option,values:byOption.get(option.id)||[]}]);
    return NextResponse.json({ items: items.map((item:any)=>({...item,options:byItem.get(item.id)||[]})) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin menu load failed", error);
    return NextResponse.json({ error: "Unable to load menu. Please check the database connection." }, { status: 500 });
  }
}
