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

  const body = (await req.json().catch(() => null)) as { projectId?: string } | null;
  const projectId = body?.projectId;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const orgId = session.user.activeOrgId;

  const orgMembership = await prisma.orgMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: orgId,
      },
    },
  });

  if (!orgMembership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  if (orgMembership.role === "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.organizationId !== orgId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectMembership.deleteMany({
      where: { projectId },
    });
    await tx.project.delete({
      where: { id: projectId },
    });
  });

  await logAudit({
    action: "DELETE_PROJECT",
    userId: session.user.id,
    organizationId: orgId,
    resource: `${project.name} (${projectId})`,
  });

  return NextResponse.json({ success: true });
}
