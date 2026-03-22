"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatOrgRole } from "@/lib/format-role";
import { Skeleton } from "@/components/ui/skeleton";

type PendingInvite = {
  id: string;
  role: string;
  createdAt: string;
  organization: { id: string; name: string; slug: string };
};

export function PendingInvitesBanner() {
  const router = useRouter();
  const { update } = useSession();
  const [invites, setInvites] = useState<PendingInvite[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/org/invites/mine");
      if (!res.ok) {
        setInvites([]);
        return;
      }
      const data = (await res.json()) as PendingInvite[];
      setInvites(data);
    } catch {
      setInvites([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function accept(inviteId: string) {
    setError(null);
    setPendingId(inviteId);
    startTransition(async () => {
      try {
        const res = await fetch("/api/org/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteId }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "Could not accept invite.");
          setPendingId(null);
          return;
        }
        await update();
        await load();
        router.refresh();
      } catch {
        setError("Something went wrong.");
      } finally {
        setPendingId(null);
      }
    });
  }

  if (invites === null) {
    return (
      <div className="mb-6">
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <p className="text-sm font-medium text-[var(--foreground)]">
        Pending invitations
      </p>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="space-y-3">
        {invites.map((inv) => (
          <li key={inv.id}>
            <Card className="border-[var(--primary)]/25 bg-[var(--muted)]/30">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {inv.organization.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                    Role: {formatOrgRole(inv.role)} · Invited{" "}
                    {new Date(inv.createdAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending && pendingId === inv.id}
                  onClick={() => void accept(inv.id)}
                >
                  {isPending && pendingId === inv.id ? "Accepting…" : "Accept invitation"}
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
