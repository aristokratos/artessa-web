"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { authApi, type AuthResponse } from "./api";
import type { UserDto } from "@/types/auth";

interface AuthState {
  user: UserDto | null;
  /** Null until the first refresh resolves — distinguishes "loading" from "signed out". */
  loading: boolean;
  login: (email: string, password: string) => Promise<UserDto>;
  register: (email: string, password: string, fullName: string) => Promise<UserDto>;
  logout: () => Promise<void>;
  /** Returns a valid access token, refreshing first if it is close to expiry. */
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthState | null>(null);

/**
 * Holds the session.
 *
 * The access token is kept in a ref, never in localStorage or a cookie readable
 * by script (PRD §8): anything reachable from JavaScript is reachable by an XSS
 * payload. Durability comes from the HttpOnly refresh cookie instead, which is
 * exchanged for a new access token on mount and shortly before expiry.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const token = useRef<string | null>(null);
  const expiresAt = useRef<number>(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apply = useCallback((auth: AuthResponse) => {
    token.current = auth.accessToken;
    expiresAt.current = new Date(auth.expiresAtUtc).getTime();
    setUser(auth.user);
  }, []);

  const clear = useCallback(() => {
    token.current = null;
    expiresAt.current = 0;
    setUser(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  // Restore the session on load. A 401 here is the normal case for a visitor
  // who has never signed in, so it is not surfaced as an error.
  useEffect(() => {
    let cancelled = false;

    authApi
      .refresh()
      .then((auth) => {
        if (!cancelled) apply(auth);
      })
      .catch(() => {
        if (!cancelled) clear();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apply, clear]);

  const getAccessToken = useCallback(async () => {
    // Refresh a minute early rather than on expiry: a token that expires
    // mid-request produces a 401 the user experiences as a random sign-out.
    const stillGood = token.current && Date.now() < expiresAt.current - 60_000;
    if (stillGood) return token.current;

    try {
      const auth = await authApi.refresh();
      apply(auth);
      return auth.accessToken;
    } catch {
      clear();
      return null;
    }
  }, [apply, clear]);

  const login = useCallback(
    async (email: string, password: string) => {
      const auth = await authApi.login(email, password);
      apply(auth);
      return auth.user;
    },
    [apply],
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const auth = await authApi.register(email, password, fullName);
      apply(auth);
      return auth.user;
    },
    [apply],
  );

  const logout = useCallback(async () => {
    // Clear locally even if the call fails — the user asked to be signed out,
    // and leaving them looking signed in is the worse outcome.
    try {
      await authApi.logout();
    } finally {
      clear();
    }
  }, [clear]);

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout, getAccessToken }),
    [user, loading, login, register, logout, getAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
