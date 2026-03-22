"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateProjectFormProps = {
  onSuccess?: () => void;
  idPrefix?: string;
};

export function CreateProjectForm({
  onSuccess,
  idPrefix = "new-project",
}: CreateProjectFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Could not create project.");
        setLoading(false);
        return;
      }

      setName("");
      onSuccess?.();
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor={idPrefix}>New project</Label>
          <Input
            id={idPrefix}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile app"
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading} className="shrink-0 sm:w-auto">
          {loading ? "Creating…" : "Create"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
