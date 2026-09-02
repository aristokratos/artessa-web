"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { commerceApi } from "@/lib/api/commerce";
import type { ArtworkVariant } from "@/types/catalogue";

/**
 * The add-to-cart gate (CART-01, CART-02).
 *
 * Browsing is open; intent to buy requires an identity. Rather than failing
 * silently or navigating away and losing the click, this sends the buyer to
 * sign-in carrying both where they were and what they were adding, so the item
 * lands in the cart by itself when they come back — including after the full
 * Google round trip.
 *
 * This gate is the single most conversion-sensitive decision in the product;
 * `auth_prompt_shown → auth_completed` (PRD §13) is what tells us whether it is
 * costing sales.
 */
export function AddToCartButton({ variant }: { variant: ArtworkVariant }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, getAccessToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!variant.isAvailable) {
    return (
      <Button className="mt-6 w-full" disabled>
        No longer available
      </Button>
    );
  }

  async function onClick() {
    if (!user) {
      // The intent rides in the URL so it survives the redirect — and, for
      // Google, a trip off-site entirely.
      const params = new URLSearchParams({
        returnUrl: pathname,
        add: variant.id,
      });
      router.push(`/login?${params.toString()}`);
      return;
    }

    if (!user.canPurchase) {
      router.push(`/verify-email?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        router.push(`/login?returnUrl=${encodeURIComponent(pathname)}&add=${variant.id}`);
        return;
      }
      await commerceApi.add(token, variant.id);
      window.dispatchEvent(new CustomEvent("artessa:cart-changed"));
      router.push("/cart");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not add this work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
    <Button
      className="mt-6 w-full"
      onClick={onClick}
      // Disabled only while the session is still resolving, so the button never
      // makes a decision based on a user object that has not arrived yet.
      disabled={loading || busy}
    >
      {loading ? "…" : busy ? "Adding…" : "Add to cart"}
    </Button>
    {error && <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">{error}</p>}
    </div>
  );
}
