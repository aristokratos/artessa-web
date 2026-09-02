"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { commerceApi } from "@/lib/api/commerce";
import { useAuth } from "@/lib/auth/AuthProvider";
import { formatPrice } from "@/lib/utils";
import type { Cart } from "@/types/commerce";

export default function CartPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    try { setCart(await commerceApi.cart(token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load your cart."); }
  }, [getAccessToken]);

  useEffect(() => { if (user) void load(); }, [user, load]);

  async function mutate(itemId: string, action: (token: string) => Promise<unknown>) {
    setBusy(itemId); setError(null);
    try {
      const token = await getAccessToken();
      if (!token) return;
      await action(token); await load();
      window.dispatchEvent(new CustomEvent("artessa:cart-changed"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your cart."); }
    finally { setBusy(null); }
  }

  if (authLoading) return <main className="mx-auto min-h-[65vh] max-w-6xl px-5 py-20 text-[var(--color-text-muted)]">Preparing your collection…</main>;
  if (!user) return (
    <main className="mx-auto grid min-h-[70vh] max-w-xl place-content-center px-5 text-center">
      <ShoppingBag className="mx-auto mb-6 text-[var(--color-light)]" size={32} strokeWidth={1.3} />
      <h1 className="font-[family-name:var(--font-display)] text-4xl">Your collection awaits</h1>
      <p className="mt-4 text-[var(--color-text-muted)]">Sign in to see your saved cart on every device.</p>
      <Link className="mt-8 inline-flex h-12 items-center justify-center bg-[var(--color-light)] px-6 font-medium text-[#0a0a0b]" href="/login?returnUrl=/cart">Sign in</Link>
    </main>
  );

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1200px] px-5 py-12 sm:px-8 lg:py-20">
      <p className="text-[11px] uppercase tracking-[.22em] text-[var(--color-light)]">Private viewing</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[length:var(--text-display)]">Your collection</h1>
      {error && <p className="mt-6 border-l-2 border-[var(--color-danger)] pl-4 text-sm text-[var(--color-danger)]" role="alert">{error}</p>}
      {!cart ? <p className="mt-12 text-[var(--color-text-muted)]">Loading your selections…</p> : cart.items.length === 0 ? (
        <div className="mt-12 border border-[var(--color-hairline)] bg-[var(--color-surface)] p-10 text-center sm:p-16">
          <p className="font-[family-name:var(--font-display)] text-2xl">A quiet room, for now.</p>
          <p className="mt-3 text-[var(--color-text-muted)]">Explore the collection and add a work that stays with you.</p>
          <Link className="mt-7 inline-flex h-12 items-center bg-[var(--color-light)] px-7 font-medium text-[#0a0a0b]" href="/gallery">Browse the gallery</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
            {cart.items.map(item => (
              <article key={item.id} className="grid grid-cols-[96px_1fr] gap-5 py-6 sm:grid-cols-[132px_1fr]">
                <Link href={`/artwork/${item.artworkSlug}`} className="aspect-[4/5] bg-[radial-gradient(circle_at_40%_30%,#735b42,#171719_70%)]" aria-label={`View ${item.artworkTitle}`} />
                <div className="flex min-w-0 flex-col sm:flex-row sm:justify-between">
                  <div>
                    <Link href={`/artwork/${item.artworkSlug}`} className="font-[family-name:var(--font-display)] text-xl hover:text-[var(--color-light)]">{item.artworkTitle}</Link>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.artistName}</p>
                    <p className="mt-3 text-xs uppercase tracking-[.14em] text-[var(--color-text-subtle)]">{item.variantLabel ?? item.variantKind}</p>
                    {item.priceChanged && <p className="mt-2 text-xs text-[var(--color-light)]">Price updated since you added this work</p>}
                    {item.reservedUntilUtc && <p className="mt-2 text-xs text-[var(--color-text-muted)]">Original held until {new Date(item.reservedUntilUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>}
                  </div>
                  <div className="mt-5 flex items-end justify-between gap-5 sm:mt-0 sm:flex-col">
                    <p>{formatPrice(item.unitPriceMinor * item.quantity, cart.currency)}</p>
                    <div className="flex items-center gap-1">
                      {item.variantKind !== "OriginalPhysical" && <div className="mr-2 flex items-center border border-[var(--color-hairline)]"><button aria-label="Decrease quantity" className="grid h-10 w-10 place-items-center" disabled={busy === item.id || item.quantity === 1} onClick={() => void mutate(item.id, t => commerceApi.update(t, item.id, item.quantity - 1))}><Minus size={14}/></button><span className="min-w-8 text-center text-sm">{item.quantity}</span><button aria-label="Increase quantity" className="grid h-10 w-10 place-items-center" disabled={busy === item.id} onClick={() => void mutate(item.id, t => commerceApi.update(t, item.id, item.quantity + 1))}><Plus size={14}/></button></div>}
                      <button aria-label={`Remove ${item.artworkTitle}`} className="grid h-10 w-10 place-items-center text-[var(--color-text-subtle)] hover:text-[var(--color-danger)]" disabled={busy === item.id} onClick={() => void mutate(item.id, t => commerceApi.remove(t, item.id))}><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit bg-[var(--color-surface)] p-7 lg:sticky lg:top-24">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Acquisition summary</h2>
            <div className="mt-7 flex justify-between border-b border-[var(--color-hairline)] pb-5"><span className="text-[var(--color-text-muted)]">Subtotal</span><strong>{formatPrice(cart.subtotalMinor, cart.currency)}</strong></div>
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-text-muted)]">{cart.requiresShipping ? "Shipping is calculated from your delivery address before payment." : "Digital works become available immediately after payment."}</p>
            <Link href="/checkout" className="mt-7 flex h-12 items-center justify-center bg-[var(--color-light)] font-medium text-[#0a0a0b]">Continue to checkout</Link>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-[var(--color-text-subtle)]"><ShieldCheck size={14}/> Secure checkout powered by Paystack</p>
          </aside>
        </div>
      )}
    </main>
  );
}
