"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type UserMenuProps = {
  email: string;
  name?: string | null;
};

export function UserMenu({ email, name }: UserMenuProps) {
  const initial = (name?.trim()?.[0] ?? email[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden min-w-0 text-right sm:block">
        <p className="truncate text-sm font-medium text-[var(--foreground)]">
          {name || "Account"}
        </p>
        <p className="truncate text-xs text-[var(--foreground-muted)]">
          {email}
        </p>
      </div>
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-sm font-medium text-[var(--foreground)]"
        aria-hidden
      >
        {initial}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  );
}
