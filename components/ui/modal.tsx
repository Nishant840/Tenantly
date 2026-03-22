"use client";

import { cn } from "@/lib/cn";
import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg",
          className,
        )}
      >
        <div className="mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {children != null ? (
          <div className="max-h-[min(70vh,28rem)] overflow-y-auto">{children}</div>
        ) : null}
        {footer ? (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
