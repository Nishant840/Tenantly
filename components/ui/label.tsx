import { cn } from "@/lib/cn";
import type { LabelHTMLAttributes } from "react";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}
