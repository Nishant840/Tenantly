import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const orgMembershipsList = await prisma.orgMembership.findMany({
    where: { userId: session.user.id },
    include: { organization: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const organizations = orgMembershipsList.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
  }));

  let orgName: string | null = null;
  let orgRole: string | null = null;

  if (session.user.activeOrgId) {
    const activeMembership = orgMembershipsList.find(
      (m) => m.organizationId === session.user.activeOrgId,
    );
    orgName = activeMembership?.organization.name ?? null;
    orgRole = activeMembership?.role ?? null;
  }

  return (
    <DashboardShell
      orgName={orgName}
      activeOrgId={session.user.activeOrgId}
      organizations={organizations}
      orgRole={orgRole}
      userEmail={session.user.email}
      userName={session.user.name}
    >
      {children}
    </DashboardShell>
  );
}
