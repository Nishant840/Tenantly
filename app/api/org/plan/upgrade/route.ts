import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const PLAN_VALUES = ["FREE", "PRO", "ENTERPRISE"] as const;
type PlanValue = (typeof PLAN_VALUES)[number];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id || !session.user.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const plan = body.plan;
  if (typeof plan !== "string" || !PLAN_VALUES.includes(plan as PlanValue)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const orgId = session.user.activeOrgId;

  const membership = await prisma.orgMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
    select: { role: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  if (membership.role === "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, plan: true, name: true },
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const previousPlan = org.plan;
  const nextPlan = plan as PlanValue;

  await prisma.organization.update({
    where: { id: orgId },
    data: { plan: nextPlan },
  });

  await logAudit({
    action: "UPDATE_ORG_PLAN",
    userId: session.user.id,
    organizationId: orgId,
    resource: `Plan changed for "${org.name}" from ${previousPlan} to ${nextPlan}`,
  });

  return NextResponse.json({ success: true });
}

