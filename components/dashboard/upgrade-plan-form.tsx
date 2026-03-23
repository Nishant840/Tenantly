"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const PLAN_VALUES = ["FREE", "PRO", "ENTERPRISE"] as const;
type PlanValue = (typeof PLAN_VALUES)[number];

function planLabel(plan: PlanValue) {
  if (plan === "FREE") return "Free";
  if (plan === "PRO") return "Pro";
  return "Enterprise";
}

export function UpgradePlanForm({ currentPlan }: { currentPlan: PlanValue }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanValue>(currentPlan);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/org/plan/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Upgrade failed");
        return;
      }
      router.refresh();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--foreground-muted)]">
              Current plan
            </p>
            <div className="text-2xl font-semibold text-[var(--foreground)]">
              {planLabel(currentPlan)}
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">
              Select a plan to update your workspace limits. (No payments integrated.)
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan-select">Choose plan</Label>
              <select
                id="plan-select"
                className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value as PlanValue)}
                disabled={loading}
              >
                {PLAN_VALUES.map((p) => (
                  <option key={p} value={p}>
                    {planLabel(p)}
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="button" onClick={() => void submit()} disabled={loading}>
                {loading ? "Updating…" : "Update plan"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

