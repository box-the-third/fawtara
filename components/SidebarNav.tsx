"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/clients", label: "Clients", icon: "👥" },
  { href: "/products", label: "Products", icon: "📦" },
];

export default function SidebarNav() {
  const path = usePathname();
  return (
    <nav className="space-y-1">
      {LINKS.map((l) => {
        const active = path === l.href || path.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-slate-50"
            }`}
          >
            <span aria-hidden>{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
