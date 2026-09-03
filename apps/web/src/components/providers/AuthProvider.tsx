"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  login as apiLogin,
  logout as apiLogout,
  type LoginUser,
  setAuthExpiredHandler,
} from "@/lib/api";
import { hasSessionCookie } from "@/lib/http/client";
import { useProfile } from "@/lib/query/hooks";
import { queryKeys } from "@/lib/query/keys";
import { isPublicPath } from "@/lib/routes";
import { usePathname, useRouter } from "@/i18n/navigation";

interface AuthUser {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  setLoginResponse: (res: LoginUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Session state provider for client components.
 *
 * The tokens live in HttpOnly cookies set by /api/auth/* — the client only
 * tracks WHETHER a session exists (hasSession cookie) and who the user is.
 * Nothing secret is stored here, and there is nothing to clean up on the
 * client beyond local state: cookie clearing happens server-side
 * (/api/auth/logout), which clearSession() fires.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(hasSessionCookie);
  // User snapshot captured from login/register responses; the server profile
  // (profileQuery) is the source of truth once loaded — merged into `user`.
  const [loginUser, setLoginUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");
  const queryClient = useQueryClient();
  const profileQuery = useProfile(authenticated);

  const publicPage = isPublicPath(pathname);

  // Profile 401 after the proxy's refresh attempt failed → dead session.
  // Derived (no setState-in-effect); the effect below only clears cookies.
  const sessionInvalid = authenticated && profileQuery.isError;
  const isAuthenticated = sessionInvalid ? false : authenticated;

  const user = profileQuery.data
    ? {
        userId: profileQuery.data.userId,
        username: profileQuery.data.username,
        nickname: profileQuery.data.nickname,
        avatar: profileQuery.data.avatar,
      }
    : loginUser;

  const isLoading = isAuthenticated && profileQuery.isLoading && !user;

  // Drop the dead session server-side (side effects only — state is derived).
  useEffect(() => {
    if (!sessionInvalid) return;
    fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
  }, [sessionInvalid]);

  // Any client fetch that surfaces a final 401 (proxy already tried refresh).
  const clearSession = useCallback(() => {
    setAuthenticated(false);
    setLoginUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.profile });
    fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
  }, [queryClient]);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      clearSession();
      router.push("/login");
    });
  }, [clearSession, router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !publicPage) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, publicPage, router]);

  const setLoginResponse = (res: LoginUser) => {
    setAuthenticated(true);
    setLoginUser({
      userId: res.userId,
      username: res.username,
      nickname: res.nickname,
      avatar: res.avatar,
    });
  };

  const login = async (username: string, password: string) => {
    const user = await apiLogin(username, password);
    setLoginResponse(user);
    router.push("/");
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Cookies are cleared server-side even when the backend call fails.
    }
    setAuthenticated(false);
    setLoginUser(null);
    queryClient.removeQueries({ queryKey: queryKeys.profile });
    router.push("/login");
  };

  if (isLoading && !publicPage) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center">{t("loading")}</div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, login, setLoginResponse, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
