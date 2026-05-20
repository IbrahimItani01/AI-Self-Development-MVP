"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, Flag, Home, Loader2, LogOut, Menu, Settings, Ticket, Users, ClipboardCheck, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/students", label: "Students", icon: Users },
  { href: "/dashboard/invites", label: "Invites", icon: Ticket },
  { href: "/dashboard/check-ins", label: "Check-ins", icon: ClipboardCheck },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Flag },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav({ organizationName }: { organizationName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-surface/95 px-4 py-3 shadow-soft backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Brand organizationName={organizationName} compact />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-ink/10 bg-surface text-ink hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Open dashboard navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-dashboard-nav"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-ink/10 bg-surface px-4 py-5 lg:flex">
        <Brand organizationName={organizationName} />
        <NavLinks pathname={pathname} />
        <LogoutButton loggingOut={loggingOut} onLogout={logout} />
      </aside>

      {mobileOpen ? (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />

          <aside
            id="mobile-dashboard-nav"
            className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,88vw)] flex-col border-r border-ink/10 bg-surface px-4 py-5 shadow-soft"
            aria-label="Dashboard navigation"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <Brand organizationName={organizationName} compact />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-ink/10 bg-surface text-ink hover:bg-canvas focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Close dashboard navigation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <NavLinks pathname={pathname} />
            <LogoutButton loggingOut={loggingOut} onLogout={logout} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function Brand({ organizationName, compact = false }: { organizationName: string; compact?: boolean }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", !compact && "mb-6")}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-white">
        <BarChart3 size={20} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">Student Companion</p>
        <p className="truncate text-xs text-ink/50">{organizationName}</p>
      </div>
    </div>
  );
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/dashboard" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/70 hover:bg-canvas hover:text-ink",
              active && "bg-primary text-white hover:bg-primary hover:text-white",
            )}
          >
            <Icon size={17} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton({ loggingOut, onLogout }: { loggingOut: boolean; onLogout: () => void }) {
  return (
    <button
      disabled={loggingOut}
      onClick={onLogout}
      className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/60 hover:bg-canvas disabled:pointer-events-none disabled:opacity-50"
    >
      {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut size={17} aria-hidden="true" />}
      {loggingOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
