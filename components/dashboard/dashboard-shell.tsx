import Link from "next/link";
import { TenantlyMark, TenantlyWordmark } from "@/components/brand/tenantly-mark";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import type { OrgOption } from "@/components/dashboard/org-switcher";
import { OrgSwitcher } from "@/components/dashboard/org-switcher";
import { UserMenu } from "@/components/dashboard/user-menu";
import { formatOrgRole } from "@/lib/format-role";
import type { ReactNode } from "react";

type DashboardShellProps = {
  orgName: string | null;
  activeOrgId: string | null;
  organizations: OrgOption[];
  orgRole: string | null;
  userEmail: string;
  userName?: string | null;
  children: ReactNode;
};

export function DashboardShell({
  orgName,
  activeOrgId,
  organizations,
  orgRole,
  userEmail,
  userName,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-[var(--border)] bg-[var(--sidebar)] lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-[var(--border)] px-5">
          <TenantlyMark className="h-8 w-8" />
          <TenantlyWordmark className="text-base" />
        </div>
        <div className="px-4 py-4">
          {!activeOrgId ? (
            <Link
              href="/onboarding"
              className="block rounded-lg border border-dashed border-[var(--border)] px-3 py-2 text-center text-xs text-[var(--foreground-muted)] hover:bg-[var(--muted)]"
            >
              Complete setup →
            </Link>
          ) : (
            <p className="text-xs text-[var(--foreground-subtle)]">
              Signed in as{" "}
              <span className="font-medium text-[var(--foreground-muted)]">
                {userEmail}
              </span>
            </p>
          )}
        </div>
        <DashboardNav />
        <div className="mt-auto border-t border-[var(--border)] p-4">
          <p className="text-xs text-[var(--foreground-subtle)]">
            © {new Date().getFullYear()} Tenantly
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 lg:gap-4">
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <TenantlyMark className="h-8 w-8" />
              <TenantlyWordmark />
            </div>
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <OrgSwitcher
                organizations={organizations}
                activeOrgId={activeOrgId}
                activeOrgName={orgName}
              />
              {orgRole ? (
                <span className="shrink-0 rounded-md bg-[var(--muted)] px-2.5 py-1 text-xs font-medium text-[var(--foreground-muted)]">
                  {formatOrgRole(orgRole)}
                </span>
              ) : null}
            </div>
          </div>
          <UserMenu email={userEmail} name={userName} />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
