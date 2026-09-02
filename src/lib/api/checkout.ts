"use client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export interface ShippingAddressInput {
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  countryCode: string;
  phoneNumber: string;
}

export interface CheckoutQuote {
  subtotalMinor: number;
  shippingMinor: number;
  totalMinor: number;
  currency: string;
  requiresShipping: boolean;
  shippingZone: string | null;
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  reference: string;
  authorizationUrl: string;
  totalMinor: number;
  currency: string;
}

export class CheckoutError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "CheckoutError";
  }
}

async function call<T>(path: string, init: RequestInit, token?: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new CheckoutError(
      body?.detail ?? body?.title ?? "Something went wrong.",
      response.status,
    );
  }

  return body as T;
}

export const checkoutApi = {
  quote: (token: string, state?: string, countryCode?: string) =>
    call<CheckoutQuote>(
      "/api/checkout/quote",
      { method: "POST", body: JSON.stringify({ state, countryCode }) },
      token,
    ),

  placeOrder: (token: string, shippingAddress: ShippingAddressInput | null) =>
    call<PlaceOrderResult>(
      "/api/checkout/orders",
      { method: "POST", body: JSON.stringify({ shippingAddress }) },
      token,
    ),

  /**
   * Confirms a payment after Paystack redirects back.
   *
   * Deliberately unauthenticated: the buyer may return in a new tab, on another
   * device, or after their token expired, and the payment still has to be
   * confirmable. The server re-verifies the reference against Paystack, so
   * holding one grants nothing.
   */
  verify: (reference: string) =>
    call<{ status: "paid" | "not_paid" }>(
      `/api/payments/${encodeURIComponent(reference)}/verify`,
      { method: "POST" },
    ),
};
