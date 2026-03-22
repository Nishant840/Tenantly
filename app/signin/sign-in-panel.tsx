"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M5.27 9.76A7.49 7.49 0 0 1 12 5.5c1.86 0 3.55.64 4.88 1.88l3.66-3.66A12.47 12.47 0 0 0 12 1C7.7 1 3.99 3.47 2.18 7.07l3.09 2.69z"
      />
      <path
        fill="#4285F4"
        d="M21.8 12.23c0-.82-.07-1.6-.2-2.36H12v4.47h5.51c-.24 1.26-.96 2.33-2.05 3.05l3.2 2.48c1.86-1.72 2.94-4.25 2.94-7.24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.24A7.5 7.5 0 0 1 5.5 12c0-.8.14-1.56.4-2.27L2.18 7.07A12.45 12.45 0 0 0 1 12c0 2.01.48 3.91 1.33 5.59l3.94-3.35z"
      />
      <path
        fill="#34A853"
        d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.2-2.48c-.9.6-2.05.96-3.76.96-2.9 0-5.36-1.96-6.24-4.59l-3.94 3.35A12.45 12.45 0 0 0 12 23z"
      />
    </svg>
  );
}

export function SignInPanel() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col bg-app-pattern lg:flex-row">
      <div className="flex flex-1 flex-col justify-center px-6 py-16 lg:px-16 xl:px-24">
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2.5 self-start rounded-lg outline-none ring-offset-2 ring-offset-[var(--background)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          <TenantlyMark className="h-9 w-9" />
          <TenantlyWordmark className="text-lg" />
        </Link>
        <div className="mx-auto w-full max-w-md">
          <Card className="border-[var(--border)] shadow-lg shadow-black/5 dark:shadow-black/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in with your Google account to open your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {error ? (
                <p
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
                  role="alert"
                >
                  Something went wrong. Please try again.
                </p>
              ) : null}
              <Button
                type="button"
                size="lg"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  void signIn("google", { callbackUrl });
                }}
              >
                <GoogleIcon className="h-5 w-5" />
                Continue with Google
              </Button>
              <p className="text-center text-xs text-[var(--foreground-muted)]">
                By continuing you agree to our terms and privacy practices.
              </p>
              <p className="text-center text-xs text-[var(--foreground-subtle)]">
                Were you invited? Use the same Google account as the invitation
                email — you can accept from the dashboard or onboarding.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="relative hidden flex-1 flex-col justify-end border-l border-[var(--border)] bg-[var(--card)] p-12 lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--mesh-1)] via-transparent to-[var(--mesh-2)]" />
        <blockquote className="relative z-10 max-w-md">
          <p className="text-lg font-medium leading-relaxed text-[var(--foreground)]">
            &ldquo;One workspace for every organization. Ship faster without
            losing the thread.&rdquo;
          </p>
          <footer className="mt-6 text-sm text-[var(--foreground-muted)]">
            — Tenantly
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
