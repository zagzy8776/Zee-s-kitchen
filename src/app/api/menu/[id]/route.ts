import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

async function authorized(){return isAdminToken((await cookies()).get(adminCookieName())?.value)}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await authorized()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const{id}=await params;const body=await request.json();const allowed=["name","description","priceCents","category","image","available","sortOrder"];const keys=Object.keys(body);if(!keys.length||keys.some(k=>!allowed.includes(k)))return NextResponse.json({error:"Invalid fields"},{status:400});
 const sql=db();const[item]=await sql`SELECT * FROM menu_items WHERE id=${id}`;if(!item)return NextResponse.json({error:"Menu item not found"},{status:404});
 const name=body.name??item.name,description=body.description??item.description,price=body.priceCents??item.price_cents,category=body.category??item.category,image=body.image??item.image,available=body.available??item.available,sort=body.sortOrder??item.sort_order;
 if(typeof name!=="string"||!name.trim()||!Number.isInteger(price)||price<0||typeof category!=="string"||!category.trim()||!Number.isInteger(sort)||sort<0)return NextResponse.json({error:"Invalid menu item"},{status:400});
 const[result]=await sql`UPDATE menu_items SET name=${name.trim()},description=${String(description||"").trim()},price_cents=${price},category=${category.trim()},image=${String(image||"").trim()},available=${Boolean(available)},sort_order=${sort},updated_at=NOW() WHERE id=${id} RETURNING *`;return NextResponse.json({item:result});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to update menu item"},{status:500})}
}
