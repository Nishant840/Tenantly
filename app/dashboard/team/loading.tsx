import { Skeleton } from "@/components/ui/skeleton";

export default function TeamLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
