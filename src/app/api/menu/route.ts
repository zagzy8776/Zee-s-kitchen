import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

export async function GET() {
  try {
    const sql = db();
    const items = await sql`SELECT id,name,description,price_cents,category,image,available,sort_order FROM menu_items WHERE available=true ORDER BY sort_order ASC, name ASC`;
    return NextResponse.json({ items });
  } catch (error) { console.error("Menu load failed", error); return NextResponse.json({ error: "Unable to load menu" }, { status: 500 }); }
}

export async function POST(request: Request) {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id,name,description,priceCents,category,image,available=true,sortOrder=0 } = await request.json();
    if (![id,name,category].every(v=>typeof v === "string" && v.trim()) || !Number.isInteger(priceCents) || priceCents < 0) return NextResponse.json({error:"Invalid menu item"},{status:400});
    const sql=db(); const [item]=await sql`INSERT INTO menu_items(id,name,description,price_cents,category,image,available,sort_order) VALUES(${id.trim()},${name.trim()},${description?.trim()||""},${priceCents},${category.trim()},${image?.trim()||""},${available},${sortOrder}) RETURNING *`;
    return NextResponse.json({item},{status:201});
  } catch { return NextResponse.json({error:"Unable to create menu item"},{status:500}); }
}
