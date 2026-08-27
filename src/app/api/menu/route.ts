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
  await sql`CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(available, sort_order)`;
  return sql;
}

async function withOptions(sql:any,items:any[]){
  if(!items.length)return items;
  const ids=items.map(i=>i.id);
  const options=await sql`SELECT id,menu_item_id,name,option_type,required,min_quantity,max_quantity,sort_order FROM menu_item_options WHERE menu_item_id = ANY(${ids}) ORDER BY sort_order ASC,id ASC`;
  if(!options.length)return items.map(i=>({...i,options:[]}));
  const optionIds=options.map((o:any)=>o.id);
  const values=await sql`SELECT id,option_id,label,price_delta_cents,sort_order FROM menu_item_option_values WHERE option_id = ANY(${optionIds}) ORDER BY sort_order ASC,id ASC`;
  const byOption=new Map<string,any[]>();for(const v of values)byOption.set(v.option_id,[...(byOption.get(v.option_id)||[]),v]);
  const byItem=new Map<string,any[]>();for(const o of options)byItem.set(o.menu_item_id,[...(byItem.get(o.menu_item_id)||[]),{...o,values:byOption.get(o.id)||[]}]);
  return items.map(i=>({...i,options:byItem.get(i.id)||[]}));
}

export async function GET() {
  try {
    const sql = await ensureMenuTable();
    const items = await sql`SELECT id,name,description,price_cents,category,image,available,sort_order FROM menu_items WHERE available=true ORDER BY sort_order ASC, name ASC`;
    return NextResponse.json({ items: await withOptions(sql,items) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Menu load failed", error);
    return NextResponse.json({ error: "Unable to load menu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, name, description, priceCents, category, image, available = true, sortOrder = 0 } = await request.json();
    if (![id, name, category].every(v => typeof v === "string" && v.trim()) || !Number.isInteger(priceCents) || priceCents < 0) return NextResponse.json({ error: "Invalid menu item" }, { status: 400 });
    const sql = await ensureMenuTable();
    const [item] = await sql`INSERT INTO menu_items(id,name,description,price_cents,category,image,available,sort_order) VALUES(${id.trim()},${name.trim()},${description?.trim() || ""},${priceCents},${category.trim()},${image?.trim() || ""},${available},${sortOrder}) RETURNING id,name,description,price_cents,category,image,available,sort_order`;
    return NextResponse.json({ item:{...item,options:[]} }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Menu create failed", error);
    return NextResponse.json({ error: "Unable to create menu item. Please check the database connection." }, { status: 500 });
  }
}
