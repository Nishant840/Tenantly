import { redirect } from "next/navigation";
import { requireActiveOrg } from "@/lib/require-active-org";
import { PLAN_LIMITS } from "@/lib/plans";
import { Card, CardContent } from "@/components/ui/card";
import { UpgradePlanForm } from "@/components/dashboard/upgrade-plan-form";

export default async function UpgradePlanPage() {
  const { membership, organization } = await requireActiveOrg();

  if (membership.role === "MEMBER") {
    redirect("/dashboard");
  }

  const currentPlan = organization.plan as "FREE" | "PRO" | "ENTERPRISE";
  const currentProjectsLimit = PLAN_LIMITS[currentPlan].projects;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Upgrade plan
        </h1>
        <p className="mt-1 text-[var(--foreground-muted)]">
          Update the workspace limits for this organization. No payment integration.
        </p>
      </div>

      <UpgradePlanForm currentPlan={currentPlan} />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--foreground-muted)]">
              Current project limit
            </p>
            <p className="text-lg font-semibold text-[var(--foreground)]">
              {currentProjectsLimit === Infinity
                ? "Unlimited"
                : `${currentProjectsLimit} projects`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

