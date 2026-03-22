import { ProjectsView, type ProjectRow } from "@/components/dashboard/projects-view";
import { PLAN_LIMITS } from "@/lib/plans";
import { requireActiveOrg } from "@/lib/require-active-org";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardProjectsPage() {
  const { membership, orgId, userId } = await requireActiveOrg();

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { projects: true },
  });

  if (!organization) {
    redirect("/onboarding");
  }

  const projectLimit = PLAN_LIMITS[organization.plan].projects;
  const atLimit =
    projectLimit !== Infinity && organization.projects.length >= projectLimit;

  const limitDescription =
    projectLimit === Infinity
      ? "You can create unlimited projects on your current plan."
      : `You can create up to ${projectLimit} project${projectLimit === 1 ? "" : "s"} on the ${organization.plan} plan.`;

  const projectsData = await prisma.project.findMany({
    where: { organizationId: orgId },
    include: {
      _count: { select: { members: true } },
      members: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects: ProjectRow[] = projectsData.map((p) => ({
    id: p.id,
    name: p.name,
    createdAt: p.createdAt.toISOString(),
    memberCount: p._count.members,
    myRole:
      p.members.find((m) => m.userId === userId)?.role ?? null,
    members: p.members.map((m) => ({
      userId: m.userId,
      role: m.role,
      email: m.user.email,
      name: m.user.name,
    })),
  }));

  const orgMembersRaw = await prisma.orgMembership.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const orgMembers = orgMembersRaw.map((m) => ({
    userId: m.userId,
    email: m.user.email,
    name: m.user.name,
  }));

  return (
    <ProjectsView
      projects={projects}
      orgMembers={orgMembers}
      currentUserId={userId}
      canManage={membership.role !== "MEMBER"}
      canDeleteProject={
        membership.role === "ADMIN" || membership.role === "OWNER"
      }
      atLimit={atLimit}
      limitDescription={limitDescription}
    />
  );
}
