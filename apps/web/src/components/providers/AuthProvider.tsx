"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { login as apiLogin, logout as apiLogout, getProfile } from "@/lib/api";

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
  const isPublicArticleDetail = /^\/articles\/[^/]+$/.test(path) &&
    !(path === "/articles/me" || path.startsWith("/articles/me/"));
  return path === "/login" || path === "/articles" || isPublicArticleDetail;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      getProfile()
        .then((profile) => {
          setUser({
            userId: profile.userId,
            username: profile.username,
            nickname: profile.nickname,
            avatar: profile.avatar
          });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !token && !isPublicPath(pathname)) {
      router.push("/login");
    }
  }, [isLoading, token, pathname, router]);

  const login = async (username: string, password: string) => {
    const res = await apiLogin(username, password);
    setToken(res.accessToken);
    localStorage.setItem("token", res.accessToken);
    setUser({
      userId: res.userId,
      username: res.username,
      nickname: res.nickname,
      avatar: res.avatar
    });
    router.push("/");
  };

  const logout = () => {
    apiLogout().catch(() => {});
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading && !isPublicPath(pathname)) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        加载中...
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
