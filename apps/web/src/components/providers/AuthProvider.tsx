"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  login as apiLogin,
  logout as apiLogout,
  getProfile,
  getCookie,
  setAuthCookies,
  clearAuthCookies,
  setAuthExpiredHandler,
} from "@/lib/api";

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function isPublicPath(path: string) {
  const isPublicArticleDetail =
    /^\/articles\/[^/]+$/.test(path) &&
    !(path === "/articles/me" || path.startsWith("/articles/me/"));
  return path === "/login" || path === "/articles" || isPublicArticleDetail;
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || getCookie("token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(readStoredToken()));
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("auth");

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
    if (!token) {
      setIsLoading(false);
      return;
    }
    getProfile()
      .then((profile) => {
        setUser({
          userId: profile.userId,
          username: profile.username,
          nickname: profile.nickname,
          avatar: profile.avatar,
        });
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenName");
        localStorage.removeItem("refreshToken");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!isLoading && !token && !isPublicPath(pathname)) {
      router.push("/login");
    }
  }, [isLoading, token, pathname, router]);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
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
    router.push("/");
  };

  const logout = async () => {
    try {
      await apiLogout();
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

  if (isLoading && !isPublicPath(pathname)) {
    return (
      <div className="text-muted-foreground flex h-screen items-center justify-center">
        {t("loading")}
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
