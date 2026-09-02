"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

/**
 * Header session state. Renders nothing while the initial refresh is in flight,
 * so the UI never flashes "Sign in" at somebody who is already signed in.
 */
export function UserMenu() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="h-11 w-24" aria-hidden />;
  }

  if (!user) {
    const returnUrl = encodeURIComponent(pathname);
    return (
      <Button
        href={`/login?returnUrl=${returnUrl}`}
        variant="secondary"
        className="hidden px-4 sm:inline-flex"
      >
        Sign in
      </Button>
    );
  }

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account/orders"
        className="hidden text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] sm:block"
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
