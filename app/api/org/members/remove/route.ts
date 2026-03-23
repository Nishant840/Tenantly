import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id || !session.user.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    userId?: string;
  } | null;
  const targetUserId = body?.userId;

  if (!targetUserId || typeof targetUserId !== "string") {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const organizationId = session.user.activeOrgId;

  const actorMembership = await prisma.orgMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  if (!actorMembership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  if (actorMembership.role === "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  const targetMembership = await prisma.orgMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId,
      },
    },
  });

  if (!targetMembership) {
    return NextResponse.json({ error: "User not in organization" }, { status: 404 });
  }

  if (targetMembership.role === "OWNER" && actorMembership.role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    const projectIds = await tx.project.findMany({
      where: { organizationId },
      select: { id: true },
    });

    await tx.projectMembership.deleteMany({
      where: {
        userId: targetUserId,
        projectId: { in: projectIds.map((p) => p.id) },
      },
    });

    await tx.orgMembership.delete({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });
  });

  const [org, targetUser] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { email: true, name: true },
    }),
  ]);

  await logAudit({
    action: "REMOVE_ORG_MEMBER",
    userId: session.user.id,
    organizationId,
    resource: `Removed ${targetUser?.email ?? targetUserId} from "${org?.name ?? "organization"}"`,
  });

  return NextResponse.json({ success: true });
}
