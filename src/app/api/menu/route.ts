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
    allergens TEXT NOT NULL DEFAULT '',
    spice_level TEXT NOT NULL DEFAULT 'mild',
    serves TEXT NOT NULL DEFAULT '',
    prep_hours INTEGER NOT NULL DEFAULT 24,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS spice_level TEXT NOT NULL DEFAULT 'mild'`;
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS serves TEXT NOT NULL DEFAULT ''`;
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_hours INTEGER NOT NULL DEFAULT 24`;
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

  // Auto-seed starter menu if empty (so storefront is never blank)
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM menu_items`;
  if (count === 0) {
    await sql`
      INSERT INTO menu_items (id,name,description,price_cents,category,image,sort_order,allergens,spice_level,serves,prep_hours) VALUES
      ('jollof-bowl','Signature Jollof Bowl','Smoky party-style jollof rice with tender chicken and fresh sides.',1800,'Rice & Bowls','https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85',1,'May contain gluten, soy','medium','Feeds 1–2',24),
      ('fried-rice-bowl','Fried Rice Bowl','Seasoned fried rice with chicken and vegetables.',1800,'Rice & Bowls','https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',2,'May contain soy, egg','mild','Feeds 1–2',24),
      ('chicken-box','Comfort Chicken Box','Golden chicken, seasoned rice and house sauce.',2100,'Chicken','https://images.unsplash.com/photo-1598514982901-ae6275a9a8b9?auto=format&fit=crop&w=900&q=85',3,'May contain gluten, soy','mild','Feeds 1–2',24),
      ('peppered-chicken','Peppered Chicken','Juicy chicken finished in a bold pepper sauce.',1900,'Chicken','https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=900&q=85',4,'May contain soy','hot','Feeds 1–2',24),
      ('plantain','Sweet Plantain','Golden caramelized plantain, made fresh.',700,'Sides','https://images.unsplash.com/photo-1603833797130-0a7e5a5c4a08?auto=format&fit=crop&w=900&q=85',5,'','mild','Side for 1–2',24),
      ('weekend-special','Weekend Special','Rotating comfort plate made for sharing.',2400,'Specials','https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=85',6,'Ask about allergens','medium','Feeds 2–3',48)
      ON CONFLICT (id) DO NOTHING
    `;
  }
  return sql;
}

async function withOptions(sql: any, items: any[]) {
  if (!items.length) return items;
  const ids = items.map((i) => i.id);
  const options = await sql`SELECT id,menu_item_id,name,option_type,required,min_quantity,max_quantity,sort_order FROM menu_item_options WHERE menu_item_id = ANY(${ids}) ORDER BY sort_order ASC,id ASC`;
  if (!options.length) return items.map((i) => ({ ...i, options: [] }));
  const optionIds = options.map((o: any) => o.id);
  const values = await sql`SELECT id,option_id,label,price_delta_cents,sort_order FROM menu_item_option_values WHERE option_id = ANY(${optionIds}) ORDER BY sort_order ASC,id ASC`;
  const byOption = new Map<string, any[]>();
  for (const v of values) byOption.set(v.option_id, [...(byOption.get(v.option_id) || []), v]);
  const byItem = new Map<string, any[]>();
  for (const o of options)
    byItem.set(o.menu_item_id, [
      ...(byItem.get(o.menu_item_id) || []),
      { ...o, values: byOption.get(o.id) || [] },
    ]);
  return items.map((i) => ({ ...i, options: byItem.get(i.id) || [] }));
}

export async function GET() {
  try {
    const sql = await ensureMenuTable();
    const items = await sql`SELECT id,name,description,price_cents,category,image,available,sort_order,allergens,spice_level,serves,prep_hours FROM menu_items WHERE available=true ORDER BY sort_order ASC, name ASC`;
    return NextResponse.json(
      { items: await withOptions(sql, items) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Menu load failed", error);
    return NextResponse.json({ error: "Unable to load menu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      priceCents,
      category,
      image,
      available = true,
      sortOrder = 0,
      allergens = "",
      spiceLevel = "mild",
      serves = "",
      prepHours = 24,
      options = [],
    } = body;
    if (
      ![id, name, category].every((v) => typeof v === "string" && v.trim()) ||
      !Number.isInteger(priceCents) ||
      priceCents < 0
    )
      return NextResponse.json({ error: "Invalid menu item" }, { status: 400 });
    const sql = await ensureMenuTable();
    const [item] = await sql`INSERT INTO menu_items(id,name,description,price_cents,category,image,available,sort_order,allergens,spice_level,serves,prep_hours)
      VALUES(${id.trim()},${name.trim()},${description?.trim() || ""},${priceCents},${category.trim()},${image?.trim() || ""},${available},${sortOrder},${String(allergens || "").trim()},${String(spiceLevel || "mild").trim()},${String(serves || "").trim()},${Number.isInteger(prepHours) ? prepHours : 24})
      RETURNING id,name,description,price_cents,category,image,available,sort_order,allergens,spice_level,serves,prep_hours`;

    // Save options on create
    if (Array.isArray(options) && options.length) {
      for (let i = 0; i < options.length; i++) {
        const o = options[i];
        if (!o?.name?.trim()) continue;
        const oid = String(o.id || `option-${id}-${i}-${Date.now()}`);
        const min = Math.max(0, Number.isInteger(o.min_quantity) ? o.min_quantity : 0);
        const max = Math.max(min, Number.isInteger(o.max_quantity) ? o.max_quantity : 1);
        await sql`INSERT INTO menu_item_options(id,menu_item_id,name,option_type,required,min_quantity,max_quantity,sort_order)
          VALUES(${oid},${id.trim()},${o.name.trim()},${o.option_type === "quantity" ? "quantity" : "choice"},${Boolean(o.required)},${min},${max},${i})`;
        for (let j = 0; j < (Array.isArray(o.values) ? o.values : []).length; j++) {
          const v = o.values[j];
          if (!v?.label?.trim()) continue;
          const vid = String(v.id || `value-${oid}-${j}-${Date.now()}`);
          const delta = Number.isInteger(v.price_delta_cents) ? v.price_delta_cents : 0;
          await sql`INSERT INTO menu_item_option_values(id,option_id,label,price_delta_cents,sort_order)
            VALUES(${vid},${oid},${v.label.trim()},${delta},${j})`;
        }
      }
    }

    return NextResponse.json(
      { item: { ...item, options: options || [] } },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Menu create failed", error);
    return NextResponse.json(
      { error: "Unable to create menu item. Please check the database connection." },
      { status: 500 },
    );
  }
}
