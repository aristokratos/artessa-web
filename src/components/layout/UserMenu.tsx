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

  // Never replace the primary account action with an inert placeholder. On a
  // cold PWA launch the hosted API can take several seconds to wake up; users
  // must still be able to open the sign-in screen during that time.
  if (loading) {
    return (
      <a
        href={`/login?returnUrl=${encodeURIComponent(pathname)}`}
        className="relative z-10 inline-flex min-h-11 items-center rounded-sm border border-[var(--color-hairline)] px-4 text-sm font-medium"
      >
        Sign in
      </a>
    );
  }

  if (!user) {
    return (
      <a
        href={`/login?returnUrl=${encodeURIComponent(pathname)}`}
        className="relative z-10 inline-flex min-h-11 items-center rounded-sm border border-[var(--color-hairline)] px-4 text-sm font-medium transition-colors hover:border-[var(--color-light)]"
      >
        Sign in
      </a>
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
