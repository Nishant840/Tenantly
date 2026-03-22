import { Suspense } from "react";
import { SignInPanel } from "./sign-in-panel";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-app-pattern">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-[var(--muted)]" />
        </div>
      }
    >
      <SignInPanel />
    </Suspense>
  );
}
