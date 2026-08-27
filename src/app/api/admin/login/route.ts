import { NextResponse } from "next/server";
import { adminCookieName, createAdminToken, credentialsValid } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string" || !credentialsValid(email, password)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(adminCookieName(), createAdminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    return response;
  } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
}
