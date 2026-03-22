import Link from "next/link";
import { TenantlyMark, TenantlyWordmark } from "@/components/brand/tenantly-mark";
import { Button } from "@/components/ui/button";

export function LandingHero() {
  return (
    <div className="relative min-h-screen bg-app-pattern">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <TenantlyMark className="h-9 w-9" />
          <TenantlyWordmark className="text-lg" />
        </div>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/signin">Sign in</Link>
        </Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-[var(--primary)]">
            Multi-tenant SaaS
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl sm:leading-tight">
            Your organizations, projects, and people — organized.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-[var(--foreground-muted)]">
            Tenantly gives each team a dedicated workspace with projects, access
            control, and audit-friendly workflows. Start in minutes with Google
            sign-in.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signin">Get started</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/signin">Sign in to existing workspace</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-20 max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-xl shadow-black/5 dark:shadow-black/30">
          <div className="rounded-xl bg-[var(--muted)] p-8 sm:p-12">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { t: "Organizations", d: "Isolated tenants with plans & limits" },
                { t: "Projects", d: "Ship work inside the right org context" },
                { t: "Members", d: "Roles, invites, and clear permissions" },
              ].map((item) => (
                <div
                  key={item.t}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-left"
                >
                  <h3 className="font-medium text-[var(--foreground)]">
                    {item.t}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                    {item.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--foreground-muted)]">
        © {new Date().getFullYear()} Tenantly
      </footer>
    </div>
  );
}
