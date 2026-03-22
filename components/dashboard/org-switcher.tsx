"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type OrgOption = { id: string; name: string };

type OrgSwitcherProps = {
  organizations: OrgOption[];
  activeOrgId: string | null;
  activeOrgName: string | null;
};

export function OrgSwitcher({
  organizations,
  activeOrgId,
  activeOrgName,
}: OrgSwitcherProps) {
  const router = useRouter();
  const { update } = useSession();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  async function switchTo(organizationId: string) {
    if (organizationId === activeOrgId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/org/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });
      if (res.ok) {
        await update();
        router.refresh();
        setOpen(false);
      }
    });
  }

  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className="relative min-w-0 flex-1">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-9 max-w-full justify-between gap-2 border-[var(--border)] font-normal"
        disabled={pending}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate text-left text-[var(--foreground)]">
          {activeOrgName ?? "Organization"}
        </span>
        <span className="shrink-0 text-[var(--foreground-subtle)]" aria-hidden>
          ▾
        </span>
      </Button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 max-h-64 min-w-[12rem] w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-lg"
          >
            {organizations.map((org) => (
              <li key={org.id} role="option" aria-selected={org.id === activeOrgId}>
                <button
                  type="button"
                  disabled={pending}
                  className={cn(
                    "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                    org.id === activeOrgId
                      ? "bg-[var(--muted)] font-medium text-[var(--foreground)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                  onClick={() => void switchTo(org.id)}
                >
                  <span className="truncate">{org.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
