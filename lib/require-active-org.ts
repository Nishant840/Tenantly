import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function requireActiveOrg() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  if (!session.user.activeOrgId) {
    redirect("/onboarding");
  }

  const membership = await prisma.orgMembership.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId: session.user.activeOrgId,
      },
    },
    include: { organization: true },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  return {
    session,
    membership,
    organization: membership.organization,
    orgId: session.user.activeOrgId,
    userId: session.user.id,
  };
}
