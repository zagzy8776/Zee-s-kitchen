import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

async function authorized(){return isAdminToken((await cookies()).get(adminCookieName())?.value)}

function cloudinaryPublicId(image: string) {
  try {
    const url = new URL(image);
    if (!url.hostname.endsWith("cloudinary.com")) return null;
    const match = url.pathname.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return null;
    return decodeURIComponent(match[1]).replace(/\.[^.\/]+$/, "");
  } catch { return null; }
}

async function destroyCloudinaryImage(image: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const publicId = cloudinaryPublicId(image);
  if (!cloudName || !apiKey || !apiSecret || !publicId) return;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const serialized = `public_id=${publicId}&timestamp=${timestamp}`;
  const sig = crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
  const body = new URLSearchParams({ public_id: publicId, timestamp, api_key: apiKey, signature: sig });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, { method: "POST", body });
  if (!response.ok) console.error("Cloudinary image deletion failed", await response.text());
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await authorized()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const{id}=await params;const body=await request.json();const allowed=["name","description","priceCents","category","image","available","sortOrder"];const keys=Object.keys(body);if(!keys.length||keys.some(k=>!allowed.includes(k)))return NextResponse.json({error:"Invalid fields"},{status:400});
 const sql=db();const[item]=await sql`SELECT * FROM menu_items WHERE id=${id}`;if(!item)return NextResponse.json({error:"Menu item not found"},{status:404});
 const name=body.name??item.name,description=body.description??item.description,price=body.priceCents??item.price_cents,category=body.category??item.category,image=body.image??item.image,available=body.available??item.available,sort=body.sortOrder??item.sort_order;
 if(typeof name!=="string"||!name.trim()||!Number.isInteger(price)||price<0||typeof category!=="string"||!category.trim()||!Number.isInteger(sort)||sort<0)return NextResponse.json({error:"Invalid menu item"},{status:400});
 const[result]=await sql`UPDATE menu_items SET name=${name.trim()},description=${String(description||"").trim()},price_cents=${price},category=${category.trim()},image=${String(image||"").trim()},available=${Boolean(available)},sort_order=${sort},updated_at=NOW() WHERE id=${id} RETURNING *`;return NextResponse.json({item:result});
 }catch(e){console.error(e);return NextResponse.json({error:"Unable to update menu item"},{status:500})}
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await authorized()))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const{id}=await params;const sql=db();const[item]=await sql`SELECT * FROM menu_items WHERE id=${id}`;if(!item)return NextResponse.json({error:"Menu item not found"},{status:404});
 await sql`DELETE FROM menu_items WHERE id=${id}`;
 try{await destroyCloudinaryImage(item.image||"")}catch(error){console.error("Cloudinary cleanup failed",error)}
 return NextResponse.json({ok:true});
 }catch(e){console.error("Menu delete failed",e);return NextResponse.json({error:"Unable to delete menu item"},{status:500})}
}
