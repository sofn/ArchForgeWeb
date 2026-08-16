"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const t = useTranslations("login");

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError(t("error_missing"));
      return;
    }
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col items-center justify-center">
      <Card className="w-full max-w-sm border-slate-200/60 bg-white/90 shadow-xl backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("submitting") : t("submit")}
            </Button>
          </form>
          <div className="mt-6 flex flex-col items-center gap-2 text-center text-sm text-slate-500">
            <div className="flex gap-4">
              <Link href="/forgot-password" className="hover:text-indigo-600">
                {t("forgotPassword")}
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/register" className="hover:text-indigo-600">
                {t("register")}
              </Link>
            </div>
            <Link href="/" className="hover:text-indigo-600">
              {t("backToHome")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
