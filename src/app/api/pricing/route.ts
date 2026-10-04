import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

const KEYS = [
  "currency",
  "tax_rate",
  "delivery_fee_cents",
  "lead_hours",
  "min_delivery_order_cents",
  "payment_note",
  "etransfer_email",
  "pickup_note",
  "delivery_cities",
] as const;

async function ensureSettings(sql: any) {
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
}

export async function GET() {
  try {
    const sql = db();
    await ensureSettings(sql);
    const rows =
      await sql`SELECT key,value FROM business_settings WHERE key = ANY(${KEYS as unknown as string[]})`;
    return NextResponse.json({
      settings: Object.fromEntries(rows.map((r: any) => [r.key, r.value])),
    });
  } catch (e) {
    console.error("Pricing load failed", e);
    // Fallback so checkout UI still works even if DB hiccups
    return NextResponse.json({
      settings: {
        currency: "CAD",
        tax_rate: "0.05",
        delivery_fee_cents: "500",
        lead_hours: "24",
        min_delivery_order_cents: "3500",
        payment_note:
          "Payment is arranged after we confirm your order. We accept Interac e-Transfer.",
        pickup_note:
          "Pickup location is confirmed by WhatsApp when your order is accepted.",
        delivery_cities: "Winnipeg",
      },
    });
  }
}

export async function PATCH(request: Request) {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const b = await request.json();
    const updates: [string, string][] = [];
    if (b.currency != null) updates.push(["currency", String(b.currency)]);
    if (b.taxRate != null) updates.push(["tax_rate", String(b.taxRate)]);
    if (b.deliveryFeeCents != null)
      updates.push(["delivery_fee_cents", String(b.deliveryFeeCents)]);
    if (b.leadHours != null) updates.push(["lead_hours", String(b.leadHours)]);
    if (b.minDeliveryOrderCents != null)
      updates.push(["min_delivery_order_cents", String(b.minDeliveryOrderCents)]);
    if (b.paymentNote != null) updates.push(["payment_note", String(b.paymentNote)]);
    if (b.etransferEmail != null)
      updates.push(["etransfer_email", String(b.etransferEmail)]);
    if (b.pickupNote != null) updates.push(["pickup_note", String(b.pickupNote)]);
    if (b.deliveryCities != null)
      updates.push(["delivery_cities", String(b.deliveryCities)]);

    if (!updates.length)
      return NextResponse.json({ error: "No settings provided" }, { status: 400 });

    for (const [k, v] of updates) {
      if (k === "currency" && !/^[A-Z]{3}$/.test(v))
        return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
      if (k === "tax_rate") {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || n > 1)
          return NextResponse.json({ error: "Invalid tax rate" }, { status: 400 });
      }
      if (
        (k === "delivery_fee_cents" ||
          k === "min_delivery_order_cents" ||
          k === "lead_hours") &&
        (!Number.isInteger(Number(v)) || Number(v) < 0)
      )
        return NextResponse.json({ error: `Invalid ${k}` }, { status: 400 });
    }

    const sql = db();
    await ensureSettings(sql);
    for (const [key, value] of updates)
      await sql`INSERT INTO business_settings(key,value,updated_at) VALUES(${key},${value},NOW()) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Pricing update failed", e);
    return NextResponse.json({ error: "Unable to update pricing" }, { status: 500 });
  }
}
