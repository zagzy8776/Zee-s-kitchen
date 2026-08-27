import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "zees_admin";

function secret() {
  if (!process.env.ADMIN_AUTH_SECRET) throw new Error("ADMIN_AUTH_SECRET is not configured");
  return process.env.ADMIN_AUTH_SECRET;
}

export function adminCookieName() { return COOKIE; }
export function createAdminToken() { return createHmac("sha256", secret()).update("zees-kitchen-admin").digest("hex"); }
export function isAdminToken(value: string | undefined) {
  if (!value) return false;
  const expected = createAdminToken();
  const a = Buffer.from(value); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function credentialsValid(email: string, password: string) {
  return !!process.env.ADMIN_EMAIL && !!process.env.ADMIN_PASSWORD && email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}
