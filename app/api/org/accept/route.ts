import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { userActiveOrgUpdateData } from "@/lib/user-active-org-data";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: { inviteId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* body optional */
  }

  const invite = body.inviteId
    ? await prisma.orgInvite.findFirst({
        where: {
          id: body.inviteId,
          email: user.email,
          status: "PENDING",
        },
        include: {
          organization: { select: { name: true } },
        },
      })
    : await prisma.orgInvite.findFirst({
        where: {
          email: user.email,
          status: "PENDING",
        },
        orderBy: { createdAt: "asc" },
        include: {
          organization: { select: { name: true } },
        },
      });

  if (!invite) {
    return NextResponse.json(
      { error: "No pending invite Found" },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.orgMembership.create({
      data: {
        userId: user.id,
        organizationId: invite.organizationId,
        role: invite.role,
      },
    });

    await tx.orgInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    });

    await tx.user.update({
      where: { id: user.id },
      data: userActiveOrgUpdateData(invite.organizationId),
    });
  });

  await logAudit({
    action: "ACCEPT_INVITE",
    userId: user.id,
    organizationId: invite.organizationId,
    resource: `${user.email} accepted invite as ${invite.role} for "${invite.organization?.name ?? "organization"}" (invite ${invite.id.slice(0, 8)}…)`,
  });

  return NextResponse.json({ success: true });
}
