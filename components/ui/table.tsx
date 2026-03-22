import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
        {children}
      </tr>
    </thead>
  );
}

export function Th({
  className,
  children,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-[var(--foreground-muted)]",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border)]">{children}</tbody>;
}

export function Tr({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-[var(--muted)]/60", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function Td({
  className,
  children,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 text-[var(--foreground)]", className)}
      {...props}
    >
      {children}
    </td>
  );
}
