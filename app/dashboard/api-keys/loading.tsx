import { Skeleton } from "@/components/ui/skeleton";

export default function ApiKeysLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
