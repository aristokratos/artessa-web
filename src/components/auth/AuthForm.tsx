"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { authApi, AuthError } from "@/lib/auth/api";
import { useAuth } from "@/lib/auth/AuthProvider";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; cta: string; switchText: string; switchHref: string; switchCta: string }> = {
  login: {
    title: "Sign in",
    cta: "Sign in",
    switchText: "New here?",
    switchHref: "/signup",
    switchCta: "Create an account",
  },
  signup: {
    title: "Create an account",
    cta: "Create account",
    switchText: "Already have an account?",
    switchHref: "/login",
    switchCta: "Sign in",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const { login, register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(
    // The Google callback redirects here with ?error=google when the exchange
    // fails, since it cannot render a message itself.
    params.get("error") === "google"
      ? "Google sign-in did not complete. Please try again."
      : null,
  );
  const [busy, setBusy] = useState(false);

  const copy = COPY[mode];
  const returnUrl = params.get("returnUrl") ?? "/";
  const variantId = params.get("add") ?? undefined;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      // replace, not push: the back button must not return to a form the user
      // has already completed.
      router.replace(returnUrl);
    } catch (cause) {
      setError(
        cause instanceof AuthError
          ? cause.message
          : "Something went wrong. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">{copy.title}</h1>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        Browsing needs no account. One is only required to buy.
      </p>

      {/* Google first: it is the path most people will take, and putting it
          under the form makes it look like an afterthought. */}
      <a
        href={authApi.googleStartUrl(returnUrl, variantId)}
        className={cn(
          "mt-8 flex min-h-11 w-full items-center justify-center gap-3 rounded-sm",
          "border border-[var(--color-hairline)] px-6 text-sm font-medium",
          "transition-colors hover:border-[var(--color-text-subtle)]",
        )}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.29 9.14 5.38 12 5.38Z" />
        </svg>
        Continue with Google
      </a>

      <div className="my-7 flex items-center gap-4">
        <span className="h-px flex-1 bg-[var(--color-hairline)]" />
        <span className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-subtle)]">or</span>
        <span className="h-px flex-1 bg-[var(--color-hairline)]" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <Field
            label="Full name"
            type="text"
            value={fullName}
            onChange={setFullName}
            autoComplete="name"
            required
          />
        )}

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={mode === "signup" ? 10 : undefined}
          hint={mode === "signup" ? "At least 10 characters. A passphrase works well." : undefined}
        />

        {error && (
          // role="alert" so a screen reader announces it without the user
          // having to hunt for what changed.
          <p role="alert" className="text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Button type="submit" disabled={busy} className="mt-2 w-full">
          {busy ? "Working…" : copy.cta}
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-2 text-sm text-[var(--color-text-subtle)]">
        <span>
          {copy.switchText}{" "}
          <Link href={copy.switchHref} className="text-[var(--color-light)] hover:underline">
            {copy.switchCta}
          </Link>
        </span>
        {mode === "login" && (
          <Link href="/forgot-password" className="hover:text-[var(--color-text)]">
            Forgot your password?
          </Link>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className={cn(
          "min-h-11 rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)]",
          "px-4 text-[var(--color-text)] transition-colors",
          "focus:border-[var(--color-light)] focus:outline-none",
        )}
      />
      {hint && <span className="text-xs text-[var(--color-text-subtle)]">{hint}</span>}
    </label>
  );
}
