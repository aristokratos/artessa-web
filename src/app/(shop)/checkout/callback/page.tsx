"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { checkoutApi } from "@/lib/api/checkout";

type State = "checking" | "paid" | "not_paid" | "error";

/**
 * Where Paystack returns the buyer.
 *
 * The redirect landing here is NOT proof of payment — anyone can visit this URL
 * with any reference. It asks the server to confirm, and the server re-verifies
 * against Paystack before anything is marked paid (PRD §9.3).
 *
 * The webhook may well have confirmed the same payment already; that is
 * expected, and fulfilment is idempotent, so whichever arrives second is a
 * no-op rather than a double order.
 */
function CallbackInner() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");

  const [state, setState] = useState<State>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setState("error");
      setMessage("No payment reference was supplied.");
      return;
    }

    let cancelled = false;

    checkoutApi
      .verify(reference)
      .then((result) => {
        if (!cancelled) setState(result.status === "paid" ? "paid" : "not_paid");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setState("error");
        setMessage(cause instanceof Error ? cause.message : null);
      });

    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-[640px] items-center px-5 py-16 sm:px-8">
      <div className="w-full text-center">
        {state === "checking" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--color-text-subtle)]" />
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl">
              Confirming your payment
            </h1>
            <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
              This takes a moment. Please do not close the page.
            </p>
          </>
        )}

        {state === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-success)]" strokeWidth={1.5} />
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-[length:var(--text-display)] leading-tight">
              Thank you
            </h1>
            <p className="mt-4 text-[var(--color-text-muted)]">
              Your payment went through. A receipt is on its way to your email.
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
              Anything digital is already in your downloads. Physical work is
              being prepared, and you will get tracking when it ships.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/account/orders">View your order</Button>
              <Button href="/gallery" variant="secondary">Keep browsing</Button>
            </div>
          </>
        )}

        {state === "not_paid" && (
          <>
            <CircleAlert className="mx-auto h-10 w-10 text-[var(--color-light)]" strokeWidth={1.5} />
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl">
              Payment not completed
            </h1>
            <p className="mt-4 text-[var(--color-text-muted)]">
              Paystack has not confirmed this payment. Nothing has been charged.
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
              Your order is saved — you can pay for it from your orders page.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href="/account/orders">Go to your orders</Button>
              <Button href="/cart" variant="secondary">Back to cart</Button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <CircleAlert className="mx-auto h-10 w-10 text-[var(--color-danger)]" strokeWidth={1.5} />
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-2xl">
              We could not confirm this
            </h1>
            <p className="mt-4 text-[var(--color-text-muted)]">
              {message ?? "Something went wrong confirming your payment."}
            </p>
            <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
              If money left your account, do not pay again — check your orders
              first, and contact us with the reference if it is still missing.
            </p>
            {reference && (
              <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-subtle)]">
                {reference}
              </p>
            )}
            <div className="mt-9">
              <Button href="/account/orders">Go to your orders</Button>
            </div>
          </>
        )}

        <p className="mt-12 text-xs text-[var(--color-text-subtle)]">
          <Link href="/" className="hover:text-[var(--color-text)]">Back to Artessa</Link>
        </p>
      </div>
    </main>
  );
}

export default function CheckoutCallbackPage() {
  // useSearchParams needs a Suspense boundary to prerender.
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  );
}
