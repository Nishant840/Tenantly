import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

export default async function DashboardAuditLogsPage() {
  const { orgId } = await requireActiveOrg();

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Audit logs
        </h1>
        <p className="mt-1 text-[var(--foreground-muted)]">
          Recent actions across your active organization (last 100 events).
        </p>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-[var(--foreground-muted)]">
            No audit events recorded yet.
          </CardContent>
        </Card>
      ) : (
        <TableWrap>
          <TableHead>
            <Th>Action</Th>
            <Th>User</Th>
            <Th>Resource</Th>
            <Th>Timestamp</Th>
          </TableHead>
          <Tbody>
            {logs.map((log) => (
              <Tr key={log.id}>
                <Td className="font-medium">{log.action}</Td>
                <Td className="text-[var(--foreground-muted)]">
                  {log.user?.name || log.user?.email || "—"}
                </Td>
                <Td className="max-w-[320px] whitespace-normal break-words text-[var(--foreground-muted)]">
                  {log.resource ?? "—"}
                </Td>
                <Td className="whitespace-nowrap text-[var(--foreground-muted)]">
                  {new Date(log.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableWrap>
      )}
    </div>
  );
}
