import {
  TeamView,
  type TeamMemberRow,
} from "@/components/dashboard/team-view";
import { requireActiveOrg } from "@/lib/require-active-org";
import { prisma } from "@/lib/prisma";

export default async function DashboardTeamPage() {
  const { membership, orgId, userId } = await requireActiveOrg();

  const membersRaw = await prisma.orgMembership.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        include: {
          projectMemberships: {
            include: {
              project: {
                select: { id: true, name: true, organizationId: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const members: TeamMemberRow[] = membersRaw.map((m) => ({
    userId: m.user.id,
    email: m.user.email,
    name: m.user.name,
    role: m.role,
    projects: m.user.projectMemberships
      .filter((pm) => pm.project.organizationId === orgId)
      .map((pm) => ({
        projectId: pm.project.id,
        projectName: pm.project.name,
      })),
  }));

  return (
    <TeamView
      members={members}
      currentUserId={userId}
      actorOrgRole={membership.role}
      canManage={membership.role !== "MEMBER"}
    />
  );
}
