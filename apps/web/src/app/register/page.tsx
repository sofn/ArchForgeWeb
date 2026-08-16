"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { register, sendVerificationCode } from "@/lib/api";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { setLoginResponse } = useAuth();
  const t = useTranslations("register");

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = async () => {
    setError("");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("error_invalid_email"));
      return;
    }
    setSending(true);
    try {
      await sendVerificationCode({ email, purpose: "REGISTER" });
      startCountdown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error_send_code"));
    } finally {
      setSending(false);
    }
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("error_invalid_email"));
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setError(t("error_password_weak"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("error_password_mismatch"));
      return;
    }
    if (!code || code.length < 4) {
      setError(t("error_code_required"));
      return;
    }

    try {
      const res = await register({ email, password, confirmPassword, code });
      setLoginResponse(res);
      setSuccess(true);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error_failed"));
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t("confirmPassword")}</Label>
              <Input
                id="confirm"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">{t("code")}</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={sending || countdown > 0}
                >
                  {countdown > 0 ? t("countdown", { seconds: countdown }) : t("sendCode")}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{t("success")}</p>}
            <Button type="submit" className="w-full">
              {t("submit")}
            </Button>
            <p className="text-center text-sm text-slate-400">
              {t("hasAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("login")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
