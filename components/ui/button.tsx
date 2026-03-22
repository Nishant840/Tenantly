import { cn } from "@/lib/cn";
import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  children?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  asChild,
  children,
  ...props
}: ButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" &&
      "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)]",
    variant === "secondary" &&
      "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]",
    variant === "ghost" &&
      "text-[var(--foreground-muted)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
    variant === "danger" &&
      "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
    size === "sm" && "h-9 px-3 text-sm",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-11 px-5 text-base",
    className,
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn(styles, (children as ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button type={type} className={styles} {...props}>
      {children}
    </button>
  );
}
