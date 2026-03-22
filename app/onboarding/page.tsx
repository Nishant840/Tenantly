"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TenantlyMark, TenantlyWordmark } from "@/components/brand/tenantly-mark";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Could not create organization.");
        setLoading(false);
        return;
      }

      await update();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app-pattern px-6 py-10">
      <div className="mx-auto flex max-w-lg flex-col">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2.5 self-start rounded-lg outline-none ring-offset-2 ring-offset-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <TenantlyMark className="h-9 w-9" />
          <TenantlyWordmark className="text-lg" />
        </Link>

        <div className="mb-8">
          <p className="text-sm font-medium text-[var(--primary)]">
            Step 1 of 1
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
            Create your organization
          </h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            This becomes your tenant. You can invite teammates and add projects
            next.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization details</CardTitle>
            <CardDescription>
              Choose a display name and a URL slug (letters, numbers, hyphens).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {error ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  name="name"
                  placeholder="Acme Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug</Label>
                <Input
                  id="org-slug"
                  name="slug"
                  placeholder="acme-inc"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "-")
                        .replace(/-+/g, "-"),
                    )
                  }
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  title="Lowercase letters, numbers, and hyphens only"
                />
                <p className="text-xs text-[var(--foreground-muted)]">
                  tenantly.app will use this internally for routing and APIs.
                </p>
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Create organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
