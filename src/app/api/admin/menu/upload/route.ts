import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { adminCookieName, isAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

function signature(params: Record<string, string>, secret: string) {
  const serialized = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  return crypto.createHash("sha1").update(serialized + secret).digest("hex");
}

export async function POST(request: Request) {
  if (!isAdminToken((await cookies()).get(adminCookieName())?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary is not configured on the server." }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Please select an image." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image must be 8 MB or smaller." }, { status: 400 });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const uploadParams = { folder: "zees-kitchen/menu", timestamp };
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", apiKey);
    body.append("timestamp", timestamp);
    body.append("folder", uploadParams.folder);
    body.append("signature", signature(uploadParams, apiSecret));

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
    const data = await response.json();
    if (!response.ok) {
      console.error("Cloudinary upload failed", data);
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ url: data.secure_url, publicId: data.public_id });
  } catch (error) {
    console.error("Menu image upload failed", error);
    return NextResponse.json({ error: "Unable to upload image." }, { status: 500 });
  }
}
