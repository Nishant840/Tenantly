import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TableHead,
  TableWrap,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/ui/table";
import { requireActiveOrg } from "@/lib/require-active-org";
import { prisma } from "@/lib/prisma";

export default async function DashboardOverviewPage() {
  const { organization, orgId } = await requireActiveOrg();

  const [projectCount, memberCount, activeKeyCount, recentLogs] =
    await Promise.all([
      prisma.project.count({ where: { organizationId: orgId } }),
      prisma.orgMembership.count({ where: { organizationId: orgId } }),
      prisma.apiKey.count({
        where: { organizationId: orgId, revokedAt: null },
      }),
      prisma.auditLog.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
    ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Overview
        </h1>
        <p className="mt-1 text-[var(--foreground-muted)]">
          <span className="font-medium text-[var(--foreground)]">
            {organization.name}
          </span>
          <span className="text-[var(--foreground-subtle)]"> · </span>
          Plan{" "}
          <span className="rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-sm font-medium text-[var(--foreground)]">
            {organization.plan}
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total projects</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {projectCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="ghost" size="sm" className="h-auto p-0" asChild>
              <Link href="/dashboard/projects">View projects →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team members</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {memberCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="ghost" size="sm" className="h-auto p-0" asChild>
              <Link href="/dashboard/team">Manage team →</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active API keys</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {activeKeyCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="ghost" size="sm" className="h-auto p-0" asChild>
              <Link href="/dashboard/api-keys">View keys →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--foreground-subtle)]">
            Recent audit activity
          </h2>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/audit-logs">View all logs</Link>
          </Button>
        </div>
        {recentLogs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-[var(--foreground-muted)]">
              No audit events yet for this organization.
            </CardContent>
          </Card>
        ) : (
          <TableWrap>
            <TableHead>
              <Th>Action</Th>
              <Th>User</Th>
              <Th>Resource</Th>
              <Th>Time</Th>
            </TableHead>
            <Tbody>
              {recentLogs.map((log) => (
                <Tr key={log.id}>
                  <Td className="font-medium">{log.action}</Td>
                  <Td className="text-[var(--foreground-muted)]">
                    {log.user?.name || log.user?.email || "—"}
                  </Td>
                  <Td className="max-w-[180px] truncate text-[var(--foreground-muted)]">
                    {log.resource ?? "—"}
                  </Td>
                  <Td className="whitespace-nowrap text-[var(--foreground-muted)]">
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </TableWrap>
        )}
      </section>
    </div>
  );
}
