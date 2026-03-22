import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

/** Pending invites for the active organization (admins / owners only). */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id || !session.user.activeOrgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: session.user.activeOrgId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  if (membership.role === "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await prisma.orgInvite.findMany({
    where: {
      organizationId: session.user.activeOrgId,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invites);
}
