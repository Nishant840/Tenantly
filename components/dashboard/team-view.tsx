"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  TableHead,
  TableWrap,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/ui/table";
import { formatOrgRole } from "@/lib/format-role";

export type TeamMemberRow = {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  projects: { projectId: string; projectName: string }[];
};

type TeamViewProps = {
  members: TeamMemberRow[];
  currentUserId: string;
  actorOrgRole: string;
  canManage: boolean;
};

export function TeamView({
  members,
  currentUserId,
  actorOrgRole,
  canManage,
}: TeamViewProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER" | "OWNER">(
    "MEMBER",
  );
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMemberRow | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  async function submitInvite() {
    setInviteError(null);
    setInviteLoading(true);
    try {
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role: inviteRole }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setInviteError(data.error ?? "Invite failed.");
        setInviteLoading(false);
        return;
      }
      setInviteOpen(false);
      setEmail("");
      router.refresh();
    } catch {
      setInviteError("Something went wrong.");
    } finally {
      setInviteLoading(false);
    }
  }

  async function confirmRemoveMember() {
    if (!removeTarget) return;
    setRemoveLoading(true);
    try {
      const res = await fetch("/api/org/members/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: removeTarget.userId }),
      });
      if (res.ok) {
        setRemoveTarget(null);
        router.refresh();
      }
    } finally {
      setRemoveLoading(false);
    }
  }

  function canRemoveRow(row: TeamMemberRow): boolean {
    if (!canManage) return false;
    if (row.userId === currentUserId) return false;
    if (row.role === "OWNER" && actorOrgRole !== "OWNER") return false;
    return true;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Team
          </h1>
          <p className="mt-1 text-[var(--foreground-muted)]">
            Members of your active organization and their project access.
          </p>
        </div>
        {canManage ? (
          <Button type="button" onClick={() => setInviteOpen(true)}>
            Invite user
          </Button>
        ) : null}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => {
          setInviteOpen(false);
          setInviteError(null);
        }}
        title="Invite user"
        description="Send an invitation by email. They must sign in with that address to accept."
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteOpen(false)}
              disabled={inviteLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void submitInvite()}
              disabled={inviteLoading || !email.trim()}
            >
              {inviteLoading ? "Sending…" : "Send invite"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {inviteError ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {inviteError}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Organization role</Label>
            <select
              id="invite-role"
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
              value={inviteRole}
              onChange={(e) =>
                setInviteRole(e.target.value as "ADMIN" | "MEMBER" | "OWNER")
              }
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              {actorOrgRole === "OWNER" ? (
                <option value="OWNER">Owner</option>
              ) : null}
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => void confirmRemoveMember()}
        title="Remove from organization"
        description={
          removeTarget
            ? `Remove ${removeTarget.name || removeTarget.email} from this organization? Their project access in this org will be removed.`
            : ""
        }
        confirmLabel="Remove"
        loading={removeLoading}
      />

      {members.length === 0 ? (
        <EmptyState
          title="No members"
          description="Invite teammates to collaborate in this organization."
          action={
            canManage ? (
              <Button type="button" onClick={() => setInviteOpen(true)}>
                Invite user
              </Button>
            ) : null
          }
        />
      ) : (
        <TableWrap>
          <TableHead>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Org role</Th>
            <Th>Projects</Th>
            {canManage ? <Th className="text-right">Actions</Th> : null}
          </TableHead>
          <Tbody>
            {members.map((row) => (
              <Tr key={row.userId}>
                <Td className="font-medium">{row.name ?? "—"}</Td>
                <Td className="text-[var(--foreground-muted)]">{row.email}</Td>
                <Td>{formatOrgRole(row.role)}</Td>
                <Td className="max-w-[200px] text-[var(--foreground-muted)]">
                  {row.projects.length === 0 ? (
                    <span className="text-[var(--foreground-subtle)]">None</span>
                  ) : (
                    <span className="line-clamp-2">
                      {row.projects.map((p) => p.projectName).join(", ")}
                    </span>
                  )}
                </Td>
                {canManage ? (
                  <Td className="text-right">
                    {canRemoveRow(row) ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        onClick={() => setRemoveTarget(row)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <span className="text-xs text-[var(--foreground-subtle)]">
                        —
                      </span>
                    )}
                  </Td>
                ) : null}
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}
    </div>
  );
}
