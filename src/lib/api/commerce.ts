import type { Cart } from "@/types/commerce";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
    throw new Error(problem?.detail ?? problem?.title ?? "Something went wrong.");
  }
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export const commerceApi = {
  cart: (token: string) => request<Cart>("/api/cart", token),
  add: (token: string, variantId: string) => request<Cart>("/api/cart/items", token, {
    method: "POST", body: JSON.stringify({ variantId, quantity: 1 }),
  }),
  update: (token: string, itemId: string, quantity: number) => request<Cart>(`/api/cart/items/${itemId}`, token, {
    method: "PATCH", body: JSON.stringify({ quantity }),
  }),
  remove: (token: string, itemId: string) => request<void>(`/api/cart/items/${itemId}`, token, { method: "DELETE" }),
};
