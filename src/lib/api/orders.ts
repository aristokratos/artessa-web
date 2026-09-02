"use client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

export type OrderStatus =
  | "Draft" | "AwaitingPayment" | "Paid" | "Preparing" | "Shipped"
  | "Delivered" | "Completed" | "Cancelled" | "Abandoned"
  | "PartiallyRefunded" | "Refunded";

export type OrderItemStatus =
  | "Pending" | "Preparing" | "Shipped" | "Delivered"
  | "Fulfilled" | "Cancelled" | "Refunded";

export type VariantKind = "OriginalPhysical" | "PrintPhysical" | "DigitalLicence";

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  itemCount: number;
  requiresShipping: boolean;
  placedAtUtc: string | null;
  thumbnailUrl: string | null;
}

export interface OrderItem {
  id: string;
  artworkTitle: string;
  artistName: string;
  variantLabel: string | null;
  kind: VariantKind;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  status: OrderItemStatus;
  requiresShipping: boolean;
  imageUrl: string | null;
  /** Present once a digital item is fulfilled and downloadable. */
  entitlementId: string | null;
}

export interface Shipment {
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAtUtc: string | null;
  deliveredAtUtc: string | null;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
  email: string;
  shippingAddressSnapshot: string | null;
  placedAtUtc: string | null;
  paidAtUtc: string | null;
  items: OrderItem[];
  shipments: Shipment[];
}

async function call<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`${response.status} from ${path}`);
  }

  return (await response.json()) as T;
}

export const ordersApi = {
  list: (token: string) => call<OrderSummary[]>("/api/orders", token),
  get: (token: string, id: string) => call<OrderDetail>(`/api/orders/${id}`, token),
};
