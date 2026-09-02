"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authApi, AuthError } from "@/lib/auth/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await authApi.forgotPassword(email);
      // Always shows the same confirmation, whether or not the address is
      // registered — otherwise this page becomes a list of who has an account.
      setSent(true);
    } catch (cause) {
      setError(cause instanceof AuthError ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-[1400px] items-center px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">Reset your password</h1>

        {sent ? (
          <>
            <p className="mt-6 text-[var(--color-text-muted)]">
              If an account exists for that address, a reset code is on its way.
            </p>
            <Link href="/login" className="mt-8 inline-block text-sm text-[var(--color-light)] hover:underline">
              Back to sign in
            </Link>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-[var(--color-text-muted)]">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="min-h-11 rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)] px-4 text-[var(--color-text)] focus:border-[var(--color-light)] focus:outline-none"
              />
            </label>

            {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

            <Button type="submit" disabled={busy} className="mt-2 w-full">
              {busy ? "Sending…" : "Send reset code"}
            </Button>

            <Link href="/login" className="mt-4 text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
