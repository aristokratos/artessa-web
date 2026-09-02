"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ordersApi, type OrderSummary } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";

/** Statuses a buyer should read as "in progress" rather than finished. */
const IN_FLIGHT = new Set(["AwaitingPayment", "Paid", "Preparing", "Shipped"]);

export default function OrdersPage() {
  const { user, loading, getAccessToken } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;

    try {
      setOrders(await ordersApi.list(token));
    } catch {
      setError("We could not load your orders. Please try again.");
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  return (
    <main className="mx-auto max-w-[900px] px-5 py-16 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-light)]">
        Your account
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
        Orders
      </h1>

      <nav className="mt-8 flex gap-6 border-b border-[var(--color-hairline)] pb-4 text-sm">
        <span className="text-[var(--color-text)]">Orders</span>
        <Link href="/account/downloads" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
          Downloads
        </Link>
        <Link href="/account/profile" className="text-[var(--color-text-subtle)] hover:text-[var(--color-text)]">
          Profile
        </Link>
      </nav>

      {loading ? (
        <p className="mt-12 text-[var(--color-text-subtle)]">Loading…</p>
      ) : !user ? (
        <div className="mt-12">
          <p className="text-[var(--color-text-muted)]">
            Sign in to see what you have bought.
          </p>
          <Button href="/login?returnUrl=%2Faccount%2Forders" className="mt-6">
            Sign in
          </Button>
        </div>
      ) : error ? (
        <p role="alert" className="mt-12 text-sm text-[var(--color-danger)]">{error}</p>
      ) : orders === null ? (
        <p className="mt-12 text-[var(--color-text-subtle)]">Loading your orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-12 rounded-sm border border-[var(--color-hairline)] px-8 py-16 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-[var(--color-text-subtle)]" strokeWidth={1.5} />
          <p className="mt-5 text-[var(--color-text-muted)]">No orders yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-text-subtle)]">
            Anything you buy appears here, with tracking for shipped work and
            download links for digital pieces.
          </p>
          <Button href="/gallery" variant="secondary" className="mt-8">
            Browse the gallery
          </Button>
        </div>
      ) : (
        <ul className="mt-10 flex flex-col divide-y divide-[var(--color-hairline)]">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="group flex items-center gap-5 py-5 transition-opacity hover:opacity-80"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-[var(--color-surface)]">
                  {order.thumbnailUrl ? (
                    <img src={order.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package
                      className="m-auto mt-5 h-6 w-6 text-[var(--color-text-subtle)]"
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-[family-name:var(--font-display)] text-base">
                      {order.orderNumber}
                    </span>
                    <Badge tone={IN_FLIGHT.has(order.status) ? "accent" : "muted"}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
                    {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    {order.placedAtUtc
                      ? ` · ${new Date(order.placedAtUtc).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}`
                      : ""}
                    {order.requiresShipping ? " · ships" : " · download"}
                  </p>
                </div>

                <span className="shrink-0 text-sm">
                  {formatPrice(order.totalMinor, order.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
