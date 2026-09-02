"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Header session state.
 *
 * Everything here is visible at every width. Sign-in used to be hidden below
 * `sm`, which meant the primary way into an account disappeared on exactly the
 * device most people browse on — and the PWA is mobile-first (PWA-04).
 */
export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  // A fixed-size placeholder rather than nothing, so the header does not
  // reflow when the session resolves.
  if (loading) {
    return <div className="h-11 w-20" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?returnUrl=${encodeURIComponent(pathname)}`}
        className="inline-flex min-h-11 items-center rounded-sm border border-[var(--color-hairline)] px-4 text-sm font-medium transition-colors hover:border-[var(--color-light)]"
      >
        Sign in
      </Link>
    );
  }

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="flex items-center gap-1">
      {/* Curators reach the upload screen from here; customers never see it. */}
      {(user.role === "Curator" || user.role === "Admin") && (
        <Link
          href="/admin/artworks"
          className="hidden min-h-11 items-center px-3 text-sm text-[var(--color-light)] transition-colors hover:underline sm:inline-flex"
        >
          Studio
        </Link>
      )}
      <Link
        href="/account/orders"
        className="inline-flex min-h-11 max-w-24 items-center truncate px-2 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        {firstName}
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="min-h-11 px-2 text-sm text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text)]"
      >
        Sign out
      </button>
    </div>
  );
}
