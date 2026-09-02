"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";

/**
 * Purchased digital files.
 *
 * The entitlement model exists and the master file is stored privately, but the
 * endpoint that mints a signed download link is not built yet — so this states
 * that plainly rather than showing a button that cannot work.
 */
export default function DownloadsPage() {
  const { user, loading } = useAuth();

  return (
    <main className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">Your account</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
        Downloads
      </h1>

      <nav className="mt-8 flex gap-6 border-b border-[var(--color-hairline)] pb-4 text-sm">
        <Link href="/account/orders" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">Orders</Link>
        <span className="text-[var(--color-text)]">Downloads</span>
        <Link href="/account/profile" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">Profile</Link>
      </nav>

      {loading ? (
        <p className="mt-12 text-[var(--color-text-subtle)]">Loading…</p>
      ) : !user ? (
        <div className="mt-12">
          <p className="text-[var(--color-text-muted)]">Sign in to reach your files.</p>
          <Button href="/login?returnUrl=%2Faccount%2Fdownloads" className="mt-6">Sign in</Button>
        </div>
      ) : (
        <div className="mt-12 rounded-sm border border-[var(--color-hairline)] px-8 py-16 text-center">
          <Download className="mx-auto h-8 w-8 text-[var(--color-text-subtle)]" strokeWidth={1.5} />
          <p className="mt-5 text-[var(--color-text-muted)]">Nothing to download yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-subtle)]">
            Buying a digital licence puts the full-resolution, unwatermarked file
            here — as a private link that only you can open.
          </p>
          <Button href="/gallery" variant="secondary" className="mt-8">Browse the gallery</Button>
        </div>
      )}
    </main>
  );
}
