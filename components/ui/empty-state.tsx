import {
  Card,
  CardContent,
} from "@/components/ui/card";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-[var(--foreground-muted)]">
            {description}
          </p>
        ) : null}
        {action}
      </CardContent>
    </Card>
  );
}
