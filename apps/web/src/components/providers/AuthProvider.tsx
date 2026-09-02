"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  login as apiLogin,
  logout as apiLogout,
  getCookie,
  setAuthCookies,
  clearAuthCookies,
  setAuthExpiredHandler,
  type WebLoginResponse,
} from "@/lib/api";
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
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  setLoginResponse: (res: WebLoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || getCookie("token");
}

function toAuthUser(source: {
  userId: number;
  username: string;
  nickname?: string;
  avatar?: string;
}): AuthUser {
  return {
    userId: source.userId,
    username: source.username,
    nickname: source.nickname,
    avatar: source.avatar,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken);
  // User snapshot captured from login/register responses. The server profile
  // (profileQuery) is the source of truth once loaded — both merge into the
  // derived `user` below, with no setState-in-effect cascades.
  const [loginUser, setLoginUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");
  const queryClient = useQueryClient();
  const profileQuery = useProfile(Boolean(token));

  const publicPage = isPublicPath(pathname);

  // Profile 401s after the refresh chain failed → session is dead. Derived
  // here instead of setState-in-effect; storage cleanup is the only side
  // effect (see effect below).
  const sessionInvalid = Boolean(token) && profileQuery.isError;
  const activeToken = sessionInvalid ? null : token;

  const user: AuthUser | null = !activeToken
    ? null
    : profileQuery.data
      ? toAuthUser(profileQuery.data)
      : loginUser;

  const isLoading = Boolean(activeToken) && profileQuery.isLoading && !user;

  const clearSession = useCallback(() => {
    setToken(null);
    setLoginUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenName");
    localStorage.removeItem("refreshToken");
    clearAuthCookies();
    queryClient.removeQueries({ queryKey: queryKeys.profile });
  }, [queryClient]);

  // Storage cleanup when the session dies from a failed profile fetch.
  // Side effects only — no setState (react-hooks/set-state-in-effect).
  useEffect(() => {
    if (!sessionInvalid) return;
    localStorage.removeItem("token");
    localStorage.removeItem("tokenName");
    localStorage.removeItem("refreshToken");
    clearAuthCookies();
  }, [sessionInvalid]);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      clearSession();
      router.push("/login");
    });
  }, [clearSession, router]);

  useEffect(() => {
    if (!isLoading && !activeToken && !publicPage) {
      router.push("/login");
    }
  }, [isLoading, activeToken, publicPage, router]);

  const setLoginResponse = (res: WebLoginResponse) => {
    const tokenName = res.tokenName || "Authorization";
    setToken(res.accessToken);
    setLoginUser(toAuthUser(res));
    localStorage.setItem("token", res.accessToken);
    localStorage.setItem("tokenName", tokenName);
    if (res.refreshToken) {
      localStorage.setItem("refreshToken", res.refreshToken);
    }
    setAuthCookies(res.accessToken, tokenName, res.refreshToken);
  };

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    setLoginResponse(res);
    router.push("/");
  };

  const logout = async () => {
    const refreshToken =
      (typeof window !== "undefined" && localStorage.getItem("refreshToken")) || getCookie("refreshToken");
    try {
      await apiLogout(refreshToken);
    } catch {
      // ignore backend errors, still clear local state
    }
    clearSession();
    router.push("/login");
  };

  if (isLoading && !publicPage) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center">{t("loading")}</div>
    );
  }

  return (
    <AuthContext.Provider value={{ token: activeToken, user, isLoading, login, setLoginResponse, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
