import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

async function requireAdmin() {
  const token = (await cookies()).get(adminCookieName())?.value;
  return isAdminToken(token);
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sql = db();
    const orders = await sql`SELECT id, customer_name, phone, email, order_date, preferred_time, fulfillment, notes, status, total_cents, created_at FROM orders ORDER BY created_at DESC LIMIT 100`;
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Order listing failed", error);
    return NextResponse.json({ error: "Unable to load orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, items } = body;
    if (!customer?.name || !customer?.phone || !customer?.orderDate || !customer?.preferredTime || !customer?.fulfillment || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Missing required order details" }, { status: 400 });
    if (!items.every((item: any) => item?.id && item?.name && Number.isInteger(item?.quantity) && item.quantity > 0 && Number.isFinite(item?.price) && item.price >= 0)) return NextResponse.json({ error: "Invalid order items" }, { status: 400 });
    const totalCents = items.reduce((sum: number, item: any) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const sql = db();
    const result = await sql.begin(async tx => {
      const [order] = await tx`INSERT INTO orders (customer_name, phone, email, order_date, preferred_time, fulfillment, notes, total_cents) VALUES (${customer.name.trim()}, ${customer.phone.trim()}, ${customer.email?.trim() || null}, ${customer.orderDate}, ${customer.preferredTime}, ${customer.fulfillment}, ${customer.notes?.trim() || null}, ${totalCents}) RETURNING id, status, created_at`;
      for (const item of items) await tx`INSERT INTO order_items (order_id, menu_item_id, name, quantity, unit_price_cents) VALUES (${order.id}, ${item.id}, ${item.name}, ${item.quantity}, ${Math.round(item.price * 100)})`;
      return order;
    });
    return NextResponse.json({ order: result }, { status: 201 });
  } catch (error) {
    console.error("Order creation failed", error);
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }
}
