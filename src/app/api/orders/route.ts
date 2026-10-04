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

async function settings(sql: any) {
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
  // Interpret as Winnipeg local (approx CST/CDT) by treating as local ISO without Z
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return d;
}

export async function GET() {
  if (!(await admin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = db();
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_json TEXT NOT NULL DEFAULT ''`;
    const orders =
      await sql`SELECT id,customer_name,phone,email,order_date,preferred_time,fulfillment,delivery_address,delivery_city,delivery_province,delivery_postal_code,notes,status,total_cents,created_at FROM orders ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ orders });
  } catch {
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
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_json TEXT NOT NULL DEFAULT ''`;
    const cfg = await settings(sql);

    // Lead time enforcement
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

    // Delivery city check (soft: warn-style reject for non-listed cities)
    if (customer.fulfillment === "delivery") {
      const city = String(customer.city || "").trim().toLowerCase();
      if (cfg.deliveryCities.length && !cfg.deliveryCities.includes(city)) {
        return NextResponse.json(
          {
            error: `Delivery is currently available in: ${cfg.deliveryCities.map((c: string) => c.replace(/\b\w/g, (x) => x.toUpperCase())).join(", ")}. Message us on WhatsApp for other areas.`,
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

    // Price = base + option deltas from client (validated as non-negative integers)
    const lineTotals = items.map((i: any) => {
      const base = byId.get(i.id)!.price_cents;
      const deltas = Array.isArray(i.selectedOptions)
        ? i.selectedOptions.reduce(
            (s: number, o: any) =>
              s + (Number.isInteger(o.priceDeltaCents) ? Math.max(0, o.priceDeltaCents) : 0),
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
        VALUES(${customer.name.trim()},${customer.phone.trim()},${customer.email?.trim() || null},${customer.orderDate},${customer.preferredTime},${customer.fulfillment},${customer.fulfillment === "delivery" ? customer.address.trim() : null},${customer.fulfillment === "delivery" ? customer.city.trim() : null},${customer.fulfillment === "delivery" ? customer.province : null},${customer.fulfillment === "delivery" ? customer.postalCode.toUpperCase().replace(" ", "") : null},${customer.notes?.trim() || null},${totalCents})
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

    await sendOneSignalPush({
      title: "New order received 🔔",
      message: `${customer.name.trim()} placed a ${customer.fulfillment} order for ${cfg.currency} ${(totalCents / 100).toFixed(2)}.`,
      url: "/admin",
    });

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
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }
}
