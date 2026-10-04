import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";
import { sendOneSignalPush } from "@/lib/onesignal";

async function admin() {
  return isAdminToken((await cookies()).get(adminCookieName())?.value);
}

function validCanadianPostal(v: string) {
  return /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(
    v,
  );
}

/** Create orders + settings tables if missing (self-heal production DB). */
async function ensureOrderSchema(sql: any) {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  await sql`CREATE TABLE IF NOT EXISTS business_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`INSERT INTO business_settings(key,value) VALUES
    ('currency','CAD'),
    ('tax_rate','0.05'),
    ('delivery_fee_cents','500'),
    ('lead_hours','24'),
    ('min_delivery_order_cents','3500'),
    ('payment_note','Payment is arranged after we confirm your order. We accept Interac e-Transfer. Details are sent when Zee confirms.'),
    ('etransfer_email',''),
    ('pickup_note','Pickup location is confirmed by WhatsApp when your order is accepted.'),
    ('delivery_cities','Winnipeg')
    ON CONFLICT(key) DO NOTHING`;

  await sql`CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    order_date DATE NOT NULL,
    preferred_time TIME NOT NULL,
    fulfillment TEXT NOT NULL CHECK (fulfillment IN ('pickup','delivery')),
    delivery_address TEXT,
    delivery_city TEXT,
    delivery_province TEXT,
    delivery_postal_code TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','completed','cancelled')),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_city TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_province TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_postal_code TEXT`;

  await sql`CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    options_json TEXT NOT NULL DEFAULT ''
  )`;
  await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_json TEXT NOT NULL DEFAULT ''`;
  await sql`CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status)`;
  await sql`CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id)`;
}

async function settings(sql: any) {
  await ensureOrderSchema(sql);
  const rows =
    await sql`SELECT key,value FROM business_settings WHERE key IN ('currency','tax_rate','delivery_fee_cents','lead_hours','min_delivery_order_cents','payment_note','delivery_cities')`;
  const s = Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
  return {
    currency: s.currency || "CAD",
    taxRate: Number(s.tax_rate ?? 0.05),
    deliveryFeeCents: Number(s.delivery_fee_cents ?? 500),
    leadHours: Number(s.lead_hours ?? 24),
    minDeliveryOrderCents: Number(s.min_delivery_order_cents ?? 3500),
    paymentNote:
      s.payment_note ||
      "Payment is arranged after we confirm your order. We accept Interac e-Transfer.",
    deliveryCities: (s.delivery_cities || "Winnipeg")
      .split(",")
      .map((c: string) => c.trim().toLowerCase())
      .filter(Boolean),
  };
}

function parseOrderDateTime(dateStr: string, timeStr: string) {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return d;
}

export async function GET() {
  if (!(await admin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = db();
    await ensureOrderSchema(sql);
    const orders =
      await sql`SELECT id,customer_name,phone,email,order_date,preferred_time,fulfillment,delivery_address,delivery_city,delivery_province,delivery_postal_code,notes,status,total_cents,created_at FROM orders ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ orders });
  } catch (e) {
    console.error("Orders load failed", e);
    return NextResponse.json({ error: "Unable to load orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { customer, items } = await request.json();
    if (
      !customer?.name ||
      !customer?.phone ||
      !customer?.orderDate ||
      !customer?.preferredTime ||
      !customer?.fulfillment ||
      !Array.isArray(items) ||
      !items.length
    )
      return NextResponse.json(
        { error: "Missing required order details" },
        { status: 400 },
      );
    if (!["pickup", "delivery"].includes(customer.fulfillment))
      return NextResponse.json({ error: "Invalid fulfillment" }, { status: 400 });
    if (
      customer.fulfillment === "delivery" &&
      (!customer.address ||
        !customer.city ||
        !customer.province ||
        !validCanadianPostal(customer.postalCode || ""))
    )
      return NextResponse.json(
        {
          error:
            "A valid Canadian delivery address and postal code are required",
        },
        { status: 400 },
      );
    if (
      !items.every(
        (i: any) => i?.id && Number.isInteger(i.quantity) && i.quantity > 0,
      )
    )
      return NextResponse.json({ error: "Invalid order items" }, { status: 400 });

    const sql = db();
    const cfg = await settings(sql);

    const when = parseOrderDateTime(customer.orderDate, customer.preferredTime);
    if (Number.isNaN(when.getTime()))
      return NextResponse.json({ error: "Invalid date or time" }, { status: 400 });
    const minWhen = new Date(Date.now() + cfg.leadHours * 60 * 60 * 1000);
    if (when < minWhen)
      return NextResponse.json(
        {
          error: `Orders need at least ${cfg.leadHours} hours notice. Please pick a later date or time.`,
        },
        { status: 400 },
      );

    if (customer.fulfillment === "delivery") {
      const city = String(customer.city || "").trim().toLowerCase();
      if (cfg.deliveryCities.length && !cfg.deliveryCities.includes(city)) {
        return NextResponse.json(
          {
            error: `Delivery is currently available in: ${cfg.deliveryCities
              .map((c: string) => c.replace(/\b\w/g, (x) => x.toUpperCase()))
              .join(", ")}. Message us on WhatsApp for other areas.`,
          },
          { status: 400 },
        );
      }
    }

    const menu =
      await sql`SELECT id,name,price_cents,available FROM menu_items WHERE id = ANY(${items.map((i: any) => i.id)})`;
    const byId = new Map(menu.map((i: any) => [i.id, i]));
    if (
      menu.length !== new Set(items.map((i: any) => i.id)).size ||
      items.some((i: any) => !byId.get(i.id)?.available)
    )
      return NextResponse.json(
        { error: "One or more selected items are unavailable" },
        { status: 409 },
      );

    const lineTotals = items.map((i: any) => {
      const base = byId.get(i.id)!.price_cents;
      const deltas = Array.isArray(i.selectedOptions)
        ? i.selectedOptions.reduce(
            (s: number, o: any) =>
              s +
              (Number.isInteger(o.priceDeltaCents)
                ? Math.max(0, o.priceDeltaCents)
                : 0),
            0,
          )
        : 0;
      return { ...i, unit: base + deltas };
    });
    const subtotalCents = lineTotals.reduce(
      (s: number, i: any) => s + i.unit * i.quantity,
      0,
    );

    if (
      customer.fulfillment === "delivery" &&
      subtotalCents < cfg.minDeliveryOrderCents
    )
      return NextResponse.json(
        {
          error: `Delivery orders need a minimum of $${(cfg.minDeliveryOrderCents / 100).toFixed(2)} CAD before fees.`,
        },
        { status: 400 },
      );

    const deliveryCents =
      customer.fulfillment === "delivery" ? cfg.deliveryFeeCents : 0;
    const taxCents = Math.round((subtotalCents + deliveryCents) * cfg.taxRate);
    const totalCents = subtotalCents + deliveryCents + taxCents;

    const result = await sql.begin(async (tx: any) => {
      const [o] =
        await tx`INSERT INTO orders(customer_name,phone,email,order_date,preferred_time,fulfillment,delivery_address,delivery_city,delivery_province,delivery_postal_code,notes,total_cents)
        VALUES(${customer.name.trim()},${customer.phone.trim()},${customer.email?.trim() || null},${customer.orderDate},${customer.preferredTime},${customer.fulfillment},${customer.fulfillment === "delivery" ? customer.address.trim() : null},${customer.fulfillment === "delivery" ? customer.city.trim() : null},${customer.fulfillment === "delivery" ? customer.province : null},${customer.fulfillment === "delivery" ? customer.postalCode.toUpperCase().replace(/\s/g, "") : null},${customer.notes?.trim() || null},${totalCents})
        RETURNING id,status,created_at`;
      for (const i of lineTotals) {
        const m = byId.get(i.id)!;
        const optsJson = Array.isArray(i.selectedOptions)
          ? JSON.stringify(i.selectedOptions)
          : "";
        await tx`INSERT INTO order_items(order_id,menu_item_id,name,quantity,unit_price_cents,options_json)
          VALUES(${o.id},${m.id},${m.name},${i.quantity},${i.unit},${optsJson})`;
      }
      return o;
    });

    try {
      await sendOneSignalPush({
        title: "New order received 🔔",
        message: `${customer.name.trim()} placed a ${customer.fulfillment} order for ${cfg.currency} ${(totalCents / 100).toFixed(2)}.`,
        url: "/admin",
      });
    } catch (pushErr) {
      console.error("OneSignal push failed (order still saved)", pushErr);
    }

    return NextResponse.json(
      {
        order: result,
        pricing: {
          subtotalCents,
          deliveryCents,
          taxCents,
          totalCents,
          currency: cfg.currency,
        },
        paymentNote: cfg.paymentNote,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("Order creation failed", e);
    const msg = e instanceof Error ? e.message : "Unable to create order";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? msg
            : "Unable to create order",
      },
      { status: 500 },
    );
  }
}
