"use client";

import type { UserDto } from "@/types/auth";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5080").replace(/\/$/, "");

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: UserDto;
}

export class AuthError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Every auth call sets `credentials: "include"`.
 *
 * The refresh token lives in an HttpOnly cookie scoped to /api/auth, so it is
 * never readable from here — but it also will not be *sent* cross-origin unless
 * this is set, and the API must answer with an exact CORS origin (never a
 * wildcard) for the browser to accept it.
 */
async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new AuthError(
      "We could not reach Artessa. Check your connection and try again.",
      0,
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      // A hosting proxy may return an HTML error page. Authentication callers
      // still receive a useful error instead of a JSON.parse exception.
    }
  }

  if (!response.ok) {
    const problem = body as { detail?: string; title?: string } | null;
    // The API speaks RFC 9457, so the human-readable reason is in `detail`.
    throw new AuthError(
      problem?.detail || problem?.title ||
        "Sign-in could not be completed. Please try again.",
      response.status,
    );
  }

  return body as T;
}

export const authApi = {
  register: (email: string, password: string, fullName: string) =>
    call<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    }),

  login: (email: string, password: string) =>
    call<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /** Exchanges the refresh cookie for a new access token; rotates the cookie. */
  refresh: () => call<AuthResponse>("/api/auth/refresh", { method: "POST" }),

  logout: () => call<void>("/api/auth/logout", { method: "POST" }),

  verifyEmail: (email: string, code: string) =>
    call<void>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  resendVerification: (email: string) =>
    call<void>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    call<void>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    call<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    }),

  /**
   * Full-page navigation, not fetch: the browser has to actually visit Google.
   * `variantId` carries the add-to-cart intent through the whole redirect so it
   * survives coming back (CART-02).
   */
  googleStartUrl: (returnUrl?: string, variantId?: string) => {
    const params = new URLSearchParams();
    if (returnUrl) params.set("returnUrl", returnUrl);
    if (variantId) params.set("variantId", variantId);
    const query = params.toString();
    return `${BASE}/api/auth/google/start${query ? `?${query}` : ""}`;
  },
};
