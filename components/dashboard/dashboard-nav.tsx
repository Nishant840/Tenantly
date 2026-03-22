"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/team", label: "Team" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/audit-logs", label: "Audit Logs" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-0.5 px-3">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--muted)] text-[var(--foreground)]"
                : "text-[var(--foreground-muted)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
