"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { commerceApi } from "@/lib/api/commerce";
import {
  checkoutApi,
  CheckoutError,
  type CheckoutQuote,
  type ShippingAddressInput,
} from "@/lib/api/checkout";
import { cn, formatPrice } from "@/lib/utils";
import type { Cart } from "@/types/commerce";

const NIGERIAN_STATES = [
  "Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Enugu", "Edo",
  "Delta", "Anambra", "Kaduna", "Ogun", "Other",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading, getAccessToken } = useAuth();

  const [cart, setCart] = useState<Cart | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState<ShippingAddressInput>({
    recipientName: "",
    line1: "",
    line2: "",
    city: "",
    state: "Lagos",
    postalCode: "",
    countryCode: "NG",
    phoneNumber: "",
  });

  const load = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      const [loadedCart, loadedQuote] = await Promise.all([
        commerceApi.cart(token),
        checkoutApi.quote(token, address.state, address.countryCode),
      ]);
      setCart(loadedCart);
      setQuote(loadedQuote);
    } catch (cause) {
      setError(cause instanceof CheckoutError ? cause.message : "Could not load your cart.");
    }
    // Shipping depends on destination, so the quote is refreshed when it changes.
  }, [getAccessToken, address.state, address.countryCode]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPlacing(true);

    try {
      const token = await getAccessToken();
      if (!token) throw new CheckoutError("Your session expired. Sign in again.", 401);

      const result = await checkoutApi.placeOrder(
        token,
        quote?.requiresShipping ? address : null,
      );

      // Hand the browser to Paystack. Nothing is marked paid here — that only
      // happens after the server re-verifies the reference.
      window.location.href = result.authorizationUrl;
    } catch (cause) {
      setError(
        cause instanceof CheckoutError ? cause.message : "Could not start the payment.",
      );
      setPlacing(false);
    }
  }

  if (authLoading) {
    return <Shell><p className="text-[var(--color-text-subtle)]">Loading…</p></Shell>;
  }

  if (!user) {
    return (
      <Shell>
        <p className="text-[var(--color-text-muted)]">Sign in to complete your order.</p>
        <Button href="/login?returnUrl=%2Fcheckout" className="mt-6">Sign in</Button>
      </Shell>
    );
  }

  // AUTH-04 is enforced server-side too; this just explains it before the
  // buyer fills in a whole form and gets rejected.
  if (!user.canPurchase) {
    return (
      <Shell>
        <p className="text-[var(--color-text-muted)]">
          Verify your email address before placing an order.
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
          We sent a code to {user.email} when you signed up.
        </p>
        <Button href="/account/profile" variant="secondary" className="mt-6">
          Go to your profile
        </Button>
      </Shell>
    );
  }

  if (cart && cart.items.length === 0) {
    return (
      <Shell>
        <p className="text-[var(--color-text-muted)]">Your cart is empty.</p>
        <Button href="/gallery" className="mt-6">Browse the gallery</Button>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="grid gap-14 lg:grid-cols-[1fr_380px]">
        <form onSubmit={placeOrder} className="flex flex-col gap-5">
          {quote?.requiresShipping ? (
            <>
              <h2 className="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
                Delivery address
              </h2>

              <Field label="Recipient name" value={address.recipientName} required
                onChange={(v) => setAddress({ ...address, recipientName: v })} />
              <Field label="Address" value={address.line1} required
                onChange={(v) => setAddress({ ...address, line1: v })} />
              <Field label="Apartment, suite (optional)" value={address.line2 ?? ""}
                onChange={(v) => setAddress({ ...address, line2: v })} />

              <div className="grid grid-cols-2 gap-4">
                <Field label="City" value={address.city} required
                  onChange={(v) => setAddress({ ...address, city: v })} />
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--color-text-muted)]">State</span>
                  <select
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="min-h-11 rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)] px-3 text-[var(--color-text)]"
                  >
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>

              <Field label="Phone number" value={address.phoneNumber} required type="tel"
                onChange={(v) => setAddress({ ...address, phoneNumber: v })} />
            </>
          ) : (
            <div className="rounded-sm border border-[var(--color-hairline)] p-6">
              <h2 className="text-sm">Nothing to ship</h2>
              <p className="mt-2 text-sm text-[var(--color-text-subtle)]">
                Your order is digital only. The files appear in your account as
                soon as the payment clears.
              </p>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-[var(--color-danger)]">{error}</p>}

          <Button type="submit" disabled={placing || !quote} className="mt-2 w-full">
            {placing ? "Redirecting to Paystack…" : "Pay with Paystack"}
          </Button>

          <p className="flex items-center gap-2 text-xs text-[var(--color-text-subtle)]">
            <Lock className="h-3.5 w-3.5" />
            Payment is taken by Paystack. Card details never reach Artessa.
          </p>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-5 text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
            Your order
          </h2>

          {cart === null ? (
            <p className="text-sm text-[var(--color-text-subtle)]">Loading…</p>
          ) : (
            <>
              <ul className="flex flex-col divide-y divide-[var(--color-hairline)]">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{item.artworkTitle}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                        {item.artistName}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ""}
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm">
                      {formatPrice(item.unitPriceMinor * item.quantity, cart.currency)}
                    </span>
                  </li>
                ))}
              </ul>

              {quote && (
                <dl className="mt-6 flex flex-col gap-3 border-t border-[var(--color-hairline)] pt-6 text-sm">
                  <Row label="Subtotal" value={formatPrice(quote.subtotalMinor, quote.currency)} />
                  <Row
                    label={quote.shippingZone ? `Shipping · ${quote.shippingZone}` : "Shipping"}
                    value={
                      quote.requiresShipping
                        ? formatPrice(quote.shippingMinor, quote.currency)
                        : "—"
                    }
                  />
                  <div className="mt-2 flex items-baseline justify-between border-t border-[var(--color-hairline)] pt-4">
                    <dt className="text-[var(--color-text-muted)]">Total</dt>
                    <dd className="font-[family-name:var(--font-display)] text-2xl">
                      {formatPrice(quote.totalMinor, quote.currency)}
                    </dd>
                  </div>
                </dl>
              )}

              <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-[var(--color-text-subtle)]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Originals ship insured and tracked with a certificate of
                authenticity. Digital files are released at full resolution,
                without the watermark.
              </p>

              <Link
                href="/cart"
                className="mt-6 inline-block text-sm text-[var(--color-text-subtle)] hover:text-[var(--color-text)]"
              >
                ← Back to cart
              </Link>
            </>
          )}
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">Checkout</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
        Complete your order
      </h1>
      <div className="mt-12">{children}</div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-[var(--color-text-subtle)]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function Field({
  label, value, onChange, required, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "min-h-11 rounded-sm border border-[var(--color-hairline)] bg-[var(--color-surface)]",
          "px-4 text-[var(--color-text)] transition-colors",
          "focus:border-[var(--color-light)] focus:outline-none",
        )}
      />
    </label>
  );
}
