"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  return (
    <main className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">Your account</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
        Profile
      </h1>

      <nav className="mt-8 flex gap-6 border-b border-[var(--color-hairline)] pb-4 text-sm">
        <Link href="/account/orders" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">Orders</Link>
        <Link href="/account/downloads" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">Downloads</Link>
        <span className="text-[var(--color-text)]">Profile</span>
      </nav>

      {loading ? (
        <p className="mt-12 text-[var(--color-text-subtle)]">Loading…</p>
      ) : !user ? (
        <div className="mt-12">
          <p className="text-[var(--color-text-muted)]">Sign in to manage your account.</p>
          <Button href="/login?returnUrl=%2Faccount%2Fprofile" className="mt-6">Sign in</Button>
        </div>
      ) : (
        <>
          <dl className="mt-12 grid grid-cols-[auto_1fr] gap-x-10 gap-y-4 text-sm">
            <dt className="text-[var(--color-text-subtle)]">Name</dt>
            <dd>{user.fullName}</dd>
            <dt className="text-[var(--color-text-subtle)]">Email</dt>
            <dd>{user.email}</dd>
            <dt className="text-[var(--color-text-subtle)]">Phone</dt>
            <dd>{user.phoneNumber ?? "—"}</dd>
            <dt className="text-[var(--color-text-subtle)]">Email verified</dt>
            <dd>{user.emailVerified ? "Yes" : "Not yet"}</dd>
          </dl>

          {!user.emailVerified && (
            <p className="mt-8 rounded-sm border border-[var(--color-hairline)] p-5 text-sm text-[var(--color-text-muted)]">
              Your email is not verified yet. An order cannot be placed until it is —
              check your inbox for the code we sent when you signed up.
            </p>
          )}

          <div className="mt-12 flex gap-3">
            <Button variant="secondary" onClick={() => logout()}>Sign out</Button>
          </div>
        </>
      )}
    </main>
  );
}
