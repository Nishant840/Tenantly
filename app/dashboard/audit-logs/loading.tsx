import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLogsLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
