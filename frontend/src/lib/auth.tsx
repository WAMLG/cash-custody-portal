"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api";
import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "@/lib/auth-storage";
import type { LoginResponse, User, UserRole } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const currentToken = getStoredToken();

    if (!currentToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await apiRequest<{ user: User }>("/me", {
        token: currentToken,
      });
      setToken(currentToken);
      setUser(response.user);
      return response.user;
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession(): Promise<void> {
      await Promise.resolve();

      if (isMounted) {
        await refreshUser();
      }
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (loginValue: string, password: string): Promise<User> => {
      const response = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({
          login: loginValue,
          password,
        }),
      });

      storeToken(response.token);
      setToken(response.token);
      setUser(response.user);

      return response.user;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    const currentToken = token ?? getStoredToken();

    if (currentToken) {
      await apiRequest("/logout", {
        method: "POST",
        token: currentToken,
      }).catch(() => null);
    }

    clearStoredToken();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export function dashboardPathForRole(role: UserRole): string {
  return role === "admin" ? "/admin/dashboard" : "/finance/dashboard";
}
