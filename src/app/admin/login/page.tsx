"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import "../../globals.css";
import "../admin.css";
import "./login.css";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      router.replace("/admin");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to sign in"); }
    finally { setLoading(false); }
  }
  return <main className="admin-login shell"><a className="brand" href="/"><span>Z</span> Zee&apos;s Kitchen</a><div className="login-card"><p className="eyebrow">KITCHEN STAFF</p><h1>Welcome back.</h1><p>Sign in to manage orders and your kitchen.</p><form onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="username" placeholder="you@example.com" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" placeholder="Your password" /></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="primary" disabled={loading}>{loading ? "Signing in…" : <>Sign in <span>→</span></>}</button></form></div></main>;
}
