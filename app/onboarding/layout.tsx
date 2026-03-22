import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin?callbackUrl=/onboarding");
  }

  if (session.user.id && session.user.activeOrgId) {
    const membership = await prisma.orgMembership.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: session.user.activeOrgId,
        },
      },
    });
    if (membership) {
      redirect("/dashboard");
    }
  }

  return <>{children}</>;
}
