import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { userActiveOrgUpdateDataNullable } from "@/lib/user-active-org-data";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id || !session.user.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.activeOrgId;

  const [actorMembership, organization] = await Promise.all([
    prisma.orgMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { name: true },
    }),
  ]);

  if (!actorMembership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  if (actorMembership.role === "OWNER") {
    const ownerCount = await prisma.orgMembership.count({
      where: { organizationId: orgId, role: "OWNER" },
    });

    if (ownerCount <= 1) {
      return NextResponse.json(
        {
          error:
            "An owner cannot leave the organization without another owner remaining.",
        },
        { status: 400 },
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.orgMembership.delete({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    const nextMembership = await tx.orgMembership.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
      orderBy: { createdAt: "asc" },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: userActiveOrgUpdateDataNullable(nextMembership?.organizationId ?? null),
    });
  });

  await logAudit({
    action: "LEAVE_ORG",
    userId: session.user.id,
    organizationId: orgId,
    resource: `Left "${organization?.name ?? "organization"}" (${actorMembership.role})`,
  });

  return NextResponse.json({ success: true });
}

