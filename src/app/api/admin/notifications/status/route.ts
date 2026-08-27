import {NextResponse} from "next/server";import {cookies} from "next/headers";import {adminCookieName,isAdminToken} from "@/lib/admin-auth";
export async function GET(){const ok=isAdminToken((await cookies()).get(adminCookieName())?.value);return NextResponse.json({authorized:ok},{status:ok?200:401})}
