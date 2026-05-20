"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, Flag, Home, LogOut, Settings, Ticket, Users, ClipboardCheck } from "lucide-react";
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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-ink/10 bg-surface px-4 py-5 lg:w-72">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
          <BarChart3 size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Student Companion</p>
          <p className="text-xs text-ink/50">{organizationName}</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/70 hover:bg-canvas hover:text-ink",
                active && "bg-primary text-white hover:bg-primary hover:text-white",
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-ink/60 hover:bg-canvas">
        <LogOut size={17} />
        Sign out
      </button>
    </aside>
  );
}
