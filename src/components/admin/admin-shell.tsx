"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/menu", label: "Menu & Photos" },
  { href: "/admin/booking-settings", label: "Booking settings" },
];

export default function AdminShell({
  children,
  title,
  subtitle,
  eyebrow = "KITCHEN DASHBOARD",
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    location.href = "/admin/login";
  }

  return (
    <main className="admin-page shell">
      <header className="admin-nav">
        <Link className="brand" href="/admin">
          <span>Z</span> Zee&apos;s Kitchen
        </Link>
        <nav className="admin-nav-links" aria-label="Admin">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "admin-nav-link active" : "admin-nav-link"}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-nav-right">
          <Link href="/" className="admin-storefront-link">
            Storefront →
          </Link>
          <button type="button" className="admin-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="admin-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="admin-heading-actions">{actions}</div> : null}
      </div>

      {children}
    </main>
  );
}
