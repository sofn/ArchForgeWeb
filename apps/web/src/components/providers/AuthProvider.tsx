"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
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
import { isPublicPath } from "@/lib/routes";
import { usePathname, useRouter } from "../../../i18n/navigation";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");
  const profileQuery = useProfile(Boolean(token));

  useEffect(() => {
    setAuthExpiredHandler(() => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("tokenName");
      localStorage.removeItem("refreshToken");
      clearAuthCookies();
      router.push("/login");
    });
  }, [router]);

  useEffect(() => {
    if (profileQuery.data) {
      setUser({
        userId: profileQuery.data.userId,
        username: profileQuery.data.username,
        nickname: profileQuery.data.nickname,
        avatar: profileQuery.data.avatar,
      });
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (profileQuery.isError && token) {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenName");
      localStorage.removeItem("refreshToken");
      setToken(null);
    }
  }, [profileQuery.isError, token]);

  const publicPage = isPublicPath(pathname);
  const isLoading = Boolean(token) && profileQuery.isLoading && !user;

  useEffect(() => {
    if (!isLoading && !token && !publicPage) {
      router.push("/login");
    }
  }, [isLoading, token, publicPage, router]);

  const setLoginResponse = (res: WebLoginResponse) => {
    const tokenName = res.tokenName || "Authorization";
    setToken(res.accessToken);
    localStorage.setItem("token", res.accessToken);
    localStorage.setItem("tokenName", tokenName);
    if (res.refreshToken) {
      localStorage.setItem("refreshToken", res.refreshToken);
    }
    setAuthCookies(res.accessToken, tokenName, res.refreshToken);
    setUser({
      userId: res.userId,
      username: res.username,
      nickname: res.nickname,
      avatar: res.avatar,
    });
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
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tokenName");
    localStorage.removeItem("refreshToken");
    clearAuthCookies();
    router.push("/login");
  };

  if (isLoading && !publicPage) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center">{t("loading")}</div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, setLoginResponse, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
