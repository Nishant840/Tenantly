export function TenantlyMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="32" height="32" rx="8" className="fill-[var(--primary)]" />
      <path
        d="M9 10h14v2.5H16.25V22h-2.5v-9.5H9V10z"
        className="fill-[var(--primary-foreground)]"
      />
    </svg>
  );
}

export function TenantlyWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-semibold tracking-tight text-[var(--foreground)] ${className ?? ""}`}
    >
      Tenantly
    </span>
  );
}
