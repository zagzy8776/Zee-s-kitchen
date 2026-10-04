import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

async function authorized() {
  return isAdminToken((await cookies()).get(adminCookieName())?.value);
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await authorized()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const sql = db();
    await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options_json TEXT NOT NULL DEFAULT ''`;
    const [order] =
      await sql`SELECT id, customer_name, phone, email, order_date, preferred_time, fulfillment, delivery_address, delivery_city, delivery_province, delivery_postal_code, notes, status, total_cents, created_at FROM orders WHERE id=${id}`;
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const items =
      await sql`SELECT menu_item_id, name, quantity, unit_price_cents, options_json FROM order_items WHERE order_id=${id}`;
    return NextResponse.json({
      order: {
        ...order,
        items: items.map((i: any) => ({
          ...i,
          selectedOptions: i.options_json
            ? (() => {
                try {
                  return JSON.parse(i.options_json);
                } catch {
                  return [];
                }
              })()
            : [],
        })),
      },
    });
  } catch (e) {
    console.error("Order detail failed", e);
    return NextResponse.json({ error: "Unable to load order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await authorized()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const { status } = await request.json();
    const allowed = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!allowed.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const sql = db();
    const [order] =
      await sql`UPDATE orders SET status=${status} WHERE id=${id} RETURNING id, status`;
    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    console.error("Order status update failed", e);
    return NextResponse.json({ error: "Unable to update order" }, { status: 500 });
  }
}
