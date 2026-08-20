"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { Link } from "../../../../../i18n/navigation";

export default function LoginPage() {
  const [formError, setFormError] = useState("");
  const { login } = useAuth();
  const t = useTranslations("login");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    try {
      await login(values.username, values.password);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : t("error_failed"));
    }
  });

  return (
    <Card className="w-full max-w-sm border-slate-200/60 bg-white/90 shadow-xl backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">{t("username")}</Label>
            <Input id="username" autoComplete="username" {...register("username")} />
            {errors.username && <p className="text-sm text-red-600">{t("error_missing")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-600">{t("error_missing")}</p>}
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
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
  );
}
