import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";
export async function GET(){if(!isAdminToken((await cookies()).get(adminCookieName())?.value))return NextResponse.json({error:"Unauthorized"},{status:401});try{const sql=db();const items=await sql`SELECT id,name,description,price_cents,category,image,available,sort_order FROM menu_items ORDER BY sort_order ASC,name ASC`;return NextResponse.json({items})}catch{return NextResponse.json({error:"Unable to load menu"},{status:500})}}
