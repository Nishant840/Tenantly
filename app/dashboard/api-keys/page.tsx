import {
  ApiKeysView,
  type ApiKeyRow,
} from "@/components/dashboard/api-keys-view";
import { requireActiveOrg } from "@/lib/require-active-org";
import { prisma } from "@/lib/prisma";

export default async function DashboardApiKeysPage() {
  const { membership, orgId } = await requireActiveOrg();

  const keysRaw = await prisma.apiKey.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      revokedAt: true,
    },
  });

  const keys: ApiKeyRow[] = keysRaw.map((k) => ({
    id: k.id,
    createdAt: k.createdAt.toISOString(),
    revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
  }));

  return (
    <ApiKeysView
      keys={keys}
      canManage={membership.role !== "MEMBER"}
    />
  );
}
