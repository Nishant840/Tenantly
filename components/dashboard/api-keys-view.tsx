"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import {
  TableHead,
  TableWrap,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/ui/table";

export type ApiKeyRow = {
  id: string;
  createdAt: string;
  revokedAt: string | null;
};

type ApiKeysViewProps = {
  keys: ApiKeyRow[];
  canManage: boolean;
};

function maskKeyId(id: string) {
  return `tk_live_••••••${id.slice(-6)}`;
}

export function ApiKeysView({ keys, canManage }: ApiKeysViewProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRow | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  function openCreateModal() {
    setNewKey(null);
    setCreateOpen(true);
  }

  async function generateKey() {
    setCreateLoading(true);
    setNewKey(null);
    try {
      const res = await fetch("/api/apikeys/create", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        apiKey?: string;
      };
      if (res.ok && data.apiKey) {
        setNewKey(data.apiKey);
        router.refresh();
      }
    } finally {
      setCreateLoading(false);
    }
  }

  async function confirmRevoke() {
    if (!revokeTarget) return;
    setRevokeLoading(true);
    try {
      await fetch("/api/apikeys/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: revokeTarget.id }),
      });
      setRevokeTarget(null);
      router.refresh();
    } finally {
      setRevokeLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            API keys
          </h1>
          <p className="mt-1 text-[var(--foreground-muted)]">
            Keys are scoped to your active organization. Store secrets safely —
            they are only shown once when created.
          </p>
        </div>
        {canManage ? (
          <Button type="button" onClick={openCreateModal}>
            Create key
          </Button>
        ) : null}
      </div>

      {!canManage ? (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--foreground-muted)]">
          Only organization owners and admins can create or revoke API keys.
        </p>
      ) : null}

      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setNewKey(null);
        }}
        title={newKey ? "Your new API key" : "Create API key"}
        description={
          newKey
            ? "Copy this key now. You will not be able to see it again."
            : "Generate a key for programmatic access to this organization."
        }
        footer={
          newKey ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setNewKey(null);
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCreateOpen(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void generateKey()}
                disabled={createLoading}
              >
                {createLoading ? "Generating…" : "Generate key"}
              </Button>
            </>
          )
        }
      >
        {newKey ? (
          <div className="space-y-3">
            <code className="block break-all rounded-lg border border-[var(--border)] bg-[var(--muted)] p-3 text-xs font-mono text-[var(--foreground)]">
              {newKey}
            </code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void navigator.clipboard.writeText(newKey)}
            >
              Copy to clipboard
            </Button>
          </div>
        ) : createLoading ? (
          <p className="text-sm text-[var(--foreground-muted)]">Generating…</p>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={() => void confirmRevoke()}
        title="Revoke API key"
        description={
          revokeTarget
            ? "This key will stop working immediately. This cannot be undone."
            : ""
        }
        confirmLabel="Revoke"
        loading={revokeLoading}
      />

      {keys.length === 0 ? (
        <EmptyState
          title="No API keys"
          description="Create a key to authenticate programmatic access to your organization."
          action={
            canManage ? (
              <Button type="button" onClick={openCreateModal}>
                Create key
              </Button>
            ) : null
          }
        />
      ) : (
        <TableWrap>
          <TableHead>
            <Th>Key</Th>
            <Th>Created</Th>
            <Th>Status</Th>
            {canManage ? <Th className="text-right">Actions</Th> : null}
          </TableHead>
          <Tbody>
            {keys.map((k) => {
              const active = k.revokedAt == null;
              return (
                <Tr key={k.id}>
                  <Td className="font-mono text-xs">{maskKeyId(k.id)}</Td>
                  <Td className="text-[var(--foreground-muted)]">
                    {new Date(k.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </Td>
                  <Td>
                    <span
                      className={
                        active
                          ? "rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--foreground)]"
                          : "rounded-md bg-[var(--muted)] px-2 py-0.5 text-xs font-medium text-[var(--foreground-muted)]"
                      }
                    >
                      {active ? "Active" : "Revoked"}
                    </span>
                  </Td>
                  {canManage ? (
                    <Td className="text-right">
                      {active ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          onClick={() => setRevokeTarget(k)}
                        >
                          Revoke
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--foreground-subtle)]">
                          —
                        </span>
                      )}
                    </Td>
                  ) : null}
                </Tr>
              );
            })}
          </Tbody>
        </TableWrap>
      )}
    </div>
  );
}
