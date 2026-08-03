"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import SidebarNav from "@/components/SidebarNav";
import { useAuth } from "@/lib/auth";

const MOBILE_LINKS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/documents", label: "Docs", icon: "📄" },
  { href: "/documents/new", label: "New", icon: "＋" },
  { href: "/clients", label: "Clients", icon: "👥" },
];

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-sm text-ink-muted">
      {children}
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { loading, user, org, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Client-side auth gate (replaces server middleware on static hosting).
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!org) router.replace("/onboarding");
  }, [loading, user, org, router]);

  if (loading) return <FullScreen>Loading your workspace…</FullScreen>;
  if (!user || !org) return <FullScreen>Redirecting…</FullScreen>;

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="px-2 py-2">
          <Wordmark />
        </div>
        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-ink">{org.name}</p>
          <p className="truncate text-xs text-ink-muted">
            {org.currency} · {org.language === "ar" ? "العربية" : "English"}
          </p>
        </div>
        <div className="mt-4 flex-1">
          <SidebarNav />
        </div>
        <div className="border-t border-slate-100 pt-3">
          <p className="truncate px-3 text-xs text-ink-muted">{user.email}</p>
          <div className="px-3 pt-1">
            <button onClick={handleSignOut} className="text-sm text-ink-muted hover:text-ink">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <Wordmark />
          <div className="flex items-center gap-3">
            <span className="max-w-[40vw] truncate text-xs text-ink-muted">{org.name}</span>
            <button onClick={handleSignOut} className="text-sm text-ink-muted hover:text-ink">
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:py-8 lg:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        {MOBILE_LINKS.map((l) => {
          const active =
            l.href === "/documents"
              ? pathname === "/documents"
              : pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                active ? "text-brand-600" : "text-ink-muted"
              }`}
            >
              <span className="text-lg leading-none">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
