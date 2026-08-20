"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/AuthProvider";
import { register as registerUser, sendVerificationCode } from "@/lib/api";
import { registerSchema, type RegisterValues } from "@/lib/validation/auth";
import { Link, useRouter } from "../../../../../i18n/navigation";

export default function RegisterPage() {
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { setLoginResponse } = useAuth();
  const t = useTranslations("register");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", code: "" },
  });

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
    setFormError("");
    const email = getValues("email");
    if (!email) {
      setFormError(t("error_invalid_email"));
      return;
    }
    setSending(true);
    try {
      await sendVerificationCode({ email, purpose: "REGISTER" });
      startCountdown(60);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_send_code"));
    } finally {
      setSending(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    setSuccess(false);
    try {
      const res = await registerUser(values);
      setLoginResponse(res);
      setSuccess(true);
      router.push("/");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_failed"));
    }
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-600">{t("error_invalid_email")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{t("error_password_weak")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">{t("confirmPassword")}</Label>
            <Input id="confirm" type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-sm text-red-600">{t("error_password_mismatch")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">{t("code")}</Label>
            <div className="flex gap-2">
              <Input id="code" inputMode="numeric" autoComplete="one-time-code" className="flex-1" {...register("code")} />
              <Button type="button" variant="outline" onClick={handleSendCode} disabled={sending || countdown > 0}>
                {countdown > 0 ? t("countdown", { seconds: countdown }) : t("sendCode")}
              </Button>
            </div>
            {errors.code && <p className="text-sm text-red-600">{t("error_code_required")}</p>}
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          {success && <p className="text-sm text-green-600">{t("success")}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
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
  );
}
